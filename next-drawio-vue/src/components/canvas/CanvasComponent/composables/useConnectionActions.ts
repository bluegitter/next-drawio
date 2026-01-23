import { useConnectionActions as useConnectionActionsCore } from '@drawio/core';

export type UseConnectionActionsArgs = Parameters<typeof useConnectionActionsCore>[0];

export const useConnectionActions = (args: UseConnectionActionsArgs) => {
  return useConnectionActionsCore(args);
};
