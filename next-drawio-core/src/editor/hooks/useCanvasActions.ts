/**
 * 画布操作核心逻辑
 * 框架无关的画布操作实现
 */

import type { CanvasComponentMethods, CanvasActionsArgs } from '../types';

/**
 * 创建画布操作处理器
 * 返回所有画布操作的处理函数
 */
export function createCanvasActions(args: CanvasActionsArgs) {
  const {
    canvasMethods,
    refreshHistoryState,
    setSelectionCount,
    setSelectedShape,
    setCanPaste,
  } = args;

  // 辅助函数：执行操作并更新状态
  const executeAction = (action: () => void) => {
    if (canvasMethods) {
      action();
      refreshHistoryState();
      updateSelectionState();
    }
  };

  // 更新选择状态
  const updateSelectionState = () => {
    if (canvasMethods) {
      const count = canvasMethods.getSelectionCount();
      setSelectionCount(count);
      setSelectedShape(canvasMethods.getSelectedShape());
      setCanPaste(canvasMethods.hasClipboard());
    }
  };

  return {
    // 基础操作
    handleDelete: () => executeAction(() => canvasMethods?.deleteSelected()),

    handleDuplicate: () => executeAction(() => canvasMethods?.duplicateSelected()),

    handleSelectAll: () => {
      canvasMethods?.selectAll?.();
      if (canvasMethods) {
        const count = canvasMethods.getSelectionCount();
        setSelectionCount(count);
        setSelectedShape(canvasMethods.getSelectedShape());
      }
    },

    handleClearSelection: () => {
      canvasMethods?.clearSelection?.();
      setSelectionCount(0);
      setSelectedShape(null);
    },

    // 图层操作
    handleBringToFront: () => executeAction(() => canvasMethods?.bringToFront()),

    handleSendToBack: () => executeAction(() => canvasMethods?.sendToBack()),

    handleMoveForward: () => executeAction(() => canvasMethods?.moveForward?.()),

    handleMoveBackward: () => executeAction(() => canvasMethods?.moveBackward?.()),

    // 变换操作
    handleRotateLeft: () => executeAction(() => canvasMethods?.rotateSelectedBy(-90)),

    handleRotateRight: () => executeAction(() => canvasMethods?.rotateSelectedBy(90)),

    handleFlipHorizontal: () => executeAction(() => canvasMethods?.flipSelectedHorizontal()),

    handleFlipVertical: () => executeAction(() => canvasMethods?.flipSelectedVertical()),

    // 历史操作
    handleUndo: () => executeAction(() => canvasMethods?.undo()),

    handleRedo: () => executeAction(() => canvasMethods?.redo()),

    // 剪贴板操作
    handleCopy: () => {
      if (!canvasMethods?.copySelection) return;
      canvasMethods.copySelection();
      const nextCanPaste = canvasMethods.hasClipboard?.() ?? false;
      setCanPaste(nextCanPaste);
      updateSelectionState();
    },

    handlePaste: () => {
      if (!canvasMethods?.pasteClipboard) return;
      canvasMethods.pasteClipboard();
      const nextCanPaste = canvasMethods.hasClipboard?.() ?? false;
      setCanPaste(nextCanPaste);
      refreshHistoryState();
      updateSelectionState();
    },

    handleCut: () => {
      if (!canvasMethods?.copySelection || !canvasMethods?.deleteSelected) return;
      canvasMethods.copySelection();
      canvasMethods.deleteSelected();
      const nextCanPaste = canvasMethods.hasClipboard?.() ?? false;
      setCanPaste(nextCanPaste);
      refreshHistoryState();
      updateSelectionState();
    },

    // 组合操作
    handleUngroup: () => executeAction(() => canvasMethods?.ungroupSelected?.()),

    handleCombineSelected: () => executeAction(() => canvasMethods?.combineSelected?.()),
  };
}