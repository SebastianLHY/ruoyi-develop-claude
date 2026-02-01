---
name: ruoyi-architecture-design
description: |
  基于若依-vue-plus（RuoYi-Vue-Plus）框架的系统架构设计与模块划分标准规范。
  
  【核心能力】
  - 定义标准四层分层架构（Controller/Service/Mapper/Entity）及其职责边界
  - 规范模块依赖关系与单向依赖原则（避免循环依赖）
  - 实施接口抽象与依赖倒置原则（DIP）
  - 确保高内聚低耦合的设计质量
  - 指导Maven模块化项目结构的合理划分
  
  【触发场景】
  - 规划新项目或微服务的目录结构与模块划分
  - 设计自定义业务模块（如订单、库存、运动健康等）
  - 解决类循环依赖、模块依赖混乱等架构问题
  - 重构现有代码组织，提升代码可维护性
  - 审查代码架构设计是否符合若依框架规范
  - 集成新的业务模块到现有若依项目中
  
  【触发词】
  架构设计、模块划分、分层架构、依赖注入、设计模式、包结构、若依框架、RuoYi、
  Controller、Service、Mapper、模块依赖、循环依赖、接口抽象、Maven模块、
  代码重构、项目结构、业务模块设计
---

# 若依架构设计规范 (RuoYi-Vue-Plus Architecture)

> 本规范基于若依-vue-plus框架（Spring Boot 3.x + MyBatis-Plus + Sa-Token）定义标准架构设计模式

---

## 一、核心规范

### 规范1：分层架构与模块职责边界

**设计原则：** 严格遵循MVC分层架构 + Maven多模块设计，确保每层职责单一、边界清晰。

**模块职责说明：**

| 模块名称 | 职责范围 | 允许内容 | 禁止内容 |
|---------|---------|---------|---------|
| **ruoyi-admin** | 应用启动与Web入口 | Controller、全局配置、启动类 | 业务逻辑、数据库操作、工具类 |
| **ruoyi-framework** | 框架核心功能 | 安全认证(Sa-Token)、缓存、日志、AOP切面、配置类 | 业务实体、具体业务逻辑 |
| **ruoyi-common** | 通用工具与常量 | 工具类、枚举、常量、通用注解 | 重型框架依赖(如MP)、业务逻辑 |
| **ruoyi-system** | 核心业务模块 | 用户/角色/权限等系统业务 | 与业务无关的通用功能 |
| **ruoyi-xxx** (自定义) | 扩展业务模块 | 独立业务领域的完整实现 | 核心系统功能的修改 |

**分层调用原则：**
```
客户端请求 
    ↓
【Controller层】 - 参数校验、权限校验、调用Service
    ↓ (只能调用Service接口)
【Service层】   - 业务逻辑、事务控制、数据转换
    ↓ (只能调用Mapper接口)
【Mapper层】    - 数据库CRUD、SQL映射
    ↓
【Database】
```

**严格禁止：**
- ❌ Controller直接调用Mapper
- ❌ Mapper层包含业务逻辑
- ❌ 跨层逆向调用（如Service调用Controller）
- ❌ 层级跳跃访问

**标准Controller示例：**

```java
/**
 * Controller 层（位于 ruoyi-admin 模块）
 * 职责：接收请求、参数校验、权限校验、调用Service、返回统一响应
 */
@Validated
@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor // Lombok自动生成构造器注入
public class SysUserController extends BaseController {
    
    // ✅ 依赖Service接口而非实现类
    private final ISysUserService userService;

    /**
     * 查询用户列表
     */
    @SaCheckPermission("system:user:list") // Sa-Token权限校验
    @GetMapping("/list")
    public TableDataInfo<SysUserVo> list(SysUserBo bo) {
        // ✅ 使用框架封装的分页工具
        startPage();
        // ✅ 调用Service接口方法
        List<SysUserVo> list = userService.selectUserList(bo);
        // ✅ 返回统一响应格式
        return getDataTable(list);
    }

    /**
     * 新增用户
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @PostMapping
    public R<Void> add(@Validated @RequestBody SysUserBo bo) {
        // ✅ Controller只做参数校验和调用，不含业务逻辑
        return toAjax(userService.insertUser(bo));
    }
    
    // ❌ 错误示例：Controller中包含业务逻辑
    // @PostMapping("/wrong")
    // public R<Void> wrong(@RequestBody SysUserBo bo) {
    //     // ❌ 直接操作数据库
    //     userMapper.insert(user);
    //     // ❌ 复杂的业务判断
    //     if (user.getAge() > 18 && user.getStatus().equals("active")) {
    //         // 多步业务处理...
    //     }
    //     return R.ok();
    // }
}
```

---

### 规范2：接口抽象与依赖倒置原则（DIP）

**设计原则：** Service层必须基于接口编程，实现依赖倒置（Dependency Inversion Principle），支持Spring AOP代理并降低模块耦合。

**核心要求：**
1. **所有Service必须定义接口**（如 `ISysUserService`），实现类统一命名为 `XxxServiceImpl`
2. **依赖注入必须注入接口**，而非实现类（支持AOP代理）
3. **跨模块调用必须通过接口**，避免直接依赖实现类
4. **接口职责单一**，避免出现"上帝接口"

**模块依赖规则：**
```
ruoyi-admin（启动模块）
    ↓ depends on
ruoyi-system（业务模块）
    ↓ depends on  
ruoyi-framework（框架模块）
    ↓ depends on
ruoyi-common（工具模块）

⚠️ 严禁反向依赖！(如 ruoyi-common 依赖 ruoyi-system)
⚠️ 严禁循环依赖！(如 ruoyi-system ↔ ruoyi-xxx 互相依赖)
```

**标准Service示例：**

```java
/**
 * Service 接口（位于 ruoyi-system 模块）
 * 接口定义业务契约，降低耦合
 */
public interface ISysUserService {
    
    /**
     * 根据条件分页查询用户列表
     * @param bo 查询条件业务对象
     * @return 用户VO列表
     */
    List<SysUserVo> selectUserList(SysUserBo bo);
    
    /**
     * 新增用户
     * @param bo 用户业务对象
     * @return 是否成功
     */
    Boolean insertUser(SysUserBo bo);
}

/**
 * Service 实现类（位于 ruoyi-system 模块）
 * 职责：业务逻辑编排、事务控制、数据转换、异常处理
 */
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl implements ISysUserService {
    
    // ✅ 注入Mapper接口
    private final SysUserMapper userMapper;
    
    // ✅ 注入其他Service接口（不是实现类）
    private final ISysRoleService roleService;
    private final ISysDeptService deptService;

    /**
     * 查询用户列表
     */
    @Override
    @DataScope(deptAlias = "d", userAlias = "u") // 若依AOP数据权限
    public List<SysUserVo> selectUserList(SysUserBo bo) {
        // ✅ 业务逻辑处理
        LambdaQueryWrapper<SysUser> wrapper = buildQueryWrapper(bo);
        List<SysUser> list = userMapper.selectList(wrapper);
        
        // ✅ 数据转换（Entity -> VO）
        return BeanUtil.copyToList(list, SysUserVo.class);
    }

    /**
     * 新增用户（包含事务管理）
     */
    @Override
    @Transactional(rollbackFor = Exception.class) // 事务管理
    public Boolean insertUser(SysUserBo bo) {
        // ✅ 业务校验
        checkUserUnique(bo);
        
        // ✅ 数据转换（BO -> Entity）
        SysUser user = BeanUtil.toBean(bo, SysUser.class);
        user.setPassword(SecurityUtils.encryptPassword(bo.getPassword()));
        
        // ✅ 数据库操作
        int rows = userMapper.insert(user);
        
        // ✅ 调用其他Service处理关联业务
        if (rows > 0 && CollUtil.isNotEmpty(bo.getRoleIds())) {
            roleService.insertUserRole(user.getUserId(), bo.getRoleIds());
        }
        
        return rows > 0;
    }
    
    // ❌ 错误示例：Service中不应出现的代码
    // private void wrongExample() {
    //     // ❌ 直接new对象（应使用依赖注入）
    //     ISysRoleService roleService = new SysRoleServiceImpl();
    //     
    //     // ❌ 依赖实现类而非接口
    //     @Autowired
    //     private SysRoleServiceImpl roleServiceImpl;
    // }
}
```

**Mapper层标准写法：**

```java
/**
 * Mapper 接口（位于 ruoyi-system 模块）
 * 职责：数据库操作，继承MyBatis-Plus的BaseMapper
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    
    /**
     * 自定义SQL查询（复杂查询场景）
     * 对应XML：mapper/system/SysUserMapper.xml
     */
    List<SysUser> selectUserListWithDept(@Param("bo") SysUserBo bo);
    
    // ✅ 充分利用MyBatis-Plus提供的CRUD方法
    // selectById、selectList、insert、updateById、deleteById等
}
```

---

### 规范3：自定义业务模块设计

**场景：** 新增独立业务模块

统一在用ruoyi-modules下新增业务模块，统一用`ruoyi-business`

---

**创建步骤（完整流程）：**

**步骤1：创建模块目录结构**

```bash
# 1.1 在 ruoyi-modules 目录下创建模块文件夹（⭐ 所有自定义业务模块必须放在 ruoyi-modules 下）
mkdir -p ruoyi-modules/ruoyi-business

# 1.2 创建标准 Maven 目录结构（包含所有必要的子目录）
mkdir -p ruoyi-modules/ruoyi-business/src/main/java/org/dromara/business/controller
mkdir -p ruoyi-modules/ruoyi-business/src/main/java/org/dromara/business/service/impl
mkdir -p ruoyi-modules/ruoyi-business/src/main/java/org/dromara/business/mapper
mkdir -p ruoyi-modules/ruoyi-business/src/main/java/org/dromara/business/domain/bo
mkdir -p ruoyi-modules/ruoyi-business/src/main/java/org/dromara/business/domain/vo
mkdir -p ruoyi-modules/ruoyi-business/src/main/resources/mapper/business
mkdir -p ruoyi-modules/ruoyi-business/src/test/java/org/dromara/business
```

**步骤2：创建 pom.xml 文件（必需）**

使用 Write 工具在 `ruoyi-modules/ruoyi-business/` 目录下创建 `pom.xml` 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 声明父模块 -->
    <parent>
        <groupId>org.dromara</groupId>
        <artifactId>ruoyi-modules</artifactId>
        <version>${revision}</version>
    </parent>
    
    <description>订单管理模块</description>
    
    <dependencies>
        <!-- 依赖通用模块 -->
        <dependency>
            <groupId>org.dromara</groupId>
            <artifactId>ruoyi-common</artifactId>
        </dependency>
        
        <!-- 可选：依赖系统模块（如需使用用户/角色等） -->
        <dependency>
            <groupId>org.dromara</groupId>
            <artifactId>ruoyi-system</artifactId>
        </dependency>
    </dependencies>
</project>
```

**步骤3：在父 pom.xml 中注册新模块（必需）**

在项目根目录的 `pom.xml` 的 `<modules>` 标签中添加：

```xml
<modules>
    <module>ruoyi-admin</module>
    <module>ruoyi-framework</module>
    <module>ruoyi-system</module>
    <module>ruoyi-common</module>
    <!-- ✅ 新增模块（注意路径包含 ruoyi-modules）-->
    <module>ruoyi-modules/ruoyi-business</module>
</modules>
```

**步骤4：在 ruoyi-admin 中添加模块依赖（可选）**

如需在启动模块中使用，在 `ruoyi-admin/pom.xml` 中添加依赖：

```xml
<dependencies>
    <!-- ... 其他依赖 ... -->
    
    <!-- ✅ 新增订单模块依赖 -->
    <dependency>
        <groupId>org.dromara</groupId>
        <artifactId>ruoyi-business</artifactId>
    </dependency>
</dependencies>
```

**步骤5：验证模块创建（可选）**

```bash
mvn clean compile
```

---

**最终标准结构：**
```
ruoyi-modules/                       # ⭐ 业务模块统一管理目录
└── ruoyi-business/
    ├── pom.xml                      # ✅ 声明依赖ruoyi-common和ruoyi-system
    ├── src/main/java/org/dromara/business/
    │   ├── controller/              # Controller层
    │   │   └── [具体业务]Controller.java
    │   ├── service/                 # Service接口
    │   │   ├── I[具体业务]Service.java
    │   │   └── impl/                # Service实现
    │   │       └── [具体业务]ServiceImpl.java
    │   ├── mapper/                  # Mapper接口
    │   │   └── [具体业务]Mapper.java
    │   └── domain/                  # 数据对象
    │       ├── [具体业务].java           # Entity实体类
    │       ├── bo/                  # 业务对象(用于参数接收)
    │       │   └── [具体业务]Bo.java
    │       └── vo/                  # 视图对象(用于数据返回)
    │           └── [具体业务]Vo.java
    └── src/main/resources/
        └── mapper/            # MyBatis XML映射文件
            └── [具体业务]Mapper.xml
```

**常见问题与注意事项：**

1. **问题：IDEA 不识别新模块**
   - 解决：点击 Maven 面板右上角的刷新按钮（Reload All Maven Projects）
   - 或者：右键项目根目录 → Maven → Reload Project

2. **问题：编译时找不到父 pom 中的依赖**
   - 检查：父 pom.xml 的 `<version>` 是否与子模块中 `<parent>` 的版本一致
   - 解决：运行 `mvn clean install` 重新安装

3. **问题：是否需要创建 resources 目录？**
   - ✅ 必须创建 `src/main/resources/` 目录
   - ✅ 如果使用 MyBatis XML，需要创建 `mapper/xxx/` 子目录
   - 如果不使用 XML（纯注解），可以只创建空的 resources 目录

4. **问题：模块必须放在 ruoyi-modules 下吗？**
   - ✅ 是的，所有自定义业务模块必须统一放在 `ruoyi-modules/` 目录下
   - ✅ 这是若依框架的标准模块化架构规范
   - ❌ 不要直接在项目根目录创建业务模块

---

### 规范4：通用配置管理

**原则：** 框架级配置放在 `ruoyi-framework`，业务配置放在各业务模块

**配置类放置规则：**

| 配置类型 | 放置位置 | 示例 |
|---------|---------|------|
| MyBatis-Plus全局配置 | ruoyi-framework | MybatisPlusConfig.java |
| Redis缓存配置 | ruoyi-framework | RedisConfig.java |
| Sa-Token安全配置 | ruoyi-framework | SaTokenConfig.java |
| 线程池配置 | ruoyi-framework | ThreadPoolConfig.java |
| 业务特定配置 | ruoyi-business | OrderPayConfig.java (在ruoyi-business) |

**标准配置类示例：**

```java
/**
 * MyBatis-Plus配置（位于 ruoyi-framework 模块）
 * 供所有业务模块复用
 */
@Configuration
@EnableTransactionManagement
public class MybatisPlusConfig {
    
    /**
     * 分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 分页插件
        PaginationInnerInterceptor paginationInner = new PaginationInnerInterceptor();
        paginationInner.setDbType(DbType.MYSQL);
        paginationInner.setOverflow(true);
        interceptor.addInnerInterceptor(paginationInner);
        
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        return interceptor;
    }
    
    /**
     * 自动填充配置
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MyMetaObjectHandler();
    }
}
```

---

## 二、禁止事项（Critical Don'ts）

## 二、禁止事项（Critical Don'ts）

### 架构层面禁止事项

1. **❌ 禁止Controller包含业务逻辑**
   ```java
   // ❌ 错误示例
   @PostMapping("/user")
   public R<Void> addUser(@RequestBody SysUserBo bo) {
       // ❌ Controller中写业务判断
       if (bo.getAge() < 18) {
           return R.fail("年龄不符合要求");
       }
       // ❌ Controller中写数据库操作
       userMapper.insert(BeanUtil.toBean(bo, SysUser.class));
       return R.ok();
   }
   
   // ✅ 正确示例：业务逻辑下沉到Service
   @PostMapping("/user")
   public R<Void> addUser(@Validated @RequestBody SysUserBo bo) {
       return toAjax(userService.insertUser(bo));
   }
   ```

2. **❌ 禁止跨层直接调用**
   ```java
   // ❌ 错误：Controller直接调用Mapper
   @Autowired
   private SysUserMapper userMapper; // Controller不应依赖Mapper
   
   // ✅ 正确：Controller只调用Service接口
   private final ISysUserService userService;
   ```

3. **❌ 禁止在Entity实体类中包含业务逻辑**
   ```java
   // ❌ 错误示例
   @TableName("sys_user")
   public class SysUser {
       private Long userId;
       private String userName;
       
       // ❌ 实体类不应包含业务方法
       public boolean isAdult() {
           return this.age >= 18;
       }
       
       // ❌ 实体类不应依赖其他Service
       public void sendNotification() {
           notificationService.send(this.email);
       }
   }
   
   // ✅ 正确：业务逻辑放在Service层
   ```

4. **❌ 禁止Service层依赖实现类**
   ```java
   // ❌ 错误：依赖实现类
   @Autowired
   private SysRoleServiceImpl roleServiceImpl;
   
   // ✅ 正确：依赖接口
   private final ISysRoleService roleService;
   ```

### 模块依赖禁止事项

5. **❌ 禁止反向依赖（核心模块依赖业务模块）**
   ```xml
   <!-- ❌ 错误：ruoyi-common依赖业务模块 -->
   <project>
       <artifactId>ruoyi-common</artifactId>
       <dependencies>
           <dependency>
               <groupId>org.dromara</groupId>
               <artifactId>ruoyi-business</artifactId> <!-- 禁止！ -->
           </dependency>
       </dependencies>
   </project>
   ```

6. **❌ 禁止循环依赖**
   ```
   ❌ 错误关系：
   ruoyi-modules → ruoyi-business
   ruoyi-business → ruoyi-modules
   
   ✅ 正确方案：
   - 抽取公共接口到 ruoyi-common
   - 通过事件驱动解耦（Spring Event）
   - 使用消息队列异步通信
   ```

7. **❌ 禁止在ruoyi-common引入重型依赖**
   ```xml
   <!-- ❌ 错误：common模块应保持轻量 -->
   <dependency>
       <groupId>com.baomidou</groupId>
       <artifactId>mybatis-plus-boot-starter</artifactId>
   </dependency>
   
   <!-- ✅ 正确：重型框架依赖放在framework模块 -->
   ```

### 命名与规范禁止事项

8. **❌ 禁止Service接口命名不规范**
   ```java
   // ❌ 错误命名
   public interface SysUserService { }        // 缺少"I"前缀
   public class SysUserServiceImplements { }  // 错误后缀
   
   // ✅ 正确命名
   public interface ISysUserService { }
   public class SysUserServiceImpl implements ISysUserService { }
   ```

9. **❌ 禁止直接返回Entity实体类给前端**
   ```java
   // ❌ 错误：直接返回Entity
   @GetMapping("/{id}")
   public R<SysUser> getUser(@PathVariable Long id) {
       return R.ok(userMapper.selectById(id)); // 暴露数据库字段
   }
   
   // ✅ 正确：使用VO对象
   @GetMapping("/{id}")
   public R<SysUserVo> getUser(@PathVariable Long id) {
       return R.ok(userService.selectUserById(id)); // 返回VO
   }
   ```

10. **❌ 禁止在Mapper层编写业务逻辑**
    ```java
    // ❌ 错误：Mapper中包含业务判断
    @Mapper
    public interface SysUserMapper extends BaseMapper<SysUser> {
        default void updateUserWithCheck(SysUser user) {
            if (user.getAge() < 18) { // 业务逻辑不应在Mapper
                throw new RuntimeException("年龄不符");
            }
            this.updateById(user);
        }
    }
    ```

11. **❌ 禁止在Controller中直接抛出底层异常**
    ```java
    // ❌ 错误：暴露底层异常
    @GetMapping("/list")
    public TableDataInfo list() throws SQLException { // 不应暴露SQL异常
        // ...
    }
    
    // ✅ 正确：使用统一异常处理
    @GetMapping("/list")
    public TableDataInfo list() {
        // 底层异常由GlobalExceptionHandler统一处理
    }
    ```

12. **❌ 禁止在Service中使用@Autowired字段注入**
    ```java
    // ❌ 不推荐：字段注入（无法final、难以测试）
    @Autowired
    private ISysRoleService roleService;
    
    // ✅ 推荐：构造器注入（配合Lombok @RequiredArgsConstructor）
    @Service
    @RequiredArgsConstructor
    public class SysUserServiceImpl implements ISysUserService {
        private final ISysRoleService roleService;
    }
    ```

---

## 三、参考代码与文件路径

### 核心模块参考路径

```
项目根目录/
├── ruoyi-admin/
│   ├── pom.xml                                          # 聚合pom
│   └── src/main/java/org/dromara/
│       ├── RuoYiApplication.java                        # 启动类 ⭐参考
│       └── web/controller/system/
│           └── SysUserController.java                   # Controller示例 ⭐参考
│
├── ruoyi-framework/
│   └── src/main/java/org/dromara/framework/
│       ├── config/
│       │   ├── MybatisPlusConfig.java                   # MyBatis-Plus配置 ⭐参考
│       │   ├── RedisConfig.java                         # Redis配置
│       │   └── SaTokenConfig.java                       # Sa-Token配置
│       ├── aspectj/
│       │   └── DataScopeAspect.java                     # 数据权限AOP
│       └── web/exception/
│           └── GlobalExceptionHandler.java              # 全局异常处理 ⭐参考
│
├── ruoyi-common/
│   └── src/main/java/org/dromara/common/
│       ├── core/domain/
│       │   ├── R.java                                   # 统一响应对象 ⭐参考
│       │   └── BaseEntity.java                          # 实体基类
│       ├── utils/
│       │   ├── StringUtils.java                         # 字符串工具
│       │   └── BeanUtil.java                            # Bean转换工具
│       └── annotation/
│           └── DataScope.java                           # 数据权限注解
│
├── ruoyi-system/
│   └── src/main/java/org/dromara/system/
│       ├── service/
│       │   ├── ISysUserService.java                     # Service接口 ⭐参考
│       │   └── impl/
│       │       └── SysUserServiceImpl.java              # Service实现 ⭐参考
│       ├── mapper/
│       │   └── SysUserMapper.java                       # Mapper接口 ⭐参考
│       └── domain/
│           ├── SysUser.java                             # Entity实体
│           ├── bo/
│           │   └── SysUserBo.java                       # 业务对象 ⭐参考
│           └── vo/
│               └── SysUserVo.java                       # 视图对象 ⭐参考
│
├── ruoyi-modules/                                       # ⭐ 自定义业务模块统一管理目录
│   ├── ruoyi-business/                                     # 订单模块示例
│   │   └── src/main/java/org/dromara/business/
│   │       ├── controller/
│   │       │   └── OrderController.java                 # 业务模块Controller ⭐参考
│   │       ├── service/
│   │       │   ├── IOrderService.java
│   │       │   └── impl/
│   │       │       └── OrderServiceImpl.java
│   │       ├── mapper/
│   │       │   └── OrderMapper.java
│   │       └── domain/
│   │           ├── Order.java
│   │           ├── bo/
│   │           │   └── OrderBo.java
│   │           └── vo/
│   │               └── OrderVo.java
│   └──                                                 # 其他业务模块
│
└── ruoyi-system/src/main/resources/
    └── mapper/system/
        └── SysUserMapper.xml                            # MyBatis XML映射 ⭐参考
```

### 关键参考文件说明

| 文件 | 路径 | 参考要点 |
|-----|------|---------|
| 启动类 | `ruoyi-admin/src/main/java/org/dromara/RuoYiApplication.java` | 项目入口、包扫描配置 |
| Controller示例 | `ruoyi-admin/src/.../SysUserController.java` | 权限校验、分页、统一响应 |
| Service接口 | `ruoyi-system/src/.../ISysUserService.java` | 接口定义规范 |
| Service实现 | `ruoyi-system/src/.../SysUserServiceImpl.java` | 事务管理、AOP切面、业务编排 |
| Mapper接口 | `ruoyi-system/src/.../SysUserMapper.java` | MyBatis-Plus集成 |
| BO对象 | `ruoyi-system/src/.../bo/SysUserBo.java` | 参数接收、校验注解 |
| VO对象 | `ruoyi-system/src/.../vo/SysUserVo.java` | 数据返回、字段脱敏 |
| 全局异常 | `ruoyi-framework/src/.../GlobalExceptionHandler.java` | 统一异常处理策略 |
| MyBatis配置 | `ruoyi-framework/src/.../MybatisPlusConfig.java` | 分页插件、乐观锁 |

---

## 四、架构设计检查清单

### 分层架构检查

- [ ] **Controller层**
  - [ ] 是否只包含参数校验、权限校验、Service调用？
  - [ ] 是否使用`@Validated`进行参数校验？
  - [ ] 是否使用`@SaCheckPermission`进行权限控制？
  - [ ] 是否返回统一响应格式（`R<T>`或`TableDataInfo<T>`）？
  - [ ] 是否避免了直接调用Mapper层？

- [ ] **Service层**
  - [ ] 是否定义了Service接口（`IXxxService`）？
  - [ ] 实现类是否命名为`XxxServiceImpl`？
  - [ ] 是否使用`@Transactional`管理事务？
  - [ ] 是否依赖接口而非实现类？
  - [ ] 是否使用构造器注入（`@RequiredArgsConstructor`）？
  - [ ] 是否包含必要的业务校验逻辑？

- [ ] **Mapper层**
  - [ ] 是否继承了`BaseMapper<T>`？
  - [ ] 是否使用`@Mapper`注解？
  - [ ] 复杂查询是否有对应的XML映射文件？
  - [ ] 是否避免了包含业务逻辑？

- [ ] **Entity/BO/VO分离**
  - [ ] Entity是否只用于数据库映射（`@TableName`）？
  - [ ] BO是否用于接收请求参数（包含`@NotNull`等校验）？
  - [ ] VO是否用于返回数据（包含必要的字段脱敏）？
  - [ ] 是否使用`BeanUtil.copyProperties`进行对象转换？

### 模块依赖检查

- [ ] **依赖方向**
  - [ ] 是否遵循 `admin → system → framework → common` 的单向依赖？
  - [ ] 自定义业务模块是否只依赖`common`和`system`？
  - [ ] 是否不存在反向依赖（如common依赖system）？
  - [ ] 是否不存在循环依赖？

- [ ] **模块职责**
  - [ ] `ruoyi-admin`是否只包含Controller和启动类？
  - [ ] `ruoyi-framework`是否只包含框架配置（Redis、MyBatis等）？
  - [ ] `ruoyi-common`是否保持轻量（只包含工具类、枚举、常量）？
  - [ ] 业务模块是否职责单一（遵循单一职责原则）？

### 配置管理检查

- [ ] **配置位置**
  - [ ] MyBatis-Plus配置是否在`ruoyi-framework`？
  - [ ] Redis配置是否在`ruoyi-framework`？
  - [ ] Sa-Token配置是否在`ruoyi-framework`？
  - [ ] 业务特定配置是否在对应业务模块？

- [ ] **配置文件**
  - [ ] `application.yml`是否在`ruoyi-admin/resources`？
  - [ ] 各模块的`application-xxx.yml`是否合理拆分？
  - [ ] 敏感配置是否使用环境变量或配置中心？

### 代码规范检查

- [ ] **命名规范**
  - [ ] Controller是否以`Controller`结尾？
  - [ ] Service接口是否以`I`开头、`Service`结尾？
  - [ ] Service实现是否以`ServiceImpl`结尾？
  - [ ] Mapper是否以`Mapper`结尾？
  - [ ] BO是否以`Bo`结尾？VO是否以`Vo`结尾？

- [ ] **注解使用**
  - [ ] Controller是否使用`@RestController`？
  - [ ] Service实现是否使用`@Service`？
  - [ ] Mapper是否使用`@Mapper`？
  - [ ] 事务方法是否使用`@Transactional`？
  - [ ] 权限方法是否使用`@SaCheckPermission`？

- [ ] **依赖注入**
  - [ ] 是否优先使用构造器注入？
  - [ ] 是否配合`@RequiredArgsConstructor`使用？
  - [ ] 是否避免使用`@Autowired`字段注入？
  - [ ] 依赖是否声明为`final`？

### 性能与安全检查

- [ ] **数据查询**
  - [ ] 是否使用了分页查询（避免全表扫描）？
  - [ ] 是否添加了必要的数据权限注解（`@DataScope`）？
  - [ ] 是否避免了N+1查询问题？
  - [ ] 大数据量查询是否考虑了性能优化？

- [ ] **异常处理**
  - [ ] 是否由`GlobalExceptionHandler`统一处理异常？
  - [ ] 是否避免在Controller层直接catch异常？
  - [ ] 自定义异常是否继承自`ServiceException`？

- [ ] **日志记录**
  - [ ] 关键操作是否添加了`@Log`注解？
  - [ ] 是否使用了正确的日志级别（info/warn/error）？
  - [ ] 是否避免了敏感信息的日志输出？

---

## 五、常见问题与解决方案

### Q1: 如何解决循环依赖？

**问题场景：**
```
ruoyi-business（订单模块） 需要调用 ruoyi-common（库存模块）
ruoyi-common 也需要调用 ruoyi-business
```

**解决方案：**

1. **方案一：抽取公共接口**
   ```
   创建 ruoyi-common-api 模块
   ├── IOrderService 接口定义
   ├── IInventoryService 接口定义
   
   ruoyi-business 和 ruoyi-commmon 都依赖 ruoyi-common-api
   ```

2. **方案二：使用Spring事件驱动**
   ```java
   // 订单模块发布事件
   applicationContext.publishEvent(new OrderCreatedEvent(orderId));
   
   // 库存模块监听事件
   @EventListener
   public void handleOrderCreated(OrderCreatedEvent event) {
       // 扣减库存
   }
   ```

3. **方案三：使用消息队列异步解耦**
   ```java
   // 订单模块发送MQ消息
   mqProducer.send("order-created", orderId);
   
   // 库存模块消费MQ消息
   @RabbitListener(queues = "order-created")
   public void consumeOrder(Long orderId) {
       // 扣减库存
   }
   ```

### Q2: 业务模块应该放在哪里？

**答案：** 与`ruoyi-system`同级，作为独立的Maven模块

```
project-root/
├── ruoyi-admin/
├── ruoyi-framework/
├── ruoyi-common/
├── ruoyi-system/
├── ruoyi-business/       # ✅ 业务模块
```

### Q3: 如何在Controller中调用多个Service？

**答案：** 直接注入多个Service接口即可

```java
@RestController
@RequiredArgsConstructor
public class OrderController {
    
    // ✅ 注入多个Service接口
    private final IOrderService orderService;
    private final IInventoryService inventoryService;
    private final IPaymentService paymentService;
    
    @PostMapping("/create")
    public R<Void> createOrder(@RequestBody OrderBo bo) {
        // 依次调用多个Service
        orderService.createOrder(bo);
        inventoryService.deductStock(bo.getProductId(), bo.getQuantity());
        paymentService.processPayment(bo.getAmount());
        return R.ok();
    }
}
```

**⚠️ 注意：** 如果多个Service调用需要保证事务一致性，应该封装到一个Service方法中：

```java
// ✅ 推荐：在OrderService中编排业务流程
@Service
@Transactional
public class OrderServiceImpl implements IOrderService {
    
    private final IInventoryService inventoryService;
    private final IPaymentService paymentService;
    
    @Override
    public void createOrderWithTransaction(OrderBo bo) {
        // 统一事务管理
        this.createOrder(bo);
        inventoryService.deductStock(bo.getProductId(), bo.getQuantity());
        paymentService.processPayment(bo.getAmount());
    }
}
```

### Q4: BO、VO、Entity有什么区别？

| 对象类型 | 全称 | 用途 | 特点 | 示例 |
|---------|-----|------|------|------|
| **Entity** | 实体对象 | 数据库映射 | 对应数据库表结构，包含`@TableName`注解 | `SysUser.java` |
| **BO** | Business Object | 接收请求参数 | 包含校验注解（`@NotNull`等），用于参数绑定 | `SysUserBo.java` |
| **VO** | View Object | 返回响应数据 | 只包含前端需要的字段，可能包含脱敏处理 | `SysUserVo.java` |

**转换关系：**
```
前端请求 → BO → Entity → 数据库
                ↓
前端响应 ← VO ← Entity ← 数据库
```

---

## 六、最佳实践建议

### 1. 优先使用MyBatis-Plus提供的方法

```java
// ✅ 推荐：使用MyBatis-Plus的LambdaQuery
LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(SysUser::getUserName, "admin")
       .ge(SysUser::getCreateTime, startTime)
       .orderByDesc(SysUser::getCreateTime);
List<SysUser> list = userMapper.selectList(wrapper);

// ❌ 不推荐：所有查询都写XML
```

### 2. 合理使用AOP切面

```java
// ✅ 利用若依提供的AOP注解
@DataScope(deptAlias = "d")  // 数据权限
@Log(title = "用户管理", businessType = BusinessType.UPDATE) // 操作日志
@Transactional // 事务管理
public boolean updateUser(SysUserBo bo) {
    // 业务逻辑
}
```

### 3. 使用Lombok简化代码

```java
@Data                          // 自动生成getter/setter
@RequiredArgsConstructor       // 自动生成构造器
@Slf4j                         // 自动生成日志对象
@Service
public class SysUserServiceImpl implements ISysUserService {
    private final SysUserMapper userMapper;
    
    public void test() {
        log.info("使用Lombok的日志"); // 直接使用log对象
    }
}
```

### 4. 统一响应格式

```java
// ✅ 使用若依提供的统一响应对象
return R.ok(data);              // 成功响应
return R.fail("操作失败");       // 失败响应
return getDataTable(list);      // 分页响应
return toAjax(rows);            // 操作结果响应
```

### 5. 参数校验使用JSR-303

```java
@Data
public class SysUserBo {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度为2-20个字符")
    private String userName;
    
    @NotNull(message = "年龄不能为空")
    @Min(value = 1, message = "年龄必须大于0")
    private Integer age;
    
    @Email(message = "邮箱格式不正确")
    private String email;
}

// Controller中使用@Validated触发校验
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo bo) {
    return toAjax(userService.insertUser(bo));
}
```

---

## 七、Claude使用本SKILL的指引

### 触发场景识别

当用户提出以下需求时，应立即应用本SKILL：

1. **架构设计类**：
   - "设计一个订单模块的架构"
   - "如何组织代码结构"
   - "模块之间应该如何依赖"

2. **代码审查类**：
   - "检查这段代码是否符合若依规范"
   - "这个Controller写得对吗"
   - "为什么出现循环依赖"

3. **重构类**：
   - "重构这个模块的代码组织"
   - "优化Service层设计"
   - "解决模块依赖混乱问题"

4. **新增功能类**：
   - "添加一个新的业务模块"
   - "实现XXX功能"（需要先规划架构）

### 应用流程

1. **第一步：理解需求**
   - 识别用户要实现的业务功能
   - 判断是否需要新建模块还是在现有模块扩展

2. **第二步：规划架构**
   - 确定模块归属（是否需要新建模块）
   - 设计分层结构（Controller/Service/Mapper）
   - 明确依赖关系（遵循单向依赖）

3. **第三步：生成代码**
   - 严格按照本SKILL的规范生成代码
   - 包含必要的注解（`@RestController`、`@Service`、`@Transactional`等）
   - 使用统一的命名规范

4. **第四步：自检**
   - 对照"检查清单"逐项检查
   - 确保没有违反"禁止事项"
   - 验证模块依赖关系的正确性

### 输出格式

生成代码时应包含：

1. **模块说明**：说明代码属于哪个模块（如`ruoyi-admin`、`ruoyi-system`）
2. **文件路径**：明确文件的完整路径
3. **依赖声明**：如果涉及新模块，提供`pom.xml`配置
4. **代码注释**：关键方法必须包含JavaDoc注释
5. **规范说明**：在代码中用注释标注符合的规范点（如`// ✅ 遵循单向依赖原则`）

---

## 八、总结