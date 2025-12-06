import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const roundedRectShape: ShapeDefinition = {
  type: 'roundedRect',
  create: (ctx: ShapeContext) => {
    const rect = ctx.createSVGElement('rect');
    if (!rect) throw new Error('Failed to create roundedRect');
    const id = ctx.generateId();
    const x = 100 + Math.random() * 100;
    const y = 100 + Math.random() * 100;
    const width = 140;
    const height = 80;
    const cornerRadius = 15; // 默认圆角半径
    rect.setAttribute('id', id);
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('rx', String(cornerRadius));
    rect.setAttribute('ry', String(cornerRadius));
    rect.setAttribute('fill', 'transparent');
    rect.setAttribute('stroke', '#000000');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('cursor', 'move');
    return {
      id,
      element: rect,
      data: {
        x, y, width, height, cornerRadius,
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
    let newCornerRadius = shape.data.cornerRadius || 0;
    
    // 根据拖拽的角落调整圆角
    const adjustCornerRadius = (dx: number, dy: number, corner: string) => {
      const maxRadius = Math.min(newWidth, newHeight) / 4; // 最大圆角为最小边长的1/4
      const adjustment = (Math.abs(dx) + Math.abs(dy)) / 2;
      
      switch (corner) {
        case 'ne': // 右上角
        case 'nw': // 左上角
        case 'se': // 右下角
        case 'sw': // 左下角
          newCornerRadius = Math.max(0, Math.min(maxRadius, newCornerRadius + adjustment * 0.1));
          break;
      }
    };
    
    switch (handle) {
      case 'se':
        newWidth = Math.max(40, newWidth + dx);
        newHeight = Math.max(40, newHeight + dy);
        adjustCornerRadius(dx, dy, 'se');
        break;
      case 'sw':
        newX = Math.min(newX + newWidth - 40, newX + dx);
        newWidth = Math.max(40, newWidth - dx);
        newHeight = Math.max(40, newHeight + dy);
        adjustCornerRadius(-dx, dy, 'sw');
        break;
      case 'ne':
        newY = Math.min(newY + newHeight - 40, newY + dy);
        newWidth = Math.max(40, newWidth + dx);
        newHeight = Math.max(40, newHeight - dy);
        adjustCornerRadius(dx, -dy, 'ne');
        break;
      case 'nw':
        newX = Math.min(newX + newWidth - 40, newX + dx);
        newY = Math.min(newY + newHeight - 40, newY + dy);
        newWidth = Math.max(40, newWidth - dx);
        newHeight = Math.max(40, newHeight - dy);
        adjustCornerRadius(-dx, -dy, 'nw');
        break;
    }
    
    shape.element.setAttribute('x', String(newX));
    shape.element.setAttribute('y', String(newY));
    shape.element.setAttribute('width', String(newWidth));
    shape.element.setAttribute('height', String(newHeight));
    shape.element.setAttribute('rx', String(newCornerRadius));
    shape.element.setAttribute('ry', String(newCornerRadius));
    
    shape.data.x = newX;
    shape.data.y = newY;
    shape.data.width = newWidth;
    shape.data.height = newHeight;
    shape.data.cornerRadius = newCornerRadius;
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
    const { x = 0, y = 0, width = 0, height = 0, cornerRadius = 0 } = shape.data;
    return [
      { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
      { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
    ];
  },
  getCornerHandles: (shape) => {
    const { x = 0, y = 0, width = 0 } = shape.data;
    const handleSize = 10;
    const offset = handleSize * 1.2;
    return [
      {
        id: `${shape.id}-corner-top`,
        type: 'corner-top',
        x: x + width - offset,
        // 固定在顶部，只允许左右拖拽调整圆角
        y: y + offset,
        visible: true,
        cursor: 'ew-resize',
      },
    ];
  },
};
