/**
 * Vue 适配层 - 将核心画布操作逻辑适配为 Vue hooks
 */
import type { Ref } from 'vue';
import type { CanvasComponentRef } from "../../canvas/canvas-types";
import { createCanvasActions, type CanvasComponentMethods } from '@drawio/core';

type UseCanvasActionsArgs = {
  canvasMethodsRef: Ref<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
  setSelectionCount: (value: number) => void;
  setSelectedShape: (value: any) => void;
  setCanPaste: (value: boolean) => void;
};

export const useCanvasActions = ({
  canvasMethodsRef,
  refreshHistoryState,
  setSelectionCount,
  setSelectedShape,
  setCanPaste,
}: UseCanvasActionsArgs) => {
  // 返回动态获取canvasMethods的操作函数
  return {
    handleDelete: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleDelete();
    },
    handleDuplicate: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleDuplicate();
    },
    handleSelectAll: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleSelectAll();
    },
    handleClearSelection: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleClearSelection();
    },
    handleBringToFront: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleBringToFront();
    },
    handleSendToBack: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleSendToBack();
    },
    handleMoveForward: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleMoveForward();
    },
    handleMoveBackward: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleMoveBackward();
    },
    handleRotateLeft: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleRotateLeft();
    },
    handleRotateRight: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleRotateRight();
    },
    handleFlipHorizontal: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleFlipHorizontal();
    },
    handleFlipVertical: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleFlipVertical();
    },
    handleUndo: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleUndo();
    },
    handleRedo: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleRedo();
    },
    handleCopy: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleCopy();
    },
    handlePaste: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handlePaste();
    },
    handleCut: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleCut();
    },
    handleUngroup: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleUngroup();
    },
    handleCombineSelected: () => {
      const methods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;
      if (!methods) return;

      const actions = createCanvasActions({
        canvasMethods: methods,
        refreshHistoryState,
        setSelectionCount,
        setSelectedShape,
        setCanPaste,
      });
      return actions.handleCombineSelected();
    },
  };
};