/**
 * Vue 适配层 - 将核心样式操作逻辑适配为 Vue hooks
 */
import type { Ref } from 'vue';
import type { CanvasComponentRef } from "../../canvas/canvas-types";
import { createSelectionStyleActions, type CanvasComponentMethods } from '@drawio/core';

type UseSelectionStyleActionsArgs = {
  canvasMethodsRef: Ref<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
};

export const useSelectionStyleActions = ({ canvasMethodsRef, refreshHistoryState }: UseSelectionStyleActionsArgs) => {
  // 返回动态获取canvasMethods的操作函数
  return {
    handleFillChange: (color: string) => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleFillChange(color);
    },
    handleStrokeChange: (color: string) => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleStrokeChange(color);
    },
    handleStrokeWidthChange: (width: number) => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleStrokeWidthChange(width);
    },
    handleRotationChange: (rotation: number) => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleRotationChange(rotation);
    },
    handleScaleChange: (scale: number) => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleScaleChange(scale);
    },
    handleOpacityChange: (opacity: number) => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleOpacityChange(opacity);
    },
    handleArrowChange: (mode: 'none' | 'start' | 'end' | 'both') => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createSelectionStyleActions({
        canvasMethods: methods,
        refreshHistoryState,
      });
      return actions.handleArrowChange(mode);
    },
  };
};