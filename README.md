# Next-DrawIO 

模仿drawio的框架无关的绘图编辑器项目，包含核心库和多框架实现。

## 项目结构

```
next-drawio/
├── next-drawio-core/      # 核心库（框架无关）
├── next-drawio-react/     # React 实现
├── next-drawio-vue/       # Vue 实现
└── pnpm-workspace.yaml    # Monorepo 配置
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动 React 项目
pnpm dev:react

# 启动 Vue 项目
pnpm dev:vue
```

### 构建

```bash
# 构建所有项目
pnpm build

# 构建特定项目
pnpm build:core    # 构建核心库
pnpm build:react   # 构建 React 项目
pnpm build:vue     # 构建 Vue 项目
```

## 包说明

### @drawio/core

框架无关的绘图核心库，提供：
- 形状系统和注册机制
- 连接管理和路径计算
- 画布状态管理
- 工具函数和常量定义

### next-drawio-react

基于 Next.js 16 + React 19 的实现，包含：
- App Router 架构
- Radix UI 组件库
- Zustand 状态管理
- Storybook 文档

### next-drawio-vue

基于 Vue 3 + Vite 的实现，包含：
- Composition API
- TypeScript 支持
- Tailwind CSS 样式

## 开发指南

### 添加新依赖

```bash
# 为所有项目添加依赖
pnpm add <package> -w

# 为特定项目添加依赖
pnpm add <package> --filter next-drawio-react
pnpm add <package> --filter next-drawio-vue
pnpm add <package> --filter next-drawio-core
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 技术栈

- **核心库**: TypeScript + Fabric.js
- **React**: Next.js 16, React 19, Zustand
- **Vue**: Vue 3, Vite
- **样式**: Tailwind CSS 4
- **测试**: Jest, Testing Library
- **构建**: TypeScript, pnpm workspace

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT

## 作者

bluegitter - [GitHub](https://github.com/bluegitter)