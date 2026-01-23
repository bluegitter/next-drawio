import { useCanvasMouse as useCanvasMouseCore } from '@drawio/core';

export type UseCanvasMouseArgs = Parameters<typeof useCanvasMouseCore>[0];

export const useCanvasMouse = (args: UseCanvasMouseArgs) => {
  return useCanvasMouseCore(args);
};
