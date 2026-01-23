import { useSelection as useSelectionCore } from '@drawio/core';

export type UseSelectionArgs = Parameters<typeof useSelectionCore>[0];

export const useSelection = (args: UseSelectionArgs) => {
  return useSelectionCore(args);
};
