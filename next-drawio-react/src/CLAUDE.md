# src 源代码模块

[根目录](../../CLAUDE.md) > **src**

## 模块职责

`src` 目录是 Next-DrawIO 项目的核心源代码目录，包含应用组件与适配层。绘图核心、常量与形状库已迁移到 `packages/drawio-core`，通过 `@drawio/core` 复用。

## 入口与启动

- **主入口**: `app/page.tsx` - 应用主页面组件
- **布局文件**: `app/layout.tsx` - 应用根布局
- **全局样式**: `app/globals.css` - 全局 CSS 样式

## 对外接口

### 组件导出结构
```
src/
├── components/          # React 组件
│   ├── ui/             # 通用 UI 组件
│   ├── CanvasProvider.tsx
│   └── [其他画布组件]
├── types/              # TypeScript 类型定义（部分透传 @drawio/core）
└── [其他应用模块]
```

### 主要导出
- `components/ui/index.ts` - UI 组件统一导出
- `types/index.ts` - 类型定义统一导出
- `packages/drawio-core/src/constants/index.ts` - 常量统一导出（通过 @drawio/core 使用）

## 关键依赖与配置

### 核心技术栈
- **React 19.2.0**: 组件框架
- **Next.js 16.0.6**: 应用框架
- **TypeScript**: 类型系统
- **Tailwind CSS**: 样式框架

### 主要依赖
- **Zustand 5.0.1**: 状态管理
- **Radix UI**: UI 组件库
- **Lucide React**: 图标库

## 数据模型

### 核心类型定义
- **CanvasObject**: 画布对象基础类型
- **ToolType**: 工具类型定义
- **Point/Size/Transform**: 几何基础类型
- **CanvasConfig**: 画布配置类型

### 主要数据流
1. 用户交互 → 工具栏 → 画布组件
2. 画布事件 → 状态管理 → UI 更新
3. 属性面板 → 对象属性更新 → 画布重绘

## 测试与质量

### 测试配置
- **Jest**: 单元测试框架
- **jest.config.js**: Jest 配置文件
- **jest.setup.js**: 测试环境设置

### 代码质量工具
- **ESLint**: 代码检查
- **TypeScript**: 类型检查
- **Storybook**: 组件文档和测试

## 常见问题 (FAQ)

### Q: 如何添加新的绘图工具？
A: 在 `src/components/` 目录下创建新的工具组件，并在 `packages/drawio-core/src/types/tool.ts` 中定义工具类型。

### Q: 如何扩展 UI 组件？
A: 在 `src/components/ui/` 目录下添加新组件，并在 `index.ts` 中导出。

### Q: 如何添加新的类型定义？
A: 在 `src/types/` 目录下创建新的类型文件，并在 `index.ts` 中重新导出。

## 相关文件清单

### 配置文件
- `jest.config.js` - Jest 测试配置
- `jest.setup.js` - 测试环境设置

### 类型定义目录 (`src/types/`)
- `index.ts` - 类型统一导出
- `common.ts` - 通用类型定义
- `canvas.ts` - 画布相关类型
- `tool.ts` - 工具类型定义
- `object.ts` - 对象类型定义
- [其他类型文件]

### 常量定义目录（已迁移）
- `packages/drawio-core/src/constants/index.ts` - 常量统一导出
- `packages/drawio-core/src/constants/*` - 画布/工具/颜色等常量

### 组件目录 (`src/components/`)
- `ui/` - UI 组件子目录
- `CanvasProvider.tsx` - 画布上下文提供者
- `Toolbar.tsx` - 工具栏组件
- `PropertyPanel.tsx` - 属性面板组件
- `CanvasComponent.tsx` - 交互式画布组件
- [其他画布组件]

## 变更记录 (Changelog)

- **2025-12-03**: 创建 src 模块文档，定义目录结构和主要接口
