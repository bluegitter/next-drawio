/**
 * 状态管理器类型定义
 * 重新导出现有类型，避免重复定义
 */

// 重新导出 canvas 中的 SVGShape，避免类型冲突
import type { SVGShape } from '../canvas/types';

// 历史状态（使用新的命名避免冲突）
export interface CanvasHistoryState {
  shapes: SVGShape[];
  selectedIds: string[];
  zoom: number;
}

export interface CanvasStateConfig {
  initialShapes?: SVGShape[];
  initialZoom?: number;
  maxHistory?: number;
}

export interface StateChangeEvent {
  type: 'shapes' | 'selection' | 'zoom' | 'history';
  oldValue?: any;
  newValue?: any;
}

// 重新导出 SVGShape
export type { SVGShape } from '../canvas/types';