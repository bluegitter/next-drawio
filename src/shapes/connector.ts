import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const connectorShape: ShapeDefinition = {
  type: 'connector',
  create: (ctx: ShapeContext) => {
    const line = ctx.createSVGElement('line');
    if (!line) throw new Error('Failed to create connector');
    const id = ctx.generateId();
    const x1 = 150, y1 = 150, x2 = 250, y2 = 210;
    line.setAttribute('id', id);
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', '#6b7280');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('fill', 'none');
    line.setAttribute('cursor', 'pointer');
    return {
      id,
      type: 'connector',
      element: line,
      data: { x1, y1, x2, y2, stroke: '#6b7280', strokeWidth: 2 },
      connections: [null, null],
    };
  },
  getBounds: (shape): Bounds => ({
    minX: Math.min(shape.data.x1 || 0, shape.data.x2 || 0),
    maxX: Math.max(shape.data.x1 || 0, shape.data.x2 || 0),
    minY: Math.min(shape.data.y1 || 0, shape.data.y2 || 0),
    maxY: Math.max(shape.data.y1 || 0, shape.data.y2 || 0),
  }),
  getCenter: (shape): Point => {
    const x1 = shape.data.x1 || 0;
    const y1 = shape.data.y1 || 0;
    const x2 = shape.data.x2 || 0;
    const y2 = shape.data.y2 || 0;
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  },
  move: (shape, dx, dy) => {
    const newX1 = (shape.data.x1 || 0) + dx;
    const newY1 = (shape.data.y1 || 0) + dy;
    const newX2 = (shape.data.x2 || 0) + dx;
    const newY2 = (shape.data.y2 || 0) + dy;
    shape.element.setAttribute('x1', String(newX1));
    shape.element.setAttribute('y1', String(newY1));
    shape.element.setAttribute('x2', String(newX2));
    shape.element.setAttribute('y2', String(newY2));
    shape.data.x1 = newX1;
    shape.data.y1 = newY1;
    shape.data.x2 = newX2;
    shape.data.y2 = newY2;
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    cloned.setAttribute('id', id);
    const newData = { ...shape.data };
    newData.x1 = (shape.data.x1 || 0) + offset;
    newData.y1 = (shape.data.y1 || 0) + offset;
    newData.x2 = (shape.data.x2 || 0) + offset;
    newData.y2 = (shape.data.y2 || 0) + offset;
    cloned.setAttribute('x1', String(newData.x1));
    cloned.setAttribute('y1', String(newData.y1));
    cloned.setAttribute('x2', String(newData.x2));
    cloned.setAttribute('y2', String(newData.y2));
    return {
      ...shape,
      id,
      element: cloned,
      data: newData,
      connections: [null, null],
    };
  },
};
