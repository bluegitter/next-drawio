import { watch } from 'vue';
import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseBoundsChangeArgs = {
  shapes: Ref<SVGShape[]>;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  lastBoundsRef: { value: { minX: number; minY: number; maxX: number; maxY: number } | null };
  onBoundsChange?: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
};

export const useBoundsChange = ({ shapes, getShapeBounds, lastBoundsRef, onBoundsChange }: UseBoundsChangeArgs) => {
  watch(
    () => shapes.value,
    () => {
      if (!onBoundsChange) return;
      if (shapes.value.length === 0) return;
      
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      
      shapes.value.forEach((shape) => {
        const b = getShapeBounds(shape);
        minX = Math.min(minX, b.minX);
        minY = Math.min(minY, b.minY);
        maxX = Math.max(maxX, b.maxX);
        maxY = Math.max(maxY, b.maxY);
      });
      
      const bounds = { minX, minY, maxX, maxY };
      const last = lastBoundsRef.value;
      if (!last || last.maxX !== bounds.maxX || last.maxY !== bounds.maxY || last.minX !== bounds.minX || last.minY !== bounds.minY) {
        lastBoundsRef.value = bounds;
        onBoundsChange(bounds);
      }
    }
    // 移除 { deep: true }，改为仅在数组引用变化时触发
  );
};