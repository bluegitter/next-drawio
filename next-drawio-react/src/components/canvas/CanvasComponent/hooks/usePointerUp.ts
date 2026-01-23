import { useCallback, useEffect } from 'react';
import type React from 'react';
import { usePointerUp as usePointerUpCore } from '@drawio/core';

export type UsePointerUpArgs = Parameters<typeof usePointerUpCore>[0];

export const usePointerUp = (args: UsePointerUpArgs) => {
  const { handleMouseUp, onWindowMouseUp } = usePointerUpCore(args);

  useEffect(() => {
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, [onWindowMouseUp]);

  const handleMouseUpReact = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => {
      const evt = (e as any).nativeEvent ?? e;
      handleMouseUp(evt as MouseEvent | PointerEvent);
    },
    [handleMouseUp]
  );

  return {
    handleMouseUp: handleMouseUpReact,
  };
};
