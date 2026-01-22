import { watchEffect } from 'vue';
import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseAutoResizeArgs = {
  autoResize: boolean;
  width: number;
  height: number;
  shapes: Ref<SVGShape[]>;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
};

export const useAutoResize = ({ autoResize, width, height, shapes, getShapeBounds }: UseAutoResizeArgs) => {
  watchEffect(() => {
    if (!autoResize) return;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let hasContent = false;

    shapes.value.forEach((shape) => {
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
    }
  });
};
