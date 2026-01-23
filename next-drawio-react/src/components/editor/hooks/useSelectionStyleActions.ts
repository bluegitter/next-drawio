import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { CanvasComponentRef } from "@/components/canvas/canvas-types";

type UseSelectionStyleActionsArgs = {
  canvasMethodsRef: MutableRefObject<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
};

export const useSelectionStyleActions = ({ canvasMethodsRef, refreshHistoryState }: UseSelectionStyleActionsArgs) => {
  const handleFillChange = useCallback((color: string) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedFill(color);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleStrokeChange = useCallback((color: string) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedStroke(color);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedStrokeWidth(width);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleRotationChange = useCallback((rotation: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.rotateSelected(rotation);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleScaleChange = useCallback((scale: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.scaleSelected(scale);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleOpacityChange = useCallback((opacity: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedOpacity(opacity);
      refreshHistoryState();
    }
  }, [canvasMethodsRef, refreshHistoryState]);

  const handleArrowChange = useCallback((mode: 'none' | 'start' | 'end' | 'both') => {
    canvasMethodsRef.current?.changeSelectedArrow?.(mode);
  }, [canvasMethodsRef]);

  return {
    handleFillChange,
    handleStrokeChange,
    handleStrokeWidthChange,
    handleRotationChange,
    handleScaleChange,
    handleOpacityChange,
    handleArrowChange,
  };
};
