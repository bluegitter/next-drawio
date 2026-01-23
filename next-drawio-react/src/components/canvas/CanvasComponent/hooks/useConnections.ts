import { useConnections as useConnectionsCore } from '@drawio/core';

export type UseConnectionsArgs = Parameters<typeof useConnectionsCore>[0];

export const useConnections = (args: UseConnectionsArgs) => {
  return useConnectionsCore(args);
};
