import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

type PathShapeData = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  scale: number;
  opacity: number;
};

const minSize = 20;

const updatePathD = (shape: any) => {
  const data = shape.data as PathShapeData & { points: Array<{ x: number; y: number }> };
  if (!shape.element || !data.points) return;
  const d = data.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  shape.element.setAttribute('d', d);
};

const normalizePoints = (x: number, y: number, w: number, h: number, blueprint: Array<{ x: number; y: number }>) =>
  blueprint.map(p => ({ x: x + p.x * w, y: y + p.y * h }));

const pathShapeFactory = (type: string, blueprint: Array<{ x: number; y: number }>): ShapeDefinition => ({
  type,
  create: (ctx: ShapeContext) => {
    const path = ctx.createSVGElement('path');
    if (!path) throw new Error(`Failed to create ${type}`);
    const id = ctx.generateId();
    const x = 80;
    const y = 80;
    const width = 140;
    const height = 90;
    const points = normalizePoints(x, y, width, height, blueprint);
    path.setAttribute('id', id);
    path.setAttribute('fill', 'transparent');
    path.setAttribute('stroke', '#000000');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('cursor', 'move');
    const shape = {
      id,
      type,
      element: path,
      data: {
        x,
        y,
        width,
        height,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
        points,
      },
      connections: [] as Array<string | null>,
    };
    updatePathD(shape);
    return shape;
  },
  getBounds: (shape): Bounds => ({
    minX: shape.data.x,
    maxX: shape.data.x + shape.data.width,
    minY: shape.data.y,
    maxY: shape.data.y + shape.data.height,
  }),
  getCenter: (shape): Point => ({
    x: shape.data.x + shape.data.width / 2,
    y: shape.data.y + shape.data.height / 2,
  }),
  move: (shape, dx, dy) => {
    shape.data.x += dx;
    shape.data.y += dy;
    shape.data.points = (shape.data.points as Array<Point>).map(p => ({ x: p.x + dx, y: p.y + dy }));
    updatePathD(shape);
  },
  resize: (shape, handle, dx, dy) => {
    let { x, y, width, height } = shape.data as PathShapeData;
    switch (handle) {
      case 'se':
        width = Math.max(minSize, width + dx);
        height = Math.max(minSize, height + dy);
        break;
      case 'sw':
        width = Math.max(minSize, width - dx);
        height = Math.max(minSize, height + dy);
        x = Math.min(x + dx, x + width - minSize);
        break;
      case 'ne':
        width = Math.max(minSize, width + dx);
        height = Math.max(minSize, height - dy);
        y = Math.min(y + dy, y + height - minSize);
        break;
      case 'nw':
        width = Math.max(minSize, width - dx);
        height = Math.max(minSize, height - dy);
        x = Math.min(x + dx, x + width - minSize);
        y = Math.min(y + dy, y + height - minSize);
        break;
    }
    shape.data.x = x;
    shape.data.y = y;
    shape.data.width = width;
    shape.data.height = height;
    shape.data.points = normalizePoints(x, y, width, height, blueprint);
    updatePathD(shape);
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    const x = shape.data.x + offset;
    const y = shape.data.y + offset;
    const width = shape.data.width;
    const height = shape.data.height;
    const points = normalizePoints(x, y, width, height, blueprint);
    const clonedShape = {
      ...shape,
      id,
      element: cloned,
      data: {
        ...shape.data,
        x,
        y,
        points,
      },
      connections: [],
    };
    updatePathD(clonedShape);
    cloned.setAttribute('id', id);
    return clonedShape;
  },
  getPorts: (shape) => {
    const { x, y, width, height } = shape.data as PathShapeData;
    return [
      { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
      { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
    ];
  },
});

export const diamondShape = pathShapeFactory('diamond', [
  { x: 0.5, y: 0 },
  { x: 1, y: 0.5 },
  { x: 0.5, y: 1 },
  { x: 0, y: 0.5 },
]);

export const trapezoidShape = pathShapeFactory('trapezoid', [
  { x: 0.2, y: 0 },
  { x: 0.8, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
]);

export const hexagonShape = pathShapeFactory('hexagon', [
  { x: 0.2, y: 0 },
  { x: 0.8, y: 0 },
  { x: 1, y: 0.5 },
  { x: 0.8, y: 1 },
  { x: 0.2, y: 1 },
  { x: 0, y: 0.5 },
]);

export const pentagonShape = pathShapeFactory('pentagon', [
  { x: 0.5, y: 0 },
  { x: 1, y: 0.4 },
  { x: 0.8, y: 1 },
  { x: 0.2, y: 1 },
  { x: 0, y: 0.4 },
]);

export const speechShape = pathShapeFactory('speech', [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 0.75 },
  { x: 0.65, y: 0.75 },
  { x: 0.5, y: 1 },
  { x: 0.5, y: 0.75 },
  { x: 0, y: 0.75 },
]);

export const waveShape = pathShapeFactory('wave', [
  { x: 0, y: 0.35 },
  { x: 0.25, y: 0.55 },
  { x: 0.5, y: 0.25 },
  { x: 0.75, y: 0.6 },
  { x: 1, y: 0.4 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
]);

// Cloud defined by cubic curves (normalized from provided path)
const cloudTemplate = [
  { cmd: 'M', pts: [0.25, 0.2105] },
  { cmd: 'C', pts: [0.05, 0.2105, 0, 0.4737, 0.16, 0.5263] },
  { cmd: 'C', pts: [0, 0.6421, 0.18, 0.8947, 0.31, 0.7895] },
  { cmd: 'C', pts: [0.4, 1, 0.7, 1, 0.8, 0.7895] },
  { cmd: 'C', pts: [1, 0.7895, 1, 0.5789, 0.875, 0.4737] },
  { cmd: 'C', pts: [1, 0.2632, 0.8, 0.0526, 0.625, 0.1579] },
  { cmd: 'C', pts: [0.5, 0, 0.3, 0, 0.25, 0.2105] },
];

const buildCloudD = (x: number, y: number, width: number, height: number) => {
  return cloudTemplate.map(seg => {
    const coords = seg.pts.map((v, idx) => (idx % 2 === 0 ? x + v * width : y + v * height));
    return `${seg.cmd} ${coords.join(' ')}`;
  }).join(' ') + ' Z';
};

export const cloudShape: ShapeDefinition = {
  type: 'cloud',
  create: (ctx: ShapeContext) => {
    const path = ctx.createSVGElement('path');
    if (!path) throw new Error('Failed to create cloud');
    const id = ctx.generateId();
    const x = 100;
    const y = 80;
    const width = 160;
    const height = 110;
    path.setAttribute('id', id);
    path.setAttribute('fill', 'transparent');
    path.setAttribute('stroke', '#000000');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('cursor', 'move');
    const shape = {
      id,
      type: 'cloud',
      element: path,
      data: {
        x,
        y,
        width,
        height,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [] as Array<string | null>,
    };
    updateCloudPath(shape);
    return shape;
  },
  getBounds: (shape): Bounds => ({
    minX: shape.data.x,
    maxX: shape.data.x + shape.data.width,
    minY: shape.data.y,
    maxY: shape.data.y + shape.data.height,
  }),
  getCenter: (shape): Point => ({
    x: shape.data.x + shape.data.width / 2,
    y: shape.data.y + shape.data.height / 2,
  }),
  move: (shape, dx, dy) => {
    shape.data.x += dx;
    shape.data.y += dy;
    updateCloudPath(shape);
  },
  resize: (shape, handle, dx, dy) => {
    let { x, y, width, height } = shape.data;
    switch (handle) {
      case 'se':
        width = Math.max(minSize, width + dx);
        height = Math.max(minSize, height + dy);
        break;
      case 'sw':
        width = Math.max(minSize, width - dx);
        height = Math.max(minSize, height + dy);
        x = Math.min(x + dx, x + width - minSize);
        break;
      case 'ne':
        width = Math.max(minSize, width + dx);
        height = Math.max(minSize, height - dy);
        y = Math.min(y + dy, y + height - minSize);
        break;
      case 'nw':
        width = Math.max(minSize, width - dx);
        height = Math.max(minSize, height - dy);
        x = Math.min(x + dx, x + width - minSize);
        y = Math.min(y + dy, y + height - minSize);
        break;
    }
    shape.data = { ...shape.data, x, y, width, height };
    updateCloudPath(shape);
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    const x = shape.data.x + offset;
    const y = shape.data.y + offset;
    const cloneData = { ...shape.data, x, y };
    const clonedShape = {
      ...shape,
      id,
      element: cloned,
      data: cloneData,
      connections: [],
    };
    updateCloudPath(clonedShape);
    cloned.setAttribute('id', id);
    return clonedShape;
  },
  getPorts: (shape) => {
    const { x, y, width, height } = shape.data;
    return [
      { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
      { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
    ];
  },
};

export const ellipseShape: ShapeDefinition = {
  type: 'ellipse',
  create: (ctx: ShapeContext) => {
    const el = ctx.createSVGElement('ellipse');
    if (!el) throw new Error('Failed to create ellipse');
    const id = ctx.generateId();
    const cx = 100;
    const cy = 100;
    const rx = 70;
    const ry = 45;
    el.setAttribute('id', id);
    el.setAttribute('cx', String(cx));
    el.setAttribute('cy', String(cy));
    el.setAttribute('rx', String(rx));
    el.setAttribute('ry', String(ry));
    el.setAttribute('fill', 'transparent');
    el.setAttribute('stroke', '#000000');
    el.setAttribute('stroke-width', '2');
    el.setAttribute('cursor', 'move');
    return {
      id,
      type: 'ellipse',
      element: el,
      data: {
        cx,
        cy,
        rx,
        ry,
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
    minX: (shape.data.cx || 0) - (shape.data.rx || 0),
    maxX: (shape.data.cx || 0) + (shape.data.rx || 0),
    minY: (shape.data.cy || 0) - (shape.data.ry || 0),
    maxY: (shape.data.cy || 0) + (shape.data.ry || 0),
  }),
  getCenter: (shape): Point => ({ x: shape.data.cx || 0, y: shape.data.cy || 0 }),
  move: (shape, dx, dy) => {
    shape.data.cx += dx;
    shape.data.cy += dy;
    shape.element.setAttribute('cx', String(shape.data.cx));
    shape.element.setAttribute('cy', String(shape.data.cy));
  },
  resize: (shape, handle, dx, dy) => {
    const rx = Math.max(minSize / 2, (shape.data.rx || 0) + (handle === 'w' || handle === 'nw' || handle === 'sw' ? -dx : dx));
    const ry = Math.max(minSize / 2, (shape.data.ry || 0) + (handle === 'n' || handle === 'nw' || handle === 'ne' ? -dy : dy));
    shape.data.rx = rx;
    shape.data.ry = ry;
    shape.element.setAttribute('rx', String(rx));
    shape.element.setAttribute('ry', String(ry));
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const cloned = shape.element.cloneNode(true) as SVGElement;
    const id = ctx.generateId();
    const cx = (shape.data.cx || 0) + offset;
    const cy = (shape.data.cy || 0) + offset;
    cloned.setAttribute('id', id);
    cloned.setAttribute('cx', String(cx));
    cloned.setAttribute('cy', String(cy));
    return {
      ...shape,
      id,
      element: cloned,
      data: { ...shape.data, cx, cy },
      connections: [],
    };
  },
  getPorts: (shape) => {
    const { cx = 0, cy = 0, rx = 0, ry = 0 } = shape.data;
    return [
      { id: `${shape.id}-port-top`, x: cx, y: cy - ry, position: 'top' },
      { id: `${shape.id}-port-right`, x: cx + rx, y: cy, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: cx, y: cy + ry, position: 'bottom' },
      { id: `${shape.id}-port-left`, x: cx - rx, y: cy, position: 'left' },
    ];
  },
};

export const cylinderShape: ShapeDefinition = {
  type: 'cylinder',
  create: (ctx: ShapeContext) => {
    const group = ctx.createSVGElement('g');
    const bodyPath = ctx.createSVGElement('path');
    const rimPath = ctx.createSVGElement('path');
    if (!group || !bodyPath || !rimPath) throw new Error('Failed to create cylinder');
    const id = ctx.generateId();
    const x = 90;
    const y = 80;
    const width = 120;
    const height = 160;
    const rx = width / 2;
    const ry = Math.max(minSize / 3, width / 4);

    bodyPath.setAttribute('class', 'cylinder-body');
    rimPath.setAttribute('class', 'cylinder-rim');
    [bodyPath, rimPath].forEach(path => {
      path.setAttribute('fill', 'transparent');
      path.setAttribute('stroke', '#000000');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('cursor', 'move');
    });
    rimPath.setAttribute('fill', 'none');

    group.setAttribute('id', id);
    group.appendChild(bodyPath);
    group.appendChild(rimPath);

    const shape = {
      id,
      type: 'cylinder',
      element: group,
      data: {
        x,
        y,
        width,
        height,
        rx,
        ry,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [] as Array<string | null>,
    };
    updateCylinderPath(shape);
    return shape;
  },
  getBounds: (shape): Bounds => ({
    minX: shape.data.x,
    maxX: shape.data.x + shape.data.width,
    minY: shape.data.y,
    maxY: shape.data.y + shape.data.height,
  }),
  getCenter: (shape): Point => ({
    x: shape.data.x + shape.data.width / 2,
    y: shape.data.y + shape.data.height / 2,
  }),
  move: (shape, dx, dy) => {
    shape.data.x += dx;
    shape.data.y += dy;
    updateCylinderPath(shape);
  },
  resize: (shape, handle, dx, dy) => {
    let { x, y, width, height, rx, ry } = shape.data;
    switch (handle) {
      case 'se':
        width = Math.max(minSize, width + dx);
        height = Math.max(minSize, height + dy);
        break;
      case 'sw':
        width = Math.max(minSize, width - dx);
        height = Math.max(minSize, height + dy);
        x = Math.min(x + dx, x + width - minSize);
        break;
      case 'ne':
        width = Math.max(minSize, width + dx);
        height = Math.max(minSize, height - dy);
        y = Math.min(y + dy, y + height - minSize);
        break;
      case 'nw':
        width = Math.max(minSize, width - dx);
        height = Math.max(minSize, height - dy);
        x = Math.min(x + dx, x + width - minSize);
        y = Math.min(y + dy, y + height - minSize);
        break;
    }
    rx = width / 2;
    ry = Math.max(minSize / 3, width / 4);
    shape.data = { ...shape.data, x, y, width, height, rx, ry };
    updateCylinderPath(shape);
  },
  clone: (shape, ctx: ShapeContext, offset: number) => {
    const clonedGroup = shape.element.cloneNode(true) as SVGGElement;
    const id = ctx.generateId();
    clonedGroup.setAttribute('id', id);
    const x = shape.data.x + offset;
    const y = shape.data.y + offset;
    const cloneData = { ...shape.data, x, y };
    const clonedShape = {
      ...shape,
      id,
      element: clonedGroup,
      data: cloneData,
      connections: [],
    };
    updateCylinderPath(clonedShape);
    return clonedShape;
  },
  getPorts: (shape) => {
    const { x, y, width, height } = shape.data;
    return [
      { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
      { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
      { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
      { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
    ];
  },
};

export function updateCylinderPath(shape: any) {
  const { x, y, width, height, rx, ry, fill, stroke, strokeWidth } = shape.data;
  const cx = x + width / 2;
  const topY = y;
  const bottomY = y + height;
  const k = 0.5522847498307936;

  const bodyPath = (shape.element as SVGGElement).querySelector('.cylinder-body') as SVGPathElement | null;
  const rimPath = (shape.element as SVGGElement).querySelector('.cylinder-rim') as SVGPathElement | null;
  if (!bodyPath || !rimPath) return;

  (shape.element as SVGGElement).setAttribute('fill', 'none');
  (shape.element as SVGGElement).setAttribute('stroke', 'none');

  const bodyD = [
    `M ${cx - rx} ${topY + ry}`,
    `C ${cx - rx} ${topY + ry - k * ry} ${cx - k * rx} ${topY} ${cx} ${topY}`,
    `C ${cx + k * rx} ${topY} ${cx + rx} ${topY + ry - k * ry} ${cx + rx} ${topY + ry}`,
    `L ${cx + rx} ${bottomY - ry}`,
    `C ${cx + rx} ${bottomY - ry + k * ry} ${cx + k * rx} ${bottomY} ${cx} ${bottomY}`,
    `C ${cx - k * rx} ${bottomY} ${cx - rx} ${bottomY - ry + k * ry} ${cx - rx} ${bottomY - ry}`,
    `Z`,
  ].join(' ');

  const rimD = [
    `M ${cx - rx} ${topY + ry}`,
    `C ${cx - rx} ${topY + ry + k * ry} ${cx - k * rx} ${topY + 2 * ry} ${cx} ${topY + 2 * ry}`,
    `C ${cx + k * rx} ${topY + 2 * ry} ${cx + rx} ${topY + ry + k * ry} ${cx + rx} ${topY + ry}`,
  ].join(' ');

  bodyPath.setAttribute('d', bodyD);
  bodyPath.setAttribute('fill', shape.data.fill ?? 'transparent');
  bodyPath.setAttribute('stroke', stroke);
  bodyPath.setAttribute('stroke-width', String(strokeWidth));
  bodyPath.setAttribute('opacity', String(shape.data.opacity ?? 1));

  rimPath.setAttribute('d', rimD);
  rimPath.setAttribute('fill', 'none');
  rimPath.setAttribute('stroke', stroke);
  rimPath.setAttribute('stroke-width', String(strokeWidth));
  rimPath.setAttribute('opacity', String(shape.data.opacity ?? 1));
}

export function updateCloudPath(shape: any) {
  const { x, y, width, height, fill, stroke, strokeWidth, opacity } = shape.data;
  const d = buildCloudD(x, y, width, height);
  shape.element.setAttribute('d', d);
  shape.element.setAttribute('fill', shape.data.fill ?? 'transparent');
  shape.element.setAttribute('stroke', stroke);
  shape.element.setAttribute('stroke-width', String(strokeWidth));
  shape.element.setAttribute('opacity', String(opacity ?? 1));
}
