import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const circleShape: ShapeDefinition = {
  type: 'circle',
  create: (ctx: ShapeContext) => {
    const circle = ctx.createSVGElement('circle');
    if (!circle) throw new Error('Failed to create circle');
    const id = ctx.generateId();
    const x = 220 + Math.random() * 100;
    const y = 180 + Math.random() * 80;
    const radius = 50;
    circle.setAttribute('id', id);
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', String(radius));
    circle.setAttribute('fill', 'transparent');
    circle.setAttribute('stroke', '#166534');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('cursor', 'move');
    return {
      id,
      element: circle,
      data: {
        x, y, radius,
        fill: 'transparent',
        stroke: '#166534',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [],
    };
  },
  getBounds: (shape): Bounds => ({
    minX: (shape.data.x || 0) - (shape.data.radius || 0),
    maxX: (shape.data.x || 0) + (shape.data.radius || 0),
    minY: (shape.data.y || 0) - (shape.data.radius || 0),
    maxY: (shape.data.y || 0) + (shape.data.radius || 0),
  }),
  getCenter: (shape): Point => ({ x: shape.data.x || 0, y: shape.data.y || 0 }),
  move: (shape, dx, dy) => {
    const newCx = (shape.data.x || 0) + dx;
    const newCy = (shape.data.y || 0) + dy;
    shape.element.setAttribute('cx', String(newCx));
    shape.element.setAttribute('cy', String(newCy));
    shape.data.x = newCx;
    shape.data.y = newCy;
  },
  resize: (shape, handle, dx, dy) => {
    const radius = shape.data.radius || 0;
    const deltaX = handle.includes('e') ? dx : handle.includes('w') ? -dx : 0;
    const deltaY = handle.includes('s') ? dy : handle.includes('n') ? -dy : 0;
    const avgDelta = (deltaX + deltaY) / 2;
    const newRadius = Math.max(10, radius + avgDelta);
    shape.element.setAttribute('r', String(newRadius));
    shape.data.radius = newRadius;
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    cloned.setAttribute('id', id);
    const newData = { ...shape.data };
    newData.x = (shape.data.x || 0) + offset;
    newData.y = (shape.data.y || 0) + offset;
    cloned.setAttribute('cx', String(newData.x));
    cloned.setAttribute('cy', String(newData.y));
    return {
      ...shape,
      id,
      element: cloned,
      data: newData,
      connections: [],
    };
  },
  getPorts: (shape) => {
    const { x = 0, y = 0, radius = 0 } = shape.data;
    return [
      { id: `${shape.id}-port-top`, x, y: y - radius, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + radius, y, position: 'right' },
      { id: `${shape.id}-port-bottom`, x, y: y + radius, position: 'bottom' },
      { id: `${shape.id}-port-left`, x: x - radius, y, position: 'left' },
    ];
  },
};
