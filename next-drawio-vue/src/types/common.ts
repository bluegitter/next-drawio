// 通用基础类型定义

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Transform {
  position: Point;
  rotation: number; // 弧度
  scale: Point;
  skew: Point;
}

export interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface Color {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

// GradientStop 类型定义在 canvas.ts 和 style.ts 中

export interface Rect extends Point, Size {}

export interface Circle extends Point {
  radius: number;
}

export interface Polygon {
  points: Point[];
}

// PathData 和 PathCommand 类型定义在 canvas.ts 中

// 事件类型
export interface BaseEvent {
  type: string;
  timestamp: number;
  prevented: boolean;
  stopPropagation: () => void;
  preventDefault: () => void;
}

export interface MouseEvent extends BaseEvent {
  type: 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dblclick';
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface KeyboardEvent extends BaseEvent {
  type: 'keydown' | 'keyup' | 'keypress';
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
}

export interface TouchEvent extends BaseEvent {
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';
  touches: Touch[];
  changedTouches: Touch[];
  targetTouches: Touch[];
}

export interface Touch {
  identifier: number;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  pageX: number;
  pageY: number;
}

// 工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 渲染上下文
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };
  zoom: number;
  devicePixelRatio: number;
  isHitTest: boolean;
}

// 交互上下文
export interface InteractionContext {
  engine: any; // CanvasEngine - 避免循环依赖
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };
  activeTool: string;
  selectedObjects: string[];
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  screenToCanvas: (point: Point) => Point;
  canvasToScreen: (point: Point) => Point;
}

// 组件上下文
export interface ComponentContext {
  engine: any;
  container: HTMLElement;
  render: () => void;
  destroy: () => void;
}

// 错误类型
export class CanvasError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CanvasError';
  }
}

export class ToolError extends CanvasError {
  constructor(message: string, toolId?: string) {
    super(message, `TOOL_ERROR_${toolId}`);
    this.name = 'ToolError';
  }
}

export class ObjectError extends CanvasError {
  constructor(message: string, objectId?: string) {
    super(message, `OBJECT_ERROR_${objectId}`);
    this.name = 'ObjectError';
  }
}

// 性能指标
export interface PerformanceMetrics {
  frameRate: number;
  renderTime: number;
  objectCount: number;
  visibleObjectCount: number;
  memoryUsage: number;
  canvasSize: Size;
}

// HistoryState 类型定义在 canvas.ts 中

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// 本地存储类型
export interface StorageData {
  userPreferences: UserPreferences;
  recentProjects: ProjectInfo[];
  canvasSettings: CanvasSettings;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface ProjectInfo {
  id: string;
  name: string;
  thumbnail?: string;
  lastModified: Date;
  size: Size;
  objectCount: number;
}

export interface CanvasSettings {
  backgroundColor: string;
  backgroundImage?: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
  dpi: number;
}