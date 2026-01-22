import type { Ref } from 'vue';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';

type UseCanvasActionsArgs = {
  canvasMethodsRef: Ref<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
  setSelectionCount: (value: number) => void;
  setSelectedShape: (value: SVGElement | null) => void;
  setCanPaste: (value: boolean) => void;
  canPaste: Ref<boolean>;
};

export const useCanvasActions = ({
  canvasMethodsRef,
  refreshHistoryState,
  setSelectionCount,
  setSelectedShape,
  setCanPaste,
  canPaste,
}: UseCanvasActionsArgs) => {
  const handleDelete = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.deleteSelected();
      refreshHistoryState();
    }
  };

  const handleDuplicate = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.duplicateSelected();
      refreshHistoryState();
    }
  };

  const handleBringToFront = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.bringToFront();
      refreshHistoryState();
    }
  };

  const handleSendToBack = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.sendToBack();
      refreshHistoryState();
    }
  };

  const handleSelectAll = () => {
    canvasMethodsRef.value?.selectAll?.();
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
    setSelectedShape(canvasMethodsRef.value?.getSelectedShape?.() || null);
  };

  const handleClearSelection = () => {
    canvasMethodsRef.value?.clearSelection?.();
    setSelectionCount(0);
    setSelectedShape(null);
  };

  const handleRotateLeft = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.rotateSelectedBy(-90);
      refreshHistoryState();
    }
  };

  const handleRotateRight = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.rotateSelectedBy(90);
      refreshHistoryState();
    }
  };

  const handleFlipHorizontal = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.flipSelectedHorizontal();
      refreshHistoryState();
    }
  };

  const handleFlipVertical = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.flipSelectedVertical();
      refreshHistoryState();
    }
  };

  const handleUndo = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.undo();
      refreshHistoryState();
    }
  };

  const handleRedo = () => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.redo();
      refreshHistoryState();
    }
  };

  const handleCopy = () => {
    if (!canvasMethodsRef.value?.copySelection) return;
    canvasMethodsRef.value.copySelection();
    const nextCanPaste = canvasMethodsRef.value.hasClipboard?.() ?? false;
    setCanPaste(nextCanPaste);
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
  };

  const handlePaste = () => {
    if (!canvasMethodsRef.value?.pasteClipboard) return;
    canvasMethodsRef.value.pasteClipboard();
    const nextCanPaste = canvasMethodsRef.value.hasClipboard?.() ?? canPaste.value;
    setCanPaste(nextCanPaste);
    refreshHistoryState();
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
  };

  const handleCut = () => {
    if (!canvasMethodsRef.value?.copySelection || !canvasMethodsRef.value?.deleteSelected) return;
    canvasMethodsRef.value.copySelection();
    canvasMethodsRef.value.deleteSelected();
    const nextCanPaste = canvasMethodsRef.value.hasClipboard?.() ?? false;
    setCanPaste(nextCanPaste);
    refreshHistoryState();
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
  };

  const handleMoveForward = () => {
    canvasMethodsRef.value?.moveForward?.();
    refreshHistoryState();
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
  };

  const handleMoveBackward = () => {
    canvasMethodsRef.value?.moveBackward?.();
    refreshHistoryState();
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
  };

  const handleUngroup = () => {
    canvasMethodsRef.value?.ungroupSelected?.();
    refreshHistoryState();
    if (canvasMethodsRef.value?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.value.getSelectionCount());
    }
  };

  const handleCombineSelected = () => {
    canvasMethodsRef.value?.combineSelected?.();
    refreshHistoryState();
  };

  return {
    handleDelete,
    handleDuplicate,
    handleBringToFront,
    handleSendToBack,
    handleSelectAll,
    handleClearSelection,
    handleRotateLeft,
    handleRotateRight,
    handleFlipHorizontal,
    handleFlipVertical,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleCut,
    handleMoveForward,
    handleMoveBackward,
    handleUngroup,
    handleCombineSelected,
  };
};
