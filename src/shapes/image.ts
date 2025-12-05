import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const imageShape: ShapeDefinition = {
  type: 'image',
  create: (ctx: ShapeContext, options?: { href?: string; width?: number; height?: number; svgText?: string; iconName?: string }) => {
    const image = ctx.createSVGElement('image');
    if (!image) throw new Error('Failed to create image');
    const id = ctx.generateId();
    const x = 120 + Math.random() * 100;
    const y = 120 + Math.random() * 80;
    const width = options?.width ?? 120;
    const height = options?.height ?? 80;
    const size = Math.max(width, height);
    if (options?.href) {
      image.setAttribute('href', options.href);
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', options.href);
    }
    image.setAttribute('id', id);
    image.setAttribute('x', String(x));
    image.setAttribute('y', String(y));
    image.setAttribute('width', String(size));
    image.setAttribute('height', String(size));
    image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    image.setAttribute('cursor', 'move');
    return {
      id,
      type: 'image',
      element: image,
      data: {
        x,
        y,
        width: size,
        height: size,
        href: options?.href || '',
        originalHref: options?.href || '',
        originalSvgText: options?.svgText || null,
        iconName: options?.iconName,
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

    // 强制保持 1:1 外框。根据拖拽方向调整锚点，保持相对边固定。
    const size = Math.max(width, height);
    switch (handle) {
      case 'se':
        width = size;
        height = size;
        break;
      case 'sw':
        x = x + (width - size);
        width = size;
        height = size;
        break;
      case 'ne':
        y = y + (height - size);
        width = size;
        height = size;
        break;
      case 'nw':
        x = x + (width - size);
        y = y + (height - size);
        width = size;
        height = size;
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
    const { x = 0, y = 0, width = 0, height = 0, iconName } = shape.data;

    const isTransformer =
      iconName?.includes('三圈变压器') ||
      (shape.data.href || '').includes('三圈变压器');
    const isSwitch =
      iconName?.includes('刀闸开关') ||
      (shape.data.href || '').includes('刀闸开关');

    if (isTransformer) {
      const cx = x + width / 2.65;
      const cy = y + height / 2;
      const dy = height * 0.45;
      return [
        { id: `${shape.id}-port-top`, x: cx, y: y + height * 0.08, position: 'top' },
        { id: `${shape.id}-port-right`, x: x + width * 0.77, y: cy, position: 'right' },
        { id: `${shape.id}-port-bottom`, x: cx, y: y + height * 0.92, position: 'bottom' },
      ];
    }

    if (isSwitch) {
      const cx = x + width / 1.7;
      const cy = y + height / 2;
      const dy = height * 0.38;
      return [
        { id: `${shape.id}-port-top`, x: cx, y: cy - dy, position: 'top' },
        { id: `${shape.id}-port-bottom`, x: cx, y: cy + dy, position: 'bottom' },
      ];
    }

    return [
      { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
      { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
    ];
  },
};
