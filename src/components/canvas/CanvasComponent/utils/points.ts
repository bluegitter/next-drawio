import type { SVGShape } from '../types';

export const pointToSegmentDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
};

export const projectPointToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return { x: x1, y: y1, t: 0 };
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return { x: x1 + t * dx, y: y1 + t * dy, t };
};

export const parsePoints = (points?: string) => {
  if (!points) return [] as Array<[number, number]>;
  return points
    .trim()
    .split(/\s+/)
    .map(pair => pair.split(',').map(Number))
    .filter(coords => coords.length === 2 && coords.every(v => Number.isFinite(v)))
    .map(coords => [coords[0], coords[1]] as [number, number]);
};

export const formatPoints = (points: Array<[number, number]>) => {
  return points.map(([px, py]) => `${px},${py}`).join(' ');
};

export const getConnectorPoints = (shape: SVGShape) => {
  if (shape.data.points) {
    const pts = parsePoints(shape.data.points);
    if (pts.length >= 2) return pts;
  }
  const x1 = shape.data.x1 ?? 0;
  const y1 = shape.data.y1 ?? 0;
  const x2 = shape.data.x2 ?? 0;
  const y2 = shape.data.y2 ?? 0;
  return [[x1, y1], [x2, y2]] as Array<[number, number]>;
};

export const pointToPolylineDistance = (px: number, py: number, points: Array<[number, number]>) => {
  if (points.length < 2) return Number.POSITIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const dist = pointToSegmentDistance(px, py, x1, y1, x2, y2);
    if (dist < min) min = dist;
  }
  return min;
};
