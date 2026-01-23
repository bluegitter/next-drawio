import { usePointerMove as usePointerMoveCore } from '@drawio/core';

export type UsePointerMoveArgs = Parameters<typeof usePointerMoveCore>[0];

export const usePointerMove = (args: UsePointerMoveArgs) => {
  return usePointerMoveCore(args);
};
