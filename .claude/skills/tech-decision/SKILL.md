---
name: tech-decision
description: |
  基于若依-vue-plus框架的技术选型与版本控制标准规范。定义后端Maven依赖管理、前端Vue3+TypeScript技术栈、数据库中间件选型、组件库引入原则及新库审批流程，确保项目技术栈的统一性、稳定性和可维护性。
  
  触发场景：
  - 引入新的第三方库（后端Jar包、前端npm包）
  - 升级核心框架版本（Spring Boot、Vue、Element Plus等）
  - 选择数据库中间件（MySQL、Redis、MongoDB等）
  - 选择前端UI组件或插件（图表、编辑器、表格等）
  - 解决依赖冲突或版本兼容性问题
  - 技术栈重构或迁移评估
  
  触发词：技术选型、版本升级、依赖管理、依赖冲突、组件库选择、Maven BOM、pom.xml、package.json、兼容性检查、第三方库
---

# 技术选型与版本规范

> **目标**: 建立统一、稳定、可维护的技术栈体系，避免版本冲突和功能重复，降低技术债务。

## 核心规范

### 规范1：后端依赖版本统一与冲突规避

**原则**: 所有后端依赖的版本号必须在根目录`pom.xml`的`<dependencyManagement>`中进行统一管理。

**详细说明**：
1. **版本集中管理**: 严禁在子模块`pom.xml`中直接写死版本号（除非有特殊技术原因并经过评审）
2. **兼容性检查**: 引入新库前必须验证与以下环境的兼容性：
   - Spring Boot 3.x (特别注意Jakarta EE 9+命名空间变更)
   - JDK 17/21 (检查是否使用已移除的API)
   - 若依框架核心版本 (检查与ruoyi-bom的版本一致性)
3. **依赖复用优先**: 优先使用若依内置依赖，避免功能重复：
   - 工具类: 使用`Hutool`而非自建工具或Apache Commons重复功能
   - ORM: 使用`MyBatis-Plus`而非MyBatis Generator或Hibernate
   - JSON: 使用`Jackson`（Spring Boot默认）而非Gson/FastJson
   - HTTP客户端: 使用`OkHttp`或`RestTemplate`，避免同时引入多个
4. **冲突检测**: 使用Maven命令检查依赖树是否存在冲突：
   ```bash
   mvn dependency:tree -Dverbose
   mvn dependency:analyze
   ```

```xml
<!-- 父工程 pom.xml 示例 -->
<project>
    <properties>
        <!-- 统一版本号管理 -->
        <ruoyi.version>5.1.0</ruoyi.version>
        <spring-boot.version>3.2.0</spring-boot.version>
        <lombok.version>1.18.30</lombok.version>
        <hutool.version>5.8.23</hutool.version>
        <mybatis-plus.version>3.5.5</mybatis-plus.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- 1. 若依核心BOM，管理了所有核心依赖版本 -->
            <dependency>
                <groupId>com.ruoyi</groupId>
                <artifactId>ruoyi-bom</artifactId>
                <version>${ruoyi.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- 2. Spring Boot BOM（通常由若依BOM传递引入，这里显式声明以便查看） -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- 3. 统一定义第三方依赖版本（若依未包含的库） -->
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </dependency>
            
            <!-- 示例：引入阿里云OSS（新增功能库） -->
            <dependency>
                <groupId>com.aliyun.oss</groupId>
                <artifactId>aliyun-sdk-oss</artifactId>
                <version>3.17.0</version>
                <exclusions>
                    <!-- 排除冲突依赖，使用Spring Boot统一版本 -->
                    <exclusion>
                        <groupId>com.fasterxml.jackson.core</groupId>
                        <artifactId>jackson-databind</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!-- 子模块引用时不需要指定版本 -->
    <dependencies>
        <!-- ✅ 正确做法：不指定版本，由dependencyManagement统一管理 -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
        
        <!-- ❌ 错误做法：子模块中指定版本 -->
        <!-- <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version> 
        </dependency> -->
    </dependencies>
</project>
```

**最佳实践**：
- 使用`${xxx.version}`属性统一管理版本号
- 通过`<exclusions>`排除传递依赖中的冲突版本
- 子模块只声明groupId和artifactId，版本继承自父POM

### 规范2：前端组件选型与 TypeScript 兼容性

**原则**: 前端技术栈严格锁定为 **Vue 3 + TypeScript + Vite + Element Plus**，确保类型安全和开发体验。

**详细说明**：
1. **UI组件优先级**：
   - 第一优先级：使用`Element Plus`原生组件（Button、Table、Form等）
   - 第二优先级：Element Plus生态组件（如`@element-plus/icons-vue`）
   - 第三优先级：社区成熟且支持Vue3+TS的库：
     - 复杂表格：`vxe-table`（若依官方推荐）
     - 图表：`ECharts 5.x` + `vue-echarts`
     - 富文本：`@wangeditor/editor-for-vue`（支持Vue3）
     - 拖拽：`@vueuse/integrations` + `sortablejs`
2. **TypeScript类型支持检查**：
   - 必须包含`.d.ts`类型声明文件或`@types/xxx`包
   - 验证方法：安装后检查`node_modules/@types/`或包根目录是否有类型文件
3. **兼容性验证**：
   - Vue版本：必须支持Vue 3.3+（Composition API、`<script setup>`语法）
   - Vite兼容：检查是否需要额外的Vite插件配置
   - Node版本：确保支持项目的Node.js版本（通常≥16.x）
4. **禁止引入的旧组件**：
   - ❌ Vue 2时代的库：`vue-resource`、`element-ui`（旧版）、`iview`
   - ❌ 非TypeScript库：纯JS编写且无类型声明的插件
   - ❌ 停止维护的库：最后提交时间>2年的仓库

```json
// package.json (前端)
{
  "name": "ruoyi-ui",
  "version": "5.1.0",
  "type": "module",
  "engines": {
    "node": ">=16.0.0",
    "pnpm": ">=8.0.0"
  },
  "dependencies": {
    // === 核心框架 ===
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",                    // 状态管理，替代 Vuex
    
    // === UI 组件库 ===
    "element-plus": "^2.4.0",             // 主UI库
    "@element-plus/icons-vue": "^2.1.0",  // 图标库
    
    // === 扩展组件（经审核引入） ===
    "vxe-table": "^4.5.0",                // 复杂表格（若依推荐）
    "echarts": "^5.4.3",                  // 图表库
    "vue-echarts": "^6.6.0",              // Vue3 ECharts 封装
    "@wangeditor/editor": "^5.1.23",      // 富文本编辑器
    "@wangeditor/editor-for-vue": "^5.1.12",
    
    // === 工具库 ===
    "axios": "^1.5.0",                    // HTTP 客户端
    "dayjs": "^1.11.10",                  // 日期处理（推荐，比moment.js轻量）
    "@vueuse/core": "^10.5.0",            // Vue Composition API 工具集
    "nprogress": "^0.2.0"                 // 进度条
  },
  "devDependencies": {
    // === 构建工具 ===
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^4.4.0",
    "vite-plugin-compression": "^0.5.1",  // Gzip压缩
    
    // === TypeScript 支持 ===
    "typescript": "^5.2.0",
    "vue-tsc": "^1.8.0",                  // Vue3 类型检查
    
    // === 代码规范 ===
    "eslint": "^8.50.0",
    "eslint-plugin-vue": "^9.17.0",
    "prettier": "^3.0.3",
    "@typescript-eslint/parser": "^6.7.0"
  }
}
```

**版本选择说明**：
- 使用`^`语义化版本：允许小版本更新（如`^3.3.0`可更新到`3.3.x`但不会到`4.0.0`）
- 锁定主版本号，避免breaking changes
- 通过`pnpm-lock.yaml`或`package-lock.json`锁定精确版本

**引入新库检查清单**：
```bash
# 1. 检查包信息（GitHub星数、最后更新时间、周下载量）
npm view package-name

# 2. 检查TypeScript支持
npm view package-name types  # 查看是否内置类型

# 3. 安装并验证类型
pnpm add package-name
pnpm add -D @types/package-name  # 如果需要额外类型包
```

### 规范3：数据库与中间件选型标准

**原则**: 基于若依框架支持的技术栈，选择成熟稳定的数据库和中间件解决方案。

**详细说明**：
1. **关系型数据库**：
   - 首选：MySQL 8.0+ / MySQL 5.7+
   - 备选：PostgreSQL 13+、Oracle 11g+（企业版）
   - 连接池：使用`HikariCP`（Spring Boot默认）
   - 驱动版本：`mysql-connector-j` 8.0.33+（支持JDK 17）
2. **缓存中间件**：
   - 首选：Redis 6.x/7.x（支持单机、哨兵、集群模式）
   - 客户端：`Redisson`（若依内置，支持分布式锁、限流等高级功能）
   - 禁止：Memcached（功能有限）、Ehcache（本地缓存，不适合分布式）
3. **消息队列**：
   - 推荐：RocketMQ 5.x（阿里生态）、RabbitMQ 3.x
   - 轻量场景：Redis Stream（若依已集成Redis）
   - 大数据场景：Kafka 3.x
4. **搜索引擎**：
   - 标准选择：Elasticsearch 8.x + `spring-boot-starter-data-elasticsearch`
   - 轻量选择：MySQL 全文索引（数据量<100万）

**版本兼容性矩阵**：
| 组件 | 推荐版本 | JDK要求 | Spring Boot兼容性 |
|------|----------|---------|-------------------|
| MySQL | 8.0.33+ | 17/21 | 3.x ✅ |
| Redis | 6.2/7.0 | 17/21 | 3.x ✅ |
| Redisson | 3.24.0+ | 17/21 | 3.x ✅ |
| RocketMQ | 5.1.x | 17/21 | 3.x ✅ |
| Elasticsearch | 8.x | 17/21 | 3.x ✅ |

### 规范4：新库引入审批流程

**触发条件**: 当需要引入不在若依默认技术栈中的第三方库时。

**审批流程**：
1. **需求评估** (开发人员)
   - [ ] 明确业务需求，确认现有技术栈无法满足
   - [ ] 调研至少3个候选方案，进行对比分析
   - [ ] 填写《技术选型评审表》（见下方模板）

2. **技术评审** (技术负责人)
   - [ ] 检查许可证兼容性（优先Apache/MIT，避免GPL）
   - [ ] 验证社区活跃度（GitHub星数>1000，近3个月有更新）
   - [ ] 评估维护成本（是否需要自定义封装、学习曲线）
   - [ ] 检查依赖冲突（使用`mvn dependency:tree`分析）

3. **安全审核** (可选，企业级项目)
   - [ ] 扫描已知漏洞（使用OWASP Dependency-Check）
   - [ ] 检查是否存在供应链风险

4. **批准引入**
   - 在父POM中添加版本管理
   - 更新项目技术文档
   - 通知团队成员并进行技术分享

**技术选型评审表模板**：
```markdown
## 技术选型评审表

**申请人**: xxx  
**申请日期**: 2024-01-20  
**业务场景**: 需要实现文件上传到阿里云OSS

### 1. 候选方案对比
| 方案 | 优点 | 缺点 | 社区活跃度 | 许可证 |
|------|------|------|------------|--------|
| aliyun-sdk-oss | 官方支持，功能全 | 依赖较多 | ⭐⭐⭐⭐⭐ | Apache 2.0 |
| minio-java | 开源对象存储 | 需自建服务 | ⭐⭐⭐⭐ | Apache 2.0 |
| 若依内置OSS | 已集成 | 功能较简单 | N/A | MIT |

### 2. 推荐方案
**选择**: aliyun-sdk-oss  
**理由**: 业务需求需要使用阿里云OSS，官方SDK最稳定

### 3. 兼容性检查
- [x] JDK 17兼容性验证通过
- [x] Spring Boot 3.x兼容性验证通过
- [x] 无依赖冲突（已排除jackson冲突依赖）

### 4. 风险评估
- **技术风险**: 低（官方维护）
- **维护成本**: 低（文档完善）
- **学习成本**: 中（需学习OSS API）
```

## 禁止事项

### 后端依赖管理
- ❌ **禁止在子模块中覆盖父POM版本**: 严禁在业务模块pom.xml中重新指定核心依赖版本（如Spring Boot、MyBatis-Plus版本）
- ❌ **禁止引入功能重叠的库**: 
  - 不允许同时使用Jackson和Gson/FastJson（JSON序列化）
  - 不允许同时使用OkHttp和Apache HttpClient（HTTP客户端）
  - 不允许同时使用Hutool和Apache Commons同类工具方法
- ❌ **禁止引入不兼容的组件**:
  - 不得引入依赖`javax.*`命名空间的库（Spring Boot 3需要`jakarta.*`）
  - 不得引入与JDK 17/21不兼容的库（如使用已删除的API）
  - 不得引入传统的JSP/Servlet组件（前后端分离架构不需要）
- ❌ **禁止使用已停止维护的库**: 
  - 最后更新时间>2年的库（除非是成熟稳定的工具库如Apache Commons）
  - GitHub仓库已归档（Archived）的项目
- ❌ **禁止使用危险许可证的库**: 
  - GPL系列（会传染整个项目）
  - 商业许可证未授权的组件
  - 许可证不明确的库

### 前端依赖管理
- ❌ **禁止引入Vue 2生态组件**: 
  - `element-ui`（使用`element-plus`替代）
  - `iview`、`ant-design-vue 2.x`
  - `vue-resource`（使用`axios`替代）
- ❌ **禁止引入非TypeScript支持的库**: 
  - 纯JS编写且无`.d.ts`类型声明文件
  - 无`@types/xxx`类型包的纯JS库
  - 类型定义严重不完整的库
- ❌ **禁止使用CDN直接引入生产依赖**: 
  - 不得在`index.html`中通过`<script src="https://cdn...">`引入Vue、ElementPlus等核心库
  - 所有依赖必须通过npm/pnpm管理（便于版本控制和离线构建）
- ❌ **禁止混用包管理器**: 
  - 项目统一使用`pnpm`（若依推荐）
  - 不得混用npm、yarn、pnpm（会导致lock文件冲突）
- ❌ **禁止使用不安全的包**: 
  - `npm audit`报告严重漏洞（High/Critical）的包
  - 依赖树中包含恶意代码的包

### 数据库与中间件
- ❌ **禁止直接使用低版本MySQL驱动**: 
  - 不得使用`mysql-connector-java 5.x`（JDK 17不兼容）
  - 必须使用`mysql-connector-j 8.0.33+`
- ❌ **禁止在代码中硬编码连接信息**: 
  - 数据库URL、用户名、密码必须配置在`application.yml`
  - 生产环境敏感信息必须使用环境变量或配置中心
- ❌ **禁止跨大版本直接升级核心组件**: 
  - Redis 5.x → 7.x 需经过6.x过渡
  - MySQL 5.7 → 8.0 需进行兼容性测试
  - 必须在测试环境充分验证后才能升级生产环境

### 版本号使用规范
- ❌ **禁止使用动态版本号**: 
  - `RELEASE`、`LATEST`（不可预测）
  - `*`、`+`通配符（Maven）
  - 前端`^latest`或`*`（不稳定）
- ❌ **禁止手动修改lock文件**: 
  - `pom.xml`需通过Maven命令更新
  - `pnpm-lock.yaml`需通过`pnpm install`更新
  - 不得直接编辑lock文件内容

## 参考代码与文件路径

### 后端项目结构
```
ruoyi-project/
├── pom.xml                          # 🔍 父工程，查看 <dependencyManagement>
├── ruoyi-common/
│   ├── pom.xml                      # 🔍 通用模块依赖
│   └── src/.../config/              # 配置类（Redis、MyBatis等）
├── ruoyi-system/
│   └── pom.xml                      # 🔍 业务模块示例
├── ruoyi-admin/
│   ├── pom.xml                      # 主启动模块
│   └── src/main/resources/
│       ├── application.yml          # 🔍 主配置文件
│       └── application-dev.yml      # 开发环境配置
└── sql/
    └── ruoyi.sql                    # 数据库脚本
```

### 前端项目结构
```
ruoyi-ui/
├── package.json                     # 🔍 前端依赖管理
├── pnpm-lock.yaml                   # 🔍 锁定精确版本
├── vite.config.ts                   # 🔍 Vite 配置（插件、代理等）
├── tsconfig.json                    # 🔍 TypeScript 配置
├── src/
│   ├── api/                         # API 接口定义
│   ├── components/                  # 全局组件
│   ├── views/                       # 页面视图
│   ├── store/                       # Pinia 状态管理
│   ├── router/                      # Vue Router 配置
│   └── utils/                       # 工具函数
└── types/                           # 🔍 TypeScript 类型声明
```

### 关键配置文件示例路径
| 文件 | 路径 | 说明 |
|------|------|------|
| 依赖版本管理 | `/pom.xml` | 查看`<dependencyManagement>`和`<properties>` |
| 通用模块依赖 | `/ruoyi-common/pom.xml` | 查看若依内置的工具库 |
| 前端依赖树 | `/ruoyi-ui/package.json` | 查看Vue/TS/Element Plus版本 |
| Vite插件配置 | `/ruoyi-ui/vite.config.ts` | 查看构建优化、代理配置 |
| 数据库配置 | `/ruoyi-admin/src/main/resources/application-dev.yml` | MySQL、Redis连接配置 |
| Redis配置类 | `/ruoyi-common/src/.../config/RedisConfig.java` | Redisson配置示例 |

### 依赖冲突排查命令
```bash
# Maven 项目（后端）
cd ruoyi-project
mvn dependency:tree -Dverbose > dependency-tree.txt  # 生成完整依赖树
mvn dependency:analyze                                # 分析未使用依赖
mvn enforcer:enforce                                  # 检查版本冲突

# NPM/PNPM 项目（前端）
cd ruoyi-ui
pnpm list --depth=0                                   # 查看直接依赖
pnpm list package-name                                # 查看特定包的依赖链
pnpm why package-name                                 # 分析包被引入的原因
pnpm audit                                            # 安全漏洞扫描
```

## 检查清单

### 引入新库前的必检项（通用）
- [ ] **需求明确性**: 是否有明确的业务需求，现有技术栈确实无法满足
- [ ] **方案调研**: 是否对比了至少3个候选方案
- [ ] **社区活跃度**: GitHub星数>1000，近3个月内有提交记录
- [ ] **许可证检查**: 是否为Apache 2.0、MIT等商业友好许可证
- [ ] **维护状态**: 是否有活跃的Issue响应（<7天响应时间）
- [ ] **安全审计**: 是否通过漏洞扫描（npm audit / OWASP）

### 后端依赖检查清单
- [ ] **版本管理**: 是否在父POM的`<dependencyManagement>`中定义了版本号
- [ ] **JDK兼容性**: 是否与JDK 17/21兼容（检查是否使用`javax.*`命名空间）
- [ ] **Spring Boot兼容性**: 是否与Spring Boot 3.x兼容
- [ ] **依赖冲突检查**: 运行`mvn dependency:tree`确认无冲突
- [ ] **功能重复检查**: 是否与若依内置库功能重复（Hutool、MyBatis-Plus等）
- [ ] **传递依赖排除**: 是否需要使用`<exclusions>`排除冲突的传递依赖
- [ ] **Jar包大小**: 新增依赖是否会显著增加最终Jar包体积（>10MB需评估）

### 前端依赖检查清单
- [ ] **Vue 3兼容性**: 是否支持Vue 3.3+和Composition API
- [ ] **TypeScript支持**: 是否包含`.d.ts`类型声明文件或`@types/xxx`包
- [ ] **类型完整性**: 安装后运行`pnpm exec vue-tsc --noEmit`检查类型错误
- [ ] **Vite兼容性**: 是否需要额外的Vite插件配置
- [ ] **Element Plus冲突**: 是否与Element Plus样式或组件冲突
- [ ] **打包体积**: 是否支持Tree Shaking（减少打包体积）
- [ ] **浏览器兼容性**: 是否支持目标浏览器（Chrome 90+, Edge 90+, Safari 14+）
- [ ] **SSR支持**: 如果项目需要SSR，是否支持服务端渲染

### 数据库与中间件检查清单
- [ ] **版本兼容性**: 是否与若依默认版本兼容（参考兼容性矩阵）
- [ ] **驱动版本**: MySQL驱动是否为`mysql-connector-j 8.0.33+`
- [ ] **连接池配置**: 是否使用HikariCP（Spring Boot默认）
- [ ] **集群支持**: 生产环境是否需要集群模式（Redis、MySQL）
- [ ] **监控集成**: 是否与Spring Boot Actuator集成
- [ ] **数据迁移计划**: 如果是升级版本，是否有数据迁移方案

### 升级依赖版本检查清单
- [ ] **变更日志阅读**: 是否阅读了目标版本的Release Notes和Breaking Changes
- [ ] **测试环境验证**: 是否在测试环境完整验证所有功能
- [ ] **回滚方案**: 是否准备了版本回滚预案
- [ ] **影响范围评估**: 是否评估了对现有代码的影响范围
- [ ] **团队通知**: 是否通知了团队成员版本变更
- [ ] **文档更新**: 是否更新了项目技术文档和README

### 技术选型评审检查（需经过审批的新库）
- [ ] **填写评审表**: 是否完成《技术选型评审表》
- [ ] **技术负责人审批**: 是否获得技术负责人批准
- [ ] **安全审核**: 企业项目是否通过安全部门审核
- [ ] **团队培训**: 是否计划了技术分享会
- [ ] **文档沉淀**: 是否输出了使用文档和最佳实践

### 发布前最终检查
- [ ] **构建测试**: `mvn clean package`是否成功（后端）
- [ ] **类型检查**: `pnpm exec vue-tsc --noEmit`是否通过（前端）
- [ ] **单元测试**: 是否通过所有单元测试
- [ ] **代码扫描**: SonarQube扫描是否通过质量门禁
- [ ] **安全扫描**: 是否通过依赖漏洞扫描
- [ ] **性能测试**: 关键接口是否通过性能测试
- [ ] **回归测试**: 是否完成核心功能回归测试

## 常见问题与解决方案

### Q1: Maven依赖冲突导致ClassNotFoundException
**问题现象**: 运行时报错`java.lang.ClassNotFoundException`或`NoSuchMethodError`

**排查步骤**:
```bash
# 1. 生成依赖树并查找冲突
mvn dependency:tree -Dverbose | grep -A 5 "conflict"

# 2. 分析具体类属于哪个Jar包
mvn dependency:tree | grep "冲突的包名"

# 3. 使用Maven Helper插件（IDEA）可视化依赖冲突
```

**解决方案**:
```xml
<!-- 在引入依赖时排除冲突版本 -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>some-library</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### Q2: 前端TypeScript类型错误
**问题现象**: `pnpm run build`报错`TS2307: Cannot find module 'xxx'`

**解决方案**:
```bash
# 1. 检查是否缺少类型声明包
pnpm add -D @types/包名

# 2. 如果没有官方类型包，创建全局声明
# 在 src/types/global.d.ts 中添加：
declare module '包名' {
  const content: any;
  export default content;
}

# 3. 检查tsconfig.json是否包含类型文件
{
  "include": ["src/**/*", "types/**/*"]
}
```

### Q3: Element Plus按需引入后样式丢失
**问题现象**: 组件功能正常但样式不显示

**解决方案**:
```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass', // 自动引入样式
        }),
      ],
    }),
  ],
})
```

### Q4: Spring Boot 3升级后启动报错
**问题现象**: 启动时报错`javax.servlet.http.HttpServletRequest not found`

**原因**: Spring Boot 3迁移到Jakarta EE 9，命名空间从`javax.*`改为`jakarta.*`

**解决方案**:
```bash
# 1. 检查所有依赖是否支持Jakarta EE 9
mvn dependency:tree | grep "javax.servlet"

# 2. 替换不兼容的依赖
# 例如：SpringFox Swagger → SpringDoc OpenAPI
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

### Q5: Redis序列化配置问题
**问题现象**: Redis中存储的对象无法反序列化

**最佳实践**:
```java
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // 使用Jackson2JsonRedisSerializer序列化
        Jackson2JsonRedisSerializer<Object> serializer = 
            new Jackson2JsonRedisSerializer<>(Object.class);
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(
            LaissezFaireSubTypeValidator.instance,
            ObjectMapper.DefaultTyping.NON_FINAL
        );
        serializer.setObjectMapper(mapper);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        return template;
    }
}
```

### Q6: Vite开发环境代理配置
**问题现象**: 开发环境跨域问题

**解决方案**:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 80,
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, '')
      }
    }
  }
})
```

## 实战案例

### 案例1: 引入阿里云OSS文件上传

**需求**: 系统需要支持文件上传到阿里云OSS

**技术选型过程**:
1. **调研阶段**: 对比本地存储、MinIO、阿里云OSS
2. **决策**: 选择阿里云OSS（业务要求使用阿里云）
3. **兼容性检查**: 
   - aliyun-sdk-oss 3.17.0 支持JDK 17 ✅
   - 需排除传递依赖中的jackson冲突 ⚠️

**实施步骤**:
```xml
<!-- 1. 在父POM中定义版本 -->
<properties>
    <aliyun-oss.version>3.17.0</aliyun-oss.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.aliyun.oss</groupId>
            <artifactId>aliyun-sdk-oss</artifactId>
            <version>${aliyun-oss.version}</version>
            <exclusions>
                <exclusion>
                    <groupId>com.fasterxml.jackson.core</groupId>
                    <artifactId>*</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 2. 在业务模块引入（无需指定版本） -->
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
</dependency>
```

```java
// 3. 创建配置类
@Configuration
@ConfigurationProperties(prefix = "aliyun.oss")
@Data
public class OssConfig {
    private String endpoint;
    private String accessKeyId;
    private String accessKeySecret;
    private String bucketName;
}

// 4. 创建工具类
@Service
public class OssService {
    @Autowired
    private OssConfig ossConfig;
    
    public String uploadFile(MultipartFile file) {
        OSS ossClient = new OSSClientBuilder().build(
            ossConfig.getEndpoint(),
            ossConfig.getAccessKeyId(),
            ossConfig.getAccessKeySecret()
        );
        try {
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            ossClient.putObject(ossConfig.getBucketName(), fileName, file.getInputStream());
            return "https://" + ossConfig.getBucketName() + "." + ossConfig.getEndpoint() + "/" + fileName;
        } finally {
            ossClient.shutdown();
        }
    }
}
```

**验证结果**:
- ✅ 依赖冲突已解决
- ✅ 单元测试通过
- ✅ 功能正常运行

### 案例2: 前端引入ECharts图表

**需求**: 在数据大屏中展示动态图表

**技术选型过程**:
1. **调研阶段**: 对比ECharts、Chart.js、D3.js
2. **决策**: 选择ECharts（功能强大、社区活跃、Vue3支持好）
3. **兼容性检查**: 
   - echarts 5.4.3 支持Vue3 ✅
   - vue-echarts 6.6.0 支持TypeScript ✅

**实施步骤**:
```bash
# 1. 安装依赖
pnpm add echarts vue-echarts
```

```typescript
// 2. 全局注册组件（src/main.ts）
import { createApp } from 'vue'
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const app = createApp(App)
app.component('v-chart', ECharts)
```

```vue
<!-- 3. 使用组件 -->
<template>
  <v-chart :option="chartOption" style="height: 400px" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EChartsOption } from 'echarts'

const chartOption = ref<EChartsOption>({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150, 80, 70], type: 'bar' }]
})
</script>
```

**优化建议**:
- 按需引入图表类型（减少打包体积）
- 使用`markRaw`包裹图表配置（提升性能）
- 添加`loading`状态和错误处理

### 案例3: 升级MyBatis-Plus到最新版本

**场景**: 从3.5.3升级到3.5.5以使用新特性

**升级步骤**:
```xml
<!-- 1. 修改父POM版本号 -->
<properties>
    <mybatis-plus.version>3.5.5</mybatis-plus.version>
</properties>
```

```bash
# 2. 清理缓存并重新构建
mvn clean install -DskipTests

# 3. 检查是否有API变更
# 查看官方Release Notes: https://github.com/baomidou/mybatis-plus/releases
```

**测试验证**:
- [ ] CRUD接口正常
- [ ] 分页查询正常
- [ ] 条件构造器正常
- [ ] 代码生成器正常（如使用）

**回滚预案**:
```xml
<!-- 如果出现问题，立即回滚版本 -->
<mybatis-plus.version>3.5.3</mybatis-plus.version>
```

## 工具推荐

### 后端开发工具
| 工具 | 用途 | 官网 |
|------|------|------|
| Maven Helper (IDEA插件) | 依赖冲突可视化 | JetBrains插件市场 |
| OWASP Dependency-Check | 依赖漏洞扫描 | https://owasp.org/www-project-dependency-check/ |
| JProfiler / Arthas | 性能分析、类冲突排查 | https://www.ej-technologies.com/products/jprofiler/overview.html |
| Spring Boot DevTools | 热重载、快速开发 | Spring官方 |

### 前端开发工具
| 工具 | 用途 | 官网 |
|------|------|------|
| Vue DevTools | Vue组件调试 | https://devtools.vuejs.org/ |
| vite-plugin-inspect | Vite插件调试 | https://github.com/antfu/vite-plugin-inspect |
| Bundle Analyzer | 打包体积分析 | rollup-plugin-visualizer |
| npm-check-updates | 批量检查依赖更新 | https://www.npmjs.com/package/npm-check-updates |

### 命令行工具
```bash
# Maven依赖分析
mvn dependency:tree -Dverbose              # 查看完整依赖树
mvn versions:display-dependency-updates    # 检查可更新依赖
mvn dependency:analyze                     # 分析未使用依赖

# NPM/PNPM依赖分析
pnpm outdated                              # 检查过期依赖
pnpm update --interactive                  # 交互式更新依赖
pnpm list --depth=Infinity                 # 查看完整依赖树
npx npm-check-updates -u                   # 升级package.json版本号
```

## 最佳实践总结

### 版本管理黄金法则
1. **锁定主版本**: 使用`^x.y.z`锁定主版本号，允许小版本更新
2. **定期更新**: 每季度评估一次依赖更新（安全补丁除外，需立即更新）
3. **渐进式升级**: 大版本升级需制定详细计划，分阶段实施
4. **文档先行**: 升级前阅读Release Notes，升级后更新项目文档

### 技术选型决策树
```
新需求 → 
  ├─ 若依内置功能可满足？
  │   └─ 是 → 直接使用 ✅
  │   └─ 否 → 继续
  ├─ Element Plus组件可满足？（前端）
  │   └─ 是 → 直接使用 ✅
  │   └─ 否 → 继续
  ├─ 社区有成熟方案？
  │   └─ 是 → 评审后引入 ⚠️
  │   └─ 否 → 自研或寻找替代方案 ⚠️
```

### 代码审查关注点
- [ ] 新引入的依赖是否在父POM中定义版本
- [ ] 是否有未使用的import或依赖
- [ ] 是否有硬编码的版本号
- [ ] TypeScript是否有类型错误（前端）
- [ ] 是否有潜在的依赖冲突

---

**文档版本**: v2.0  
**最后更新**: 2024-01-26  
**维护人**: 技术架构组  
**适用范围**: 基于若依-vue-plus框架的所有项目