/**
 * React 适配层 - 将核心画布操作逻辑适配为 React hooks
 */
import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { CanvasComponentRef } from "@/components/canvas/canvas-types";
import { createCanvasActions, type CanvasComponentMethods } from '@drawio/core';

type UseCanvasActionsArgs = {
  canvasMethodsRef: MutableRefObject<CanvasComponentRef | null>;
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
  // 适配CanvasComponentRef到CanvasComponentMethods接口
  const adaptedMethods = canvasMethodsRef.current as unknown as CanvasComponentMethods | null;

  // 创建核心操作处理器
  const actions = createCanvasActions({
    canvasMethods: adaptedMethods,
    refreshHistoryState,
    setSelectionCount,
    setSelectedShape,
    setCanPaste,
  });

  return actions;
};