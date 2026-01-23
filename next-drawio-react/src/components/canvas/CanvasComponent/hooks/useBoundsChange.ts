import { useEffect } from 'react';
import { useBoundsChange as useBoundsChangeCore } from '@drawio/core';

export type UseBoundsChangeArgs = Parameters<typeof useBoundsChangeCore>[0];

export const useBoundsChange = (args: UseBoundsChangeArgs) => {
  const checkBounds = useBoundsChangeCore(args);

  useEffect(() => {
    checkBounds();
  }, [checkBounds]);
};
