import { useEffect } from 'react';
import type React from 'react';
import type { SVGShape } from '../canvas-types';
import { useShapeEventBindings as useShapeEventBindingsCore } from '@drawio/core';

export type UseShapeEventBindingsArgs = Omit<Parameters<typeof useShapeEventBindingsCore>[0], 'handleShapeMouseDown'> & {
  handleShapeMouseDown: (e: React.MouseEvent, shape: SVGShape) => void;
};

export const useShapeEventBindings = (args: UseShapeEventBindingsArgs) => {
  const bind = useShapeEventBindingsCore({
    ...args,
    handleShapeMouseDown: (e, shape) => args.handleShapeMouseDown(e as unknown as React.MouseEvent, shape),
  });

  useEffect(() => {
    return bind();
  }, [bind]);
};
