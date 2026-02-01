---
name: security-guard
description: |
  基于若依-vue-plus框架的系统安全防护与权限控制完整规范。全面覆盖接口鉴权、数据权限隔离、输入校验、SQL注入防护、XSS攻击防护、敏感数据脱敏、CSRF防护、文件上传安全及日志安全。
  
  触发场景：
  - 开发或审查任何Controller接口时
  - 处理用户输入和表单数据时
  - 配置数据范围或部门权限时
  - 处理敏感数据（密码、身份证、手机号、银行卡）时
  - 实现文件上传/下载功能时
  - 编写SQL查询和数据库操作时
  - 配置安全策略和过滤器时
  - 输出用户可见的数据时
  
  触发词：安全防护、权限校验、防注入、数据脱敏、XSS过滤、接口鉴权、数据权限、输入验证、文件上传、CSRF防护、日志安全、Token校验、越权访问
---

# 若依安全防护与权限控制规范

## 技能目标
本技能帮助开发者在基于若依-vue-plus框架的项目中建立完善的安全防护体系，确保：
1. 所有接口都经过适当的权限验证，防止未授权访问
2. 用户数据严格按照权限范围隔离，防止越权查看
3. 有效防御常见Web安全攻击（SQL注入、XSS、CSRF、文件上传攻击等）
4. 敏感数据得到适当的保护和脱敏处理
5. 安全日志规范且不泄露敏感信息
6. 符合等保2.0和OWASP Top 10安全标准

---

## 核心规范

### 规范1：接口鉴权与数据权限隔离

**适用场景：** 所有Controller层接口开发、数据查询、多租户/多部门系统

**详细说明：**
- **接口级权限：** 所有对外暴露的Controller接口必须添加`@SaCheckPermission`注解进行细粒度权限控制
- **用户身份获取：** 严禁在业务逻辑中硬编码"当前用户ID"，必须通过`SecurityUtils.getUserId()`从Token上下文中动态获取
- **防止参数篡改：** 严禁信任前端传递的userId、deptId等敏感参数，必须从服务端Token中提取
- **数据范围隔离：** 对于需要部门数据隔离的场景，必须在Service层的查询方法上使用`@DataScope`注解
- **实体字段配置：** 在实体类中需要配置`deptId`、`userId`字段以支持数据权限过滤
- **越权访问校验：** 查询或操作他人数据前，必须校验当前用户是否有权限访问该数据

**权限注解说明：**
- `@SaCheckPermission("system:user:list")`：接口级权限控制
- `@SaCheckRole("admin")`：角色级权限控制
- `@DataScope(deptAlias = "d", userAlias = "u")`：数据范围权限控制（本人、部门、全部等）

**示例代码：**
```java
@RestController
@RequestMapping("/system/order")
public class SysOrderController extends BaseController {

    @Autowired
    private ISysOrderService orderService;

    /**
     * 查询订单列表（带数据权限过滤）
     */
    @SaCheckPermission("system:order:list")
    @GetMapping("/list")
    public TableDataInfo<SysOrder> list(SysOrder order) {
        startPage();
        // Service层会自动根据DataScope注解拼接SQL，过滤非本部门数据
        List<SysOrder> list = orderService.selectOrderList(order);
        return getDataTable(list);
    }

    /**
     * 获取订单详情（校验数据归属权）
     */
    @SaCheckPermission("system:order:query")
    @GetMapping("/{orderId}")
    public AjaxResult getInfo(@PathVariable Long orderId) {
        // ✅ 正确：从Token上下文获取当前用户ID
        Long currentUserId = SecurityUtils.getUserId();
        
        // 查询订单
        SysOrder order = orderService.selectOrderById(orderId);
        if (order == null) {
            return AjaxResult.error("订单不存在");
        }
        
        // ✅ 正确：校验数据归属权，防止越权访问
        if (!order.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            log.warn("用户{}尝试访问非本人订单{}", currentUserId, orderId);
            return AjaxResult.error("无权访问该订单数据");
        }
        
        return success(order);
    }

    /**
     * 新增订单
     */
    @SaCheckPermission("system:order:add")
    @Log(title = "订单管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody SysOrder order) {
        // ✅ 正确：服务端设置创建人ID，不信任前端传参
        order.setCreateBy(SecurityUtils.getUsername());
        order.setUserId(SecurityUtils.getUserId());
        order.setDeptId(SecurityUtils.getDeptId());
        
        return toAjax(orderService.insertOrder(order));
    }

    /**
     * 修改订单
     */
    @SaCheckPermission("system:order:edit")
    @Log(title = "订单管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@Validated @RequestBody SysOrder order) {
        // ✅ 正确：先查询再校验，防止横向越权
        SysOrder existOrder = orderService.selectOrderById(order.getOrderId());
        if (existOrder == null) {
            return AjaxResult.error("订单不存在");
        }
        
        Long currentUserId = SecurityUtils.getUserId();
        if (!existOrder.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            return AjaxResult.error("无权修改该订单");
        }
        
        // ✅ 正确：防止前端篡改userId和deptId
        order.setUserId(existOrder.getUserId());
        order.setDeptId(existOrder.getDeptId());
        order.setUpdateBy(SecurityUtils.getUsername());
        
        return toAjax(orderService.updateOrder(order));
    }
}
```

**Service层数据权限配置示例：**
```java
@Service
public class SysOrderServiceImpl implements ISysOrderService {

    @Autowired
    private SysOrderMapper orderMapper;

    /**
     * 查询订单列表（自动应用数据权限）
     * deptAlias: 部门表别名
     * userAlias: 用户表别名（如果需要按用户过滤）
     */
    @Override
    @DataScope(deptAlias = "d", userAlias = "u")
    public List<SysOrder> selectOrderList(SysOrder order) {
        // 框架会自动在SQL中添加数据权限过滤条件
        return orderMapper.selectOrderList(order);
    }
}
```

---

### 规范2：输入校验与SQL注入防护

**适用场景：** 所有接收用户输入的接口、数据库查询操作

**详细说明：**
- **永不信任前端：** 严禁直接信任前端参数，所有输入都视为不可信
- **JSR-303校验：** DTO或Entity必须使用JSR-303注解（如`@NotBlank`、`@Pattern`、`@Size`）进行格式校验
- **控制器层校验：** Controller方法参数必须添加`@Validated`或`@Valid`注解开启校验
- **SQL预编译：** MyBatis-Plus或Mapper XML中严禁使用`${}`进行参数拼接，必须使用`#{}`以防止SQL注入
- **动态SQL安全：** 如果必须使用动态排序或动态字段，必须使用白名单校验
- **特殊字符处理：** 对于Like查询，必须对`%`、`_`等特殊字符进行转义

**校验注解说明：**
- `@NotNull`：不能为null
- `@NotBlank`：不能为null且trim后长度大于0
- `@Size(min=, max=)`：字符串、集合、数组长度范围
- `@Pattern(regexp=)`：正则表达式校验
- `@Email`：邮箱格式校验
- `@Min`、`@Max`：数值范围校验

**示例代码：**

```java
/**
 * 用户注册DTO（输入校验）
 */
public class SysUserRegisterDTO {

    @NotBlank(message = "用户账号不能为空")
    @Size(min = 2, max = 30, message = "用户账号长度必须在2到30个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户账号只能包含字母、数字和下划线")
    private String userName;

    @NotBlank(message = "用户密码不能为空")
    @Size(min = 6, max = 20, message = "用户密码长度必须在6到20个字符之间")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{6,}$", 
             message = "密码必须包含大小写字母和数字")
    private String password;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phonenumber;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$",
             message = "身份证号格式不正确")
    private String idCard;
}

/**
 * Controller层开启校验
 */
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    @PostMapping("/register")
    public AjaxResult register(@Validated @RequestBody SysUserRegisterDTO userDTO) {
        // ✅ 如果校验失败，框架会自动拦截并返回400错误
        // ✅ 此时userDTO中的数据已经通过格式校验
        return userService.register(userDTO);
    }
}
```

**Mapper XML安全示例：**
```xml
<!-- ✅ 安全：使用预编译 #{} -->
<select id="selectUserById" resultType="SysUser">
    SELECT user_id, user_name, nick_name, email, phonenumber
    FROM sys_user
    WHERE user_id = #{userId}
</select>

<!-- ✅ 安全：Like查询使用concat函数 -->
<select id="selectUserList" resultType="SysUser">
    SELECT user_id, user_name, nick_name
    FROM sys_user
    WHERE user_name LIKE CONCAT('%', #{userName}, '%')
</select>

<!-- ❌ 危险：禁止使用 ${} 拼接用户输入 -->
<!-- 
<select id="selectUserByName" resultType="SysUser">
    SELECT * FROM sys_user WHERE user_name = '${userName}'
</select>
这样会导致SQL注入！如果userName传入：' OR '1'='1
实际SQL变成：SELECT * FROM sys_user WHERE user_name = '' OR '1'='1'
-->

<!-- ⚠️ 特殊情况：动态排序需要白名单校验 -->
<select id="selectUserList" resultType="SysUser">
    SELECT user_id, user_name, create_time
    FROM sys_user
    <where>
        <if test="userName != null and userName != ''">
            AND user_name LIKE CONCAT('%', #{userName}, '%')
        </if>
    </where>
    <!-- ✅ 后端需要白名单校验orderByColumn -->
    <if test="orderByColumn != null and orderByColumn != ''">
        ORDER BY ${orderByColumn} ${isAsc}
    </if>
</select>
```

**动态排序白名单校验：**
```java
public class BaseEntity {
    // 允许排序的字段白名单
    private static final Set<String> ALLOWED_SORT_FIELDS = 
        new HashSet<>(Arrays.asList("user_id", "user_name", "create_time", "update_time"));

    private String orderByColumn;
    private String isAsc;

    public void setOrderByColumn(String orderByColumn) {
        // ✅ 白名单校验，防止SQL注入
        if (StringUtils.isNotEmpty(orderByColumn) && ALLOWED_SORT_FIELDS.contains(orderByColumn)) {
            this.orderByColumn = orderByColumn;
        } else {
            throw new ServiceException("非法的排序字段");
        }
    }

    public void setIsAsc(String isAsc) {
        // ✅ 只允许ASC或DESC
        if ("ASC".equalsIgnoreCase(isAsc) || "DESC".equalsIgnoreCase(isAsc)) {
            this.isAsc = isAsc;
        } else {
            this.isAsc = "ASC";
        }
    }
}
```

---

### 规范3：敏感数据脱敏与加密存储

**适用场景：** 处理密码、身份证、手机号、银行卡、地址等敏感信息

**详细说明：**
- **密码存储：** 密码必须使用BCrypt等不可逆加密算法存储，严禁明文或MD5存储
- **传输加密：** 敏感数据传输必须使用HTTPS，密码等信息前端传输前应RSA加密
- **输出脱敏：** 返回给前端的敏感数据必须脱敏处理（如手机号中间4位、身份证中间10位）
- **日志脱敏：** 日志中严禁输出完整的敏感信息
- **Token安全：** JWT中严禁包含密码等敏感信息
- **脱敏注解：** 使用`@Sensitive`注解自动脱敏

**脱敏规则：**
- 手机号：138****5678
- 身份证：340101****12345678
- 银行卡：6222 **** **** 1234
- 姓名：张*三（3字保留首尾）
- 邮箱：abc***@qq.com
- 地址：北京市朝阳区****

**示例代码：**

```java
/**
 * 用户实体（输出脱敏）
 */
public class SysUserVO {
    
    private Long userId;
    
    private String userName;
    
    /**
     * 手机号脱敏：138****5678
     */
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phonenumber;
    
    /**
     * 身份证脱敏：340101****12345678
     */
    @Sensitive(strategy = SensitiveStrategy.ID_CARD)
    private String idCard;
    
    /**
     * 邮箱脱敏：abc***@qq.com
     */
    @Sensitive(strategy = SensitiveStrategy.EMAIL)
    private String email;
    
    /**
     * 银行卡脱敏：6222 **** **** 1234
     */
    @Sensitive(strategy = SensitiveStrategy.BANK_CARD)
    private String bankCard;
    
    // ✅ 密码字段不返回给前端
    // private String password; // 不要在VO中包含密码字段
}

/**
 * 密码加密工具类
 */
@Component
public class PasswordService {
    
    /**
     * 加密密码
     */
    public String encryptPassword(String password) {
        // ✅ 使用BCrypt加密，每次加密结果都不同（带盐）
        return SecurityUtils.encryptPassword(password);
    }
    
    /**
     * 校验密码
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        return SecurityUtils.matchesPassword(rawPassword, encodedPassword);
    }
}

/**
 * 用户注册（密码加密）
 */
@Service
public class SysUserServiceImpl {
    
    @Autowired
    private PasswordService passwordService;
    
    public int register(SysUserRegisterDTO userDTO) {
        SysUser user = new SysUser();
        user.setUserName(userDTO.getUserName());
        
        // ✅ 密码加密后存储
        String encryptedPassword = passwordService.encryptPassword(userDTO.getPassword());
        user.setPassword(encryptedPassword);
        
        user.setPhonenumber(userDTO.getPhonenumber());
        user.setEmail(userDTO.getEmail());
        
        return userMapper.insertUser(user);
    }
    
    /**
     * 查询用户列表（自动脱敏）
     */
    public List<SysUserVO> selectUserList(SysUser user) {
        List<SysUser> userList = userMapper.selectUserList(user);
        // ✅ 转换为VO，自动应用脱敏规则
        return BeanCopyUtils.copyList(userList, SysUserVO.class);
    }
}

/**
 * 日志脱敏配置
 */
@Slf4j
public class SysLoginService {
    
    public void recordLoginInfo(String userName, String password) {
        // ❌ 错误：日志中明文打印密码
        // log.info("用户{}登录，密码：{}", userName, password);
        
        // ✅ 正确：日志中不打印密码或打印掩码
        log.info("用户{}尝试登录", userName);
    }
    
    public void recordUserInfo(SysUser user) {
        // ❌ 错误：日志中打印完整敏感信息
        // log.info("用户信息：{}", user);
        
        // ✅ 正确：日志中脱敏
        log.info("用户信息：userName={}, phone={}", 
            user.getUserName(), 
            DesensitizedUtil.mobilePhone(user.getPhonenumber()));
    }
}
```

**前端RSA加密传输示例（可选）：**
```java
/**
 * RSA解密登录密码
 */
@RestController
public class SysLoginController {
    
    @Autowired
    private RSAUtils rsaUtils;
    
    @PostMapping("/login")
    public AjaxResult login(@RequestBody LoginBody loginBody) {
        // ✅ 前端使用RSA公钥加密密码传输
        // ✅ 后端使用私钥解密
        String decryptedPassword = rsaUtils.decryptByPrivateKey(loginBody.getPassword());
        
        // 进行登录验证
        String token = loginService.login(loginBody.getUsername(), decryptedPassword);
        return success(Map.of("token", token));
    }
}
```

---

### 规范4：XSS跨站脚本攻击防护

**适用场景：** 所有接收用户输入并展示的场景（富文本编辑器、评论、昵称等）

**详细说明：**
- **输入过滤：** 若依框架已内置XSS过滤器，自动对用户输入进行转义
- **输出编码：** 前端展示用户输入内容时，必须进行HTML编码
- **富文本处理：** 富文本编辑器内容必须使用白名单过滤，只允许安全标签
- **JSON输出：** 使用`@RestController`自动进行JSON编码，防止XSS
- **不要禁用：** 严禁通过`@Xss(enable=false)`禁用XSS过滤器

**XSS攻击示例：**
```javascript
// 攻击者输入的恶意脚本
<script>alert(document.cookie)</script>
<img src=x onerror="alert(document.cookie)">
<a href="javascript:alert(1)">点击</a>
```

**防护代码示例：**

```java
/**
 * XSS过滤配置（框架已内置）
 */
@Configuration
public class FilterConfig {
    
    @Bean
    public FilterRegistrationBean<XssFilter> xssFilterRegistration() {
        FilterRegistrationBean<XssFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new XssFilter());
        // ✅ 对所有请求进行XSS过滤
        registration.addUrlPatterns("/*");
        registration.setName("xssFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}

/**
 * 用户评论实体
 */
public class SysComment {
    
    private Long commentId;
    
    /**
     * ✅ 评论内容会自动进行XSS过滤
     * 输入：<script>alert(1)</script>
     * 存储：&lt;script&gt;alert(1)&lt;/script&gt;
     */
    private String content;
    
    /**
     * ✅ 富文本内容使用白名单过滤
     */
    @Xss(mode = XssMode.WHITE_LIST)
    private String richContent;
}

/**
 * 富文本白名单配置
 */
@Component
public class XssWhiteListConfig {
    
    // ✅ 只允许安全的HTML标签和属性
    private static final Safelist WHITE_LIST = Safelist.relaxed()
        .addTags("h1", "h2", "h3", "h4", "h5", "h6")
        .addAttributes("a", "href", "title", "target")
        .addAttributes("img", "src", "alt", "width", "height")
        .addProtocols("a", "href", "http", "https", "mailto")
        .addProtocols("img", "src", "http", "https");
    
    public String clean(String html) {
        // ✅ 使用Jsoup清理HTML，只保留白名单标签
        return Jsoup.clean(html, WHITE_LIST);
    }
}

/**
 * Controller层（自动XSS防护）
 */
@RestController
@RequestMapping("/system/comment")
public class SysCommentController {
    
    @PostMapping
    public AjaxResult add(@Validated @RequestBody SysComment comment) {
        // ✅ comment.getContent()已经过XSS过滤
        // ✅ 框架自动转义了<script>等危险标签
        return toAjax(commentService.insertComment(comment));
    }
    
    @GetMapping("/list")
    public TableDataInfo<SysComment> list(SysComment comment) {
        List<SysComment> list = commentService.selectCommentList(comment);
        // ✅ 返回JSON时自动进行HTML编码
        return getDataTable(list);
    }
}
```

**前端防护示例：**
```javascript
// ✅ Vue中使用双大括号自动转义
<template>
  <div>{{ comment.content }}</div>
</template>

// ❌ 使用v-html会执行脚本，必须确保内容已过滤
<template>
  <div v-html="comment.richContent"></div>
</template>

// ✅ React中JSX自动转义
function Comment({ content }) {
  return <div>{content}</div>;
}

// ❌ 使用dangerouslySetInnerHTML有风险
function RichComment({ html }) {
  // 必须确保html已经过后端白名单过滤
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

---

### 规范5：文件上传安全

**适用场景：** 所有文件上传功能（头像、附件、Excel导入等）

**详细说明：**
- **文件类型校验：** 必须校验文件扩展名和MIME类型（双重校验）
- **文件大小限制：** 必须限制单个文件和总文件大小
- **文件名处理：** 不信任原始文件名，使用UUID重命名
- **存储路径隔离：** 上传文件存储在非Web目录或使用对象存储
- **图片校验：** 图片文件必须进行二次校验，读取图片内容确认格式
- **禁止执行：** 上传目录必须配置禁止脚本执行
- **病毒扫描：** 重要系统应集成病毒扫描引擎

**文件上传攻击示例：**
```
1. 上传恶意脚本：shell.jsp、webshell.php
2. 文件名攻击：../../../etc/passwd
3. 双写绕过：shell.jsp.jpg
4. MIME伪造：修改Content-Type为image/jpeg
5. 图片马：在图片中嵌入PHP代码
```

**防护代码示例：**

```java
/**
 * 文件上传配置
 */
@Configuration
public class FileUploadConfig {
    
    // ✅ 允许上传的文件扩展名白名单
    public static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(
        Arrays.asList("jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx")
    );
    
    // ✅ 允许的图片MIME类型
    public static final Set<String> ALLOWED_IMAGE_TYPES = new HashSet<>(
        Arrays.asList("image/jpeg", "image/png", "image/gif")
    );
    
    // ✅ 单个文件大小限制：10MB
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    // ✅ 上传目录（非Web可访问目录）
    public static final String UPLOAD_DIR = "/data/upload/";
}

/**
 * 文件上传服务
 */
@Service
public class SysFileService {
    
    /**
     * 上传文件（安全校验）
     */
    public SysFile uploadFile(MultipartFile file) throws IOException {
        // ✅ 1. 校验文件是否为空
        if (file.isEmpty()) {
            throw new ServiceException("上传文件不能为空");
        }
        
        // ✅ 2. 校验文件大小
        if (file.getSize() > FileUploadConfig.MAX_FILE_SIZE) {
            throw new ServiceException("文件大小超过限制，最大10MB");
        }
        
        // ✅ 3. 获取原始文件名并校验
        String originalFilename = file.getOriginalFilename();
        if (StringUtils.isEmpty(originalFilename)) {
            throw new ServiceException("文件名不能为空");
        }
        
        // ✅ 4. 防止目录遍历攻击
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new ServiceException("文件名不合法");
        }
        
        // ✅ 5. 校验文件扩展名（白名单）
        String extension = FileUtils.getExtension(originalFilename).toLowerCase();
        if (!FileUploadConfig.ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ServiceException("不允许上传该类型的文件：" + extension);
        }
        
        // ✅ 6. 校验MIME类型
        String contentType = file.getContentType();
        if (isImageFile(extension)) {
            // 图片文件需要校验MIME类型
            if (!FileUploadConfig.ALLOWED_IMAGE_TYPES.contains(contentType)) {
                throw new ServiceException("文件MIME类型不匹配");
            }
            
            // ✅ 7. 图片文件进行二次校验（读取图片内容）
            if (!isValidImage(file)) {
                throw new ServiceException("图片文件校验失败，可能包含恶意代码");
            }
        }
        
        // ✅ 8. 使用UUID生成新文件名，防止文件名攻击
        String newFileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        
        // ✅ 9. 构建存储路径（按日期分目录）
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String filePath = FileUploadConfig.UPLOAD_DIR + datePath + "/" + newFileName;
        
        // ✅ 10. 保存文件
        File dest = new File(filePath);
        dest.getParentFile().mkdirs();
        file.transferTo(dest);
        
        // ✅ 11. 设置文件权限（Linux下禁止执行）
        dest.setExecutable(false);
        dest.setReadable(true);
        dest.setWritable(false);
        
        // ✅ 12. 记录上传日志
        SysFile sysFile = new SysFile();
        sysFile.setFileName(originalFilename);
        sysFile.setFilePath(filePath);
        sysFile.setFileSize(file.getSize());
        sysFile.setFileType(extension);
        sysFile.setCreateBy(SecurityUtils.getUsername());
        
        return sysFile;
    }
    
    /**
     * 校验是否为有效图片
     */
    private boolean isValidImage(MultipartFile file) {
        try {
            // ✅ 使用ImageIO读取图片，如果不是有效图片会抛出异常
            BufferedImage image = ImageIO.read(file.getInputStream());
            return image != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 判断是否为图片文件
     */
    private boolean isImageFile(String extension) {
        return Arrays.asList("jpg", "jpeg", "png", "gif").contains(extension);
    }
}

/**
 * 文件上传Controller
 */
@RestController
@RequestMapping("/system/file")
public class SysFileController {
    
    @Autowired
    private SysFileService fileService;
    
    /**
     * 上传文件
     */
    @SaCheckPermission("system:file:upload")
    @PostMapping("/upload")
    public AjaxResult upload(@RequestParam("file") MultipartFile file) {
        try {
            SysFile sysFile = fileService.uploadFile(file);
            return success(sysFile);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return error("文件上传失败：" + e.getMessage());
        }
    }
    
    /**
     * 下载文件
     */
    @SaCheckPermission("system:file:download")
    @GetMapping("/download/{fileId}")
    public void download(@PathVariable Long fileId, HttpServletResponse response) {
        SysFile sysFile = fileService.selectFileById(fileId);
        if (sysFile == null) {
            throw new ServiceException("文件不存在");
        }
        
        // ✅ 校验文件路径，防止目录遍历
        File file = new File(sysFile.getFilePath());
        if (!file.exists() || !file.isFile()) {
            throw new ServiceException("文件不存在或已被删除");
        }
        
        // ✅ 校验文件路径是否在上传目录内
        String canonicalPath = file.getCanonicalPath();
        if (!canonicalPath.startsWith(FileUploadConfig.UPLOAD_DIR)) {
            throw new ServiceException("非法的文件路径");
        }
        
        // ✅ 设置响应头，防止XSS
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment; filename=" + 
            URLEncoder.encode(sysFile.getFileName(), "UTF-8"));
        
        // ✅ 输出文件流
        try (InputStream inputStream = new FileInputStream(file);
             OutputStream outputStream = response.getOutputStream()) {
            IOUtils.copy(inputStream, outputStream);
        } catch (IOException e) {
            log.error("文件下载失败", e);
        }
    }
}
```

**Nginx配置（禁止执行上传目录脚本）：**
```nginx
# ✅ 禁止上传目录执行PHP、JSP等脚本
location ~ ^/upload/.*\.(php|jsp|asp|aspx|sh)$ {
    deny all;
}

# ✅ 设置上传目录只允许静态文件访问
location /upload/ {
    alias /data/upload/;
    # 禁止执行脚本
    location ~ \.(php|jsp|asp|aspx|sh)$ {
        return 403;
    }
}
```

---

## 禁止事项

### 权限控制类
- ❌ **禁止省略权限注解**：Controller或Service方法中省略`@SaCheckPermission`注解，导致接口未授权可访问
- ❌ **禁止信任前端参数**：通过前端传递的userId、deptId等敏感参数直接用于数据查询，必须从Token获取
- ❌ **禁止硬编码用户ID**：在代码中硬编码当前用户ID或角色判断，必须使用`SecurityUtils`动态获取
- ❌ **禁止忽略数据权限**：跨部门查询数据时未添加`@DataScope`注解，导致数据泄露
- ❌ **禁止省略越权校验**：修改或删除数据前未校验数据归属权，导致横向越权

### 输入校验类
- ❌ **禁止省略输入校验**：Controller方法参数未添加`@Validated`注解，导致脏数据进入系统
- ❌ **禁止信任前端校验**：仅在前端进行格式校验，后端未做二次校验
- ❌ **禁止使用${}拼接SQL**：MyBatis XML中使用`${}`接收用户输入，必须使用`#{}`预编译
- ❌ **禁止动态SQL无白名单**：动态排序、动态字段查询未进行白名单校验，导致SQL注入风险
- ❌ **禁止拼接SQL语句**：在Service层手动拼接SQL字符串，必须使用MyBatis-Plus或Mapper

### 敏感数据类
- ❌ **禁止明文存储密码**：密码使用MD5或明文存储，必须使用BCrypt等不可逆加密
- ❌ **禁止日志输出敏感信息**：日志中打印完整的密码、Token、身份证、银行卡等敏感数据
- ❌ **禁止返回未脱敏数据**：接口返回给前端的敏感数据未脱敏处理
- ❌ **禁止JWT包含敏感信息**：JWT Token中包含密码、完整身份证等敏感字段
- ❌ **禁止前端存储敏感数据**：在localStorage或sessionStorage中存储完整敏感信息

### XSS防护类
- ❌ **禁止禁用XSS过滤器**：通过`@Xss(enable=false)`或移除XSS过滤器
- ❌ **禁止富文本无白名单**：富文本编辑器内容未进行白名单过滤直接存储和展示
- ❌ **禁止前端不转义输出**：前端使用`v-html`或`dangerouslySetInnerHTML`直接输出未过滤内容
- ❌ **禁止拼接HTML字符串**：在Java代码中手动拼接HTML，未进行转义

### 文件上传类
- ❌ **禁止不校验文件类型**：仅校验文件扩展名或仅校验MIME类型，必须双重校验
- ❌ **禁止信任原始文件名**：直接使用用户上传的原始文件名，可能导致目录遍历攻击
- ❌ **禁止上传目录可执行**：上传目录未配置禁止脚本执行，可能被上传Webshell
- ❌ **禁止不限制文件大小**：未限制单个文件和总上传大小，可能导致磁盘占满
- ❌ **禁止下载无路径校验**：文件下载时未校验文件路径，可能导致任意文件下载漏洞

### 其他安全类
- ❌ **禁止关闭CSRF防护**：在重要操作（修改、删除）接口关闭CSRF Token校验
- ❌ **禁止暴露详细错误**：生产环境返回详细的异常堆栈信息给前端
- ❌ **禁止使用弱密码策略**：允许用户设置简单密码（如123456）
- ❌ **禁止无限制重试**：登录、验证码等接口未限制重试次数，可能被暴力破解
- ❌ **禁止Token永不过期**：JWT Token设置过长的过期时间或永不过期

---

## 安全检查清单

### 开发阶段检查
- [ ] **权限注解完整性**：所有Controller接口都添加了`@SaCheckPermission`注解
- [ ] **数据权限配置**：涉及多部门数据的Service方法添加了`@DataScope`注解
- [ ] **输入校验完整性**：所有接收用户输入的DTO都添加了JSR-303校验注解
- [ ] **SQL预编译**：所有Mapper XML都使用`#{}`而非`${}`接收参数
- [ ] **敏感数据脱敏**：返回前端的VO中敏感字段添加了`@Sensitive`注解
- [ ] **密码加密存储**：密码使用BCrypt加密存储
- [ ] **文件上传校验**：文件上传进行了类型、大小、内容的三重校验
- [ ] **XSS过滤开启**：未禁用XSS过滤器，富文本使用白名单过滤
- [ ] **日志安全**：日志中未输出密码、Token等敏感信息
- [ ] **越权校验**：修改、删除、查询他人数据前进行了权限校验

### 代码审查检查
- [ ] **SecurityUtils使用**：获取当前用户信息使用`SecurityUtils`而非前端传参
- [ ] **硬编码检查**：代码中无硬编码的用户ID、角色判断
- [ ] **异常处理**：生产环境未返回详细异常信息给前端
- [ ] **Token安全**：JWT中未包含敏感信息
- [ ] **前端参数信任**：未直接信任前端传递的userId、deptId等参数
- [ ] **动态SQL白名单**：动态排序、动态字段进行了白名单校验
- [ ] **文件下载路径校验**：文件下载时校验了文件路径合法性
- [ ] **CSRF防护**：重要操作接口启用了CSRF Token校验

### 测试阶段检查
- [ ] **越权测试**：测试普通用户是否能访问管理员接口
- [ ] **横向越权测试**：测试用户A是否能访问用户B的数据
- [ ] **SQL注入测试**：使用`' OR '1'='1`等payload测试SQL注入
- [ ] **XSS攻击测试**：输入`<script>alert(1)</script>`测试XSS防护
- [ ] **文件上传攻击测试**：尝试上传`shell.jsp`、`test.php`等脚本文件
- [ ] **密码强度测试**：尝试设置弱密码（如123456）是否被拦截
- [ ] **暴力破解测试**：测试登录接口是否有重试次数限制
- [ ] **敏感数据泄露测试**：检查接口返回是否包含未脱敏的敏感数据

### 上线前检查
- [ ] **HTTPS配置**：生产环境已启用HTTPS
- [ ] **上传目录权限**：上传目录已配置禁止脚本执行
- [ ] **日志脱敏**：日志组件已配置敏感字段脱敏规则
- [ ] **错误页面**：生产环境已配置统一错误页面，不暴露技术栈信息
- [ ] **安全头配置**：Nginx已配置`X-Frame-Options`、`X-XSS-Protection`等安全头
- [ ] **数据库权限**：应用数据库账号遵循最小权限原则
- [ ] **Redis安全**：Redis已设置密码且未使用默认端口
- [ ] **备份策略**：已配置数据库定期备份策略

---

## 参考代码与文档

### 若依框架核心安全类
- **SecurityConfig.java**：`ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java`
  - Sa-Token安全配置
  - 跨域配置
  - 认证拦截器配置

- **SecurityUtils.java**：`ruoyi-common/src/main/java/com/ruoyi/common/utils/SecurityUtils.java`
  - 获取当前用户ID：`SecurityUtils.getUserId()`
  - 获取当前用户名：`SecurityUtils.getUsername()`
  - 获取当前部门ID：`SecurityUtils.getDeptId()`
  - 判断是否管理员：`SecurityUtils.isAdmin()`
  - 密码加密：`SecurityUtils.encryptPassword()`
  - 密码校验：`SecurityUtils.matchesPassword()`

- **DataScopeInterceptor.java**：`ruoyi-framework/src/main/java/com/ruoyi/framework/interceptor/DataScopeInterceptor.java`
  - 数据权限拦截器
  - 自动拼接SQL数据过滤条件

- **XssFilter.java**：`ruoyi-framework/src/main/java/com/ruoyi/framework/filter/XssFilter.java`
  - XSS过滤器
  - 自动转义用户输入

### 实体类示例
- **SysUser.java**：`ruoyi-system/src/main/java/com/ruoyi/system/domain/SysUser.java`
  - 用户实体
  - 敏感字段脱敏配置

- **BaseEntity.java**：`ruoyi-common/src/main/java/com/ruoyi/common/core/domain/BaseEntity.java`
  - 基础实体
  - 创建人、更新人字段

### 配置文件
- **application.yml**：安全相关配置
  ```yaml
  # Sa-Token配置
  sa-token:
    # Token有效期（单位：秒）
    timeout: 7200
    # Token临时有效期（记住我功能，单位：秒）
    activity-timeout: 1800
    # 是否允许同一账号并发登录
    is-concurrent: false
    # 是否共享Token（多端登录）
    is-share: false
    # Token前缀
    token-name: Authorization
  
  # 文件上传配置
  file:
    # 上传路径
    upload-path: /data/upload/
    # 单个文件大小限制（MB）
    max-file-size: 10
    # 总文件大小限制（MB）
    max-request-size: 50
    # 允许上传的文件类型
    allowed-extensions:
      - jpg
      - jpeg
      - png
      - gif
      - pdf
      - doc
      - docx
      - xls
      - xlsx
  
  # 日志脱敏配置
  logging:
    pattern:
      console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n"
    # 敏感字段脱敏
    desensitize:
      enabled: true
      fields:
        - password
        - idCard
        - phone
        - bankCard
  ```

---

## 安全最佳实践

### 1. 纵深防御原则
不依赖单一防护措施，而是建立多层防护体系：
- 前端输入校验（提升用户体验）
- 后端参数校验（必须，不信任前端）
- SQL预编译（防SQL注入）
- 数据权限过滤（防越权）
- 输出脱敏（防信息泄露）

### 2. 最小权限原则
- 用户只能访问其工作所需的最小数据范围
- 数据库账号只分配必需的权限（避免使用root）
- 接口权限粒度细化到按钮级别

### 3. 白名单优于黑名单
- 文件上传只允许白名单内的扩展名
- 动态SQL只允许白名单内的字段名和表名
- 富文本只允许白名单内的HTML标签

### 4. 默认安全
- 新增接口默认需要权限验证（而非默认公开）
- 敏感字段默认脱敏（而非需要时才脱敏）
- 日志默认不输出敏感信息

### 5. 纵深防御
- 即使XSS过滤失效，前端也要进行HTML编码
- 即使权限注解失效，Service层也要校验数据归属权
- 即使文件类型校验失效，上传目录也禁止脚本执行

---

## 常见安全漏洞与修复

### 1. SQL注入漏洞
**漏洞代码：**
```xml
<!-- ❌ 危险：使用${}拼接 -->
<select id="selectUserByName">
    SELECT * FROM sys_user WHERE user_name = '${userName}'
</select>
```

**修复方案：**
```xml
<!-- ✅ 安全：使用#{}预编译 -->
<select id="selectUserByName">
    SELECT * FROM sys_user WHERE user_name = #{userName}
</select>
```

### 2. 越权访问漏洞
**漏洞代码：**
```java
// ❌ 危险：直接使用前端传递的userId
@GetMapping("/getUserInfo")
public AjaxResult getUserInfo(Long userId) {
    SysUser user = userService.selectUserById(userId);
    return success(user);
}
```

**修复方案：**
```java
// ✅ 安全：从Token获取userId
@SaCheckPermission("system:user:query")
@GetMapping("/getUserInfo")
public AjaxResult getUserInfo() {
    Long userId = SecurityUtils.getUserId();
    SysUser user = userService.selectUserById(userId);
    return success(user);
}
```

### 3. XSS跨站脚本漏洞
**漏洞代码：**
```java
// ❌ 危险：禁用XSS过滤
@Xss(enable = false)
private String comment;
```

**修复方案：**
```java
// ✅ 安全：启用XSS过滤（默认）
private String comment;

// ✅ 富文本使用白名单
@Xss(mode = XssMode.WHITE_LIST)
private String richContent;
```

### 4. 敏感信息泄露
**漏洞代码：**
```java
// ❌ 危险：返回完整用户信息
@GetMapping("/list")
public List<SysUser> list() {
    return userService.selectUserList();
}
```

**修复方案：**
```java
// ✅ 安全：返回脱敏后的VO
@GetMapping("/list")
public List<SysUserVO> list() {
    List<SysUser> users = userService.selectUserList();
    return BeanCopyUtils.copyList(users, SysUserVO.class);
}
```

### 5. 文件上传漏洞
**漏洞代码：**
```java
// ❌ 危险：仅校验扩展名
String ext = getExtension(filename);
if ("jpg".equals(ext)) {
    file.transferTo(new File("/upload/" + filename));
}
```

**修复方案：**
```java
// ✅ 安全：三重校验+重命名
// 1. 校验扩展名白名单
// 2. 校验MIME类型
// 3. 图片二次校验（读取内容）
// 4. UUID重命名
// 5. 路径防护
String newFileName = UUID.randomUUID() + "." + ext;
file.transferTo(new File(uploadDir + newFileName));
```

---

## 应用示例：完整的用户管理模块

以下是一个符合安全规范的完整用户管理模块示例：

```java
/**
 * 用户Controller（完整安全实现）
 */
@RestController
@RequestMapping("/system/user")
public class SysUserController extends BaseController {

    @Autowired
    private ISysUserService userService;

    /**
     * 查询用户列表（数据权限过滤）
     */
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<SysUserVO> list(SysUserQuery query) {
        startPage();
        List<SysUser> list = userService.selectUserList(query);
        // ✅ 转换为VO并脱敏
        List<SysUserVO> voList = BeanCopyUtils.copyList(list, SysUserVO.class);
        return getDataTable(voList);
    }

    /**
     * 获取用户详情（越权校验）
     */
    @SaCheckPermission("system:user:query")
    @GetMapping("/{userId}")
    public AjaxResult getInfo(@PathVariable Long userId) {
        Long currentUserId = SecurityUtils.getUserId();
        
        // ✅ 只能查看自己或管理员可查看所有
        if (!userId.equals(currentUserId) && !SecurityUtils.isAdmin()) {
            return AjaxResult.error("无权查看该用户信息");
        }
        
        SysUser user = userService.selectUserById(userId);
        SysUserVO vo = BeanCopyUtils.copy(user, SysUserVO.class);
        return success(vo);
    }

    /**
     * 新增用户（输入校验+密码加密）
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody SysUserDTO userDTO) {
        // ✅ 校验用户名是否重复
        if (!userService.checkUserNameUnique(userDTO.getUserName())) {
            return AjaxResult.error("新增用户'" + userDTO.getUserName() + "'失败，用户名已存在");
        }
        
        // ✅ 校验手机号是否重复
        if (!userService.checkPhoneUnique(userDTO.getPhonenumber())) {
            return AjaxResult.error("新增用户'" + userDTO.getUserName() + "'失败，手机号已存在");
        }
        
        SysUser user = BeanCopyUtils.copy(userDTO, SysUser.class);
        
        // ✅ 密码加密
        user.setPassword(SecurityUtils.encryptPassword(userDTO.getPassword()));
        
        // ✅ 设置创建人信息
        user.setCreateBy(SecurityUtils.getUsername());
        
        return toAjax(userService.insertUser(user));
    }

    /**
     * 修改用户（越权校验+敏感字段保护）
     */
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@Validated @RequestBody SysUserDTO userDTO) {
        // ✅ 查询原数据
        SysUser existUser = userService.selectUserById(userDTO.getUserId());
        if (existUser == null) {
            return AjaxResult.error("用户不存在");
        }
        
        Long currentUserId = SecurityUtils.getUserId();
        
        // ✅ 只能修改自己或管理员可修改所有
        if (!existUser.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            return AjaxResult.error("无权修改该用户信息");
        }
        
        SysUser user = BeanCopyUtils.copy(userDTO, SysUser.class);
        
        // ✅ 防止前端篡改敏感字段
        user.setUserId(existUser.getUserId());
        user.setUserName(existUser.getUserName()); // 用户名不允许修改
        user.setPassword(existUser.getPassword()); // 密码通过专门接口修改
        user.setDeptId(existUser.getDeptId()); // 部门只能由管理员修改
        
        // ✅ 设置更新人信息
        user.setUpdateBy(SecurityUtils.getUsername());
        
        return toAjax(userService.updateUser(user));
    }

    /**
     * 删除用户（越权校验+软删除）
     */
    @SaCheckPermission("system:user:remove")
    @Log(title = "用户管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public AjaxResult remove(@PathVariable Long[] userIds) {
        // ✅ 不能删除管理员
        for (Long userId : userIds) {
            SysUser user = userService.selectUserById(userId);
            if (user.isAdmin()) {
                return AjaxResult.error("不允许删除管理员用户");
            }
        }
        
        // ✅ 软删除（更新del_flag字段）
        return toAjax(userService.deleteUserByIds(userIds));
    }

    /**
     * 重置密码（权限校验+密码加密）
     */
    @SaCheckPermission("system:user:resetPwd")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PutMapping("/resetPwd")
    public AjaxResult resetPwd(@RequestBody SysUserDTO userDTO) {
        // ✅ 校验密码格式
        if (!isValidPassword(userDTO.getPassword())) {
            return AjaxResult.error("密码必须包含大小写字母和数字，长度6-20位");
        }
        
        // ✅ 加密密码
        userDTO.setPassword(SecurityUtils.encryptPassword(userDTO.getPassword()));
        userDTO.setUpdateBy(SecurityUtils.getUsername());
        
        return toAjax(userService.resetPwd(userDTO));
    }

    /**
     * 修改个人密码（旧密码校验）
     */
    @PutMapping("/profile/updatePwd")
    public AjaxResult updatePwd(String oldPassword, String newPassword) {
        Long userId = SecurityUtils.getUserId();
        SysUser user = userService.selectUserById(userId);
        
        // ✅ 校验旧密码
        if (!SecurityUtils.matchesPassword(oldPassword, user.getPassword())) {
            return AjaxResult.error("旧密码错误");
        }
        
        // ✅ 校验新密码格式
        if (!isValidPassword(newPassword)) {
            return AjaxResult.error("新密码必须包含大小写字母和数字，长度6-20位");
        }
        
        // ✅ 新旧密码不能相同
        if (oldPassword.equals(newPassword)) {
            return AjaxResult.error("新密码不能与旧密码相同");
        }
        
        // ✅ 加密新密码
        user.setPassword(SecurityUtils.encryptPassword(newPassword));
        user.setUpdateBy(SecurityUtils.getUsername());
        
        return toAjax(userService.updateUser(user));
    }

    /**
     * 校验密码强度
     */
    private boolean isValidPassword(String password) {
        // 长度6-20，包含大小写字母和数字
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{6,20}$";
        return password.matches(regex);
    }
}
```

---

## 总结

本技能文档全面覆盖了若依-vue-plus框架的安全防护与权限控制规范，包括：

1. **接口鉴权与数据权限隔离**：防止未授权访问和越权查看
2. **输入校验与SQL注入防护**：防止恶意输入和SQL注入攻击
3. **敏感数据脱敏与加密存储**：保护用户隐私和敏感信息
4. **XSS跨站脚本攻击防护**：防止恶意脚本注入
5. **文件上传安全**：防止文件上传攻击和Webshell

遵循本规范可以有效防御OWASP Top 10中的大部分安全威胁，构建安全可靠的企业级应用系统。

**安全是一个持续的过程，不是一次性的任务。开发、测试、上线、运维的每个环节都要重视安全，建立安全意识和安全文化。**
