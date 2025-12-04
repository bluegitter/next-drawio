import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const imageShape: ShapeDefinition = {
  type: 'image',
  create: (ctx: ShapeContext, options?: { href?: string; width?: number; height?: number }) => {
    const image = ctx.createSVGElement('image');
    if (!image) throw new Error('Failed to create image');
    const id = ctx.generateId();
    const x = 120 + Math.random() * 100;
    const y = 120 + Math.random() * 80;
    const width = options?.width ?? 120;
    const height = options?.height ?? 80;
    if (options?.href) {
      image.setAttribute('href', options.href);
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', options.href);
    }
    image.setAttribute('id', id);
    image.setAttribute('x', String(x));
    image.setAttribute('y', String(y));
    image.setAttribute('width', String(width));
    image.setAttribute('height', String(height));
    image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    image.setAttribute('cursor', 'move');
    return {
      id,
      type: 'image',
      element: image,
      data: {
        x,
        y,
        width,
        height,
        href: options?.href || '',
        fill: 'none',
        stroke: 'none',
        strokeWidth: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [],
    };
  },
  getBounds: (shape): Bounds => ({
    minX: shape.data.x || 0,
    minY: shape.data.y || 0,
    maxX: (shape.data.x || 0) + (shape.data.width || 0),
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
    let { x = 0, y = 0, width = 0, height = 0 } = shape.data;
    switch (handle) {
      case 'se':
        width = Math.max(20, width + dx);
        height = Math.max(20, height + dy);
        break;
      case 'sw':
        x = Math.min(x + width - 20, x + dx);
        width = Math.max(20, width - dx);
        height = Math.max(20, height + dy);
        break;
      case 'ne':
        y = Math.min(y + height - 20, y + dy);
        width = Math.max(20, width + dx);
        height = Math.max(20, height - dy);
        break;
      case 'nw':
        x = Math.min(x + width - 20, x + dx);
        y = Math.min(y + height - 20, y + dy);
        width = Math.max(20, width - dx);
        height = Math.max(20, height - dy);
        break;
    }
    shape.element.setAttribute('x', String(x));
    shape.element.setAttribute('y', String(y));
    shape.element.setAttribute('width', String(width));
    shape.element.setAttribute('height', String(height));
    shape.data.x = x;
    shape.data.y = y;
    shape.data.width = width;
    shape.data.height = height;
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
