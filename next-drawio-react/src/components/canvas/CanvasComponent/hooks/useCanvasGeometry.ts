import { useCanvasGeometry as useCanvasGeometryCore } from '@drawio/core';

export type UseCanvasGeometryArgs = Parameters<typeof useCanvasGeometryCore>[0];

export const useCanvasGeometry = (args: UseCanvasGeometryArgs) => {
  return useCanvasGeometryCore(args);
};
