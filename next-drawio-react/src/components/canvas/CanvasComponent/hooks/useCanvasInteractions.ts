import { useCallback, useEffect } from 'react';
import type React from 'react';
import { useCanvasInteractions as useCanvasInteractionsCore } from '@drawio/core';

export type UseCanvasInteractionsArgs = Parameters<typeof useCanvasInteractionsCore>[0];

export const useCanvasInteractions = (args: UseCanvasInteractionsArgs) => {
  const interactions = useCanvasInteractionsCore(args);

  useEffect(() => {
    return interactions.bindShapeEvents();
  }, [interactions]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    interactions.handleMouseMove(evt as MouseEvent | PointerEvent);
  }, [interactions]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    interactions.handleMouseUp(evt as MouseEvent | PointerEvent);
  }, [interactions]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    interactions.handleCanvasMouseDown(evt as MouseEvent);
  }, [interactions]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    interactions.handleCanvasClick(evt as MouseEvent);
  }, [interactions]);

  return {
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleCanvasClick,
  };
};
