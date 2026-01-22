import { useCallback } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';

type UseCanvasBoundsArgs = {
  pageWidth: number;
  pageHeight: number;
  pageCountX: number;
  pageCountY: number;
  pageNegX: number;
  pageNegY: number;
  setPageCountX: Dispatch<SetStateAction<number>>;
  setPageCountY: Dispatch<SetStateAction<number>>;
  setPageNegX: Dispatch<SetStateAction<number>>;
  setPageNegY: Dispatch<SetStateAction<number>>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
};

export const useCanvasBounds = ({
  pageWidth,
  pageHeight,
  pageCountX,
  pageCountY,
  pageNegX,
  pageNegY,
  setPageCountX,
  setPageCountY,
  setPageNegX,
  setPageNegY,
  scrollContainerRef,
  zoom,
}: UseCanvasBoundsArgs) => {
  return useCallback((bounds: { minX: number; minY: number; maxX: number; maxY: number }) => {
    const STEP = 0.5; // expand/shrink by half a page
    const SHRINK_PADDING_X = pageWidth * 0.1;
    const SHRINK_PADDING_Y = pageHeight * 0.1;
    const ceilToStep = (value: number) => Math.ceil(value / STEP) * STEP;

    const paddedMinX = bounds.minX - SHRINK_PADDING_X;
    const paddedMaxX = bounds.maxX + SHRINK_PADDING_X;
    const paddedMinY = bounds.minY - SHRINK_PADDING_Y;
    const paddedMaxY = bounds.maxY + SHRINK_PADDING_Y;

    const requiredNegX = Math.max(0, ceilToStep(Math.max(0, -paddedMinX) / pageWidth));
    const requiredNegY = Math.max(0, ceilToStep(Math.max(0, -paddedMinY) / pageHeight));
    const requiredPosX = Math.max(1, ceilToStep(Math.max(0, paddedMaxX) / pageWidth));
    const requiredPosY = Math.max(1, ceilToStep(Math.max(0, paddedMaxY) / pageHeight));

    const nextNegX = requiredNegX;
    const nextNegY = requiredNegY;
    const nextPosX = requiredPosX;
    const nextPosY = requiredPosY;

    const deltaNegX = nextNegX - pageNegX;
    const deltaNegY = nextNegY - pageNegY;

    if (nextNegX === pageNegX && nextNegY === pageNegY && nextPosX === pageCountX && nextPosY === pageCountY) {
      return;
    }

    setPageNegX(prev => (prev === nextNegX ? prev : nextNegX));
    setPageNegY(prev => (prev === nextNegY ? prev : nextNegY));
    setPageCountX(prev => (prev === nextPosX ? prev : nextPosX));
    setPageCountY(prev => (prev === nextPosY ? prev : nextPosY));

    if ((deltaNegX !== 0 || deltaNegY !== 0) && scrollContainerRef.current) {
      const scroller = scrollContainerRef.current;
      const newLeft = scroller.scrollLeft + deltaNegX * pageWidth * zoom;
      const newTop = scroller.scrollTop + deltaNegY * pageHeight * zoom;
      requestAnimationFrame(() => {
        scroller.scrollTo({
          left: Math.max(0, newLeft),
          top: Math.max(0, newTop),
          behavior: 'instant' as ScrollBehavior,
        });
      });
    }
  }, [pageCountX, pageCountY, pageHeight, pageNegX, pageNegY, pageWidth, scrollContainerRef, setPageCountX, setPageCountY, setPageNegX, setPageNegY, zoom]);
};
