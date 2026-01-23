import { useEffect } from 'react';
import { useAutoResize as useAutoResizeCore } from '@drawio/core';

export type UseAutoResizeArgs = Parameters<typeof useAutoResizeCore>[0];

export const useAutoResize = (args: UseAutoResizeArgs) => {
  const checkAutoResize = useAutoResizeCore(args);

  useEffect(() => {
    checkAutoResize();
  }, [checkAutoResize]);
};
