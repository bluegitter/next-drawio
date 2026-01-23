import { useSelectionActions as useSelectionActionsCore } from '@drawio/core';

export type UseSelectionActionsArgs = Parameters<typeof useSelectionActionsCore>[0];

export const useSelectionActions = (args: UseSelectionActionsArgs) => {
  return useSelectionActionsCore(args);
};
