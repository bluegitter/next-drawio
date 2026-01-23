import type { ShapeDefinition } from '../../shapes';
import type { SVGShape } from '../types';
import { decodeDataUri, toDataUri } from '../utils/svgDataUri';
import { formatPoints } from '../utils/points';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

type UseShapeCreationArgs = {
  svgRef: RefLike<SVGSVGElement>;
  shapes: MaybeRef<SVGShape[]>;
  createSVGElement: (tagName: string) => SVGElement | null;
  generateId: () => string;
  getDef: (shapeOrType: SVGShape | string) => ShapeDefinition | undefined;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedShape: (id: string | null) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  selectedIds: MaybeRef<Set<string>>;
  tempLine: RefLike<SVGElement>;
  setTempLine: (next: SVGElement | null) => void;
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setConnectionStartPort: (next: string | null) => void;
};

export const useShapeCreation = ({
  svgRef,
  shapes,
  createSVGElement,
  generateId,
  getDef,
  getShapeBounds,
  getShapeCenter,
  getPortPositionById,
  setShapesState,
  setSelectedShape,
  saveToHistory,
  onShapeSelect,
  selectedIds,
  tempLine,
  setTempLine,
  setIsConnecting,
  setConnectionStart,
  setConnectionStartPort,
}: UseShapeCreationArgs) => {
  const addShape = (type: string, options?: any, dropPosition?: { x: number; y: number }) => {
    const svg = getRefValue(svgRef);
    if (!svg) return;
    const def = getDef(type);
    if (!def?.create) return;
    try {
      const created = def.create({ createSVGElement, generateId }, options) as SVGShape;
      const newShape: SVGShape = {
        ...created,
        type: (def.type as SVGShape['type']) || (type as SVGShape['type']),
        connections: created.connections ?? [],
      };
      svg.appendChild(newShape.element);

      if (dropPosition) {
        const bounds = getShapeBounds(newShape);
        const dx = dropPosition.x - bounds.minX;
        const dy = dropPosition.y - bounds.minY;
        const shapeDef = getDef(newShape);
        if (shapeDef?.move) {
          shapeDef.move(newShape, dx, dy);
        } else if ('x' in newShape.data && 'y' in newShape.data) {
          const nextX = (newShape.data.x || 0) + dx;
          const nextY = (newShape.data.y || 0) + dy;
          newShape.element.setAttribute('x', String(nextX));
          newShape.element.setAttribute('y', String(nextY));
          newShape.data.x = nextX;
          newShape.data.y = nextY;
        }
      }

      setShapesState((prev) => {
        const updated = [...prev, newShape];
        saveToHistory(updated, newShape.id);
        return updated;
      });
      setSelectedShape(newShape.id);
      onShapeSelect?.(newShape.element);
    } catch (err) {
      console.error('Failed to create shape', err);
    }
  };

  const addRectangle = () => addShape('rect');
  const addRoundedRect = () => addShape('roundedRect');
  const addCircle = () => addShape('circle');
  const addTriangle = () => addShape('triangle');
  const addLine = () => addShape('line');
  const addPolyline = () => addShape('polyline');
  const addText = () => addShape('text');

  const addSvgIcon = (
    href: string,
    options?: { width?: number; height?: number; position?: { x: number; y: number }; iconName?: string }
  ) => {
    const { position, iconName, ...rest } = options || {};
    const isDataUri = href.startsWith('data:image/svg+xml');
    if (isDataUri) {
      const svgText = decodeDataUri(href);
      addShape('image', { href, width: rest.width, height: rest.height, svgText, iconName }, position);
      return;
    }

    if (href.endsWith('.svg') || href.startsWith('/')) {
      (async () => {
        try {
          const res = await fetch(href);
          const text = await res.text();
          const dataUri = toDataUri(text);
          addShape('image', { href: dataUri || href, width: rest.width, height: rest.height, svgText: text, iconName }, position);
        } catch (err) {
          console.warn('Failed to load svg icon, fallback original href', err);
          addShape('image', { href, width: rest.width, height: rest.height, iconName }, position);
        }
      })();
    } else {
      addShape('image', { href, width: rest.width, height: rest.height, iconName }, position);
    }
  };

  const addShapeAt = (type: string, position: { x: number; y: number }) => {
    addShape(type, undefined, position);
  };

  const connectShapes = (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => {
    const svg = getRefValue(svgRef);
    const shapeList = getRefValue(shapes) || [];
    if (!svg || fromShape === toShape) return;

    const fromShapeObj = shapeList.find((s) => s.id === fromShape);
    const toShapeObj = shapeList.find((s) => s.id === toShape);

    if (!fromShapeObj || !toShapeObj) return;

    const fromPoint = (fromPortId ? getPortPositionById(fromShapeObj, fromPortId) : null) || getShapeCenter(fromShapeObj);
    const toPoint = (toPortId ? getPortPositionById(toShapeObj, toPortId) : null) || getShapeCenter(toShapeObj);

    const connector = createSVGElement('polyline');
    if (!connector) return;

    const connId = generateId();
    connector.setAttribute('id', connId);
    const pointsString = formatPoints([
      [fromPoint.x, fromPoint.y],
      [toPoint.x, toPoint.y],
    ]);
    connector.setAttribute('points', pointsString);
    connector.setAttribute('stroke', '#6b7280');
    connector.setAttribute('stroke-width', '2');
    connector.setAttribute('fill', 'none');
    connector.setAttribute('cursor', 'pointer');

    const newShape: SVGShape = {
      id: connId,
      type: 'connector',
      element: connector,
      data: {
        x1: fromPoint.x,
        y1: fromPoint.y,
        x2: toPoint.x,
        y2: toPoint.y,
        points: pointsString,
        startPortId: fromPortId || null,
        endPortId: toPortId || null,
        fill: 'none',
        stroke: '#6b7280',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [fromShape, toShape],
    };

    svg.appendChild(connector);

    const updatedShapes = shapeList.map((shape) => {
      if (shape.id === fromShape) {
        return { ...shape, connections: [...(shape.connections || []), connId] };
      }
      if (shape.id === toShape) {
        return { ...shape, connections: [...(shape.connections || []), connId] };
      }
      return shape;
    });

    const finalShapes = [...updatedShapes, newShape];
    setShapesState(() => finalShapes);

    const temp = getRefValue(tempLine);
    if (temp && svg.contains(temp)) {
      svg.removeChild(temp);
      setTempLine(null);
    }

    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionStartPort(null);
    saveToHistory(finalShapes, getRefValue(selectedIds) || new Set());
  };

  return {
    addShape,
    addRectangle,
    addRoundedRect,
    addCircle,
    addTriangle,
    addLine,
    addPolyline,
    addText,
    addSvgIcon,
    addShapeAt,
    connectShapes,
  };
};
