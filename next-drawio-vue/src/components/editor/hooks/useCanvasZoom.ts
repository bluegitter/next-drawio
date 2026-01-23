/**
 * Vue 适配层 - 将核心缩放操作逻辑适配为 Vue hooks
 */
import type { Ref } from 'vue';
import type { CanvasComponentRef } from "../../canvas/canvas-types";
import { createCanvasZoomActions, type CanvasComponentMethods, type ZoomConfig } from '@drawio/core';

type UseCanvasZoomArgs = {
  zoom: Ref<number>;
  setZoom: (value: number) => void;
  minZoom: number;
  maxZoom: number;
  zoomFactor: number;
  zoomOptions: number[];
  canvasMethodsRef: Ref<CanvasComponentRef | null>;
  scrollContainerRef: Ref<HTMLDivElement | null>;
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
  const adaptedMethods = canvasMethodsRef.value as unknown as CanvasComponentMethods | null;

  // 创建核心缩放操作处理器
  const zoomActions = createCanvasZoomActions({
    zoom: zoom.value,
    setZoom,
    config,
    canvasMethods: adaptedMethods,
    scrollContainer: scrollContainerRef.value,
  });

  return zoomActions;
};