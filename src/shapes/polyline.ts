import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const polylineShape: ShapeDefinition = {
  type: 'polyline',
  create: (ctx: ShapeContext) => {
    const poly = ctx.createSVGElement('polyline');
    if (!poly) throw new Error('Failed to create polyline');
    const id = ctx.generateId();
    const points = '100,100 160,140 220,120';
    poly.setAttribute('id', id);
    poly.setAttribute('points', points);
    poly.setAttribute('stroke', '#6b7280');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('fill', 'none');
    poly.setAttribute('cursor', 'pointer');
    return {
      id,
      type: 'polyline',
      element: poly,
      data: { points, stroke: '#6b7280', strokeWidth: 2 },
      connections: [null, null],
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
    const polyX = pts.reduce((sum: number, [x]: number[]) => sum + x, 0) / pts.length;
    const polyY = pts.reduce((sum: number, [, y]: number[]) => sum + y, 0) / pts.length;
    return { x: polyX, y: polyY };
  },
  move: (shape, dx, dy) => {
    const polyPoints = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    const shiftedPoints = polyPoints.map(([px, py]: number[]) => `${px + dx},${py + dy}`).join(' ');
    shape.element.setAttribute('points', shiftedPoints);
    shape.data.points = shiftedPoints;
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    cloned.setAttribute('id', id);
    const polyPoints = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    const newPolyPoints = polyPoints.map(([x, y]: number[]) => `${x + offset},${y + offset}`).join(' ');
    cloned.setAttribute('points', newPolyPoints);
    return {
      ...shape,
      id,
      element: cloned,
      data: { ...shape.data, points: newPolyPoints },
      connections: [null, null],
    };
  },
};
