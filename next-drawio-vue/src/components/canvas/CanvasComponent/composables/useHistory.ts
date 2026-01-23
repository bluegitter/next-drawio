import { useHistory as useHistoryCore } from '@drawio/core';

export type UseHistoryArgs = Parameters<typeof useHistoryCore>[0];

export const useHistory = (args: UseHistoryArgs) => {
  return useHistoryCore(args);
};
