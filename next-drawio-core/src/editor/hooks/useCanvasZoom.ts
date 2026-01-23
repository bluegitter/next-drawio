/**
 * 缩放操作核心逻辑
 * 框架无关的缩放操作实现
 */

import type { ZoomConfig, ZoomActionsArgs } from '../types';

/**
 * 创建缩放操作处理器
 * 返回所有缩放操作的处理函数
 */
export function createCanvasZoomActions(args: ZoomActionsArgs) {
  const {
    zoom,
    setZoom,
    config,
    canvasMethods,
    scrollContainer,
  } = args;

  const { minZoom, maxZoom, zoomFactor, zoomOptions } = config;

  // 限制缩放范围
  const clampZoom = (value: number) => Math.min(maxZoom, Math.max(minZoom, value));

  // 应用缩放（保持中心点）
  const applyZoom = (value: number) => {
    const clamped = clampZoom(value);

    if (scrollContainer) {
      // 计算滚动容器的当前视图中心
      const styles = window.getComputedStyle(scrollContainer);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingTop = parseFloat(styles.paddingTop) || 0;

      const viewportCenterX = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2 - paddingLeft;
      const viewportCenterY = scrollContainer.scrollTop + scrollContainer.clientHeight / 2 - paddingTop;

      // 计算中心点在画布坐标系中的位置
      const centerX = viewportCenterX / Math.max(zoom, 0.0001);
      const centerY = viewportCenterY / Math.max(zoom, 0.0001);

      // 调用画布方法设置缩放
      canvasMethods?.setZoom?.(clamped);
      setZoom(clamped);

      // 调整滚动位置以保持中心点
      requestAnimationFrame(() => {
        if (scrollContainer) {
          const nextLeft = centerX * clamped + paddingLeft - scrollContainer.clientWidth / 2;
          const nextTop = centerY * clamped + paddingTop - scrollContainer.clientHeight / 2;
          scrollContainer.scrollTo({
            left: Math.max(0, nextLeft),
            top: Math.max(0, nextTop),
            behavior: 'instant' as ScrollBehavior,
          });
        }
      });
    } else {
      // 没有滚动容器时直接设置缩放
      canvasMethods?.setZoom?.(clamped);
      setZoom(clamped);
    }

    return clamped;
  };

  return {
    // 缩放操作
    handleZoomIn: () => applyZoom(zoom * zoomFactor),

    handleZoomOut: () => applyZoom(zoom / zoomFactor),

    handleResetZoom: () => applyZoom(1),

    handleSelectZoomPercent: (percent: number) => applyZoom(percent / 100),

    handleApplyCustomZoom: (percent: number) => applyZoom(percent / 100),

    // 工具方法
    clampZoom,
    getCurrentZoomPercent: () => Math.round(zoom * 100),
    isValidZoom: (value: number) => value >= minZoom && value <= maxZoom,

    // 配置
    zoomOptions,
  };
}