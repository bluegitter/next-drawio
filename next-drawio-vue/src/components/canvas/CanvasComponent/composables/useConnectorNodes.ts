import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseConnectorNodesArgs = {
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  projectPointToSegment: (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => { x: number; y: number };
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedShape: (id: string | null) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
};

export const useConnectorNodes = ({
  shapes,
  selectedIds,
  getPointerPosition,
  getConnectorPoints,
  projectPointToSegment,
  updateConnectorPoints,
  setShapesState,
  setSelectedShape,
  onShapeSelect,
  saveToHistory,
}: UseConnectorNodesArgs) => {
  const addConnectorNodeAt = (shape: SVGShape, clientX: number, clientY: number) => {
    if (shape.type !== 'connector') return;
    const { x, y } = getPointerPosition(clientX, clientY);
    const points = getConnectorPoints(shape);
    if (points.length < 2) return;
    let bestIndex = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    let bestPoint = { x, y };
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const proj = projectPointToSegment(x, y, x1, y1, x2, y2);
      const dist = Math.hypot(x - proj.x, y - proj.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
        bestPoint = { x: proj.x, y: proj.y };
      }
    }
    const newPoints = [
      ...points.slice(0, bestIndex + 1),
      [bestPoint.x, bestPoint.y] as [number, number],
      ...points.slice(bestIndex + 1),
    ];
    const nextShape = { ...shape, data: { ...shape.data } };
    updateConnectorPoints(nextShape, newPoints);
    const updatedShapes = shapes.value.map((s) => (s.id === shape.id ? nextShape : s));
    setShapesState(() => updatedShapes);
    setSelectedShape(shape.id);
    onShapeSelect?.(nextShape.element);
    saveToHistory(updatedShapes, selectedIds.value);
  };

  return { addConnectorNodeAt };
};
