import { Point, Size, Transform, RenderContext, PerformanceMetrics } from './common';

// 画布对象类型
export type ObjectType = 
  | 'rectangle'
  | 'circle' 
  | 'ellipse'
  | 'line'
  | 'path'
  | 'text'
  | 'image'
  | 'group'
  | 'symbol'
  | 'polygon'
  | 'star'
  | 'custom';

// 混合模式
export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

// 画布对象
export interface CanvasObject {
  id: string;
  type: ObjectType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  
  // 变换属性
  transform: Transform;
  
  // 几何属性
  geometry: ObjectGeometry;
  
  // 样式属性
  style: ObjectStyle;
  
  // 元数据
  metadata: ObjectMetadata;
  
  // 自定义数据
  data: Record<string, any>;
  
  // 事件处理
  onPropertyChanged?: (property: string, oldValue: any, newValue: any) => void;
  onTransformChanged?: (oldTransform: Transform, newTransform: Transform) => void;
  onStyleChanged?: (oldStyle: ObjectStyle, newStyle: ObjectStyle) => void;
}

// 几何属性
export interface ObjectGeometry {
  // 基础属性
  x: number;
  y: number;
  width: number;
  height: number;
  
  // 路径相关
  path?: PathData;
  
  // 文字相关
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textDirection?: CanvasDirection;
  letterSpacing?: number;
  lineHeight?: number;
  
  // 高级图形
  points?: Point[];
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  startAngle?: number;
  endAngle?: number;
  cornerRadius?: number;
  sides?: number;
  innerRadius?: number;
  
  // 图片相关
  src?: string;
  image?: HTMLImageElement;
  
  // 裁剪路径
  clipPath?: string;
}

// 路径数据
export interface PathData {
  commands: PathCommand[];
}

export interface PathCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z' | 'H' | 'V' | 'S' | 'T' | 'A';
  params: number[];
}

// 对象样式
export interface ObjectStyle {
  fill?: FillStyle;
  stroke?: StrokeStyle;
  filter?: FilterStyle;
  shadow?: ShadowStyle;
  composite?: CompositeStyle;
}

// 填充样式
export type FillStyle = 
  | string
  | GradientFill
  | PatternFill
  | null;

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
}

export interface GradientStop {
  offset: number; // 0-1
  color: string;
  opacity?: number;
}

export interface PatternFill {
  type: 'pattern';
  src: string;
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  transform?: Transform;
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
}

// 画布上下文（SVG 版本）
export type CanvasRefLike<T> = { current: T | null } | { value: T | null };

export interface CanvasContextType {
  canvas: SVGSVGElement | null;
  canvasRef: CanvasRefLike<SVGSVGElement>;
  isLoading: boolean;
  error: Error | null;
  // SVG 画布操作方法
  clearCanvas: () => void;
  setZoom: (zoom: number) => void;
  centerCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => string;
}

// 合成样式
export interface CompositeStyle {
  operation?: GlobalCompositeOperation;
  alpha?: number;
}

// 对象元数据
export interface ObjectMetadata {
  createdAt: Date;
  modifiedAt: Date;
  createdBy?: string;
  modifiedBy?: string;
  version: number;
  tags: string[];
  notes?: string;
  locked: boolean;
  lockReason?: string;
}

// 视口配置
export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  centerX: number;
  centerY: number;
}

// 画布配置
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  enableHistory: boolean;
  historyLimit: number;
  enableGrid: boolean;
  enableRulers: boolean;
  enableSnap: boolean;
  gridSize: number;
  snapThreshold: number;
  enableMultiSelect: boolean;
  enableGroups: boolean;
  enableLayers: boolean;
  enablePlugins: boolean;
  maxObjects: number;
  renderMode: 'canvas' | 'svg' | 'webgl';
  quality: 'low' | 'medium' | 'high';
}

// 画布事件
export interface CanvasEventMap {
  'object:added': { object: CanvasObject };
  'object:removed': { object: CanvasObject };
  'object:updated': { object: CanvasObject; changes: Partial<CanvasObject> };
  'object:selected': { objects: CanvasObject[] };
  'object:deselected': { objects: CanvasObject[] };
  'object:lock-changed': { object: CanvasObject; locked: boolean };
  'object:visibility-changed': { object: CanvasObject; visible: boolean };
  
  'selection:changed': { selected: CanvasObject[]; previous: CanvasObject[] };
  'selection:cleared': {};
  
  'viewport:changed': { viewport: Viewport };
  'viewport:zoomed': { oldZoom: number; newZoom: number; center?: Point };
  'viewport:panned': { delta: Point };
  'viewport:resized': { oldSize: Size; newSize: Size };
  
  'tool:activated': { tool: string };
  'tool:deactivated': { tool: string };
  'tool:changed': { from: string; to: string };
  
  'render:started': {};
  'render:completed': { metrics: PerformanceMetrics };
  'render:error': { error: Error };
  
  'history:added': { state: HistoryState };
  'history:undone': { state: HistoryState };
  'history:redone': { state: HistoryState };
  'history:cleared': {};
  
  'canvas:cleared': {};
  'canvas:loaded': { data: any };
  'canvas:saved': { data: any };
  'canvas:exported': { format: string; data: Blob };
  
  'plugin:loaded': { plugin: string };
  'plugin:unloaded': { plugin: string };
  'plugin:error': { plugin: string; error: Error };
}

// 历史状态
export interface HistoryState {
  id: string;
  timestamp: number;
  action: string;
  description: string;
  data: {
    objects: CanvasObject[];
    viewport: Viewport;
    selection: string[];
  };
}

// 渲染层
export interface RenderLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  objects: string[];
  zIndex: number;
}

// 网格配置
export interface GridConfig {
  enabled: boolean;
  size: number;
  subdivisions: number;
  color: string;
  opacity: number;
  majorLines: {
    every: number;
    color: string;
    width: number;
  };
  minorLines: {
    color: string;
    width: number;
  };
  snapTo: boolean;
  snapThreshold: number;
}

// 标尺配置
export interface RulerConfig {
  enabled: boolean;
  unit: 'px' | 'mm' | 'cm' | 'in';
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  showGuides: boolean;
  guideColor: string;
  guideWidth: number;
}

// 辅助线
export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color?: string;
  width?: number;
  locked?: boolean;
}
