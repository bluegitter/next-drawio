/**
 * React 适配层 - 将核心缩放操作逻辑适配为 React hooks
 */
import { useCallback } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type { CanvasComponentRef } from "@/components/canvas/canvas-types";
import { createCanvasZoomActions, type CanvasComponentMethods, type ZoomConfig } from '@drawio/core';

type UseCanvasZoomArgs = {
  zoom: number;
  setZoom: (value: number) => void;
  minZoom: number;
  maxZoom: number;
  zoomFactor: number;
  zoomOptions: number[];
  canvasMethodsRef: MutableRefObject<CanvasComponentRef | null>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export const useCanvasZoom = ({
  zoom,
  setZoom,
  minZoom,
  maxZoom,
  zoomFactor,
  zoomOptions,
  canvasMethodsRef,
  scrollContainerRef,
}: UseCanvasZoomArgs) => {
  // 配置对象
  const config: ZoomConfig = {
    minZoom,
    maxZoom,
    zoomFactor,
    zoomOptions,
  };

  // 适配CanvasComponentRef到CanvasComponentMethods接口
  const adaptedMethods = canvasMethodsRef.current as unknown as CanvasComponentMethods | null;

  // 创建核心缩放操作处理器
  const zoomActions = createCanvasZoomActions({
    zoom,
    setZoom,
    config,
    canvasMethods: adaptedMethods,
    scrollContainer: scrollContainerRef.current,
  });

  return zoomActions;
};