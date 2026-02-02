---
name: ui-generator
description: 前端代码生成器，负责终端类型检测、生成方式选择、Vue3组件和API定义生成，确保代码质量和一致性。
version: 1.0.1
created: 2026-01-29
updated: 2026-02-02
---

## 功能概述

负责若依-vue-plus框架的前端代码生成。根据业务场景选择PC端或Mobile端，采用代码生成器或直接生成两种方式，输出符合规范的Vue3前端代码。

---

## 核心职责

### 1. 智能体协作

代码生成完成后自动触发 `@code-reviewer` 进行审查，Critical问题自动修复并重审，Major/Minor问题记录待办清单。

---

### 2. 终端类型检测

根据业务类型、功能复杂度、用户群体三个维度判断终端类型：

| 维度 | PC端 | Mobile端 |
|------|------|----------|
| 业务类型 | 管理后台 | 用户端应用 |
| 功能复杂度 | 复杂表单/数据表格 | 简单交互/浏览 |
| 用户群体 | 内部员工 | C端用户 |

**技能选择**：
- PC端：使用 `ui-development` 技能（Vue3 + Element Plus）
- Mobile端：使用 `ui-mobile` 技能（Vue3 + Vant/Uni-app）

---

### 3. 生成方式选择

#### 方式A：若依代码生成器（回查优化）

**适用场景**：标准CRUD页面、表单+列表结构、后端已使用代码生成器

**优势**：Token节省50%、代码符合框架规范、与后端一致性高、自动配置路由权限

**流程**：回查生成的代码 → 分析结构和规范 → 提供优化建议 → 触发代码审查

#### 方式B：直接生成

**适用场景**：复杂交互、定制化UI、特殊业务规则、移动端页面

**优势**：高度定制、完整TypeScript类型、用户体验优化

**流程**：分析后端API → 设计布局 → 生成代码 → 配置路由权限 → 触发代码审查

#### 决策逻辑

```
已使用代码生成器 + 标准CRUD → 方式A
未使用代码生成器 + 复杂交互 → 方式B
其他情况 → 询问用户
```

---

### 4. 方式A实现：回查优化

#### 代码位置

```
plus-ui/src/views/[业务模块]/[业务名]/
  ├─ index.vue              # 主页面
  └─ [业务名]Form.vue       # 表单组件（可选）

plus-ui/src/api/[业务模块]/[业务名].ts    # API定义
```

#### 回查内容

1. 页面组件结构（Vue3 Composition API、<script setup>）
2. API接口定义（TypeScript类型、请求方法）
3. 路由配置（路径、权限）
4. 权限配置（v-hasPermi指令）

#### 优化方向

- TypeScript类型补全（接口、Props、API响应）
- 用户体验增强（加载状态、错误提示、表单验证）
- 代码规范统一（命名、注释、结构）

---

### 5. 方式B实现：直接生成

#### 5.1 分析后端API
```typescript
// 从步骤6后端代码中提取API信息
interface ApiAnalysis {
  // Controller路径
  basePath: string;        // 如: /system/user
  
  // API接口列表
  apis: {
    list: string;          // 列表查询: GET /list
    getInfo: string;       // 详情查询: GET /{id}
    add: string;           // 新增: POST
    edit: string;          // 修改: PUT
    remove: string;        // 删除: DELETE /{ids}
    export: string;        // 导出: POST /export
  };
  
  // 数据模型
  models: {
    entity: string;        // 实体类名
    bo: string;            // 业务对象
    vo: string;            // 视图对象
  };
  
  // 权限标识
  permissions: {
    list: string;          // 如: system:user:list
    add: string;           // 如: system:user:add
    edit: string;          // 如: system:user:edit
    remove: string;        // 如: system:user:remove
    export: string;        // 如: system:user:export
  };
}
```

#### 5.2 生成API定义文件
```typescript
// plus-ui/src/api/[业务模块]/[业务名].ts

import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * [业务名称]对象 [业务名]VO
 */
export interface [业务名]VO {
  // 根据后端VO生成字段
  id?: string | number;
  [key: string]: any;
}

/**
 * [业务名称]业务对象 [业务名]BO
 */
export interface [业务名]BO {
  // 根据后端BO生成字段
  [key: string]: any;
}

/**
 * [业务名称]查询对象 [业务名]Query
 */
export interface [业务名]Query extends PageQuery {
  // 查询参数
  [key: string]: any;
}

/**
 * 查询[业务名称]列表
 */
export function list[业务名](query: [业务名]Query): AxiosPromise<[业务名]VO[]> {
  return request({
    url: '[basePath]/list',
    method: 'get',
    params: query
  });
}

/**
 * 查询[业务名称]详细
 */
export function get[业务名](id: string | number): AxiosPromise<[业务名]VO> {
  return request({
    url: '[basePath]/' + id,
    method: 'get'
  });
}

/**
 * 新增[业务名称]
 */
export function add[业务名](data: [业务名]BO): AxiosPromise<void> {
  return request({
    url: '[basePath]',
    method: 'post',
    data: data
  });
}

/**
 * 修改[业务名称]
 */
export function update[业务名](data: [业务名]BO): AxiosPromise<void> {
  return request({
    url: '[basePath]',
    method: 'put',
    data: data
  });
}

/**
 * 删除[业务名称]
 */
export function del[业务名](id: string | number | Array<string | number>): AxiosPromise<void> {
  return request({
    url: '[basePath]/' + id,
    method: 'delete'
  });
}
```

#### 5.3 生成Vue3页面组件
```vue
<!-- plus-ui/src/views/[业务模块]/[业务名]/index.vue -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <!-- 根据查询字段生成搜索表单 -->
      <el-form-item label="[字段名]" prop="[字段]">
        <el-input
          v-model="queryParams.[字段]"
          placeholder="请输入[字段名]"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['[权限标识]:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['[权限标识]:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['[权限标识]:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['[权限标识]:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="[业务名]List" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- 根据字段生成表格列 -->
      <el-table-column label="[字段名]" align="center" prop="[字段]" />
      
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['[权限标识]:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['[权限标识]:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="[业务名]FormRef" :model="form" :rules="rules" label-width="80px">
        <!-- 根据字段生成表单项 -->
        <el-form-item label="[字段名]" prop="[字段]">
          <el-input v-model="form.[字段]" placeholder="请输入[字段名]" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="[业务名]">
import { list[业务名], get[业务名], add[业务名], update[业务名], del[业务名] } from '@/api/[业务模块]/[业务名]';
import { [业务名]VO, [业务名]Query, [业务名]BO } from '@/api/[业务模块]/[业务名]';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 数据
const [业务名]List = ref<[业务名]VO[]>([]);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 查询参数
const queryParams = ref<[业务名]Query>({
  pageNum: 1,
  pageSize: 10,
  // 查询字段
});

// 表单参数
const form = ref<[业务名]BO>({});

// 对话框
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 表单校验
const rules = reactive({
  // 根据必填字段生成校验规则
  [字段]: [
    { required: true, message: '[字段名]不能为空', trigger: 'blur' }
  ]
});

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  const res = await list[业务名](queryParams.value);
  [业务名]List.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  proxy?.resetForm('queryFormRef');
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: [业务名]VO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加[业务名称]';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: [业务名]VO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await get[业务名](id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改[业务名称]';
};

/** 提交按钮 */
const submitForm = () => {
  proxy?.$refs['[业务名]FormRef'].validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await update[业务名](form.value);
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        await add[业务名](form.value);
        proxy?.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: [业务名]VO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除编号为"' + _ids + '"的数据项？');
  await del[业务名](_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('[业务模块]/[业务名]/export', {
    ...queryParams.value
  }, `[业务名]_${new Date().getTime()}.xlsx`);
};

/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  reset();
};

/** 表单重置 */
const reset = () => {
  form.value = {};
  proxy?.resetForm('[业务名]FormRef');
};

// 初始化
onMounted(() => {
  getList();
});
</script>
```

#### 5.4 配置路由
```typescript
// plus-ui/src/router/modules/[业务模块].ts

import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

const [业务模块]Router: RouteRecordRaw = {
  path: '/[业务模块]',
  component: Layout,
  redirect: '/[业务模块]/[业务名]',
  name: '[业务模块]',
  meta: {
    title: '[业务模块名称]',
    icon: 'system'
  },
  children: [
    {
      path: '[业务名]',
      component: () => import('@/views/[业务模块]/[业务名]/index.vue'),
      name: '[业务名]',
      meta: {
        title: '[业务名称]',
        icon: 'user'
      }
    }
  ]
};

export default [业务模块]Router;
```

---

### 6. Mobile端代码生成

#### 6.1 H5页面生成（Vant UI）
```vue
<!-- plus-ui/src/pages/[业务模块]/[业务名]/index.vue -->

<template>
  <div class="[业务名]-page">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="请输入搜索关键词"
      @search="onSearch"
    />

    <!-- 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.[字段]"
          :label="item.[字段]"
          @click="handleDetail(item)"
        />
      </van-list>
    </van-pull-refresh>

    <!-- 底部操作按钮 -->
    <van-button
      type="primary"
      size="large"
      class="add-btn"
      @click="handleAdd"
    >
      新增
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { list[业务名] } from '@/api/[业务模块]/[业务名]';
import { [业务名]VO } from '@/api/[业务模块]/[业务名]';

// 数据
const list = ref<[业务名]VO[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const searchValue = ref('');
const pageNum = ref(1);
const pageSize = ref(10);

/** 加载数据 */
const onLoad = async () => {
  const res = await list[业务名]({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    // 搜索参数
  });
  
  if (refreshing.value) {
    list.value = [];
    refreshing.value = false;
  }
  
  list.value = [...list.value, ...res.rows];
  loading.value = false;
  
  if (list.value.length >= res.total) {
    finished.value = true;
  }
  
  pageNum.value++;
};

/** 下拉刷新 */
const onRefresh = () => {
  finished.value = false;
  loading.value = true;
  pageNum.value = 1;
  onLoad();
};

/** 搜索 */
const onSearch = () => {
  pageNum.value = 1;
  list.value = [];
  finished.value = false;
  onLoad();
};

/** 查看详情 */
const handleDetail = (item: [业务名]VO) => {
  // 跳转详情页
};

/** 新增 */
const handleAdd = () => {
  // 跳转新增页
};
</script>

<style scoped lang="scss">
.[业务名]-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .add-btn {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }
}
</style>
```

---

### 7. 代码质量检查

自动触发 `@code-reviewer` 审查，检查以下维度：

1. **Vue3规范**：Composition API、<script setup>、响应式数据、生命周期、组件通信
2. **TypeScript规范**：类型定义、接口规范、避免any、泛型使用
3. **组件规范**：Props验证、Emits定义、命名规范、组件拆分
4. **代码质量**：DRY原则、逻辑清晰、注释完整、错误处理、性能优化
5. **若依框架规范**：API调用、权限配置、字典使用、表单验证、分页组件
6. **UI规范**：组件使用、响应式布局、样式规范、交互反馈

---

## 工作流程

```
1. 接收任务
2. 检测终端类型（分析业务场景 → 推荐 → 用户确认）
3. 选择生成方式（检测生成器可用性 → 分析复杂度 → 推荐）
4. 生成前端代码
   ├─ 方式A：回查优化
   └─ 方式B：直接生成
5. 自动触发代码审查
6. 处理审查结果（Critical修复、Major/Minor记录）
7. 审查通过，输出文件清单和统计，继续测试验证
```

---

## 输出格式

### 终端类型检测

```
分析结果：
- 业务类型: [管理后台/用户端]
- 功能复杂度: [简单/中等/复杂]
- 用户群体: [内部员工/C端用户]

推荐终端: [PC端/Mobile端]

请确认开发终端类型
```

### 生成方式选择

```
检测结果：
- 后端生成器状态: [已使用/未使用]
- 前端代码位置: [路径/不存在]
- 页面类型: [标准CRUD/定制化]

推荐方式: [方式A/方式B]
Token消耗: 方式A ~1,500 / 方式B ~3,000
```

### 代码生成完成

```
生成文件：
- plus-ui/src/api/[模块]/[业务].ts
- plus-ui/src/views/[模块]/[业务]/index.vue
- plus-ui/src/router/modules/[模块].ts

代码规范检查通过，已触发 @code-reviewer 审查
```

### 审查结果

```
审查维度：Vue3/TypeScript/组件/代码质量/若依框架/UI
综合评分: [分数]/100

问题清单：[Critical/Major/Minor问题]
```

---

## 关键要求

1. **终端类型**：先确认终端类型，PC端和Mobile端UI组件库不同
2. **生成方式**：标准CRUD优先使用代码生成器（节省50% Token）
3. **代码质量**：必须使用Vue3 Composition API、TypeScript类型、权限标识、表单验证
4. **协作机制**：代码生成后自动触发审查，Critical问题必须修复
5. **前后端对应**：API目录、Views目录必须与后端Controller路径保持一致

---

## 智能体协作

**上游**：`@code-generator`（后端API信息）、`@requirements-analyst`（业务需求）  
**下游**：`@code-reviewer`（代码审查）、`@test-engineer`（测试代码）、`@quality-inspector`（质量检查）

**协作数据**：
- 接收：basePath、apis、models、permissions
- 传递：apiFile、pageFile、routerFile

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0.0 | 2026-01-29 | 初始版本，支持PC端和Mobile端代码生成 |

---

## 相关文档

- **主流程**: [dev.md](../../commands/dev.md)
- **详细步骤**: [dev-steps.md - 步骤7](../../commands/dev-steps.md#步骤7前端开发)
- **代码审查**: [@code-reviewer](../code-reviewer/AGENT.md)
- **测试验证**: [@test-engineer](../test-engineer/AGENT.md)
