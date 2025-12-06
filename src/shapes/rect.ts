import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const rectShape: ShapeDefinition = {
  type: 'rect',
  create: (ctx: ShapeContext) => {
    const rect = ctx.createSVGElement('rect');
    if (!rect) throw new Error('Failed to create rect');
    const id = ctx.generateId();
    const x = 100 + Math.random() * 100;
    const y = 100 + Math.random() * 100;
    const width = 140;
    const height = 80;
    rect.setAttribute('id', id);
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('fill', 'transparent');
    rect.setAttribute('stroke', '#000000');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('cursor', 'move');
    return {
      id,
      element: rect,
      data: {
        x, y, width, height,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [],
    };
  },
  getBounds: (shape): Bounds => ({
    minX: shape.data.x || 0,
    maxX: (shape.data.x || 0) + (shape.data.width || 0),
    minY: shape.data.y || 0,
    maxY: (shape.data.y || 0) + (shape.data.height || 0),
  }),
  getCenter: (shape): Point => ({
    x: (shape.data.x || 0) + (shape.data.width || 0) / 2,
    y: (shape.data.y || 0) + (shape.data.height || 0) / 2,
  }),
  move: (shape, dx, dy) => {
    const newX = (shape.data.x || 0) + dx;
    const newY = (shape.data.y || 0) + dy;
    shape.element.setAttribute('x', String(newX));
    shape.element.setAttribute('y', String(newY));
    shape.data.x = newX;
    shape.data.y = newY;
  },
  resize: (shape, handle, dx, dy) => {
    let newX = shape.data.x || 0;
    let newY = shape.data.y || 0;
    let newWidth = shape.data.width || 0;
    let newHeight = shape.data.height || 0;
    switch (handle) {
      case 'se':
        newWidth = Math.max(20, newWidth + dx);
        newHeight = Math.max(20, newHeight + dy);
        break;
      case 'sw':
        newX = Math.min(newX + newWidth - 20, newX + dx);
        newWidth = Math.max(20, newWidth - dx);
        newHeight = Math.max(20, newHeight + dy);
        break;
      case 'ne':
        newY = Math.min(newY + newHeight - 20, newY + dy);
        newWidth = Math.max(20, newWidth + dx);
        newHeight = Math.max(20, newHeight - dy);
        break;
      case 'nw':
        newX = Math.min(newX + newWidth - 20, newX + dx);
        newY = Math.min(newY + newHeight - 20, newY + dy);
        newWidth = Math.max(20, newWidth - dx);
        newHeight = Math.max(20, newHeight - dy);
        break;
    }
    shape.element.setAttribute('x', String(newX));
    shape.element.setAttribute('y', String(newY));
    shape.element.setAttribute('width', String(newWidth));
    shape.element.setAttribute('height', String(newHeight));
    shape.data.x = newX;
    shape.data.y = newY;
    shape.data.width = newWidth;
    shape.data.height = newHeight;
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    cloned.setAttribute('id', id);
    const newData = { ...shape.data };
    newData.x = (shape.data.x || 0) + offset;
    newData.y = (shape.data.y || 0) + offset;
    cloned.setAttribute('x', String(newData.x));
    cloned.setAttribute('y', String(newData.y));
    return {
      ...shape,
      id,
      element: cloned,
      data: newData,
      connections: [],
    };
  },
  getPorts: (shape) => {
    const { x = 0, y = 0, width = 0, height = 0 } = shape.data;
    return [
      { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
      { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
    ];
  },
};
