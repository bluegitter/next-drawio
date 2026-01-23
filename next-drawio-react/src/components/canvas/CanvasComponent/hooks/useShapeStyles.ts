import { useShapeStyles as useShapeStylesCore } from '@drawio/core';

export type UseShapeStylesArgs = Parameters<typeof useShapeStylesCore>[0];

export const useShapeStyles = (args: UseShapeStylesArgs) => {
  return useShapeStylesCore(args);
};
