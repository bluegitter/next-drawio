import { useEffect } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseBoundsChangeArgs {
  shapes: SVGShape[];
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  lastBoundsRef: React.MutableRefObject<{ minX: number; minY: number; maxX: number; maxY: number } | null>;
  onBoundsChange?: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
}

export const useBoundsChange = ({
  shapes,
  getShapeBounds,
  lastBoundsRef,
  onBoundsChange,
}: UseBoundsChangeArgs) => {
  useEffect(() => {
    if (!onBoundsChange || shapes.length === 0) return;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    shapes.forEach(shape => {
      const b = getShapeBounds(shape);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    });
    const bounds = { minX, minY, maxX, maxY };
    const last = lastBoundsRef.current;
    if (!last || last.maxX !== bounds.maxX || last.maxY !== bounds.maxY || last.minX !== bounds.minX || last.minY !== bounds.minY) {
      lastBoundsRef.current = bounds;
      onBoundsChange(bounds);
    }
  }, [getShapeBounds, lastBoundsRef, onBoundsChange, shapes]);
};
