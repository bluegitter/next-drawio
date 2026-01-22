import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';

type UseCanvasActionsArgs = {
  canvasMethodsRef: MutableRefObject<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
  setSelectionCount: Dispatch<SetStateAction<number>>;
  setSelectedShape: Dispatch<SetStateAction<SVGElement | null>>;
  setCanPaste: Dispatch<SetStateAction<boolean>>;
  canPaste: boolean;
};

export const useCanvasActions = ({
  canvasMethodsRef,
  refreshHistoryState,
  setSelectionCount,
  setSelectedShape,
  setCanPaste,
  canPaste,
}: UseCanvasActionsArgs) => {
  const handleDelete = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.deleteSelected();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleDuplicate = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.duplicateSelected();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleBringToFront = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.bringToFront();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleSendToBack = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.sendToBack();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleSelectAll = useCallback(() => {
    canvasMethodsRef.current?.selectAll?.();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
    setSelectedShape(canvasMethodsRef.current?.getSelectedShape?.() || null);
  }, [canvasMethodsRef, setSelectedShape, setSelectionCount]);

  const handleClearSelection = useCallback(() => {
    canvasMethodsRef.current?.clearSelection?.();
    setSelectionCount(0);
    setSelectedShape(null);
  }, [canvasMethodsRef, setSelectedShape, setSelectionCount]);

  const handleRotateLeft = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.rotateSelectedBy(-90);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleRotateRight = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.rotateSelectedBy(90);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleFlipHorizontal = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.flipSelectedHorizontal();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleFlipVertical = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.flipSelectedVertical();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleUndo = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.undo();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleRedo = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.redo();
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleCopy = useCallback(() => {
    if (!canvasMethodsRef.current?.copySelection) return;
    canvasMethodsRef.current.copySelection();
    const nextCanPaste = canvasMethodsRef.current.hasClipboard?.() ?? false;
    setCanPaste(nextCanPaste);
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canvasMethodsRef, setCanPaste, setSelectionCount]);

  const handlePaste = useCallback(() => {
    if (!canvasMethodsRef.current?.pasteClipboard) return;
    canvasMethodsRef.current.pasteClipboard();
    const nextCanPaste = canvasMethodsRef.current.hasClipboard?.() ?? canPaste;
    setCanPaste(nextCanPaste);
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canvasMethodsRef, canPaste, refreshHistoryState, setCanPaste, setSelectionCount]);

  const handleCut = useCallback(() => {
    if (!canvasMethodsRef.current?.copySelection || !canvasMethodsRef.current?.deleteSelected) return;
    canvasMethodsRef.current.copySelection();
    canvasMethodsRef.current.deleteSelected();
    const nextCanPaste = canvasMethodsRef.current.hasClipboard?.() ?? false;
    setCanPaste(nextCanPaste);
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canvasMethodsRef, refreshHistoryState, setCanPaste, setSelectionCount]);

  const handleMoveForward = useCallback(() => {
    canvasMethodsRef.current?.moveForward?.();
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canvasMethodsRef, refreshHistoryState, setSelectionCount]);

  const handleMoveBackward = useCallback(() => {
    canvasMethodsRef.current?.moveBackward?.();
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canvasMethodsRef, refreshHistoryState, setSelectionCount]);

  const handleUngroup = useCallback(() => {
    canvasMethodsRef.current?.ungroupSelected?.();
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canvasMethodsRef, refreshHistoryState, setSelectionCount]);

  const handleCombineSelected = useCallback(() => {
    canvasMethodsRef.current?.combineSelected?.();
    refreshHistoryState();
  }, [canvasMethodsRef, refreshHistoryState]);

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
