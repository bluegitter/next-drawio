import { useLayering as useLayeringCore } from '@drawio/core';

export type UseLayeringArgs = Parameters<typeof useLayeringCore>[0];

export const useLayering = (args: UseLayeringArgs) => {
  return useLayeringCore(args);
};
