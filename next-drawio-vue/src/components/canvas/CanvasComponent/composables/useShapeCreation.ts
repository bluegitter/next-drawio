import { useShapeCreation as useShapeCreationCore } from '@drawio/core';

export type UseShapeCreationArgs = Parameters<typeof useShapeCreationCore>[0];

export const useShapeCreation = (args: UseShapeCreationArgs) => {
  return useShapeCreationCore(args);
};
