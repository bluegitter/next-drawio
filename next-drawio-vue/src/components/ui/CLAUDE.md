# UI 组件模块

[根目录](../../../../CLAUDE.md) > [src](../../../CLAUDE.md) > [components](../../CLAUDE.md) > **ui**

## 模块职责

`src/components/ui` 目录是 Next-DrawIO 项目的通用 UI 组件库，提供可复用的界面组件、工具函数和样式规范。该模块致力于构建一致的视觉体验和交互模式。

## 入口与启动

### 统一导出入口
- **index.ts**: UI 组件和工具的统一导出文件

### 核心组件
- **Button.tsx**: 按钮组件，支持多种变体和大小
- **Input.tsx**: 输入框组件，支持多种输入类型
- **utils.ts**: UI 工具函数，包含样式合并、类名处理等

## 对外接口

### 组件导出结构
```typescript
// 从 index.ts 统一导出
export { Button } from './Button';
export { Input } from './Input';
export { cn, ... } from './utils';
```

### 主要组件接口

#### Button 组件
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}
```

#### Input 组件
```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  [key: string]: any;
}
```

## 关键依赖与配置

### 技术依赖
- **React 19.2.0**: 组件框架
- **Tailwind CSS 4.0**: 样式框架
- **clsx**: 类名合并工具
- **tailwind-merge**: Tailwind 样式合并

### UI 设计系统
- **设计令牌**: 使用 Tailwind CSS 的设计系统
- **颜色主题**: 基于项目主题配置
- **字体系统**: 使用 Geist 字体族
- **间距系统**: 遵循 Tailwind 间距规范

## 数据模型

### 样式变体系统
```typescript
// 按钮变体配置
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};
```

### 工具函数
- **cn()**: 类名合并函数，结合 clsx 和 tailwind-merge
- **样式预设**: 预定义的样式组合
- **响应式工具**: 断点相关的工具函数

## 测试与质量

### Storybook 文档
- **Button.stories.tsx**: 完整的按钮组件展示和测试
- 包含所有变体、大小、状态的演示
- 交互式测试和参数调整

### 质量保证
- **TypeScript**: 完整的类型定义
- **PropTypes**: 运行时类型检查（如果使用）
- **可访问性**: 遵循 ARIA 规范
- **响应式设计**: 多设备兼容性

## 常见问题 (FAQ)

### Q: 如何添加新的 UI 组件？
A: 创建新的组件文件，实现标准的 props 接口，并在 index.ts 中导出。

### Q: 如何自定义组件样式？
A: 使用 className prop 传入自定义类名，或通过 Tailwind CSS 工具类进行样式覆盖。

### Q: 如何确保组件的一致性？
A: 遵循现有的组件设计模式，使用统一的 props 命名和样式变体系统。

## 相关文件清单

### 核心文件
- `index.ts` - 组件统一导出
- `Button.tsx` - 按钮组件实现
- `Input.tsx` - 输入框组件实现
- `utils.ts` - UI 工具函数

### Storybook 文档
- `Button.stories.tsx` - 按钮组件的故事文档

### 样式相关
- 使用 Tailwind CSS 类名
- 响应式设计断点
- 主题颜色变量

## 变更记录 (Changelog)

- **2025-12-03**: 创建 UI 组件模块文档
- **2025-12-03**: 完成 Button 和 Input 组件分析
- **2025-12-03**: 建立组件导出和工具函数体系