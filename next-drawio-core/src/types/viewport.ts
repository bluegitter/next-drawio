import { Point, Size } from './common';

// 视口类型
export type ViewportMode = 'fit-all' | 'fit-width' | 'fit-height' | 'actual-size' | 'custom';

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
  mode: ViewportMode;
}

// 视口状态
export interface ViewportState extends Viewport {
  isAnimating: boolean;
  animationDuration: number;
  animationEasing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// 视口变换
export interface ViewportTransform {
  translateX: number;
  translateY: number;
  scale: number;
}

// 视口事件
export interface ViewportEventMap {
  'viewport:changed': Viewport;
  'viewport:zoomed': { oldZoom: number; newZoom: number; center?: Point };
  'viewport:panned': { delta: Point };
  'viewport:resized': { oldSize: Size; newSize: Size };
  'viewport:fitted': { mode: ViewportMode };
  'viewport:reset': {};
  'viewport:animation-started': {};
  'viewport:animation-completed': {};
}

// 视口操作选项
export interface ZoomOptions {
  center?: Point;
  animate?: boolean;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  minZoom?: number;
  maxZoom?: number;
}

export interface PanOptions {
  animate?: boolean;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  constrain?: boolean;
}

export interface FitOptions {
  mode?: 'all' | 'selection' | 'bounds';
  padding?: number;
  animate?: boolean;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// 视口工具
export interface ViewportTools {
  screenToCanvas: (point: Point) => Point;
  canvasToScreen: (point: Point) => Point;
  screenDistanceToCanvas: (distance: number) => number;
  canvasDistanceToScreen: (distance: number) => number;
  getVisibleBounds: () => { left: number; top: number; right: number; bottom: number };
  isPointVisible: (point: Point) => boolean;
  isBoundsVisible: (bounds: { left: number; top: number; right: number; bottom: number }) => boolean;
  zoomToLevel: (zoom: number, options?: ZoomOptions) => void;
  zoomToFit: (options?: FitOptions) => void;
  panTo: (point: Point, options?: PanOptions) => void;
  centerOn: (point: Point, options?: PanOptions) => void;
}