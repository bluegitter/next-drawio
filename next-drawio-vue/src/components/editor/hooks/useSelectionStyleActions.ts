import type { Ref } from 'vue';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';

type UseSelectionStyleActionsArgs = {
  canvasMethodsRef: Ref<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
};

export const useSelectionStyleActions = ({ canvasMethodsRef, refreshHistoryState }: UseSelectionStyleActionsArgs) => {
  const handleFillChange = (color: string) => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.changeSelectedFill(color);
      refreshHistoryState();
    }
  };

  const handleStrokeChange = (color: string) => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.changeSelectedStroke(color);
      refreshHistoryState();
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.changeSelectedStrokeWidth(width);
      refreshHistoryState();
    }
  };

  const handleRotationChange = (rotation: number) => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.rotateSelected(rotation);
      refreshHistoryState();
    }
  };

  const handleScaleChange = (scale: number) => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.scaleSelected(scale);
      refreshHistoryState();
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (canvasMethodsRef.value) {
      canvasMethodsRef.value.changeSelectedOpacity(opacity);
      refreshHistoryState();
    }
  };

  const handleArrowChange = (mode: 'none' | 'start' | 'end' | 'both') => {
    canvasMethodsRef.value?.changeSelectedArrow?.(mode);
  };

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
