# @drawio/core

框架无关的绘图核心库，提供图表编辑和画布操作的底层能力。

## 概述

`@drawio/core` 是一个纯 TypeScript 实现的绘图核心库，基于 Fabric.js 构建，完全框架无关。该库提供了：

- 🔧 **形状系统** - 完整的图形定义和注册机制
- 🔗 **连接管理** - 智能连接点计算和路径规划
- 🎨 **样式系统** - 统一的图形样式管理
- 📐 **工具函数** - 点计算、SVG处理等实用工具
- ⚙️ **常量定义** - 配置、颜色、工具类型等

## 特性

- ✅ **框架无关** - 可在任何框架中使用（React、Vue、Angular等）
- ✅ **TypeScript** - 完整的类型定义和类型安全
- ✅ **轻量级** - 仅依赖 Fabric.js
- ✅ **可扩展** - 插件化的形状系统
- ✅ **高性能** - 优化的渲染和计算逻辑

## 安装

```bash
pnpm add @drawio/core
```

## 快速开始

```typescript
import { shapeRegistry, createCanvasState } from '@drawio/core';

// 创建画布状态
const canvasState = createCanvasState();

// 注册自定义形状
const customShape: ShapeDefinition = {
  type: 'custom-rectangle',
  // ... 形状配置
};

shapeRegistry.register(customShape);
```

## 核心模块

### 形状系统 (`shapes/`)
```typescript
import { shapeRegistry, getPortsForShape } from '@drawio/core';

// 获取形状的连接点
const ports = getPortsForShape('rectangle');

// 注册新形状
shapeRegistry.register({
  type: 'my-shape',
  // ... 配置
});
```

### 连接管理 (`lib/connection/`)
```typescript
import { ConnectionManager, DefaultConnectionPointGenerator } from '@drawio/core';

const manager = new ConnectionManager();
const points = manager.calculateConnectionPath(startShape, endShape);
```

### 工具函数 (`canvas/utils/`)
```typescript
import { 
  getConnectorPoints, 
  parsePoints, 
  formatPoints,
  toDataUri 
} from '@drawio/core';

// 计算连接点
const points = getConnectorPoints(rect1, rect2);

// SVG数据处理
const dataUri = toDataUri(svgString);
```

### 常量定义 (`constants/`)
```typescript
import { 
  DEFAULT_CANVAS_CONFIG, 
  SHAPE_ICONS,
  GENERAL_SHAPE_LIBRARY 
} from '@drawio/core';
```

## API 文档

详细的 API 文档请参考 [TypeScript 类型定义](./src/types/index.ts)。

## 开发

```bash
# 安装依赖
pnpm install

# 类型检查
pnpm type-check

# 构建
pnpm build

# 监听模式
pnpm dev
```

## 项目结构

```
src/
├── canvas/          # 画布状态和工具函数
├── constants/       # 常量定义
├── lib/            # 核心库（连接管理等）
├── shapes/         # 形状定义和注册
└── types/          # TypeScript 类型定义
```

## 使用框架

### React
```tsx
import { useCanvasState } from '@drawio/core/react';
```

### Vue
```vue
<script setup>
import { useCanvasState } from '@drawio/core/vue';
</script>
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 作者

VectorDraw Pro Team