import { useMemo } from 'react';
import { useCanvasDerived as useCanvasDerivedCore } from '@drawio/core';

export type UseCanvasDerivedArgs = Parameters<typeof useCanvasDerivedCore>[0];

export const useCanvasDerived = (args: UseCanvasDerivedArgs) => {
  return useMemo(() => useCanvasDerivedCore(args), [
    args.shapes,
    args.selectedIds,
    args.getShapeBounds,
    args.parsePoints,
  ]);
};
