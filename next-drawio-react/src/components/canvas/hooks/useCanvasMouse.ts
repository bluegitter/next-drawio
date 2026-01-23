import { useCallback } from 'react';
import type React from 'react';
import { useCanvasMouse as useCanvasMouseCore } from '@drawio/core';

export type UseCanvasMouseArgs = Parameters<typeof useCanvasMouseCore>[0];

export const useCanvasMouse = (args: UseCanvasMouseArgs) => {
  const handlers = useCanvasMouseCore(args);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    handlers.handleCanvasMouseDown(evt as MouseEvent);
  }, [handlers]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    handlers.handleCanvasClick(evt as MouseEvent);
  }, [handlers]);

  return { handleCanvasMouseDown, handleCanvasClick };
};
