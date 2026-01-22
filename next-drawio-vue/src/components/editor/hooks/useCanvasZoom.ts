import type { Ref } from 'vue';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';

type UseCanvasZoomArgs = {
  zoom: Ref<number>;
  setZoom: (value: number) => void;
  minZoom: number;
  maxZoom: number;
  zoomFactor: number;
  canvasMethodsRef: Ref<CanvasComponentRef | null>;
  scrollContainerRef: Ref<HTMLDivElement | null>;
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
  const applyZoom = (value: number) => {
    const clamped = Math.min(maxZoom, Math.max(minZoom, value));
    const scroller = scrollContainerRef.value;
    let centerX = 0;
    let centerY = 0;
    let paddingLeft = 0;
    let paddingTop = 0;
    const prevZoom = zoom.value;
    if (scroller) {
      const styles = window.getComputedStyle(scroller);
      paddingLeft = parseFloat(styles.paddingLeft) || 0;
      paddingTop = parseFloat(styles.paddingTop) || 0;
      const viewportCenterX = scroller.scrollLeft + scroller.clientWidth / 2 - paddingLeft;
      const viewportCenterY = scroller.scrollTop + scroller.clientHeight / 2 - paddingTop;
      centerX = viewportCenterX / Math.max(prevZoom, 0.0001);
      centerY = viewportCenterY / Math.max(prevZoom, 0.0001);
    }
    canvasMethodsRef.value?.setZoom?.(clamped);
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
  };

  const handleZoomIn = () => {
    applyZoom(zoom.value * zoomFactor);
  };

  const handleZoomOut = () => {
    applyZoom(zoom.value / zoomFactor);
  };

  const handleResetZoom = () => {
    applyZoom(1);
  };

  const handleSelectZoomPercent = (percent: number) => {
    applyZoom(percent / 100);
  };

  const handleApplyCustomZoom = (percent: number) => {
    applyZoom(percent / 100);
  };

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleSelectZoomPercent,
    handleApplyCustomZoom,
  };
};
