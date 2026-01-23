import { useShapes as useShapesCore } from '@drawio/core';

export type UseShapesArgs = Parameters<typeof useShapesCore>[0];

export const useShapes = (args: UseShapesArgs) => {
  return useShapesCore(args);
};
