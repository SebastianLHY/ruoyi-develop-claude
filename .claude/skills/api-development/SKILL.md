---
name: api-development
description: |
  基于若依-vue-plus框架，定义符合RESTful风格的API接口开发标准与规范。
  
  **触发场景**：
  - 开发Controller层新接口
  - 定义RESTful路由规范
  - 补齐权限标识与注解
  - 前后端联调对齐接口契约
  - 审查现有接口是否符合规范
  
  **触发词**：开发接口、API设计、控制器开发、编写Controller、RESTful、若依接口规范、接口权限、接口注解
  
  **期望产出**：
  1. 符合RESTful风格的接口路径设计（HTTP方法 + URL）
  2. 完整的请求/响应模型定义（BO/VO）
  3. 正确的权限标识（@SaCheckPermission）
  4. 必要的注解组合（@Log、@RepeatSubmit、@Validated）
  5. 参数校验规则（JSR-303注解）
  6. 必要时提供完整Controller骨架代码
  
  **不适用场景**：
  - 仅修改Service/Mapper内部实现，且不涉及对外API契约变更
  - 纯前端接口调用封装（JS/TS axios封装）
  - 框架配置类问题（如Spring配置、拦截器配置）
  - 数据库层Mapper SQL编写
---

# RESTful API 设计规范

## 使用指南
**Claude在遇到以下情况时必须应用此SKILL：**
1. 用户明确提到"开发接口"、"写Controller"、"API设计"等关键词
2. 涉及到HTTP路由定义、权限注解配置
3. 需要输出完整的Controller方法代码
4. 审查或优化现有接口代码

**应用步骤：**
1. 先明确接口的业务语义（资源类型、操作类型）
2. 根据规范1确定HTTP方法和URL路径
3. 根据规范2设计请求/响应模型
4. 根据规范3~6添加必要注解
5. 输出完整代码并附带检查清单

## 核心规范

### 规范1：URL路由与HTTP方法语义化
**说明**：API路径应使用名词复数形式表示资源集合。HTTP方法需严格对应资源操作行为：GET用于查询，POST用于新增，PUT用于修改，DELETE用于删除。

#### 1.1 资源命名规则
- ✅ 使用小写字母，多个单词用短横线连接（如 `/order-items`）
- ✅ 资源名使用名词复数形式（如 `/users`，而非 `/user`）
- ❌ 禁止大写字母（如 `/OrderItems`）
- ❌ 禁止下划线（如 `/order_items`）
- ❌ 禁止驼峰命名（如 `/orderItems`）

#### 1.2 集合与单体操作规范

**列表查询**：
- 标准方式：`GET /system/users`（通过Query参数承载筛选与分页）
- 兼容方式：`GET /system/users/list`（若受若依-vue-plus既有习惯影响）
- ⚠️ 说明：`/list` 仅作为兼容前端封装的端点，应视为"集合查询"
- ❌ 禁止扩散更多动作型路径（如 `/search`、`/query`、`/find` 等）

**详情查询**：
- 推荐方式：`GET /system/users/{userId}`
- 组合路由：`GET /system/users/` 与 `GET /system/users/{userId}`
  - 使用场景：支持"新增/编辑页面初始化"
  - ⚠️ **强制要求**：必须在方法注释中明确说明：
    - 无参数时返回什么（如空模板、默认值）
    - 有参数时返回什么（如具体用户详情）
  - 避免前后端误解为同一语义的"详情接口"

**新增操作**：
- 标准方式：`POST /system/users`
- 请求体：BO对象（Business Object）
- 响应：`R<Void>` 或 `R<Long>`（返回新增记录的ID）

**修改操作**：
- 标准方式：`PUT /system/users`
- 请求体：BO对象，**必须包含主键ID**
- 响应：`R<Void>`

**删除操作**：
- 标准方式：`DELETE /system/users/{userIds}`
- 路径参数：支持逗号分隔的多个ID（批量删除，沿用若依常见写法）
- 响应：`R<Void>`

#### 1.3 业务动作的资源化建模

**禁止动作型路径（/list 除外）**：
- ❌ 错误示例：`/getUser`、`/addUser`、`/updateStatus`、`/enableUser`、`/changePassword`

**正确做法：将业务动作建模为"子资源"或"状态资源"**：
- 状态修改：`PUT /system/users/{id}/status` + 请求体 `{"status": "active"}`
- 密码修改：`PUT /system/users/{id}/password` + 请求体 `{"oldPassword": "...", "newPassword": "..."}`
- 启用/禁用：`PUT /system/users/{id}/enabled` + 请求体 `{"enabled": true}`
- 角色分配：`PUT /system/users/{id}/roles` + 请求体 `{"roleIds": [1, 2, 3]}`

#### 1.4 代码示例

**✅ 正确示例：符合RESTful规范**

```java
@RestController
@RequestMapping("/system/users")
@RequiredArgsConstructor
public class SysUserController {
    
    private final SysUserService userService;
    
    /**
     * 查询用户列表
     * 支持分页、筛选条件通过Query参数传递
     */
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<SysUserVo> list(SysUserQuery query, PageQuery pageQuery) {
        return userService.selectUserList(query, pageQuery);
    }
    
    /**
     * 查询用户详情
     * @param userId 用户ID（可选）
     * - 若传入userId：返回该用户的详细信息
     * - 若不传userId：返回空用户模板（用于新增页面初始化）
     */
    @SaCheckPermission("system:user:query")
    @GetMapping(value = {"/", "/{userId}"})
    public R<SysUserVo> getInfo(@PathVariable(value = "userId", required = false) Long userId) {
        return R.ok(userService.selectUserById(userId));
    }
    
    /**
     * 新增用户
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated @RequestBody SysUserBo user) {
        return toAjax(userService.insertUser(user));
    }
    
    /**
     * 修改用户
     */
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated @RequestBody SysUserBo user) {
        return toAjax(userService.updateUser(user));
    }
    
    /**
     * 删除用户（支持批量）
     */
    @SaCheckPermission("system:user:remove")
    @Log(title = "用户管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        return toAjax(userService.deleteUserByIds(userIds));
    }
    
    /**
     * 修改用户状态
     * 示例：将业务动作建模为子资源
     */
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PutMapping("/{userId}/status")
    public R<Void> changeStatus(
            @PathVariable Long userId,
            @Validated @RequestBody UserStatusBo statusBo) {
        return toAjax(userService.changeStatus(userId, statusBo.getStatus()));
    }
}
```

**❌ 错误示例：违反RESTful规范**

```java
// 问题1：使用POST方法执行修改操作（语义不匹配）
@PostMapping("/system/users/update")
public R<Void> update(@RequestBody SysUserBo user) { ... }

// 问题2：动作型URL路径
@GetMapping("/system/users/getUserById")
public R<SysUserVo> getUserById(@RequestParam Long id) { ... }

// 问题3：URL包含大写字母和下划线
@GetMapping("/system/User_Info/getDetail")
public R<SysUserVo> getDetail(@RequestParam Long id) { ... }

// 问题4：缺少权限注解
@GetMapping("/system/users/{userId}")
public R<SysUserVo> getInfo(@PathVariable Long userId) { ... }

// 问题5：字段注入（应使用构造器注入）
@Autowired
private SysUserService userService;
```

---

### 规范2：统一响应结构封装
**说明**：所有接口返回值必须使用若依框架提供的统一响应对象 `R` 进行封装，确保前端处理逻辑的一致性。成功返回 `R.ok(data)`，失败返回 `R.fail(msg)` 或自定义业务错误码。

#### 2.1 基本用法

```java
// 查询接口：返回数据
@SaCheckPermission("system:user:query")
@GetMapping("/{userId}")
public R<SysUserVo> getInfo(@PathVariable Long userId) {
    SysUserVo user = userService.selectUserById(userId);
    return R.ok(user);
}

// 新增/修改/删除：返回操作结果
@SaCheckPermission("system:user:add")
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@RepeatSubmit()
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo user) {
    // toAjax方法会根据影响行数返回 R.ok() 或 R.fail()
    return toAjax(userService.insertUser(user));
}

// 返回新增记录的ID
@PostMapping
public R<Long> add(@Validated @RequestBody SysUserBo user) {
    Long userId = userService.insertUser(user);
    return R.ok(userId);
}
```

#### 2.2 分页/表格型响应

- 列表接口若使用框架约定的分页响应（如 `TableDataInfo` / `PageQuery` 等），应遵循项目既有返回结构
- ❌ 禁止使用 `Map` 临时拼装字段（如 `Map.of("list", list, "total", total)`）
- ✅ 使用框架提供的 `TableDataInfo` 或自定义VO封装

```java
// 正确：使用TableDataInfo
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserQuery query, PageQuery pageQuery) {
    return userService.selectUserList(query, pageQuery);
}

// 错误：使用Map拼装
@GetMapping("/list")
public R<Map<String, Object>> list(SysUserQuery query) {
    List<SysUserVo> list = userService.selectUserList(query);
    return R.ok(Map.of("list", list, "total", list.size())); // ❌ 禁止
}
```

#### 2.3 异常处理规范

- ❌ 禁止在Controller层使用 `try/catch` 吞异常并手工 `R.fail`
- ✅ 优先抛出业务异常（由全局异常处理器统一转为 `R.fail(...)` 或带错误码响应）
- 保证错误语义一致

```java
// 错误做法：手动try/catch
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo user) {
    try {
        userService.insertUser(user);
        return R.ok();
    } catch (Exception e) {
        return R.fail("新增失败：" + e.getMessage()); // ❌ 禁止
    }
}

// 正确做法：抛出业务异常
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo user) {
    if (userService.checkUserNameUnique(user.getUserName())) {
        throw new ServiceException("用户名已存在"); // ✅ 抛出业务异常
    }
    return toAjax(userService.insertUser(user));
}
```

#### 2.4 文件流/导出接口

- 下载类接口 **不要返回 `R`**
- 应写入 `HttpServletResponse` 输出流
- 避免前端误把二进制当 JSON 解析

```java
// 正确：导出Excel
@SaCheckPermission("system:user:export")
@Log(title = "用户管理", businessType = BusinessType.EXPORT)
@PostMapping("/export")
public void export(HttpServletResponse response, SysUserQuery query) {
    List<SysUserVo> list = userService.selectUserList(query);
    ExcelUtil.exportExcel(list, "用户数据", SysUserVo.class, response);
}

// 错误：返回R对象
@PostMapping("/export")
public R<byte[]> export(SysUserQuery query) { // ❌ 禁止
    // ...
}
```

---

### 规范3：接口权限控制注解
**说明**：所有对外暴露的Controller接口必须添加 `@SaCheckPermission` 注解进行权限校验，确保接口安全。权限标识通常遵循 `模块:功能:操作` 的格式。

#### 3.1 权限标识命名规范

**格式**：`模块:功能:操作`
- 模块：如 `system`、`business`、`monitor`
- 功能：如 `user`、`role`、`menu`
- 操作：固定使用以下五类（保持项目一致性）
  - `list` - 列表查询
  - `query` - 详情查询
  - `add` - 新增
  - `edit` - 修改
  - `remove` - 删除

**示例**：
```java
@SaCheckPermission("system:user:list")   // 用户列表
@SaCheckPermission("system:user:query")  // 用户详情
@SaCheckPermission("system:user:add")    // 新增用户
@SaCheckPermission("system:user:edit")   // 修改用户
@SaCheckPermission("system:user:remove") // 删除用户
```

#### 3.2 权限与前端配置一致性

- ⚠️ **强制要求**：权限标识必须与前端路由/菜单配置中的权限字段保持一致
- 前端按钮权限控制（如 `v-hasPermi="['system:user:add']"`）需要与后端注解匹配
- 建议在接口开发时同步更新权限配置文档

#### 3.3 公开接口例外处理

- 登录、回调等无需鉴权的接口，使用框架提供的忽略鉴权注解（如 `@SaIgnore`）
- ⚠️ **必须在代码注释中说明**：
  - 为什么不需要鉴权
  - 安全边界在哪里
  - 是否有其他安全措施（如验证码、频率限制）

```java
/**
 * 用户登录接口
 * 公开接口，无需鉴权
 * 安全措施：验证码校验、登录失败次数限制、IP频率限制
 */
@SaIgnore
@PostMapping("/login")
public R<LoginVo> login(@Validated @RequestBody LoginBo loginBo) {
    return R.ok(loginService.login(loginBo));
}
```

#### 3.4 完整示例

```java
@RestController
@RequestMapping("/system/users")
@RequiredArgsConstructor
public class SysUserController {
    
    private final SysUserService userService;
    
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<SysUserVo> list(SysUserQuery query, PageQuery pageQuery) {
        return userService.selectUserList(query, pageQuery);
    }
    
    @SaCheckPermission("system:user:query")
    @GetMapping("/{userId}")
    public R<SysUserVo> getInfo(@PathVariable Long userId) {
        return R.ok(userService.selectUserById(userId));
    }
    
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated @RequestBody SysUserBo user) {
        return toAjax(userService.insertUser(user));
    }
    
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated @RequestBody SysUserBo user) {
        return toAjax(userService.updateUser(user));
    }
    
    @SaCheckPermission("system:user:remove")
    @Log(title = "用户管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        return toAjax(userService.deleteUserByIds(userIds));
    }
}
```

---

### 规范4：操作日志注解
**说明**：对于增删改操作，必须添加 `@Log` 注解以确保操作审计日志完整。

#### 4.1 基本用法

```java
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo user) {
    return toAjax(userService.insertUser(user));
}

@Log(title = "用户管理", businessType = BusinessType.UPDATE)
@PutMapping
public R<Void> edit(@Validated @RequestBody SysUserBo user) {
    return toAjax(userService.updateUser(user));
}

@Log(title = "用户管理", businessType = BusinessType.DELETE)
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) {
    return toAjax(userService.deleteUserByIds(userIds));
}

@Log(title = "用户管理", businessType = BusinessType.EXPORT)
@PostMapping("/export")
public void export(HttpServletResponse response, SysUserQuery query) {
    // 导出操作
}
```

#### 4.2 BusinessType枚举

- `INSERT` - 新增
- `UPDATE` - 修改
- `DELETE` - 删除
- `EXPORT` - 导出
- `IMPORT` - 导入
- `GRANT` - 授权
- `FORCE` - 强退
- `CLEAN` - 清空数据
- `OTHER` - 其他

#### 4.3 强制要求

- ❌ 禁止增删改操作缺少 `@Log` 注解
- ✅ 查询操作可不添加日志注解（避免日志表膨胀）
- ⚠️ 导出操作必须添加日志（属于敏感操作）

---

### 规范5：防重复提交注解
**说明**：对于新增、修改等写操作，建议添加 `@RepeatSubmit` 注解防止用户重复提交。

#### 5.1 基本用法

```java
@RepeatSubmit()
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo user) {
    return toAjax(userService.insertUser(user));
}

@RepeatSubmit()
@PutMapping
public R<Void> edit(@Validated @RequestBody SysUserBo user) {
    return toAjax(userService.updateUser(user));
}
```

#### 5.2 适用场景

- ✅ 新增操作（防止重复创建）
- ✅ 修改操作（防止并发修改）
- ✅ 状态变更操作（防止重复点击）
- ❌ 查询操作（不需要防重复提交）
- ❌ 删除操作（可选，根据业务需求）

#### 5.3 原理说明

- 基于Redis实现，默认5秒内不允许重复提交
- 通过请求参数的hash值判断是否为重复请求
- 若需自定义时间间隔，可配置注解参数

---

### 规范6：参数校验注解
**说明**：使用JSR-303校验注解对请求参数进行校验，确保数据合法性。校验失败会被全局异常处理器捕获，自动返回 `R.fail(msg)`。

#### 6.1 基本用法

```java
// Controller层：添加 @Validated 注解
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo user) {
    return toAjax(userService.insertUser(user));
}

// BO对象：添加校验注解
@Data
public class SysUserBo {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度为2-20个字符")
    private String userName;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度为6-20个字符")
    private String password;
    
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotNull(message = "状态不能为空")
    private Integer status;
}
```

#### 6.2 常用校验注解

| 注解 | 说明 | 示例 |
|------|------|------|
| `@NotNull` | 不能为null | `@NotNull(message = "ID不能为空")` |
| `@NotBlank` | 不能为null且trim后长度>0 | `@NotBlank(message = "用户名不能为空")` |
| `@NotEmpty` | 不能为null且size>0（用于集合） | `@NotEmpty(message = "角色列表不能为空")` |
| `@Size` | 字符串/集合长度限制 | `@Size(min = 2, max = 20)` |
| `@Min` / `@Max` | 数值范围限制 | `@Min(value = 0, message = "年龄不能小于0")` |
| `@Pattern` | 正则表达式校验 | `@Pattern(regexp = "^1[3-9]\\d{9}$")` |
| `@Email` | 邮箱格式校验 | `@Email(message = "邮箱格式不正确")` |

#### 6.3 分组校验

- 对于新增/修改共用同一个BO的场景，可使用分组校验
- 新增时ID为null，修改时ID必填

```java
// 定义分组接口
public interface AddGroup {}
public interface EditGroup {}

// BO对象
@Data
public class SysUserBo {
    
    @NotNull(message = "用户ID不能为空", groups = {EditGroup.class})
    private Long userId;
    
    @NotBlank(message = "用户名不能为空", groups = {AddGroup.class, EditGroup.class})
    private String userName;
}

// Controller使用
@PostMapping
public R<Void> add(@Validated(AddGroup.class) @RequestBody SysUserBo user) {
    return toAjax(userService.insertUser(user));
}

@PutMapping
public R<Void> edit(@Validated(EditGroup.class) @RequestBody SysUserBo user) {
    return toAjax(userService.updateUser(user));
}
```

#### 6.4 路径参数校验

```java
// 类级别添加 @Validated
@Validated
@RestController
@RequestMapping("/system/users")
public class SysUserController {
    
    @GetMapping("/{userId}")
    public R<SysUserVo> getInfo(
            @PathVariable 
            @Min(value = 1, message = "用户ID必须大于0") 
            Long userId) {
        return R.ok(userService.selectUserById(userId));
    }
}
```

---

### 规范7：依赖注入规范
**说明**：禁止使用 `@Autowired` 进行字段注入，推荐使用构造器注入（配合Lombok的 `@RequiredArgsConstructor`）。

#### 7.1 正确做法

```java
@RestController
@RequestMapping("/system/users")
@RequiredArgsConstructor  // Lombok注解，自动生成构造器
public class SysUserController {
    
    private final SysUserService userService;  // final字段，通过构造器注入
    private final SysRoleService roleService;
}
```

#### 7.2 错误做法

```java
@RestController
@RequestMapping("/system/users")
public class SysUserController {
    
    @Autowired  // ❌ 禁止字段注入
    private SysUserService userService;
}
```

#### 7.3 优势

1. **不可变性**：final字段保证依赖不会被意外修改
2. **便于测试**：可通过构造器直接传入Mock对象
3. **清晰的依赖关系**：所有依赖在构造器中一目了然
4. **避免循环依赖**：构造器注入会在编译时/启动时发现循环依赖问题

---

## 禁止事项清单

### Controller层职责边界
- ❌ 禁止在Controller层编写复杂的业务逻辑，业务逻辑应下沉至Service层
- ❌ 禁止在Controller层直接操作数据库（直接调用Mapper）
- ❌ 禁止在Controller层进行数据转换（Entity ↔ VO），应在Service层完成

### 返回值规范
- ❌ 禁止直接返回实体类（Entity）对象，必须转换为VO（View Object）
- ❌ 禁止直接返回Map对象，必须使用 `R` 对象封装或定义专用VO
- ❌ 禁止在查询接口中返回敏感字段（如密码、盐、身份证号等）
  - 必须在VO中排除敏感字段，或进行脱敏处理

### URL路径规范
- ❌ 禁止URL路径中包含大写字母，一律使用小写
- ❌ 禁止使用下划线（如 `/user_info`），应使用短横线（如 `/user-info`）
- ❌ 禁止使用动作型路径（如 `/getUser`、`/addUser`），应使用资源化路径
- ❌ 禁止在 `/list` 之外扩散更多动作型路径（如 `/search`、`/query`、`/find`）

### HTTP方法语义
- ❌ 禁止使用POST方法执行查询操作（应使用GET）
- ❌ 禁止使用POST方法执行修改操作（应使用PUT）
- ❌ 禁止使用GET方法执行写操作（新增/修改/删除）
- ❌ 禁止在列表查询接口中使用 `@RequestBody` 承载查询条件（破坏GET语义）
  - 应使用Query参数或专用Query DTO（除非项目有明确约定）

### 注解使用规范
- ❌ 禁止对外接口缺少 `@SaCheckPermission` 权限注解（公开接口除外，但需 `@SaIgnore` 并注释说明）
- ❌ 禁止增删改操作缺少 `@Log` 日志注解
- ❌ 禁止使用 `@Autowired` 进行字段注入，推荐构造器注入
- ❌ 禁止在Controller方法上缺少 `@Validated` 注解（当参数需要校验时）

### 异常处理规范
- ❌ 禁止在Controller层使用 `try/catch` 吞异常并手工返回 `R.fail`
  - 应抛出业务异常，由全局异常处理器统一处理
- ❌ 禁止捕获异常后仅打印日志而不向上抛出
- ❌ 禁止返回技术异常堆栈信息给前端（如 `e.printStackTrace()`）

### 数据安全规范
- ❌ 禁止把敏感字段（如密码、盐、身份证号、银行卡号）通过VO/实体直接返回
  - 必须做脱敏处理或字段裁剪
- ❌ 禁止在日志中打印敏感信息（密码、token、身份证等）
- ❌ 禁止在URL路径或Query参数中传递敏感信息（应使用请求体）

### 参数校验规范
- ❌ 禁止缺少必要的参数校验（应使用JSR-303注解）
- ❌ 禁止在Controller层手写参数校验逻辑（应使用注解自动校验）
- ❌ 禁止校验失败后返回500错误（应被全局异常处理器捕获返回400）

### 文件操作规范
- ❌ 禁止文件上传接口缺少文件类型校验（防止上传恶意文件）
- ❌ 禁止文件上传接口缺少文件大小限制
- ❌ 禁止下载/导出接口返回 `R` 对象（应写入 `HttpServletResponse` 输出流）

---

## 参考资源

### 代码参考
- **后端Controller示例**：`ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysUserController.java`
- **前端API封装示例**：`ruoyi-ui/src/api/system/user.js`
- **BO对象示例**：`ruoyi-system/src/main/java/com/ruoyi/system/domain/bo/SysUserBo.java`
- **VO对象示例**：`ruoyi-system/src/main/java/com/ruoyi/system/domain/vo/SysUserVo.java`

### 框架文档
- 若依-vue-plus官方文档：https://gitee.com/dromara/RuoYi-Vue-Plus
- Sa-Token权限认证文档：https://sa-token.cc/
- JSR-303校验规范：https://beanvalidation.org/

---

## 接口开发检查清单

在提交代码前，请逐项检查以下内容：

### 基础规范
- [ ] URL路径是否使用小写字母和短横线（禁止大写、下划线、驼峰）
- [ ] 是否遵循RESTful风格（GET查询，POST新增，PUT修改，DELETE删除）
- [ ] 是否避免了动作型路径（如 `/getUser`、`/addUser`）
- [ ] 组合路由是否在注释中明确说明了不同参数下的返回差异

### 注解完整性
- [ ] 是否添加了 `@SaCheckPermission` 权限注解（公开接口是否添加了 `@SaIgnore` 并注释说明）
- [ ] 增删改操作是否添加了 `@Log` 日志注解
- [ ] 新增/修改操作是否添加了 `@RepeatSubmit` 防重复提交注解
- [ ] 请求参数是否添加了 `@Validated` 校验注解

### 参数校验
- [ ] BO对象是否添加了JSR-303校验注解（如 `@NotNull`、`@NotBlank`、`@Size`）
- [ ] 校验失败的错误提示是否清晰明确
- [ ] 路径参数是否进行了必要的校验（如ID必须大于0）

### 返回值规范
- [ ] 是否使用 `R` 对象封装返回结果
- [ ] 是否返回了VO对象而非Entity实体
- [ ] 是否排除了敏感字段（密码、盐、身份证等）
- [ ] 列表接口是否使用了 `TableDataInfo` 等框架约定的分页响应（而非Map拼装）

### 依赖注入
- [ ] 是否避免了字段注入（`@Autowired`）
- [ ] 是否使用了构造器注入（`@RequiredArgsConstructor` + `final`）

### 权限标识
- [ ] 权限标识是否遵循 `模块:功能:操作` 格式
- [ ] 权限标识是否与前端菜单/按钮权限配置保持一致
- [ ] 是否使用了标准的五类操作名：`list`、`query`、`add`、`edit`、`remove`

### 异常处理
- [ ] 是否避免了在Controller层使用 `try/catch` 吞异常
- [ ] 业务异常是否正确抛出（而非手工返回 `R.fail`）

### 数据安全
- [ ] 敏感字段是否已脱敏或排除
- [ ] 日志中是否避免打印敏感信息
- [ ] 文件上传接口是否进行了类型和大小校验

### 代码质量
- [ ] Controller方法是否保持简洁（只做参数校验、权限控制、调用Service）
- [ ] 是否避免了在Controller层编写复杂业务逻辑
- [ ] 代码注释是否清晰（特别是组合路由、特殊业务逻辑）

---

## Claude使用此SKILL的注意事项

1. **强制应用场景**：遇到开发Controller、设计API、定义路由等关键词时，必须应用此SKILL
2. **完整性检查**：输出代码前，必须对照"禁止事项清单"和"检查清单"进行审查
3. **代码注释**：对于组合路由、特殊业务逻辑，必须添加清晰的注释说明
4. **提供完整代码**：不要只给出片段，应提供完整的Controller类骨架（包含类注解、依赖注入、所有方法）
5. **说明权限标识**：输出代码时，应明确告知用户需要在前端配置哪些权限标识
6. **BO/VO设计**：如果涉及到新的业务对象，应同时设计BO（请求对象）和VO（响应对象）的字段定义
7. **错误示例对比**：必要时提供"错误示例 vs 正确示例"的对比，帮助用户理解规范
8. **不要过度设计**：对于简单的CRUD接口，不要引入过度复杂的设计模式
9. **保持一致性**：同一个Controller内的接口风格必须保持一致（命名、注解顺序、响应格式等）
10. **安全优先**：涉及敏感操作时，必须主动提醒用户添加额外的安全措施（如验证码、频率限制等）
