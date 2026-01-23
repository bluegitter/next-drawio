import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import type { CanvasComponentRef } from "@/components/canvas/canvas-types";

type UseCanvasZoomArgs = {
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  minZoom: number;
  maxZoom: number;
  zoomFactor: number;
  canvasMethodsRef: MutableRefObject<CanvasComponentRef | null>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export const useCanvasZoom = ({
  zoom,
  setZoom,
  minZoom,
  maxZoom,
  zoomFactor,
  canvasMethodsRef,
  scrollContainerRef,
}: UseCanvasZoomArgs) => {
  const applyZoom = useCallback((value: number) => {
    const clamped = Math.min(maxZoom, Math.max(minZoom, value));
    const scroller = scrollContainerRef.current;
    let centerX = 0;
    let centerY = 0;
    let paddingLeft = 0;
    let paddingTop = 0;
    const prevZoom = zoom;
    if (scroller) {
      const styles = window.getComputedStyle(scroller);
      paddingLeft = parseFloat(styles.paddingLeft) || 0;
      paddingTop = parseFloat(styles.paddingTop) || 0;
      const viewportCenterX = scroller.scrollLeft + scroller.clientWidth / 2 - paddingLeft;
      const viewportCenterY = scroller.scrollTop + scroller.clientHeight / 2 - paddingTop;
      centerX = viewportCenterX / Math.max(prevZoom, 0.0001);
      centerY = viewportCenterY / Math.max(prevZoom, 0.0001);
    }
    canvasMethodsRef.current?.setZoom?.(clamped);
    setZoom(clamped);
    if (scroller) {
      requestAnimationFrame(() => {
        const nextLeft = centerX * clamped + paddingLeft - scroller.clientWidth / 2;
        const nextTop = centerY * clamped + paddingTop - scroller.clientHeight / 2;
        scroller.scrollTo({
          left: Math.max(0, nextLeft),
          top: Math.max(0, nextTop),
          behavior: 'instant' as ScrollBehavior,
        });
      });
    }
    return clamped;
  }, [canvasMethodsRef, maxZoom, minZoom, scrollContainerRef, setZoom, zoom]);

  const handleZoomIn = useCallback(() => {
    applyZoom(zoom * zoomFactor);
  }, [applyZoom, zoom, zoomFactor]);

  const handleZoomOut = useCallback(() => {
    applyZoom(zoom / zoomFactor);
  }, [applyZoom, zoom, zoomFactor]);

  const handleResetZoom = useCallback(() => {
    applyZoom(1);
  }, [applyZoom]);

  const handleSelectZoomPercent = useCallback((percent: number) => {
    applyZoom(percent / 100);
  }, [applyZoom]);

  const handleApplyCustomZoom = useCallback((percent: number) => {
    applyZoom(percent / 100);
  }, [applyZoom]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleSelectZoomPercent,
    handleApplyCustomZoom,
  };
};
