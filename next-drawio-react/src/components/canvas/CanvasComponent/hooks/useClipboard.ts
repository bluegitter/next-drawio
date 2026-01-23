import { useClipboard as useClipboardCore } from '@drawio/core';

export type UseClipboardArgs = Parameters<typeof useClipboardCore>[0];

export const useClipboard = (args: UseClipboardArgs) => {
  return useClipboardCore(args);
};
