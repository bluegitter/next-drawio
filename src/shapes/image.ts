import { ShapeDefinition, ShapeContext, Bounds, Point } from './types';

type PortPoint = { id: string; x: number; y: number; position?: string };

const buildTransformerPorts = ({ x, y, width, height, shapeId }: { x: number; y: number; width: number; height: number; shapeId: string }): PortPoint[] => {
  const cx = x + width / 2.65;
  const cy = y + height / 2;
  return [
    { id: `${shapeId}-port-top`, x: cx - width * 0.03, y: y + height * 0.08, position: 'top' },
    { id: `${shapeId}-port-right`, x: x + width * 0.87, y: cy, position: 'right' },
    { id: `${shapeId}-port-bottom`, x: cx- width * 0.03, y: y + height * 0.92, position: 'bottom' },
  ];
};

const buildVerticalTwoPorts = ({ x, y, width, height, shapeId }: { x: number; y: number; width: number; height: number; shapeId: string }): PortPoint[] => {
  const cx = x + width * 0.5;
  return [
    { id: `${shapeId}-port-top`, x: cx + width * 0.08, y: y , position: 'top' },
    { id: `${shapeId}-port-bottom`, x: cx + width * 0.08, y: y + height, position: 'bottom' },
  ];
};

const buildHorizontalTwoPorts = ({ x, y, width, height, shapeId }: { x: number; y: number; width: number; height: number; shapeId: string }): PortPoint[] => {
  const cy = y + height * 0.5;
  return [
    { id: `${shapeId}-port-left`, x: x , y: cy, position: 'left' },
    { id: `${shapeId}-port-right`, x: x + width , y: cy, position: 'right' },
  ];
};

const PORT_BUILDERS: Record<string, (params: { x: number; y: number; width: number; height: number; shapeId: string }) => PortPoint[]> = {
  // 三圈变压器系列
  '三圈变压器': buildTransformerPorts,
  '三圈变压器-1': buildTransformerPorts,
  '三圈变压器2': buildTransformerPorts,
  '/icons/三圈变压器.svg': buildTransformerPorts,
  '/icons/三圈变压器-1.svg': buildTransformerPorts,
  '/icons/三圈变压器2.svg': buildTransformerPorts,

  // 垂直类开关/隔离开关
  '隔离开关': buildVerticalTwoPorts,
  '隔离开关-1': buildVerticalTwoPorts,
  '接地刀闸-分': buildVerticalTwoPorts,
  '接地刀闸-合': buildVerticalTwoPorts,
  '刀闸开关': buildVerticalTwoPorts,
  '断路器': buildHorizontalTwoPorts,
  '/icons/隔离开关.svg': buildVerticalTwoPorts,
  '/icons/隔离开关-1.svg': buildVerticalTwoPorts,
  '/icons/接地刀闸-分.svg': buildVerticalTwoPorts,
  '/icons/接地刀闸-合.svg': buildVerticalTwoPorts,
  '/icons/刀闸开关.svg': buildVerticalTwoPorts,
  '/icons/断路器.svg': buildVerticalTwoPorts,

  // 横置的端口（预留，如有横向断路器）
  '/icons/断路器-横向.svg': buildHorizontalTwoPorts,
};

const resolvePortBuilder = (shape: any) => {
  const keys = [
    shape?.data?.iconName as string | undefined,
    shape?.data?.originalHref as string | undefined,
    shape?.data?.href as string | undefined,
  ].filter(Boolean) as string[];

  for (const k of keys) {
    const builder = PORT_BUILDERS[k];
    if (builder) return builder;
  }
  return null;
};

const applyTransformToPorts = (
  shape: any,
  ports: PortPoint[]
): PortPoint[] => {
  const { x = 0, y = 0, width = 0, height = 0, rotation = 0, scale = 1, flipX = false, flipY = false } = shape.data || {};
  const cx = x + width / 2;
  const cy = y + height / 2;

  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const sx = scale * (flipX ? -1 : 1);
  const sy = scale * (flipY ? -1 : 1);

  return ports.map(port => {
    const dx = port.x - cx;
    const dy = port.y - cy;

    // 先应用翻转+缩放，再旋转
    const scaledX = dx * sx;
    const scaledY = dy * sy;
    const rx = scaledX * cos - scaledY * sin;
    const ry = scaledX * sin + scaledY * cos;

    return {
      ...port,
      x: cx + rx,
      y: cy + ry,
    };
  });
};

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
    const { x = 0, y = 0, width = 0, height = 0 } = shape.data;
    const builder = resolvePortBuilder(shape);
    const basePorts = builder
      ? builder({ x, y, width, height, shapeId: shape.id })
      : [
        { id: `${shape.id}-port-top`, x: x + width / 2, y, position: 'top' },
        { id: `${shape.id}-port-right`, x: x + width, y: y + height / 2, position: 'right' },
        { id: `${shape.id}-port-bottom`, x: x + width / 2, y: y + height, position: 'bottom' },
        { id: `${shape.id}-port-left`, x, y: y + height / 2, position: 'left' },
      ];

    return applyTransformToPorts(shape, basePorts);
  },
};
