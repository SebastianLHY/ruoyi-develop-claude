---
name: payment-integration
description: |
  基于若依-vue-plus框架的第三方支付（微信支付/支付宝)标准集成规范。
  
  核心能力：
  - 统一下单接口的安全封装与签名计算
  - 支付回调的验签、解析与幂等性处理
  - 订单状态管理与金额二次校验
  - 异常情况的容错与日志记录
  - 支付配置的安全存储与访问
  
  触发场景：
  - 开发支付下单、预支付订单创建接口
  - 处理微信/支付宝异步回调通知
  - 实现订单状态查询与同步
  - 配置支付参数（商户号、密钥、证书等）
  - 处理支付退款、关单等业务
  
  触发词：支付集成、微信支付、支付宝支付、支付下单、异步回调、支付通知、支付验签、订单状态、幂等性、支付安全
---

# 支付功能集成规范

> 本规范适用于若依-vue-plus框架下的支付系统集成，确保支付流程的安全性、可靠性和可维护性。

## 核心规范

### 规范1：统一下单与签名安全

**原则说明**：
所有支付相关的敏感参数（如AppID、AppKey、商户号、商户秘钥、API证书等）必须保存在服务端配置中心（如Nacos）或数据库加密字段中，严禁硬编码或暴露给前端。

**实现要求**：
1. 统一下单接口必须在后端完成全部参数的构建、签名计算和预处理
2. 前端仅需传递业务参数（如订单号、金额、商品描述等）
3. 后端返回已签名的支付参数（如微信的prepay_id、支付宝的orderString）
4. 所有返回数据必须使用`R`对象封装，包含完整的状态码和错误信息
5. 必须对订单金额、商品信息进行业务合法性校验

**代码示例**：

```java
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController extends BaseController {

    private final IPaymentService paymentService;

    /**
     * 统一下单接口（微信支付示例）
     * @param order 订单信息
     * @return 预支付交易会话标识及签名参数
     */
    @SaCheckPermission("system:payment:unifyOrder")
    @Log(title = "支付管理", businessType = BusinessType.CREATE)
    @PostMapping("/unifyOrder")
    public R<Map<String, Object>> unifyOrder(@Validated @RequestBody PayOrderDTO order) {
        // 1. 校验订单有效性
        if (StringUtils.isEmpty(order.getOrderNo())) {
            return R.fail("订单号不能为空");
        }
        
        // 2. 验证订单金额合法性（防止篡改）
        BigDecimal actualAmount = paymentService.getOrderAmount(order.getOrderNo());
        if (actualAmount.compareTo(order.getAmount()) != 0) {
            log.error("订单{}金额校验失败，预期：{}，实际：{}", 
                order.getOrderNo(), order.getAmount(), actualAmount);
            return R.fail("订单金额不匹配");
        }
        
        // 3. 检查订单状态（防止重复支付）
        String orderStatus = paymentService.getOrderStatus(order.getOrderNo());
        if ("PAID".equals(orderStatus)) {
            return R.fail("订单已支付，请勿重复操作");
        }
        
        // 4. 后端完成签名与参数生成（所有敏感操作在服务端完成）
        try {
            Map<String, Object> payParams = paymentService.createWxOrder(order);
            return R.ok(payParams);
        } catch (Exception e) {
            log.error("创建支付订单失败", e);
            return R.fail("支付订单创建失败，请稍后重试");
        }
    }
    
    /**
     * 查询订单支付状态
     */
    @SaCheckPermission("system:payment:query")
    @GetMapping("/query/{orderNo}")
    public R<PaymentStatusVO> queryPayStatus(@PathVariable String orderNo) {
        PaymentStatusVO status = paymentService.queryPaymentStatus(orderNo);
        return R.ok(status);
    }
}
```

**关键要点**：
- ✅ 使用`@Validated`进行参数校验
- ✅ 在服务端进行金额二次校验，防止前端篡改
- ✅ 检查订单状态，避免重复支付
- ✅ 使用try-catch捕获异常，返回友好错误信息
- ✅ 记录详细的错误日志，便于问题排查

### 规范2：异步回调处理与幂等性控制

**原则说明**：
支付平台（微信/支付宝）会通过异步通知的方式告知商户支付结果。回调接口是支付流程中最关键的环节，必须确保安全性、幂等性和可靠性。

**实现要求**：
1. **接口暴露**：回调接口必须暴露为公开接口，在Spring Security/Sa-Token配置中放行（支持IP白名单验证更佳）
2. **验签必须**：接收回调后，第一步必须验证签名，确认请求来源合法性
3. **幂等性控制**：处理业务逻辑前，必须查询订单当前状态，防止重复通知导致的数据错误
4. **事务保证**：订单状态更新、库存扣减等操作必须在数据库事务中完成
5. **响应规范**：处理成功必须返回平台规定的成功报文，处理失败返回失败报文（平台会重试）
6. **异步解耦**：通知第三方、发送消息等操作应使用MQ异步处理，不阻塞回调响应

**代码示例**：

```java
@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentCallbackController {

    private final IPaymentService paymentService;
    private final WxPayApiConfig wxPayApiConfig;
    private final RedissonClient redissonClient;

    /**
     * 微信支付异步通知回调
     * 注意：需在Spring Security/Sa-Token配置中放行该路径
     * 路径示例：permitAll().antMatchers("/payment/notify/**")
     */
    @PostMapping("/notify/wx")
    public String wxNotify(@RequestBody String notifyData, HttpServletRequest request) {
        // 记录原始回调数据（用于问题排查）
        log.info("收到微信支付回调，IP：{}，数据：{}", 
            ServletUtil.getClientIP(request), notifyData);
        
        try {
            // 1. 验签（关键安全措施）
            if (!WxPayKit.verifyNotify(notifyData, wxPayApiConfig.getPartnerKey())) {
                log.error("微信支付回调验签失败，可能存在安全风险");
                return WxPayKit.returnFail("验签失败");
            }
            
            // 2. 解析回调数据
            Map<String, String> data = WxPayKit.xmlToMap(notifyData);
            String orderNo = data.get("out_trade_no");
            String transactionId = data.get("transaction_id");
            String resultCode = data.get("result_code");
            
            // 3. 验证支付是否成功
            if (!"SUCCESS".equals(resultCode)) {
                log.warn("订单{}支付失败，返回码：{}", orderNo, resultCode);
                return WxPayKit.returnSuccess("OK"); // 支付失败也返回成功，避免重复通知
            }
            
            // 4. 使用分布式锁防止并发处理（同一订单可能收到多次回调）
            String lockKey = "payment:callback:" + orderNo;
            RLock lock = redissonClient.getLock(lockKey);
            
            try {
                // 尝试获取锁，最多等待5秒，锁自动释放时间30秒
                if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                    try {
                        // 5. 幂等性检查（核心！防止重复处理）
                        SysOrder order = paymentService.getOrderByNo(orderNo);
                        if (order == null) {
                            log.error("订单{}不存在", orderNo);
                            return WxPayKit.returnFail("订单不存在");
                        }
                        
                        if ("PAID".equals(order.getStatus())) {
                            log.info("订单{}已处理，忽略重复回调", orderNo);
                            return WxPayKit.returnSuccess("OK");
                        }
                        
                        // 6. 金额校验（防止支付金额被篡改）
                        Integer totalFee = Integer.parseInt(data.get("total_fee")); // 单位：分
                        BigDecimal paidAmount = new BigDecimal(totalFee).divide(new BigDecimal(100));
                        if (order.getAmount().compareTo(paidAmount) != 0) {
                            log.error("订单{}金额校验失败，订单金额：{}，支付金额：{}", 
                                orderNo, order.getAmount(), paidAmount);
                            return WxPayKit.returnFail("金额校验失败");
                        }
                        
                        // 7. 更新订单状态（加事务）
                        PaymentCallbackDTO callbackDTO = PaymentCallbackDTO.builder()
                            .orderNo(orderNo)
                            .transactionId(transactionId)
                            .paidAmount(paidAmount)
                            .paidTime(LocalDateTime.now())
                            .callbackData(notifyData)
                            .build();
                        
                        paymentService.handlePaymentSuccess(callbackDTO);
                        
                        log.info("订单{}支付回调处理成功，交易号：{}", orderNo, transactionId);
                        return WxPayKit.returnSuccess("OK");
                        
                    } finally {
                        lock.unlock();
                    }
                } else {
                    log.warn("订单{}获取分布式锁超时", orderNo);
                    return WxPayKit.returnFail("处理中，请稍后");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("订单{}获取锁被中断", orderNo, e);
                return WxPayKit.returnFail("系统繁忙");
            }
            
        } catch (Exception e) {
            log.error("微信回调处理异常", e);
            return WxPayKit.returnFail("ERROR");
        }
    }
    
    /**
     * 支付宝异步通知回调
     */
    @PostMapping("/notify/alipay")
    public String alipayNotify(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        
        try {
            // 解析参数
            for (String name : requestParams.keySet()) {
                String[] values = requestParams.get(name);
                params.put(name, String.join(",", values));
            }
            
            log.info("收到支付宝回调：{}", params);
            
            // 1. 验签
            if (!AlipaySignature.rsaCheckV1(params, alipayPublicKey, "UTF-8", "RSA2")) {
                log.error("支付宝回调验签失败");
                return "failure";
            }
            
            // 2. 解析关键参数
            String orderNo = params.get("out_trade_no");
            String tradeNo = params.get("trade_no");
            String tradeStatus = params.get("trade_status");
            
            // 3. 验证交易状态
            if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
                // 4-7步同微信支付处理逻辑
                // ...（使用分布式锁、幂等性检查、金额校验、更新订单）
                
                return "success";
            } else {
                log.warn("订单{}交易状态异常：{}", orderNo, tradeStatus);
                return "success"; // 非成功状态也返回success，避免重复通知
            }
            
        } catch (Exception e) {
            log.error("支付宝回调处理异常", e);
            return "failure";
        }
    }
}
```

**Service层事务处理示例**：

```java
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {
    
    private final ISysOrderMapper orderMapper;
    private final IOrderGoodsMapper orderGoodsMapper;
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * 处理支付成功回调（事务方法）
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void handlePaymentSuccess(PaymentCallbackDTO callbackDTO) {
        String orderNo = callbackDTO.getOrderNo();
        
        // 1. 更新订单状态
        SysOrder updateOrder = new SysOrder();
        updateOrder.setOrderNo(orderNo);
        updateOrder.setStatus("PAID");
        updateOrder.setTransactionId(callbackDTO.getTransactionId());
        updateOrder.setPaidTime(callbackDTO.getPaidTime());
        updateOrder.setUpdateTime(LocalDateTime.now());
        
        int rows = orderMapper.updateByOrderNo(updateOrder);
        if (rows == 0) {
            throw new ServiceException("订单状态更新失败");
        }
        
        // 2. 扣减库存（根据业务需要）
        List<OrderGoods> goodsList = orderGoodsMapper.selectByOrderNo(orderNo);
        for (OrderGoods goods : goodsList) {
            // 扣减库存逻辑
        }
        
        // 3. 发布支付成功事件（异步处理通知、积分等）
        PaymentSuccessEvent event = new PaymentSuccessEvent(this, orderNo);
        eventPublisher.publishEvent(event);
        
        // 4. 保存回调记录（用于对账）
        PaymentCallback callback = new PaymentCallback();
        callback.setOrderNo(orderNo);
        callback.setCallbackData(callbackDTO.getCallbackData());
        callback.setCreateTime(LocalDateTime.now());
        paymentCallbackMapper.insert(callback);
    }
}
```

**关键要点**：
- ✅ 必须进行签名验证，防止伪造回调
- ✅ 使用分布式锁（Redisson）防止并发问题
- ✅ 通过查询订单状态实现幂等性
- ✅ 进行金额二次校验，防止支付金额被篡改
- ✅ 使用`@Transactional`确保数据一致性
- ✅ 使用事件发布机制异步处理后续业务
- ✅ 记录完整的日志和回调原始数据
- ✅ 返回平台规定的响应格式

### 规范3：支付配置安全管理

**原则说明**：
支付相关的配置信息（商户号、密钥、证书等）属于高度敏感信息，必须采用安全的存储和访问方式。

**实现要求**：
1. **配置存储**：使用配置中心（Nacos）或数据库加密字段存储
2. **访问控制**：配置修改需要管理员权限，记录操作日志
3. **密钥加密**：数据库存储的密钥必须加密（使用AES/RSA）
4. **证书管理**：支付证书文件存放在安全目录，不可通过Web访问
5. **环境隔离**：开发、测试、生产环境使用独立的支付配置

**配置实体示例**：

```java
@Data
@TableName("sys_payment_config")
public class PaymentConfig extends BaseEntity {
    
    /** 支付方式：WX-微信，ALIPAY-支付宝 */
    private String paymentType;
    
    /** 商户号 */
    private String merchantId;
    
    /** 应用ID */
    private String appId;
    
    /** 商户密钥（加密存储） */
    @TableField(typeHandler = EncryptTypeHandler.class)
    private String secretKey;
    
    /** API证书路径 */
    private String certPath;
    
    /** 回调通知URL */
    private String notifyUrl;
    
    /** 是否启用 */
    private Boolean enabled;
    
    /** 环境：dev、test、prod */
    private String environment;
}
```

### 规范4：订单状态流转管理

**原则说明**：
订单状态必须严格按照预定义的流程流转，防止状态混乱。

**状态定义**：
- `PENDING`：待支付（订单创建，未支付）
- `PAYING`：支付中（用户已发起支付，等待回调）
- `PAID`：已支付（收到支付成功回调）
- `CLOSED`：已关闭（超时未支付或用户取消）
- `REFUNDING`：退款中
- `REFUNDED`：已退款

**状态流转规则**：

```java
@Component
public class OrderStatusValidator {
    
    private static final Map<String, List<String>> ALLOWED_TRANSITIONS = new HashMap<>();
    
    static {
        ALLOWED_TRANSITIONS.put("PENDING", Arrays.asList("PAYING", "CLOSED"));
        ALLOWED_TRANSITIONS.put("PAYING", Arrays.asList("PAID", "CLOSED"));
        ALLOWED_TRANSITIONS.put("PAID", Arrays.asList("REFUNDING"));
        ALLOWED_TRANSITIONS.put("REFUNDING", Arrays.asList("REFUNDED", "PAID"));
        ALLOWED_TRANSITIONS.put("REFUNDED", Collections.emptyList());
        ALLOWED_TRANSITIONS.put("CLOSED", Collections.emptyList());
    }
    
    /**
     * 验证状态流转是否合法
     */
    public boolean canTransition(String currentStatus, String targetStatus) {
        List<String> allowedTargets = ALLOWED_TRANSITIONS.get(currentStatus);
        if (allowedTargets == null) {
            return false;
        }
        return allowedTargets.contains(targetStatus);
    }
    
    /**
     * 执行状态流转（带验证）
     */
    public void transition(SysOrder order, String targetStatus) {
        if (!canTransition(order.getStatus(), targetStatus)) {
            throw new ServiceException(
                String.format("订单状态不允许从[%s]流转到[%s]", order.getStatus(), targetStatus)
            );
        }
        order.setStatus(targetStatus);
        order.setUpdateTime(LocalDateTime.now());
    }
}
```

### 规范5：异常处理与日志记录

**原则说明**：
支付是资金敏感业务，必须有完善的日志记录和异常处理机制，确保问题可追溯。

**日志规范**：
1. **关键节点必须记录**：下单请求、签名参数、回调原始数据、状态变更
2. **日志级别**：正常流程用INFO，异常用ERROR，警告用WARN
3. **敏感信息脱敏**：记录日志时对密钥、完整金额等脱敏处理
4. **结构化日志**：使用MDC记录订单号，便于链路追踪

**日志示例**：

```java
@Slf4j
@Component
public class PaymentLogger {
    
    /**
     * 记录支付请求
     */
    public void logPaymentRequest(String orderNo, PayOrderDTO order) {
        MDC.put("orderNo", orderNo);
        log.info("创建支付订单 - 订单号：{}，金额：{}，商品：{}", 
            orderNo, 
            desensitizeAmount(order.getAmount()), 
            order.getSubject());
        MDC.clear();
    }
    
    /**
     * 记录回调数据
     */
    public void logCallback(String orderNo, String callbackData) {
        MDC.put("orderNo", orderNo);
        log.info("收到支付回调 - 订单号：{}，回调数据：{}", 
            orderNo, 
            desensitizeCallbackData(callbackData));
        MDC.clear();
    }
    
    /**
     * 金额脱敏（仅显示前后部分）
     */
    private String desensitizeAmount(BigDecimal amount) {
        if (amount == null) return "***";
        String amountStr = amount.toString();
        if (amountStr.length() <= 4) return "***";
        return amountStr.substring(0, 2) + "***" + amountStr.substring(amountStr.length() - 2);
    }
    
    /**
     * 回调数据脱敏（移除密钥等敏感字段）
     */
    private String desensitizeCallbackData(String data) {
        // 移除sign、key等字段
        return data.replaceAll("(<sign>|<key>).*?(</sign>|</key>)", "$1***$2");
    }
}
```

## 禁止事项

### 安全相关禁止事项
- ❌ **严禁**将支付密钥（SecretKey、PartnerKey）在前端代码、日志、接口响应中明文暴露
- ❌ **严禁**在前端进行任何签名计算或参数拼接，所有签名必须在服务端完成
- ❌ **严禁**在支付回调接口中省略验签步骤，直接信任回调数据
- ❌ **严禁**将支付配置硬编码在代码中，必须使用配置中心或加密数据库存储
- ❌ **严禁**在生产环境使用测试环境的支付配置（商户号、密钥等）

### 业务逻辑禁止事项
- ❌ **严禁**在支付回调处理中缺乏幂等性控制，导致重复发货、充值或扣减库存
- ❌ **严禁**在前端通过API直接修改订单状态为"已支付"，状态变更必须且仅通过服务端回调触发
- ❌ **严禁**在订单状态更新前省略金额二次校验，防止支付金额与订单金额不一致
- ❌ **严禁**跳过订单状态流转规则，如从"待支付"直接变为"已退款"
- ❌ **严禁**在回调处理中进行长时间的外部网络请求（如通知第三方），必须使用异步消息队列

### 技术实现禁止事项
- ❌ **严禁**在事务方法中进行外部HTTP调用，避免分布式事务问题
- ❌ **严禁**使用`@Async`注解处理支付回调，回调必须同步处理并快速响应
- ❌ **严禁**在回调接口中抛出未捕获的异常，必须返回规范的失败响应
- ❌ **严禁**不记录支付回调的原始数据，必须保存完整的回调内容用于对账和问题排查
- ❌ **严禁**在订单金额使用`float`或`double`类型，必须使用`BigDecimal`

### 配置管理禁止事项
- ❌ **严禁**回调URL使用内网地址或localhost，必须使用公网可访问的域名
- ❌ **严禁**不配置回调接口的访问频率限制，防止恶意攻击
- ❌ **严禁**在生产环境开启支付接口的详细日志输出（避免泄露敏感信息）
- ❌ **严禁**不进行支付证书的定期更新和备份

### 测试相关禁止事项
- ❌ **严禁**在生产环境进行支付测试，必须使用沙箱环境
- ❌ **严禁**使用真实用户的订单进行支付流程测试
- ❌ **严禁**在测试环境关闭验签逻辑，测试必须与生产保持一致

## 最佳实践

### 支付配置管理
```java
// 推荐：使用配置类统一管理支付配置
@Configuration
@ConfigurationProperties(prefix = "payment.wechat")
@Data
public class WxPayConfigProperties {
    /** 应用ID */
    private String appId;
    /** 商户号 */
    private String mchId;
    /** 商户密钥（使用Jasypt加密） */
    @EncryptedProperty
    private String apiKey;
    /** 证书路径 */
    private String certPath;
    /** 回调地址 */
    private String notifyUrl;
}
```

### Spring Security回调接口放行
```java
@Configuration
public class SecurityConfig extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {
    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            // 放行支付回调接口
            .antMatchers("/payment/notify/**").permitAll()
            // 其他接口需要认证
            .anyRequest().authenticated();
    }
}
```

### 支付金额处理规范
```java
// ✅ 正确：使用BigDecimal，保留2位小数
BigDecimal amount = new BigDecimal("99.99");
amount = amount.setScale(2, RoundingMode.HALF_UP);

// ❌ 错误：使用double，存在精度问题
double amount = 99.99;
```

### 订单超时处理（使用定时任务）
```java
@Component
@Slf4j
public class OrderTimeoutTask {
    
    @Scheduled(cron = "0 */5 * * * ?") // 每5分钟执行一次
    public void closeTimeoutOrders() {
        LocalDateTime expireTime = LocalDateTime.now().minusMinutes(30);
        List<SysOrder> timeoutOrders = orderMapper.selectTimeoutOrders(expireTime);
        
        for (SysOrder order : timeoutOrders) {
            // 主动查询支付状态
            PaymentStatusVO status = paymentService.queryFromPlatform(order.getOrderNo());
            
            if ("UNPAID".equals(status.getStatus())) {
                // 确实未支付，关闭订单
                orderService.closeOrder(order.getOrderNo());
                log.info("订单{}超时未支付已关闭", order.getOrderNo());
            } else if ("PAID".equals(status.getStatus())) {
                // 支付成功但未收到回调，手动更新订单
                paymentService.manualUpdateOrderStatus(order.getOrderNo());
                log.warn("订单{}支付成功但未收到回调，已手动更新", order.getOrderNo());
            }
        }
    }
}
```

## 参考代码
- 文件路径：`ruoyi-payment/src/main/java/com/ruoyi/payment/controller/PaymentController.java`
- 文件路径：`ruoyi-payment/src/main/java/com/ruoyi/payment/controller/PaymentCallbackController.java`
- 文件路径：`ruoyi-payment/src/main/java/com/ruoyi/payment/service/impl/PaymentServiceImpl.java`
- 文件路径：`ruoyi-ui/src/views/pay/order.vue`（前端调起支付示例）

## 检查清单

### 下单接口检查
- [ ] 是否遵循服务端签名原则，所有签名在后端完成
- [ ] 是否对订单金额进行二次校验，防止前端篡改
- [ ] 是否检查订单状态，避免重复支付
- [ ] 是否使用`@Validated`进行参数校验
- [ ] 是否记录详细的错误日志

### 回调接口检查
- [ ] 是否在回调接口中实现了严格的验签逻辑
- [ ] 是否实现了回调处理的幂等性（检查订单状态）
- [ ] 是否使用分布式锁防止并发问题
- [ ] 是否进行金额二次校验
- [ ] 是否使用`@Transactional`确保数据一致性
- [ ] 是否正确配置了回调URL的白名单放行
- [ ] 是否保存了完整的回调原始数据

### 配置管理检查
- [ ] 支付密钥是否加密存储
- [ ] 是否区分了开发、测试、生产环境配置
- [ ] 回调URL是否使用公网可访问的域名
- [ ] 是否配置了访问频率限制

### 安全性检查
- [ ] 是否在前端暴露了支付密钥或敏感信息
- [ ] 日志中是否对敏感信息进行了脱敏处理
- [ ] 是否使用`BigDecimal`处理金额，避免精度问题
- [ ] 是否实现了订单状态流转的合法性验证

## 常见问题

### Q1：收到支付成功回调但订单未更新？
**原因**：
1. 回调接口被拦截器拦截（未正确放行）
2. 验签失败（密钥配置错误）
3. 业务逻辑抛出异常但未正确处理

**解决方案**：
1. 检查Spring Security/Sa-Token配置，确保回调路径放行
2. 对比支付平台和服务端的密钥配置
3. 查看服务端日志，排查业务异常
4. 使用支付平台提供的回调重发功能测试

### Q2：订单被重复处理（重复发货）？
**原因**：
1. 未实现幂等性控制
2. 分布式锁未生效或锁粒度不够
3. 订单状态判断有误

**解决方案**：
1. 在处理回调前，先查询订单当前状态
2. 使用Redis分布式锁，锁key使用订单号
3. 使用乐观锁（version字段）更新订单状态

### Q3：支付金额与订单金额不一致？
**原因**：
1. 前端篡改了支付金额
2. 未进行金额二次校验
3. 使用了`double`/`float`导致精度丢失

**解决方案**：
1. 在下单接口中，根据订单号从数据库查询实际金额进行校验
2. 在回调接口中，对比支付金额和订单金额
3. 统一使用`BigDecimal`处理金额

### Q4：回调响应超时导致重复通知？
**原因**：
1. 回调处理逻辑耗时过长（如调用外部接口）
2. 数据库事务阻塞
3. 未快速返回响应

**解决方案**：
1. 回调处理应快速响应（建议<3秒）
2. 使用事件发布或MQ异步处理耗时业务
3. 避免在事务中进行外部HTTP调用
4. 优化数据库查询和更新性能

## 总结

支付功能集成是一个涉及资金安全的核心业务，必须严格遵循本规范的要求。重点关注以下几个方面：

1. **安全第一**：所有敏感信息必须在服务端处理，严禁暴露给前端
2. **幂等性控制**：通过订单状态检查和分布式锁确保不重复处理
3. **金额校验**：在下单和回调两个环节都要进行金额二次校验
4. **完善日志**：记录关键节点和异常信息，便于问题排查和对账
5. **异步解耦**：使用事件或MQ处理后续业务，确保回调快速响应

遵循这些规范，可以构建一个安全、可靠、易维护的支付系统。
