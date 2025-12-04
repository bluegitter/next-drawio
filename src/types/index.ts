// 重新导出所有类型定义
export * from './connection';
export * from './common';
export * from './object';
export * from './tool';
export * from './style';
export * from './layer';
export * from './viewport';
export * from './file';
export * from './ui';
export * from './api';

// 从 canvas.ts 选择性导出避免重复的类型
export type {
  ObjectType,
  BlendMode,
  CanvasObject,
  ObjectGeometry,
  ObjectStyle,
  ObjectMetadata,
  RenderLayer,
  GridConfig,
  RulerConfig,
  Guide,
  PathData,
  PathCommand,
  FillStyle,
  GradientFill,
  PatternFill,
  GradientStop,
  StrokeStyle,
  FilterStyle,
  ShadowStyle,
  CanvasContextType,
} from './canvas';