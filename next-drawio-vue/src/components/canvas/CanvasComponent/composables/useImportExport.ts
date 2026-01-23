import { useImportExport as useImportExportCore } from '@drawio/core';

export type UseImportExportArgs = Parameters<typeof useImportExportCore>[0];

export const useImportExport = (args: UseImportExportArgs) => {
  return useImportExportCore(args);
};
