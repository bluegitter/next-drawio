import { useCallback } from 'react';
import type React from 'react';
import { shapeRegistry, getPortsForShape } from '@drawio/core';
import type { ShapeDefinition } from '@drawio/core';
import type { SVGShape } from '../types';
import { formatPoints, getConnectorPoints } from '@drawio/core';

interface UseCanvasGeometryArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  shapeIdCounter: React.MutableRefObject<number>;
}

export const useCanvasGeometry = ({
  svgRef,
  shapes,
  shapeIdCounter,
}: UseCanvasGeometryArgs) => {
  const generateId = useCallback(() => `shape-${++shapeIdCounter.current}`, [shapeIdCounter]);

  const createSVGElement = useCallback((tagName: string) => {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }, []);

  const getDef = useCallback((shapeOrType: SVGShape | string): ShapeDefinition | undefined => {
    const type = typeof shapeOrType === 'string' ? shapeOrType : shapeOrType.type;
    return shapeRegistry[type];
  }, []);

  const getShapeCenter = useCallback((shape: SVGShape) => {
    const def = getDef(shape);
    if (def?.getCenter) return def.getCenter(shape);
    return { x: 0, y: 0 };
  }, [getDef]);

  const getPortPositionById = useCallback((shape: SVGShape, portId?: string | null) => {
    if (!portId) return null;
    const ports = getPortsForShape(shape);
    const port = ports.find(p => p.id === portId);
    if (!port) return null;

    // Apply shape transformations to port position
    const { rotation = 0, scale = 1 } = shape.data;
    if (rotation === 0 && scale === 1) {
      return port;
    }

    const center = getShapeCenter(shape);
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = port.x - center.x;
    const dy = port.y - center.y;
    const scaledX = dx * scale;
    const scaledY = dy * scale;
    const rx = scaledX * cos - scaledY * sin;
    const ry = scaledX * sin + scaledY * cos;

    return {
      ...port,
      x: center.x + rx,
      y: center.y + ry
    };
  }, [getShapeCenter]);

  const ensureConnectorPolylineElement = useCallback((shape: SVGShape, pointsString: string) => {
    if (shape.element instanceof SVGPolylineElement) return shape.element;
    if (!svgRef.current) return shape.element;
    const poly = createSVGElement('polyline');
    if (!poly) return shape.element;
    poly.setAttribute('id', shape.id);
    shape.element.getAttributeNames().forEach(name => {
      if (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2') return;
      const val = shape.element.getAttribute(name);
      if (val != null) poly.setAttribute(name, val);
    });
    poly.setAttribute('points', pointsString);
    if (!poly.getAttribute('fill')) poly.setAttribute('fill', 'none');
    svgRef.current.replaceChild(poly, shape.element);
    return poly;
  }, [createSVGElement, svgRef]);

  const updateConnectorPoints = useCallback((shape: SVGShape, points: Array<[number, number]>) => {
    if (points.length < 2) return;
    const pointsString = formatPoints(points);
    const first = points[0];
    const last = points[points.length - 1];
    shape.data.points = pointsString;
    shape.data.x1 = first[0];
    shape.data.y1 = first[1];
    shape.data.x2 = last[0];
    shape.data.y2 = last[1];
    const el = ensureConnectorPolylineElement(shape, pointsString);
    if (el instanceof SVGPolylineElement) {
      el.setAttribute('points', pointsString);
      el.setAttribute('fill', 'none');
    } else {
      el.setAttribute('x1', String(first[0]));
      el.setAttribute('y1', String(first[1]));
      el.setAttribute('x2', String(last[0]));
      el.setAttribute('y2', String(last[1]));
    }
    shape.element = el;
  }, [ensureConnectorPolylineElement]);

  const updatePolylinePoints = useCallback((shape: SVGShape, points: Array<[number, number]>) => {
    if (points.length < 2) return;
    const pointsString = formatPoints(points);
    if (shape.element instanceof SVGPolylineElement) {
      shape.element.setAttribute('points', pointsString);
    }
    shape.data.points = pointsString;
  }, []);

  const isLineConnected = useCallback((shape: SVGShape) => {
    if (shape.type !== 'line' && shape.type !== 'connector') return true;
    if (!shape.connections || shape.connections.length === 0) return false;
    const [from, to] = shape.connections as Array<string | null | undefined>;
    return Boolean(from) || Boolean(to);
  }, []);

  const getShapeBounds = useCallback((shape: SVGShape) => {
    const def = getDef(shape);
    if (def?.getBounds) return def.getBounds(shape);
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }, [getDef]);

  const getBounds = useCallback((shape: SVGShape) => {
    const b = getShapeBounds(shape);
    return { x: b.minX, y: b.minY, w: b.maxX - b.minX, h: b.maxY - b.minY };
  }, [getShapeBounds]);

  const updateConnectionLine = useCallback((connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => {
    const source = shapeList || shapes;
    const shape = source.find(s => s.id === shapeId);
    if (!shape) return;

    const [fromShapeId, toShapeId] = (connLine.connections || []) as Array<string | null | undefined>;
    const isStart = fromShapeId === shapeId;
    const isEnd = toShapeId === shapeId;

    if (!isStart && !isEnd) return;

    const portId = isStart ? connLine.data.startPortId : connLine.data.endPortId;
    const anchor = portId ? getPortPositionById(shape, portId) : null;
    const point = anchor || getShapeCenter(shape);

    if (connLine.type === 'connector' && (connLine.data.points || connLine.element instanceof SVGPolylineElement)) {
      const points = getConnectorPoints(connLine);
      if (isStart) points[0] = [point.x, point.y];
      if (isEnd) points[points.length - 1] = [point.x, point.y];
      updateConnectorPoints(connLine, points);
      return;
    }

    if (isStart) {
      connLine.element.setAttribute('x1', String(point.x));
      connLine.element.setAttribute('y1', String(point.y));
      connLine.data.x1 = point.x;
      connLine.data.y1 = point.y;
    }
    if (isEnd) {
      connLine.element.setAttribute('x2', String(point.x));
      connLine.element.setAttribute('y2', String(point.y));
      connLine.data.x2 = point.x;
      connLine.data.y2 = point.y;
    }
  }, [getPortPositionById, getShapeCenter, shapes, updateConnectorPoints]);

  return {
    generateId,
    createSVGElement,
    getDef,
    getShapeCenter,
    getPortPositionById,
    ensureConnectorPolylineElement,
    updateConnectorPoints,
    updatePolylinePoints,
    isLineConnected,
    getShapeBounds,
    getBounds,
    updateConnectionLine,
  };
};
