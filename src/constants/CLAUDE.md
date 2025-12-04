# 常量定义模块

[根目录](../../../CLAUDE.md) > [src](../../CLAUDE.md) > **constants**

## 模块职责

`src/constants` 目录是 Next-DrawIO 项目的常量定义模块，包含项目中使用的所有常量、配置项和枚举值。该模块确保项目中配置的集中管理和一致性。

## 入口与启动

### 常量导出入口
- **index.ts**: 常量统一导出文件

### 核心常量文件
- `canvas.ts` - 画布相关常量
- `tools.ts` - 工具相关常量
- `colors.ts` - 颜色主题常量
- `shortcuts.ts` - 快捷键常量
- `defaults.ts` - 默认值常量
- `config.ts` - 全局配置常量

## 对外接口

### 导出结构
```typescript
// index.ts
export * from './canvas';
export * from './tools';
export * from './colors';
export * from './shortcuts';
export * from './defaults';
export * from './config';
```

## 关键依赖与配置

### 配置文件结构
- **环境配置**: 使用 Next.js 环境变量
- **构建配置**: 在 `next.config.ts` 中集成
- **运行时配置**: 通过常量模块提供

### 模块依赖
- 依赖 `@/types` 进行类型约束
- 提供给组件模块使用的配置值
- 与工具系统紧密集成

## 数据模型

### 画布常量 (canvas.ts)
```typescript
// 画布尺寸限制
export const CANVAS_MIN_WIDTH = 100;
export const CANVAS_MAX_WIDTH = 5000;
export const CANVAS_MIN_HEIGHT = 100;
export const CANVAS_MAX_HEIGHT = 5000;

// 默认画布设置
export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 600;

// 网格配置
export const DEFAULT_GRID_SIZE = 20;
export const MIN_GRID_SIZE = 5;
export const MAX_GRID_SIZE = 100;
```

### 工具常量 (tools.ts)
```typescript
// 工具类型
export const TOOL_TYPES = {
  SELECT: 'select',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  LINE: 'line',
  POLYLINE: 'polyline',
  TEXT: 'text',
  CONNECT: 'connect',
} as const;

// 工具配置
export const TOOL_CONFIGS = {
  rectangle: { cursor: 'crosshair', hotkey: 'R' },
  circle: { cursor: 'crosshair', hotkey: 'C' },
  // ...
};
```

### 颜色常量 (colors.ts)
```typescript
// 主色调
export const PRIMARY_COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
} as const;

// 默认图形颜色
export const DEFAULT_SHAPE_COLORS = {
  fill: {
    rectangle: '#3b82f6',
    circle: '#10b981',
    triangle: '#f59e0b',
    text: '#1f2937',
  },
  stroke: {
    rectangle: '#1e40af',
    circle: '#059669',
    triangle: '#d97706',
    line: '#ef4444',
    polyline: '#8b5cf6',
  },
} as const;
```

### 快捷键常量 (shortcuts.ts)
```typescript
// 工具快捷键
export const TOOL_SHORTCUTS = {
  'select': 'V',
  'rectangle': 'R',
  'circle': 'C',
  'triangle': 'T',
  'line': 'L',
  'polyline': 'P',
  'text': 'T',
  'connect': 'Shift+C',
} as const;

// 操作快捷键
export const ACTION_SHORTCUTS = {
  'undo': 'Ctrl+Z',
  'redo': 'Ctrl+Y',
  'delete': 'Delete',
  'duplicate': 'Ctrl+D',
  'copy': 'Ctrl+C',
  'paste': 'Ctrl+V',
} as const;
```

### 默认值常量 (defaults.ts)
```typescript
// 默认图形属性
export const DEFAULT_SHAPE_PROPS = {
  strokeWidth: 2,
  opacity: 1,
  radius: 40,
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
} as const;

// 默认画布属性
export const DEFAULT_CANVAS_PROPS = {
  backgroundColor: '#ffffff',
  showGrid: false,
  snapToGrid: false,
  showRulers: false,
} as const;
```

### 全局配置常量 (config.ts)
```typescript
// 应用配置
export const APP_CONFIG = {
  name: 'VectorDraw Pro',
  version: '3.0.0',
  description: '高级矢量图形编辑器',
} as const;

// 性能配置
export const PERFORMANCE_CONFIG = {
  maxObjects: 1000,
  renderThrottle: 16, // 60fps
  historyLimit: 50,
  autoSaveInterval: 30000, // 30秒
} as const;

// 导出配置
export const EXPORT_CONFIG = {
  formats: ['png', 'jpg', 'svg', 'pdf'],
  defaultFormat: 'png',
  quality: {
    png: 1.0,
    jpg: 0.8,
  },
} as const;
```

## 测试与质量

### 配置验证
- **类型检查**: 使用 TypeScript 确保类型安全
- **范围检查**: 验证配置值的有效范围
- **依赖检查**: 确保常量间的依赖关系正确

### 测试覆盖
- 配置值格式验证
- 常量导入导出测试
- 配置变更影响测试

## 常见问题 (FAQ)

### Q: 如何修改默认配置？
A: 直接在对应的常量文件中修改值，或使用环境变量覆盖配置。

### Q: 如何添加新的工具常量？
A: 在 `tools.ts` 中添加工具定义和配置，并在 `TOOL_TYPES` 中注册。

### Q: 如何自定义颜色主题？
A: 在 `colors.ts` 中修改颜色定义，或创建新的主题配置对象。

### Q: 如何管理环境相关配置？
A: 使用 Next.js 的环境变量系统，或在常量文件中进行环境判断。

## 相关文件清单

### 核心常量文件
- `index.ts` - 常量导出文件
- `canvas.ts` - 画布相关常量
- `tools.ts` - 工具相关常量
- `colors.ts` - 颜色主题常量
- `shortcuts.ts` - 快捷键常量
- `defaults.ts` - 默认值常量
- `config.ts` - 全局配置常量

## 变更记录 (Changelog)

- **2025-12-03**: 创建常量定义模块文档
- **2025-12-03**: 完成核心常量文件分析
- **2025-12-03**: 建立常量导出和配置体系

## 常量设计原则

### 命名规范
- 使用 UPPER_SNAKE_CASE 命名常量
- 使用描述性名称，避免歧义
- 分组相关常量，使用命名空间

### 组织原则
- 按功能模块分组常量
- 避免循环依赖
- 保持常量的不可变性

### 可扩展性
- 使用 `as const` 进行字面量类型推断
- 支持配置的热更新
- 提供配置验证机制

### 性能考虑
- 避免在常量文件中进行复杂计算
- 使用编译时常量优化
- 减少运行时配置解析开销