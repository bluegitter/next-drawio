import { useShapeMouseDown as useShapeMouseDownCore } from '@drawio/core';

export type UseShapeMouseDownArgs = Parameters<typeof useShapeMouseDownCore>[0];

export const useShapeMouseDown = (args: UseShapeMouseDownArgs) => {
  return useShapeMouseDownCore(args);
};
