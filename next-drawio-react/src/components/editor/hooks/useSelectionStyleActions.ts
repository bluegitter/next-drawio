/**
 * React 适配层 - 将核心样式操作逻辑适配为 React hooks
 */
import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { CanvasComponentRef } from "@/components/canvas/canvas-types";
import { createSelectionStyleActions, type CanvasComponentMethods } from '@drawio/core';

type UseSelectionStyleActionsArgs = {
  canvasMethodsRef: MutableRefObject<CanvasComponentRef | null>;
  refreshHistoryState: () => void;
};

export const useSelectionStyleActions = ({ canvasMethodsRef, refreshHistoryState }: UseSelectionStyleActionsArgs) => {
  // 适配CanvasComponentRef到CanvasComponentMethods接口
  const adaptedMethods = canvasMethodsRef.current as unknown as CanvasComponentMethods | null;

  // 创建核心样式操作处理器
  return createSelectionStyleActions({
    canvasMethods: adaptedMethods,
    refreshHistoryState,
  });
};