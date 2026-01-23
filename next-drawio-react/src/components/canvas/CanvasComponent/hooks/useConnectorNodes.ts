import { useConnectorNodes as useConnectorNodesCore } from '@drawio/core';

export type UseConnectorNodesArgs = Parameters<typeof useConnectorNodesCore>[0];

export const useConnectorNodes = (args: UseConnectorNodesArgs) => {
  return useConnectorNodesCore(args);
};
