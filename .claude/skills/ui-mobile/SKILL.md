---
name: ui-mobile
description: |
  基于若依-vue-plus框架的移动端（Uni-app）开发规范，针对UVIEW 2.0组件库的引入、配置、样式定制及交互逻辑进行标准化定义。
  本规范旨在确保移动端开发的一致性、可维护性和高质量交付。
  触发场景：开发移动端H5页面、小程序页面、使用UVIEW 2.0组件库构建UI界面、移动端表单开发、移动端样式定制
  触发词：移动端开发、UVIEW组件、Uniapp页面、UI库配置、uni-app、小程序开发、H5开发、移动端UI
---

# UVIEW 2.0 组件库应用规范

## 概述
本技能规范适用于基于 **若依-vue-plus** 框架的移动端开发，重点聚焦于 **UVIEW 2.0** 组件库的标准化应用。UVIEW 2.0 是基于 Vue 3 的 uni-app 生态 UI 组件库，提供了丰富的组件和工具函数。

**适用场景：**
- 移动端 H5 页面开发
- 微信小程序、支付宝小程序等多端小程序开发
- 基于 uni-app 的跨平台应用开发
- 需要快速构建移动端 UI 界面的项目

## 核心规范

### 规范1：组件引入与EasyCom配置
**详细说明：**
UVIEW 2.0 默认支持 `easycom` 模式，实现组件的按需自动引入，无需手动 import。必须在 `pages.json` 中正确配置 `easycom` 路径，确保组件使用时严格遵循 `u-` 前缀命名规范。

**核心要点：**
- 所有 UI 组件应优先使用 UVIEW 库内组件，避免重复造轮子
- 组件命名必须使用 `u-` 前缀（如 `u-button`、`u-input`）
- 组件无需手动 import，直接在模板中使用即可
- 自定义组件可通过 easycom 配置实现自动引入

**配置示例：**

```json
// pages.json 配置示例
{
  "easycom": {
    "autoscan": true,
    "custom": {
      // UVIEW 2.0 组件配置（uview-plus）
      "^u-(.*)": "uview-plus/components/u-$1/u-$1.vue",
      // 自定义组件配置（可选）
      "^my-(.*)": "@/components/my-$1/my-$1.vue"
    }
  },
  "pages": [...],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  }
}
```

**页面使用示例：**

```html
<!-- 页面中使用示例，无需import -->
<template>
  <view class="page-container">
    <!-- 按钮组件 -->
    <u-button type="primary" text="提交" @click="handleSubmit"></u-button>
    
    <!-- 输入框组件 -->
    <u-input 
      v-model="formData.username" 
      placeholder="请输入用户名"
      border="surround"
      clearable
    ></u-input>
    
    <!-- 表单组件 -->
    <u-form :model="formData" ref="formRef">
      <u-form-item label="手机号" prop="phone">
        <u-input v-model="formData.phone" placeholder="请输入手机号"></u-input>
      </u-form-item>
    </u-form>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formData = reactive({
  username: '',
  phone: ''
})

const handleSubmit = () => {
  // 业务逻辑
}
</script>
```

### 规范2：主题定制与样式变量覆盖
**详细说明：**
禁止直接修改 `node_modules` 下的组件源码，这会导致依赖更新时丢失修改。项目主题色的定制应通过在 `uni.scss` 中覆盖 UVIEW 的 SCSS 变量来实现。

**核心要点：**
- 若依框架通常配置了特定的品牌色（如 `#409EFF`），移动端需与 PC 端保持视觉一致
- 通过全局变量覆盖实现主题定制，便于维护和统一管理
- 支持深色模式等多主题切换（可选）
- 颜色变量需符合 UI 设计规范

**主题变量配置：**

```scss
/* uni.scss - 全局样式变量文件 */

// ===== 主色调覆盖（匹配若依默认风格）=====
$u-primary: #409EFF;      // 主色
$u-success: #67C23A;      // 成功色
$u-warning: #E6A23C;      // 警告色
$u-error: #F56C6C;        // 错误色
$u-info: #909399;         // 信息色

// ===== 文字颜色覆盖 =====
$u-main-color: #303133;   // 主要文字颜色
$u-content-color: #606266; // 内容文字颜色
$u-tips-color: #909399;   // 提示文字颜色
$u-light-color: #C0C4CC;  // 浅色文字颜色

// ===== 字体变量覆盖 =====
$u-font-size-base: 14px;  // 基准字体大小
$u-font-size-sm: 12px;    // 小号字体
$u-font-size-lg: 16px;    // 大号字体
$u-font-size-xl: 18px;    // 超大号字体

// ===== 边框和圆角 =====
$u-border-color: #DCDFE6; // 边框颜色
$u-border-radius: 4px;    // 圆角半径

// ===== 间距变量 =====
$u-padding: 15px;         // 默认内边距
$u-margin: 15px;          // 默认外边距

// ===== 背景颜色 =====
$u-bg-color: #F5F5F5;     // 背景色

// 导入 UVIEW 样式（必须放在变量覆盖之后）
@import 'uview-plus/theme.scss';
```

### 规范3：表单校验与数据管理
**详细说明：**
使用 UVIEW 的 `u-form` 组件进行表单管理，结合 `rules` 规则进行数据校验，确保数据的有效性和用户体验。

**核心要点：**
- 使用 `u-form` 和 `u-form-item` 构建表单结构
- 通过 `rules` 配置校验规则
- 使用 `ref` 获取表单实例进行手动校验
- 支持异步校验和自定义校验规则

**表单示例：**

```html
<template>
  <view class="form-container">
    <u-form 
      :model="formData" 
      :rules="rules" 
      ref="formRef"
      labelWidth="80"
    >
      <u-form-item label="用户名" prop="username" required>
        <u-input 
          v-model="formData.username" 
          placeholder="请输入用户名"
          border="surround"
        ></u-input>
      </u-form-item>
      
      <u-form-item label="手机号" prop="phone" required>
        <u-input 
          v-model="formData.phone" 
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
          border="surround"
        ></u-input>
      </u-form-item>
      
      <u-form-item label="邮箱" prop="email">
        <u-input 
          v-model="formData.email" 
          placeholder="请输入邮箱"
          border="surround"
        ></u-input>
      </u-form-item>
    </u-form>
    
    <u-button 
      type="primary" 
      text="提交" 
      @click="handleSubmit"
      :loading="loading"
      customStyle="margin-top: 30rpx"
    ></u-button>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  username: '',
  phone: '',
  email: ''
})

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号', 
      trigger: 'blur' 
    }
  ],
  email: [
    { 
      type: 'email', 
      message: '请输入正确的邮箱地址', 
      trigger: ['blur', 'change'] 
    }
  ]
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate().then(valid => {
    if (valid) {
      loading.value = true
      // 执行提交逻辑
      console.log('表单数据：', formData)
      setTimeout(() => {
        loading.value = false
        uni.$u.toast('提交成功')
      }, 1000)
    } else {
      uni.$u.toast('请检查表单填写')
    }
  })
}
</script>

<style lang="scss" scoped>
.form-container {
  padding: 30rpx;
}
</style>
```

### 规范4：交互反馈统一使用UVIEW方法
**详细说明：**
为保持 UI 风格的统一性，所有交互反馈（提示、弹窗、加载等）必须使用 UVIEW 封装的方法，而非原生 uni API。

**核心要点：**
- 使用 `uni.$u.toast()` 替代 `uni.showToast()`
- 使用 `uni.$u.modal()` 替代 `uni.showModal()`
- 使用 `uni.$u.loading()` 进行加载提示
- 统一的交互风格提升用户体验

**交互方法示例：**

```javascript
// 轻提示
uni.$u.toast('操作成功')
uni.$u.toast({
  title: '操作失败',
  type: 'error',
  duration: 2000
})

// 确认弹窗
uni.$u.modal({
  title: '提示',
  content: '确定要删除这条记录吗？',
  showCancelButton: true,
  success: (res) => {
    if (res.confirm) {
      // 用户点击确定
      console.log('确定删除')
    }
  }
})

// 加载提示
uni.$u.loading('加载中...')
// 隐藏加载
uni.$u.loading.close()
```

### 规范5：响应式布局与单位规范
**详细说明：**
uni-app 采用 `rpx` 作为响应式单位，1rpx = 屏幕宽度 / 750。所有布局相关的尺寸必须使用 `rpx` 单位以适配不同屏幕。

**核心要点：**
- 布局使用 `rpx` 单位（如 `width: 750rpx`）
- 字体大小可使用 `rpx` 或 `px`（建议关键字号使用 `px`）
- 图标大小使用 `rpx` 确保在不同设备上保持比例
- 设计稿基准为 750px 宽度

**单位使用示例：**

```scss
.container {
  width: 750rpx;           // 全屏宽度
  padding: 30rpx;          // 内边距使用rpx
  margin-top: 20rpx;       // 外边距使用rpx
}

.card {
  width: 690rpx;           // 卡片宽度
  height: 200rpx;          // 卡片高度
  border-radius: 16rpx;    // 圆角使用rpx
}

.title {
  font-size: 32rpx;        // 标题字号（也可用16px）
  line-height: 44rpx;      // 行高
}

.icon {
  width: 48rpx;            // 图标尺寸
  height: 48rpx;
}
```

## 禁止事项

### ❌ 组件使用禁止项
1. **禁止混用 UVIEW 1.x 和 2.x 语法**
   - UVIEW 2.x 基于 Vue 3，部分属性已变更
   - 例如：按钮文本从插槽改为 `text` 属性
   - 必须查阅 UVIEW 2.0 官方文档确认正确用法

2. **禁止直接修改组件源码**
   - 不允许修改 `node_modules/uview-plus` 下的任何文件
   - 依赖更新会导致修改丢失
   - 应通过主题变量、自定义样式或二次封装实现定制

3. **禁止不规范的组件命名**
   - 必须使用 `u-` 前缀（如 `u-button` 而非 `uButton`）
   - 组件名必须是短横线分隔（kebab-case）

### ❌ 样式使用禁止项
1. **禁止使用 px 作为布局基准单位**
   - 必须使用 `rpx` 响应式像素单位
   - 固定像素会导致在不同屏幕上显示异常
   - 例外：`1px` 边框可使用 `px`（某些场景下）

2. **禁止直接修改组件内部样式**
   - 不允许使用 `/deep/` 或 `::v-deep` 强行覆盖组件内部样式
   - 应使用组件提供的 `custom-style` 或 `custom-class` 属性
   - 必要时可通过二次封装实现样式定制

3. **禁止在 uni.scss 外定义全局变量**
   - 所有全局 SCSS 变量必须在 `uni.scss` 中定义
   - 避免变量作用域混乱

### ❌ API 使用禁止项
1. **禁止直接使用原生 uni API 进行交互提示**
   - 禁止使用：`uni.showToast()`、`uni.showModal()`
   - 应使用：`uni.$u.toast()`、`uni.$u.modal()`
   - 保持 UI 风格统一

2. **禁止在模板中使用复杂的业务逻辑**
   - 计算属性和方法应在 `<script>` 中定义
   - 模板仅负责渲染，不应包含复杂判断

3. **禁止绕过表单校验直接提交**
   - 必须调用 `formRef.validate()` 进行校验
   - 确保数据有效性

### ❌ 性能与安全禁止项
1. **禁止在循环中使用静态 key**
   - 列表渲染必须使用唯一的 `:key`（如 `item.id`）
   - 不允许使用 `index` 作为 key（除非列表纯静态）

2. **禁止将敏感信息硬编码在前端**
   - API 密钥、token 等必须通过后端接口获取
   - 不允许在代码中明文存储密码

3. **禁止过度使用全局状态**
   - 页面级数据应使用组件 `data` 或 `ref/reactive`
   - 仅跨页面共享的数据才使用 Vuex/Pinia


## 最佳实践

### 1. 组件二次封装
对于频繁使用的组件，建议进行二次封装以统一业务逻辑：

```html
<!-- components/my-submit-button/my-submit-button.vue -->
<template>
  <u-button 
    :type="type"
    :text="text"
    :loading="loading"
    :disabled="disabled"
    @click="handleClick"
    :customStyle="buttonStyle"
  ></u-button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '提交'
  },
  type: {
    type: String,
    default: 'primary'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonStyle = computed(() => {
  return {
    width: '100%',
    marginTop: '30rpx'
  }
})

const handleClick = () => {
  if (!props.loading && !props.disabled) {
    emit('click')
  }
}
</script>
```

### 2. 请求拦截与统一处理
结合若依框架的请求封装，统一处理加载状态和错误提示：

```javascript
// utils/request.js
import { http } from '@/utils/http'

export const request = {
  async get(url, params = {}, showLoading = true) {
    if (showLoading) {
      uni.$u.loading('加载中...')
    }
    
    try {
      const res = await http.get(url, { params })
      uni.$u.loading.close()
      return res
    } catch (error) {
      uni.$u.loading.close()
      uni.$u.toast({
        title: error.message || '请求失败',
        type: 'error'
      })
      throw error
    }
  },
  
  async post(url, data = {}, showLoading = true) {
    if (showLoading) {
      uni.$u.loading('提交中...')
    }
    
    try {
      const res = await http.post(url, data)
      uni.$u.loading.close()
      return res
    } catch (error) {
      uni.$u.loading.close()
      uni.$u.toast({
        title: error.message || '提交失败',
        type: 'error'
      })
      throw error
    }
  }
}
```

### 3. 页面结构标准模板
推荐的页面结构模板：

```html
<template>
  <view class="page-container">
    <!-- 顶部导航栏（可选） -->
    <u-navbar 
      :title="pageTitle" 
      :safeAreaInsetTop="true"
      :placeholder="true"
    ></u-navbar>
    
    <!-- 主体内容区 -->
    <view class="content">
      <!-- 内容区域 -->
    </view>
    
    <!-- 底部操作栏（可选） -->
    <view class="footer-bar safe-area-inset-bottom">
      <u-button type="primary" text="确认"></u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 页面数据
const pageTitle = ref('页面标题')
const loading = ref(false)
const dataList = reactive([])

// 生命周期
onMounted(() => {
  initPage()
})

// 初始化页面
const initPage = async () => {
  loading.value = true
  try {
    // 加载数据
    await loadData()
  } finally {
    loading.value = false
  }
}

// 加载数据
const loadData = async () => {
  // 数据加载逻辑
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: $u-bg-color;
}

.content {
  padding: 30rpx;
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
```

### 4. 列表渲染优化
使用虚拟列表提升长列表性能：

```html
<template>
  <view class="list-container">
    <!-- 下拉刷新 -->
    <u-loadmore 
      :status="loadStatus" 
      @loadmore="loadMore"
    >
      <u-list 
        @scrolltolower="loadMore"
        :lowerThreshold="50"
      >
        <u-list-item 
          v-for="item in dataList" 
          :key="item.id"
        >
          <view class="list-item">
            <text>{{ item.name }}</text>
          </view>
        </u-list-item>
      </u-list>
    </u-loadmore>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const dataList = reactive([])
const page = ref(1)
const pageSize = ref(20)
const loadStatus = ref('loadmore') // loadmore, loading, nomore

const loadMore = async () => {
  if (loadStatus.value === 'loading' || loadStatus.value === 'nomore') {
    return
  }
  
  loadStatus.value = 'loading'
  
  try {
    // 模拟请求
    const res = await fetchList(page.value, pageSize.value)
    
    if (res.data.length > 0) {
      dataList.push(...res.data)
      page.value++
      loadStatus.value = 'loadmore'
    } else {
      loadStatus.value = 'nomore'
    }
  } catch (error) {
    loadStatus.value = 'loadmore'
  }
}

const fetchList = (page, size) => {
  // 实际请求逻辑
  return Promise.resolve({ data: [] })
}
</script>
```

## 参考代码路径

### 配置文件
- `pages.json` - easycom 配置、页面路由配置
- `uni.scss` - 全局 SCSS 变量覆盖
- `manifest.json` - 应用配置、平台配置
- `App.vue` - 全局样式、生命周期

### 页面示例
- `src/pages/index/index.vue` - 首页典型示例
- `src/pages/form/form.vue` - 表单页面示例
- `src/pages/list/list.vue` - 列表页面示例

### 组件示例
- `src/components/my-button/` - 按钮二次封装示例
- `src/components/my-form/` - 表单组件封装示例

### 工具函数
- `src/utils/request.js` - 请求封装
- `src/utils/validate.js` - 表单校验规则
- `src/utils/common.js` - 通用工具函数

## 检查清单

### 基础配置检查
- [ ] pages.json 中已正确配置 easycom 路径
- [ ] uni.scss 中已覆盖主题变量（与若依 PC 端保持一致）
- [ ] manifest.json 中已配置必要的权限和平台参数
- [ ] App.vue 中已引入 UVIEW 全局样式

### 组件使用检查
- [ ] 所有组件使用 `u-` 前缀命名规范
- [ ] 组件无需手动 import，直接在模板中使用
- [ ] 未混用 UVIEW 1.x 和 2.x 语法
- [ ] 组件属性使用正确（查阅 UVIEW 2.0 文档）

### 样式规范检查
- [ ] 布局尺寸使用 `rpx` 单位（非 `px`）
- [ ] 未直接修改 node_modules 中的组件源码
- [ ] 样式定制使用 `custom-style` 或 `custom-class`
- [ ] 全局变量在 uni.scss 中统一定义

### 表单校验检查
- [ ] 表单使用 `u-form` 和 `u-form-item` 构建
- [ ] 配置了合理的 `rules` 校验规则
- [ ] 提交前调用 `formRef.validate()` 进行校验
- [ ] 校验失败有明确的错误提示

### 交互反馈检查
- [ ] 使用 `uni.$u.toast()` 而非 `uni.showToast()`
- [ ] 使用 `uni.$u.modal()` 而非 `uni.showModal()`
- [ ] 加载状态使用 `uni.$u.loading()`
- [ ] 交互反馈风格统一

### 性能与安全检查
- [ ] 列表渲染使用唯一的 `:key`（非 index）
- [ ] 敏感信息未硬编码在前端代码中
- [ ] 长列表使用虚拟列表或分页加载
- [ ] 图片使用懒加载（必要时）

### 代码质量检查
- [ ] 代码结构清晰，逻辑分离合理
- [ ] 使用 Vue 3 Composition API（setup 语法糖）
- [ ] 无 console.log 调试代码残留
- [ ] 注释清晰，易于维护

## 常见问题与解决方案

### Q1: UVIEW 组件不显示或样式异常
**解决方案：**
1. 检查 pages.json 的 easycom 配置是否正确
2. 确认 uni.scss 中的变量覆盖是否在 `@import 'uview-plus/theme.scss'` 之前
3. 清除缓存并重新编译项目
4. 检查组件命名是否符合 `u-` 前缀规范

### Q2: 表单校验不生效
**解决方案：**
1. 确认 `u-form-item` 的 `prop` 属性与 `rules` 中的字段名一致
2. 检查 `formRef` 是否正确绑定到 `u-form` 组件
3. 确认 `formData` 使用 `reactive` 或 `ref` 包裹
4. 查看控制台是否有错误信息

### Q3: rpx 单位在不同设备显示不一致
**解决方案：**
1. 确认设计稿基准为 750px 宽度
2. 避免混用 px 和 rpx 导致布局错乱
3. 对于 1px 边框，可使用 `transform: scale(0.5)` 实现细线
4. 测试时使用多种分辨率的设备

### Q4: 小程序与 H5 样式差异
**解决方案：**
1. 使用条件编译处理平台差异：`/* #ifdef H5 */`
2. 避免使用小程序不支持的 CSS 属性
3. 图片路径使用绝对路径或网络路径
4. 测试时同时在小程序和 H5 平台验证

### Q5: 性能优化建议
**解决方案：**
1. 长列表使用虚拟列表或分页加载
2. 图片使用 `lazy-load` 懒加载
3. 避免在 `v-for` 中调用方法
4. 合理使用 `computed` 和 `watch`
5. 及时清理定时器和事件监听

## 相关资源

### 官方文档
- [UVIEW 2.0 官方文档](https://uviewui.com/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://cn.vuejs.org/)

### 若依框架
- [若依管理系统](http://ruoyi.vip/)
- [若依-vue-plus](https://gitee.com/dromara/RuoYi-Vue-Plus)

### 开发工具
- [HBuilderX](https://www.dcloud.io/hbuilderx.html) - uni-app 官方 IDE
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

## 更新日志
- 2026-01-26: 完善规范结构，新增最佳实践、检查清单和常见问题解决方案
- 初始版本: 创建基础 UVIEW 2.0 应用规范