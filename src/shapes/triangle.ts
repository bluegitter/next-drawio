import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

const makeTrianglePoints = (cx: number, cy: number, size = 80) => {
  const h = (size * Math.sqrt(3)) / 2;
  const p1 = [cx, cy - (2 / 3) * h];
  const p2 = [cx - size / 2, cy + h / 3];
  const p3 = [cx + size / 2, cy + h / 3];
  return `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
};

export const triangleShape: ShapeDefinition = {
  type: 'triangle',
  create: (ctx: ShapeContext) => {
    const poly = ctx.createSVGElement('polygon');
    if (!poly) throw new Error('Failed to create triangle');
    const id = ctx.generateId();
    const cx = 160 + Math.random() * 100;
    const cy = 220 + Math.random() * 80;
    const points = makeTrianglePoints(cx, cy, 100);
    poly.setAttribute('id', id);
    poly.setAttribute('points', points);
    poly.setAttribute('fill', 'transparent');
    poly.setAttribute('stroke', '#d97706');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('cursor', 'move');
    return {
      id,
      type: 'triangle',
      element: poly,
      data: {
        points,
        fill: 'transparent',
        stroke: '#d97706',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [],
    };
  },
  getBounds: (shape): Bounds => {
    const pts = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    const xs = pts.map(([x]: number[]) => x);
    const ys = pts.map(([, y]: number[]) => y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  },
  getCenter: (shape): Point => {
    const pts = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    if (!pts.length) return { x: 0, y: 0 };
    const centerX = pts.reduce((sum: number, p: number[]) => sum + p[0], 0) / pts.length;
    const centerY = pts.reduce((sum: number, p: number[]) => sum + p[1], 0) / pts.length;
    return { x: centerX, y: centerY };
  },
  move: (shape, dx, dy) => {
    const points = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    const newPoints = points.map(([x, y]: number[]) => `${x + dx},${y + dy}`).join(' ');
    shape.element.setAttribute('points', newPoints);
    shape.data.points = newPoints;
  },
  resize: (shape, handle, dx, dy) => {
    const pts = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    if (pts.length === 0) return;
    const xs = pts.map(([px]: number[]) => px);
    const ys = pts.map(([, py]: number[]) => py);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const anchor = {
      x: handle.includes('w') ? maxX : minX,
      y: handle.includes('n') ? maxY : minY,
    };
    const widthDelta = handle.includes('e') ? dx : -dx;
    const heightDelta = handle.includes('s') ? dy : -dy;
    const newWidth = Math.max(20, width + widthDelta);
    const newHeight = Math.max(20, height + heightDelta);
    const scaleX = newWidth / width;
    const scaleY = newHeight / height;
    const scaled = pts.map(([px, py]: number[]) => {
      const nx = anchor.x + (px - anchor.x) * scaleX;
      const ny = anchor.y + (py - anchor.y) * scaleY;
      return `${nx},${ny}`;
    }).join(' ');
    shape.element.setAttribute('points', scaled);
    shape.data.points = scaled;
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    cloned.setAttribute('id', id);
    const pts = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    const shiftedPoints = pts.map(([x, y]: number[]) => `${x + offset},${y + offset}`).join(' ');
    cloned.setAttribute('points', shiftedPoints);
    return {
      ...shape,
      id,
      element: cloned,
      data: { ...shape.data, points: shiftedPoints },
      connections: [],
    };
  },
  getPorts: (shape) => {
    const pts = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    if (pts.length < 3) return [];
    const centroid = pts.reduce((acc: number[], p: number[]) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]).map((v: number) => v / pts.length);
    const edges = [
      [pts[0], pts[1]],
      [pts[1], pts[2]],
      [pts[2], pts[0]],
    ] as const;
    const directions = [
      { id: `${shape.id}-port-top`, dir: { x: 0, y: -1 }, position: 'top' },
      { id: `${shape.id}-port-right`, dir: { x: 1, y: 0 }, position: 'right' },
      { id: `${shape.id}-port-bottom`, dir: { x: 0, y: 1 }, position: 'bottom' },
      { id: `${shape.id}-port-left`, dir: { x: -1, y: 0 }, position: 'left' },
    ] as const;
    const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;
    const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
    type HitPoint = { x: number; y: number; t: number };
    const intersectRaySegment = (origin: Point, dir: Point, a: Point, b: Point): HitPoint | null => {
      const seg = subtract(b, a);
      const denom = cross(dir, seg);
      if (Math.abs(denom) < 1e-6) return null;
      const diff = subtract(a, origin);
      const t = cross(diff, seg) / denom; // ray factor
      const u = cross(diff, dir) / denom; // segment factor
      if (t >= 0 && u >= 0 && u <= 1) {
        return {
          x: origin.x + t * dir.x,
          y: origin.y + t * dir.y,
          t,
        };
      }
      return null;
    };
    return directions.map(portDir => {
      let best: HitPoint | null = null;
      for (const [a, b] of edges) {
        const hit = intersectRaySegment(
          { x: centroid[0], y: centroid[1] },
          portDir.dir,
          { x: a[0], y: a[1] },
          { x: b[0], y: b[1] }
        );
        if (hit && (!best || hit.t < best.t)) best = hit;
      }
      const hitPoint: Point = best ? { x: best.x, y: best.y } : { x: centroid[0], y: centroid[1] };
      return { id: portDir.id, x: hitPoint.x, y: hitPoint.y, position: portDir.position };
    });
  },
};
