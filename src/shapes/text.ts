import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

export const textShape: ShapeDefinition = {
  type: 'text',
  create: (ctx: ShapeContext) => {
    const foreign = ctx.createSVGElement('foreignObject') as SVGForeignObjectElement | null;
    if (!foreign) throw new Error('Failed to create text');
    const id = ctx.generateId();
    const x = 100 + Math.random() * 100;
    const y = 250 + Math.random() * 50;
    const width = 200;
    const height = 60;

    foreign.setAttribute('id', id);
    foreign.setAttribute('x', String(x));
    foreign.setAttribute('y', String(y));
    foreign.setAttribute('width', String(width));
    foreign.setAttribute('height', String(height));
    foreign.setAttribute('cursor', 'move');

    const div = document.createElement('div');
    div.textContent = '点击编辑文字';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.style.fontSize = '20px';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.fontWeight = '400';
    div.style.color = '#1f2937';
    div.style.lineHeight = '1.2';

    foreign.appendChild(div);

    return {
      id,
      type: 'text',
      element: foreign,
      data: {
        x, y, width, height,
        text: div.textContent || '',
        fill: '#1f2937',
        stroke: 'none',
        strokeWidth: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [],
    };
  },
  getBounds: (shape): Bounds => {
    if (shape.element instanceof SVGForeignObjectElement) {
      const bbox = shape.element.getBBox();
      return {
        minX: bbox.x,
        maxX: bbox.x + bbox.width,
        minY: bbox.y,
        maxY: bbox.y + bbox.height,
      };
    }
    return {
      minX: shape.data.x || 0,
      maxX: (shape.data.x || 0) + (shape.data.width || 100),
      minY: shape.data.y || 0,
      maxY: (shape.data.y || 0) + (shape.data.height || 30),
    };
  },
  getCenter: (shape): Point => ({
    x: (shape.data.x || 0) + (shape.data.width || 0) / 2,
    y: (shape.data.y || 0) + (shape.data.height || 0) / 2,
  }),
  move: (shape, dx, dy) => {
    const newTextX = (shape.data.x || 0) + dx;
    const newTextY = (shape.data.y || 0) + dy;
    shape.element.setAttribute('x', String(newTextX));
    shape.element.setAttribute('y', String(newTextY));
    shape.data.x = newTextX;
    shape.data.y = newTextY;
  },
  resize: (shape, handle, dx, dy) => {
    const currentW = shape.data.width || Number(shape.element.getAttribute('width')) || 100;
    const currentH = shape.data.height || Number(shape.element.getAttribute('height')) || 30;
    const currentX = shape.data.x || Number(shape.element.getAttribute('x')) || 0;
    const currentY = shape.data.y || Number(shape.element.getAttribute('y')) || 0;
    let newX = currentX;
    let newY = currentY;
    let newW = currentW;
    let newH = currentH;
    if (handle.includes('e')) newW = Math.max(30, currentW + dx);
    if (handle.includes('s')) newH = Math.max(20, currentH + dy);
    if (handle.includes('w')) { newX = currentX + dx; newW = Math.max(30, currentW - dx); }
    if (handle.includes('n')) { newY = currentY + dy; newH = Math.max(20, currentH - dy); }
    shape.element.setAttribute('x', String(newX));
    shape.element.setAttribute('y', String(newY));
    shape.element.setAttribute('width', String(newW));
    shape.element.setAttribute('height', String(newH));
    if (shape.element instanceof SVGForeignObjectElement) {
      const div = shape.element.firstChild as HTMLElement | null;
      if (div) { div.style.width = '100%'; div.style.height = '100%'; }
    }
    shape.data.x = newX;
    shape.data.y = newY;
    shape.data.width = newW;
    shape.data.height = newH;
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
    if (cloned instanceof SVGForeignObjectElement) {
      cloned.setAttribute('width', String(newData.width || cloned.getAttribute('width') || 200));
      cloned.setAttribute('height', String(newData.height || cloned.getAttribute('height') || 60));
    }
    return {
      ...shape,
      id,
      element: cloned,
      data: newData,
      connections: [],
    };
  },
};
