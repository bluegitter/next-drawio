import { Point } from './common';
import { CanvasObject } from './canvas';

// 工具类型
export type ToolType = 
  | 'select'
  | 'direct-select'
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'pen'
  | 'pencil'
  | 'text'
  | 'hand'
  | 'zoom'
  | 'eyedropper'
  | 'gradient'
  | 'eraser'
  | 'scissors'
  | 'shape'
  | 'star'
  | 'polygon';

// 工具状态
export type ToolState = 
  | 'idle'
  | 'active'
  | 'drawing'
  | 'editing'
  | 'transforming'
  | 'disabled';

// 光标类型
export type CursorType = 
  | 'default'
  | 'pointer'
  | 'crosshair'
  | 'move'
  | 'text'
  | 'not-allowed'
  | 'grab'
  | 'grabbing'
  | 'nwse-resize'
  | 'nesw-resize'
  | 'ew-resize'
  | 'ns-resize';

// 工具基类接口
export interface Tool {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly icon: string;
  readonly cursor: CursorType;
  readonly type: ToolType;
  readonly category: ToolCategory;
  readonly state: ToolState;
  
  // 工具选项
  options: ToolOptions;
  
  // 生命周期方法
  onActivate?(context: any): void;
  onDeactivate?(context: any): void;
  onEnable?(): void;
  onDisable?(): void;
  
  // 事件处理方法
  onMouseDown?(event: any, context: any): boolean;
  onMouseMove?(event: any, context: any): boolean;
  onMouseUp?(event: any, context: any): boolean;
  onDoubleClick?(event: any, context: any): boolean;
  onKeyDown?(event: any, context: any): boolean;
  onKeyUp?(event: any, context: any): boolean;
  onTouchStart?(event: any, context: any): boolean;
  onTouchMove?(event: any, context: any): boolean;
  onTouchEnd?(event: any, context: any): boolean;
  
  // 渲染方法
  renderPreview?(context: any): void;
  renderOverlay?(context: any): void;
  
  // 工具方法
  setOptions?(options: Partial<ToolOptions>): void;
  getOptions?(): ToolOptions;
  reset?(): void;
  
  // 快捷键
  shortcuts?: string[];
  
  // 依赖
  dependencies?: string[];
}

// 工具分类
export type ToolCategory = 
  | 'selection'
  | 'drawing'
  | 'text'
  | 'navigation'
  | 'color'
  | 'transform'
  | 'custom';

// 工具选项
export interface ToolOptions {
  // 通用选项
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  constrainProportions?: boolean;
  
  // 选择工具选项
  selectionMode?: 'replace' | 'add' | 'subtract' | 'intersect';
  allowMultiSelect?: boolean;
  selectBehind?: boolean;
  
  // 绘图工具选项
  fillEnabled?: boolean;
  strokeEnabled?: boolean;
  strokeCap?: CanvasLineCap;
  strokeJoin?: CanvasLineJoin;
  
  // 矩形工具选项
  cornerRadius?: number;
  
  // 圆形工具选项
  fromCenter?: boolean;
  constrainToCircle?: boolean;
  
  // 文字工具选项
  autoSize?: boolean;
  wordWrap?: boolean;
  
  // 钢笔工具选项
  smoothness?: number;
  autoClose?: boolean;
  
  // 铅笔工具选项
  smoothing?: number;
  simplifyTolerance?: number;
  
  // 自定义选项
  [key: string]: any;
}

// 选择工具
export interface SelectTool extends Tool {
  type: 'select';
  options: ToolOptions & {
    selectionMode: 'replace' | 'add' | 'subtract' | 'intersect';
    allowMultiSelect: boolean;
    selectBehind: boolean;
    showBoundingBox: boolean;
    showTransformHandles: boolean;
  };
}

// 直接选择工具
export interface DirectSelectTool extends Tool {
  type: 'direct-select';
  options: ToolOptions & {
    showAnchors: boolean;
    showHandles: boolean;
    editPathPoints: boolean;
  };
}

// 矩形工具
export interface RectangleTool extends Tool {
  type: 'rectangle';
  options: ToolOptions & {
    cornerRadius: number;
    fromCenter: boolean;
    squareMode: boolean;
  };
}

// 圆形工具
export interface CircleTool extends Tool {
  type: 'circle';
  options: ToolOptions & {
    fromCenter: boolean;
    constrainToCircle: boolean;
  };
}

// 钢笔工具
export interface PenTool extends Tool {
  type: 'pen';
  options: ToolOptions & {
    smoothness: number;
    autoClose: boolean;
    showPathPoints: boolean;
  };
  
  // 钢笔工具状态
  currentPath?: Point[];
  isDrawing?: boolean;
  lastPoint?: Point;
}

// 铅笔工具
export interface PencilTool extends Tool {
  type: 'pencil';
  options: ToolOptions & {
    smoothing: number;
    simplifyTolerance: number;
    pressure: boolean;
  };
  
  // 铅笔工具状态
  currentPath?: Point[];
  isDrawing?: boolean;
  lastPoint?: Point;
  pressure?: number;
}

// 文字工具
export interface TextTool extends Tool {
  type: 'text';
  options: ToolOptions & {
    fontSize: number;
    fontFamily: string;
    fontWeight: string | number;
    fontStyle: string;
    autoSize: boolean;
    wordWrap: boolean;
    maxWidth?: number;
  };
  
  // 文字工具状态
  isEditing?: boolean;
  editingObjectId?: string;
}

// 手形工具
export interface HandTool extends Tool {
  type: 'hand';
  options: ToolOptions & {
    panSensitivity: number;
  };
  
  // 手形工具状态
  isPanning?: boolean;
  lastPanPoint?: Point;
}

// 缩放工具
export interface ZoomTool extends Tool {
  type: 'zoom';
  options: ToolOptions & {
    zoomIn: boolean;
    zoomFactor: number;
    minZoom: number;
    maxZoom: number;
  };
}

// 吸管工具
export interface EyedropperTool extends Tool {
  type: 'eyedropper';
  options: ToolOptions & {
    sampleSize: number;
    sampleAllLayers?: boolean;
  };
}

// 工具注册信息
export interface ToolRegistration {
  tool: Tool;
  enabled: boolean;
  order: number;
  dependencies?: string[];
  shortcuts?: string[];
}

// 工具管理器
export interface ToolManager {
  // 工具注册
  registerTool(tool: Tool): void;
  unregisterTool(toolId: string): void;
  getTool(toolId: string): Tool | undefined;
  getAllTools(): Tool[];
  getToolsByCategory(category: ToolCategory): Tool[];
  
  // 工具激活
  setActiveTool(toolId: string): boolean;
  getActiveTool(): Tool | undefined;
  deactivateCurrentTool(): void;
  
  // 工具状态
  getToolState(toolId: string): ToolState;
  setToolState(toolId: string, state: ToolState): void;
  
  // 工具选项
  getToolOptions(toolId: string): ToolOptions;
  setToolOptions(toolId: string, options: Partial<ToolOptions>): void;
  
  // 快捷键
  registerShortcut(shortcut: string, toolId: string): void;
  unregisterShortcut(shortcut: string): void;
  getToolByShortcut(shortcut: string): Tool | undefined;
  
  // 事件处理
  handleMouseEvent(event: any, context: any): boolean;
  handleKeyboardEvent(event: any, context: any): boolean;
  handleTouchEvent(event: any, context: any): boolean;
}

// 工具事件
export interface ToolEventMap {
  'tool:registered': { tool: Tool };
  'tool:unregistered': { toolId: string };
  'tool:activated': { tool: Tool };
  'tool:deactivated': { tool: Tool };
  'tool:state-changed': { tool: Tool; oldState: ToolState; newState: ToolState };
  'tool:options-changed': { tool: Tool; oldOptions: ToolOptions; newOptions: ToolOptions };
  'tool:shortcut-registered': { shortcut: string; toolId: string };
  'tool:shortcut-unregistered': { shortcut: string };
}