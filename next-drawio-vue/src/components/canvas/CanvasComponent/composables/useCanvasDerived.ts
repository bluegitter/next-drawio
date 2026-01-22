import { computed, type Ref } from 'vue';
import type { SVGShape } from '../types';

type UseCanvasDerivedArgs = {
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  parsePoints: (points: string) => Array<[number, number]>;
};

export const useCanvasDerived = ({ shapes, selectedIds, getShapeBounds, parsePoints }: UseCanvasDerivedArgs) => {
  const groupSelectionBounds = computed(() => {
    if (selectedIds.value.size <= 1) return null;
    const selectedShapes = shapes.value.filter((s) => selectedIds.value.has(s.id));
    const groupIds = new Set(selectedShapes.map((s) => s.data.groupId).filter(Boolean) as string[]);
    if (groupIds.size !== 1) return null;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    selectedShapes.forEach((shape) => {
      const b = getShapeBounds(shape);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return null;
    const padding = 10;
    return {
      x: minX - padding,
      y: minY - padding,
      w: maxX - minX + padding * 2,
      h: maxY - minY + padding * 2,
    };
  });

  const polylineHandles = computed(() => {
    const handles: Array<{ shapeId: string; index: number; x: number; y: number }> = [];
    selectedIds.value.forEach((id) => {
      const shape = shapes.value.find((s) => s.id === id);
      if (!shape) return;
      if (shape.type !== 'polyline' && shape.type !== 'connector') {
        return;
      }
      const rawPoints =
        shape.data.points ||
        (shape.element instanceof SVGPolylineElement ? shape.element.getAttribute('points') || '' : '');
      const pts = parsePoints(rawPoints);
      if (pts.length === 0) return;
      const startIndex = shape.type === 'connector' ? 1 : 0;
      const endIndex = shape.type === 'connector' ? pts.length - 1 : pts.length;
      for (let idx = startIndex; idx < endIndex; idx += 1) {
        const [px, py] = pts[idx];
        handles.push({ shapeId: id, index: idx, x: px, y: py });
      }
    });
    return handles;
  });

  return {
    groupSelectionBounds,
    polylineHandles,
  };
};
