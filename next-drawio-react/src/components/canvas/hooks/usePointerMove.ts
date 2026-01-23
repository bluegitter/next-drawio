import { useCallback } from 'react';
import type React from 'react';
import { usePointerMove as usePointerMoveCore } from '@drawio/core';

export type UsePointerMoveArgs = Parameters<typeof usePointerMoveCore>[0];

export const usePointerMove = (args: UsePointerMoveArgs) => {
  const handler = usePointerMoveCore(args);

  return useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => {
    const evt = (e as any).nativeEvent ?? e;
    handler(evt as MouseEvent | PointerEvent);
  }, [handler]);
};
