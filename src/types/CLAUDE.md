# 类型定义模块

[根目录](../../../CLAUDE.md) > [src](../../CLAUDE.md) > **types**

## 模块职责

`src/types` 目录是 Next-DrawIO 项目的 TypeScript 类型定义模块，负责定义项目中使用的所有类型接口、枚举和类型声明。该模块确保项目的类型安全性和开发体验。

## 入口与启动

### 类型导出入口
- **index.ts**: 统一的类型导出文件，重新导出所有子模块类型

### 核心类型文件
- `common.ts` - 通用基础类型定义
- `canvas.ts` - 画布相关类型定义
- `object.ts` - 画布对象类型定义
- `tool.ts` - 工具类型定义
- `style.ts` - 样式相关类型定义
- `layer.ts` - 层级类型定义
- `viewport.ts` - 视口类型定义
- `file.ts` - 文件相关类型定义
- `api.ts` - API 相关类型定义
- `ui.ts` - UI 组件类型定义

## 对外接口

### 导出结构
```typescript
// index.ts
export * from './common';
export * from './canvas';
export * from './object';
export * from './tool';
export * from './style';
export * from './layer';
export * from './viewport';
export * from './file';
export * from './api';
export * from './ui';
```

## 关键依赖与配置

### TypeScript 配置
- **严格模式**: 启用所有严格类型检查
- **路径映射**: 使用 `@/` 前缀进行路径引用
- **类型声明**: 完整的类型定义覆盖

### 类型依赖关系
- `canvas.ts` 依赖 `common.ts`
- `object.ts` 依赖 `common.ts` 和 `style.ts`
- 其他模块依赖基础类型定义

## 数据模型

### 核心基础类型 (common.ts)

#### 几何类型
```typescript
export interface Point { x: number; y: number; }
export interface Size { width: number; height: number; }
export interface Bounds { left: number; top: number; right: number; bottom: number; }
export interface Rect extends Point, Size {}
export interface Circle extends Point { radius: number; }
export interface Polygon { points: Point[]; }
```

#### 变换类型
```typescript
export interface Transform {
  position: Point;
  rotation: number; // 弧度
  scale: Point;
  skew: Point;
}
```

#### 颜色和主题
```typescript
export interface Color {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export type Theme = 'light' | 'dark' | 'auto';
```

### 画布类型 (canvas.ts)

#### 对象类型
```typescript
export type ObjectType = 
  | 'rectangle' | 'circle' | 'ellipse' 
  | 'line' | 'path' | 'text' | 'image'
  | 'group' | 'symbol' | 'polygon' | 'star' | 'custom';
```

#### 混合模式
```typescript
export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity';
```

#### 画布对象
```typescript
export interface CanvasObject {
  id: string;
  type: ObjectType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  geometry: ObjectGeometry;
  style: ObjectStyle;
  metadata: ObjectMetadata;
  data: Record<string, any>;
}
```

### 工具类型 (tool.ts)
- 工具定义和配置
- 工具状态和事件
- 工具交互模式

### 样式类型 (style.ts)
- 填充样式 (FillStyle)
- 描边样式 (StrokeStyle)
- 阴影样式 (ShadowStyle)
- 滤镜样式 (FilterStyle)

## 测试与质量

### 类型检查策略
- **编译时检查**: 使用 TypeScript 编译器
- **IDE 集成**: VS Code 类型检查
- **构建验证**: 在构建流程中进行类型检查

### 类型覆盖率
- ✅ 所有公共 API 有类型定义
- ✅ 组件 Props 完全类型化
- ✅ 事件处理函数类型化
- ✅ 配置对象类型化

## 常见问题 (FAQ)

### Q: 如何添加新的类型定义？
A: 在相应的类型文件中添加，然后在 index.ts 中重新导出。

### Q: 如何扩展现有类型？
A: 使用 TypeScript 的扩展机制，或创建联合类型和交叉类型。

### Q: 如何处理第三方库的类型？
A: 使用 `@types/` 包，或在类型声明文件中扩展已有类型。

### Q: 如何确保类型兼容性？
A: 使用语义化版本控制，避免破坏性变更，并使用 TypeScript 的兼容性检查工具。

## 相关文件清单

### 核心类型文件
- `index.ts` - 类型导出文件
- `common.ts` - 通用类型定义
- `canvas.ts` - 画布类型定义
- `object.ts` - 对象类型定义
- `tool.ts` - 工具类型定义
- `style.ts` - 样式类型定义

### 扩展类型文件
- `layer.ts` - 层级类型定义
- `viewport.ts` - 视口类型定义
- `file.ts` - 文件类型定义
- `api.ts` - API 类型定义
- `ui.ts` - UI 类型定义

## 变更记录 (Changelog)

- **2025-12-03**: 创建类型定义模块文档
- **2025-12-03**: 完成核心类型文件分析
- **2025-12-03**: 建立类型导出和依赖关系

## 类型设计原则

### 命名规范
- 使用 PascalCase 命名接口和类型
- 使用 camelCase 命名属性
- 使用描述性名称，避免缩写

### 可扩展性
- 使用泛型提高类型复用性
- 使用联合类型支持多种变体
- 使用条件类型进行高级类型操作

### 类型安全
- 优先使用 `interface` 而非 `type`（除非需要联合类型）
- 使用 `readonly` 修饰符保护不可变数据
- 使用 `as const` 进行字面量类型推断