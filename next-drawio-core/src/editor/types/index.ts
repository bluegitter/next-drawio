/**
 * Editor模块类型定义
 * 跨框架共享的编辑器相关类型
 */

import type { SVGShape } from '../../canvas/types';

/**
 * 画布操作方法引用接口
 * 定义了画布组件需要暴露的所有操作方法
 */
export interface CanvasComponentMethods {
  // 基础操作
  deleteSelected: () => void;
  duplicateSelected: () => void;
  selectAll: () => void;
  clearSelection: () => void;

  // 图层操作
  bringToFront: () => void;
  sendToBack: () => void;
  moveForward: () => void;
  moveBackward: () => void;

  // 变换操作
  rotateSelected: (angle: number) => void;
  rotateSelectedBy: (delta: number) => void;
  flipSelectedHorizontal: () => void;
  flipSelectedVertical: () => void;
  scaleSelected: (scale: number) => void;

  // 样式操作
  changeSelectedFill: (color: string) => void;
  changeSelectedStroke: (color: string) => void;
  changeSelectedStrokeWidth: (width: number) => void;
  changeSelectedOpacity: (opacity: number) => void;
  changeSelectedArrow: (mode: 'none' | 'start' | 'end' | 'both') => void;

  // 历史操作
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // 剪贴板操作
  copySelection: () => void;
  pasteClipboard: () => void;
  hasClipboard: () => boolean;

  // 组合操作
  combineSelected: () => void;
  ungroupSelected: () => void;

  // 其他操作
  getSelectionCount: () => number;
  getSelectedShape: (selectedShapeId?: string | null) => SVGShape | null;
  setZoom?: (zoom: number) => void;
}

/**
 * 画布操作参数接口
 */
export interface CanvasActionsArgs {
  canvasMethods: CanvasComponentMethods | null;
  refreshHistoryState: () => void;
  setSelectionCount: (value: number) => void;
  setSelectedShape: (value: SVGShape | null) => void;
  setCanPaste: (value: boolean) => void;
}

/**
 * 样式操作参数接口
 */
export interface StyleActionsArgs {
  canvasMethods: CanvasComponentMethods | null;
  refreshHistoryState: () => void;
}

/**
 * 缩放配置接口
 */
export interface ZoomConfig {
  minZoom: number;
  maxZoom: number;
  zoomFactor: number;
  zoomOptions: number[];
}

/**
 * 缩放操作参数接口
 */
export interface ZoomActionsArgs {
  zoom: number;
  setZoom: (value: number) => void;
  config: ZoomConfig;
  canvasMethods: CanvasComponentMethods | null;
  scrollContainer: HTMLDivElement | null;
}