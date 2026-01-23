import type { SVGShape } from '../types';
import { getPortsForShape } from '../../shapes';

type HandlePolylinePointArgs = {
  shapes: SVGShape[];
  shape: SVGShape;
  index: number;
  x: number;
  y: number;
  dragStart: { x: number; y: number };
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  parsePoints: (points: string) => Array<[number, number]>;
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  updatePolylinePoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  enableConnectorNodeSnap: boolean;
  connectorNodeSnapDistance: number;
  connectorNodeAlignDistance: number;
  viewBoxMinX: number;
  viewBoxMinY: number;
};

export const handlePolylinePointDragMove = ({
  shapes,
  shape,
  index,
  x,
  y,
  dragStart,
  setDragStart,
  setShapesState,
  parsePoints,
  updateConnectorPoints,
  updatePolylinePoints,
  enableConnectorNodeSnap,
  connectorNodeSnapDistance,
  connectorNodeAlignDistance,
  viewBoxMinX,
  viewBoxMinY,
}: HandlePolylinePointArgs) => {
  const pts = parsePoints(shape.data.points || '');
  if (!pts[index]) return;
  const dx = x - dragStart.x;
  const dy = y - dragStart.y;
  let nextX = pts[index][0] + dx;
  let nextY = pts[index][1] + dy;
  let snappedToPort = false;

  if (enableConnectorNodeSnap) {
    let bestDist = Number.POSITIVE_INFINITY;
    let bestPoint: { x: number; y: number } | undefined;
    shapes.forEach((candidate) => {
      if (candidate.type === 'connector') return;
      const ports = getPortsForShape(candidate);
      ports.forEach((port: any) => {
        const dist = Math.hypot(port.x - nextX, port.y - nextY);
        if (dist <= connectorNodeSnapDistance && dist < bestDist) {
          bestDist = dist;
          bestPoint = { x: port.x as number, y: port.y as number };
        }
      });
    });
    if (bestPoint) {
      nextX = bestPoint.x;
      nextY = bestPoint.y;
      snappedToPort = true;
    }
  }

  if (!snappedToPort) {
    const prev = pts[index - 1];
    const next = pts[index + 1];
    if (prev) {
      if (Math.abs(nextX - prev[0]) <= connectorNodeAlignDistance) nextX = prev[0];
      if (Math.abs(nextY - prev[1]) <= connectorNodeAlignDistance) nextY = prev[1];
    }
    if (next) {
      if (Math.abs(nextX - next[0]) <= connectorNodeAlignDistance) nextX = next[0];
      if (Math.abs(nextY - next[1]) <= connectorNodeAlignDistance) nextY = next[1];
    }
  }

  pts[index] = [nextX, nextY];
  const nextShape = { ...shape, data: { ...shape.data } };
  if (shape.type === 'connector') {
    updateConnectorPoints(nextShape, pts);
  } else {
    updatePolylinePoints(nextShape, pts);
  }
  const updatedShapes = shapes.map((s) => (s.id === shape.id ? nextShape : s));
  setShapesState(() => updatedShapes);
  setDragStart({ x, y, viewBoxMinX, viewBoxMinY });
};
