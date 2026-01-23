/**
 * 样式操作核心逻辑
 * 框架无关的样式操作实现
 */

import type { CanvasComponentMethods, StyleActionsArgs } from '../types';

/**
 * 创建样式操作处理器
 * 返回所有样式操作的处理函数
 */
export function createSelectionStyleActions(args: StyleActionsArgs) {
  const {
    canvasMethods,
    refreshHistoryState,
  } = args;

  // 辅助函数：执行样式操作并刷新历史
  const executeStyleAction = (action: () => void) => {
    if (canvasMethods) {
      action();
      refreshHistoryState();
    }
  };

  return {
    // 颜色和样式
    handleFillChange: (color: string) =>
      executeStyleAction(() => canvasMethods?.changeSelectedFill(color)),

    handleStrokeChange: (color: string) =>
      executeStyleAction(() => canvasMethods?.changeSelectedStroke(color)),

    handleStrokeWidthChange: (width: number) =>
      executeStyleAction(() => canvasMethods?.changeSelectedStrokeWidth(width)),

    // 变换
    handleRotationChange: (rotation: number) =>
      executeStyleAction(() => canvasMethods?.rotateSelected(rotation)),

    handleScaleChange: (scale: number) =>
      executeStyleAction(() => canvasMethods?.scaleSelected(scale)),

    handleOpacityChange: (opacity: number) =>
      executeStyleAction(() => canvasMethods?.changeSelectedOpacity(opacity)),

    // 箭头模式
    handleArrowChange: (mode: 'none' | 'start' | 'end' | 'both') => {
      canvasMethods?.changeSelectedArrow?.(mode);
    },
  };
}