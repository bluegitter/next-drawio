import { Color, Point, Transform } from './common';

// 填充样式
export type FillStyle = 
  | SolidFill
  | GradientFill
  | PatternFill
  | null;

export interface SolidFill {
  type: 'solid';
  color: string;
  opacity?: number;
}

export interface GradientFill {
  type: 'linear' | 'radial';
  stops: GradientStop[];
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  fx?: number;
  fy?: number;
  transform?: Transform;
}

export interface PatternFill {
  type: 'pattern';
  src: string;
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  transform?: Transform;
}

export interface GradientStop {
  offset: number; // 0-1
  color: string;
  opacity?: number;
}

// 描边样式
export interface StrokeStyle {
  color: string;
  width: number;
  cap: CanvasLineCap;
  join: CanvasLineJoin;
  miterLimit: number;
  dashArray?: number[];
  dashOffset?: number;
  opacity?: number;
}

// 滤镜样式
export interface FilterStyle {
  blur?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  hueRotate?: number;
  invert?: number;
  saturate?: number;
  sepia?: number;
}

// 阴影样式
export interface ShadowStyle {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity?: number;
}

// 合成样式
export interface CompositeStyle {
  operation?: GlobalCompositeOperation;
  alpha?: number;
}