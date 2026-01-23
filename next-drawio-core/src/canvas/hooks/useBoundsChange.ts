import type { SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue, setRefValue } from '../../utils/refs';

export type UseBoundsChangeArgs = {
  shapes: MaybeRef<SVGShape[]>;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  lastBoundsRef: RefLike<{ minX: number; minY: number; maxX: number; maxY: number } | null>;
  onBoundsChange?: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
};

export const useBoundsChange = ({ shapes, getShapeBounds, lastBoundsRef, onBoundsChange }: UseBoundsChangeArgs) => {
  return () => {
    if (!onBoundsChange) return;
    const shapeList = getRefValue(shapes) ?? [];
    if (shapeList.length === 0) return;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    shapeList.forEach((shape) => {
      const b = getShapeBounds(shape);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    });
    const bounds = { minX, minY, maxX, maxY };
    const last = getRefValue(lastBoundsRef);
    if (!last || last.maxX !== bounds.maxX || last.maxY !== bounds.maxY || last.minX !== bounds.minX || last.minY !== bounds.minY) {
      setRefValue(lastBoundsRef, bounds);
      onBoundsChange(bounds);
    }
  };
};
