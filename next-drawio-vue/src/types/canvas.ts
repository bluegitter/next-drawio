import type { Ref } from 'vue';
import type { fabric } from 'fabric';
import { Point, Size, Transform, PerformanceMetrics } from './common';

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
  onPropertyChanged?: (property: string, oldValue: any, newValue: any) => void;
  onTransformChanged?: (oldTransform: Transform, newTransform: Transform) => void;
  onStyleChanged?: (oldStyle: ObjectStyle, newStyle: ObjectStyle) => void;
}

export interface ObjectGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  path?: PathData;
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
  points?: Point[];
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  startAngle?: number;
  endAngle?: number;
  cornerRadius?: number;
  sides?: number;
  innerRadius?: number;
  src?: string;
  image?: HTMLImageElement;
  clipPath?: string;
}

export interface PathData {
  commands: PathCommand[];
}

export interface PathCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z' | 'H' | 'V' | 'S' | 'T' | 'A';
  params: number[];
}

export interface ObjectStyle {
  fill?: FillStyle;
  stroke?: StrokeStyle;
  filter?: FilterStyle;
  shadow?: ShadowStyle;
  composite?: CompositeStyle;
}

export type FillStyle = string | GradientFill | PatternFill | null;

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
  offset: number;
  color: string;
  opacity?: number;
}

export interface PatternFill {
  type: 'pattern';
  src: string;
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  transform?: Transform;
}

export interface StrokeStyle {
  color: string;
  width: number;
  cap: CanvasLineCap;
  join: CanvasLineJoin;
  miterLimit: number;
  dashArray?: number[];
  dashOffset?: number;
}

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

export interface ShadowStyle {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface CanvasContextType {
  canvas: fabric.Canvas | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  isLoading: boolean;
  error: Error | null;
  addObject: (object: fabric.Object) => void;
  removeObject: (object: fabric.Object) => void;
  clearCanvas: () => void;
  getSelectedObjects: () => fabric.Object[];
  setActiveTool: (tool: 'select' | 'draw' | 'erase' | 'pan') => void;
  setZoom: (zoom: number) => void;
  centerCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => string;
}

export interface CompositeStyle {
  operation?: GlobalCompositeOperation;
  alpha?: number;
}

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

export interface RenderLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  objects: string[];
  zIndex: number;
}

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

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color?: string;
  width?: number;
  locked?: boolean;
}
