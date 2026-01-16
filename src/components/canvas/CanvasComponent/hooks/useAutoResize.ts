import { useEffect } from 'react';
import type { SVGShape } from '../types';

interface UseAutoResizeArgs {
  autoResize: boolean;
  width: number;
  height: number;
  shapes: SVGShape[];
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
}

export const useAutoResize = ({
  autoResize,
  width,
  height,
  shapes,
  getShapeBounds,
}: UseAutoResizeArgs) => {
  useEffect(() => {
    if (!autoResize) return;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    let hasContent = false;

    shapes.forEach(shape => {
      hasContent = true;
      const bounds = getShapeBounds(shape);
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    });

    if (hasContent && (minX < 0 || minY < 0 || maxX > width || maxY > height)) {
      const padding = 50;
      const newWidth = Math.max(width, maxX + padding);
      const newHeight = Math.max(height, maxY + padding);
      console.log('Canvas needs resizing to:', { newWidth, newHeight });
    }
  }, [autoResize, getShapeBounds, height, shapes, width]);
};
