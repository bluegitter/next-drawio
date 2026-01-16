# 组件模块

[根目录](../../../CLAUDE.md) > [src](../../CLAUDE.md) > **components**

## 模块职责

`src/components` 目录是 Next-DrawIO 项目的 React 组件模块，包含画布相关组件、UI 组件库和交互组件。该模块负责实现用户界面的所有视觉元素和交互逻辑。

## 入口与启动

### 主要组件文件
- **CanvasProvider.tsx**: 画布上下文提供者，管理全局画布状态
- **CanvasComponent.tsx**: 核心画布交互组件
- **Toolbar.tsx**: 工具栏组件
- **PropertyPanel.tsx**: 属性面板组件

### UI 组件子模块
- **ui/**: 通用 UI 组件库
  - `Button.tsx` - 按钮组件
  - `Input.tsx` - 输入框组件
  - `utils.ts` - UI 工具函数

## 对外接口

### 组件导出结构
```typescript
// 主要画布组件
export { default as CanvasProvider } from './CanvasProvider';
export { default as CanvasComponent } from './CanvasComponent';
export { default as Toolbar } from './Toolbar';
export { default as PropertyPanel } from './PropertyPanel';

// UI 组件（从 ui 子目录导出）
export * from './ui';
```

### 组件接口定义

#### CanvasComponentRef 接口
```typescript
export interface CanvasComponentRef {
  addRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addPolyline: () => void;
  addText: () => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  // ... 其他方法
}
```

## 关键依赖与配置

### 技术依赖
- **Fabric.js 5.5.2**: Canvas 图形操作库
- **React 19.2.0**: 组件框架
- **Radix UI**: 基础 UI 组件
- **Tailwind CSS**: 样式框架
- **Lucide React**: 图标库

### 内部依赖
- **@/types**: 类型定义模块
- **@/constants**: 常量定义模块

## 数据模型

### SVGShape 接口
```typescript
interface SVGShape {
  id: string;
  type: 'rect' | 'circle' | 'triangle' | 'line' | 'polyline' | 'text' | 'connector';
  element: SVGElement;
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
  connections?: string[];
}
```

### 主要状态管理
- **shapes**: 画布上的图形列表
- **selectedShape**: 当前选中的图形 ID
- **history**: 历史记录管理
- **isDragging/isResizing/isConnecting**: 交互状态标志

## 测试与质量

### Storybook 文档
- **Button.stories.tsx**: 按钮组件故事
- **EnhancedToolbar.stories.tsx**: 增强工具栏故事
- **PropertyPanel.stories.tsx**: 属性面板故事
- **CanvasComponent.stories.tsx**: 画布组件故事

### 测试覆盖范围
- 组件渲染测试
- 用户交互测试
- 事件处理测试
- 响应式设计测试

## 常见问题 (FAQ)

### Q: 如何添加新的绘图工具？
A: 创建新的工具组件，然后在 `CanvasComponent` 中添加对应的工具处理逻辑。

### Q: 如何自定义画布样式？
A: 通过 CanvasProvider 传递样式配置，或直接修改组件的 Tailwind CSS 类名。

### Q: 如何扩展属性面板？
A: 在 `PropertyPanel.tsx` 中添加新的属性控制组件，并连接到画布组件的相应方法。

## 相关文件清单

### 核心画布组件
- `CanvasProvider.tsx` - 画布状态管理
- `CanvasComponent.tsx` - 交互式画布（主要功能）
- `SimpleCanvasComponent.tsx` - 简化画布组件
- `AdvancedCanvasComponent.tsx` - 高级画布组件

### UI 组件
- `Toolbar.tsx` - 工具栏
- `EnhancedToolbar.tsx` - 增强工具栏
- `PropertyPanel.tsx` - 属性面板

### UI 子模块 (`ui/`)
- `index.ts` - UI 组件导出
- `utils.ts` - UI 工具函数
- `Button.tsx` - 按钮组件
- `Input.tsx` - 输入框组件
- [其他 UI 组件]

### Storybook 文件
- `Button.stories.tsx` - 按钮故事
- `EnhancedToolbar.stories.tsx` - 工具栏故事
- `PropertyPanel.stories.tsx` - 属性面板故事
- `CanvasComponent.stories.tsx` - 画布故事

## 变更记录 (Changelog)

- **2025-12-03**: 创建组件模块文档，定义组件结构和接口
- **2025-12-03**: 完成核心画布组件分析，包括 CanvasComponent
