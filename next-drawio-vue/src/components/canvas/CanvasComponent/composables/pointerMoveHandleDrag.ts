import type { SVGShape } from '../types';

type HandleConnectorDragArgs = {
  draggingHandle: { connectorId: string; end: 'start' | 'end'; original: any } | null;
  shapes: SVGShape[];
  x: number;
  y: number;
  target: EventTarget | null;
  hoveredShapeId: string | null;
  activePortHighlight: { shapeId: string; portId: string } | null;
  connectorHandleRef: { value: Map<string, { start: SVGCircleElement; end: SVGCircleElement }> };
  portElementsRef: { value: Map<string, SVGCircleElement[]> };
  setHoveredShapeId: (next: string | null) => void;
  setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  findNearestPortElement: (x: number, y: number) => SVGCircleElement | null;
  highlightPortStyle: (el: SVGCircleElement) => void;
  resetPortStyle: (el: SVGCircleElement) => void;
  showPorts: (shape: SVGShape) => void;
  hidePorts: (shapeId: string) => void;
  disableShapeHover?: boolean;
};

export const handleConnectorHandleDragMove = ({
  draggingHandle,
  shapes,
  x,
  y,
  target,
  hoveredShapeId,
  activePortHighlight,
  connectorHandleRef,
  portElementsRef,
  setHoveredShapeId,
  setActivePortHighlight,
  getShapeBounds,
  getConnectorPoints,
  updateConnectorPoints,
  findNearestPortElement,
  highlightPortStyle,
  resetPortStyle,
  showPorts,
  hidePorts,
  disableShapeHover = false,
}: HandleConnectorDragArgs) => {
  if (!draggingHandle) return false;

  const { connectorId, end } = draggingHandle;
  const connector = shapes.find((s) => s.id === connectorId);
  if (connector && (connector.type === 'connector' || connector.type === 'line')) {
    if (connector.type === 'connector' && (connector.data.points || connector.element instanceof SVGPolylineElement)) {
      const points = getConnectorPoints(connector);
      if (end === 'start') {
        points[0] = [x, y];
        connector.data.startPortId = null;
        if (connector.connections) connector.connections[0] = null;
      } else {
        points[points.length - 1] = [x, y];
        connector.data.endPortId = null;
        if (connector.connections) connector.connections[1] = null;
      }
      updateConnectorPoints(connector, points);
    } else if (end === 'start') {
      connector.element.setAttribute('x1', String(x));
      connector.element.setAttribute('y1', String(y));
      connector.data.x1 = x;
      connector.data.y1 = y;
      connector.data.startPortId = null;
      if (connector.connections) connector.connections[0] = null;
    } else {
      connector.element.setAttribute('x2', String(x));
      connector.element.setAttribute('y2', String(y));
      connector.data.x2 = x;
      connector.data.y2 = y;
      connector.data.endPortId = null;
      if (connector.connections) connector.connections[1] = null;
    }
    const handles = connectorHandleRef.value.get(connectorId);
    if (handles) {
      const handleEl = end === 'start' ? handles.start : handles.end;
      handleEl.setAttribute('cx', String(x));
      handleEl.setAttribute('cy', String(y));
    }

    if (disableShapeHover) {
      if (hoveredShapeId) {
        hidePorts(hoveredShapeId);
        setHoveredShapeId(null);
      }
      if (activePortHighlight) {
        const prev = portElementsRef.value
          .get(activePortHighlight.shapeId)
          ?.find((p) => p.getAttribute('data-port-id') === activePortHighlight.portId);
        if (prev) resetPortStyle(prev as SVGCircleElement);
        setActivePortHighlight(null);
      }
      return true;
    }

    const padding = 10;
    let hovered: SVGShape | null = null;
    for (let i = shapes.length - 1; i >= 0; i -= 1) {
      const shape = shapes[i];
      if (shape.type === 'connector') continue;
      const bounds = getShapeBounds(shape);
      if (
        x >= bounds.minX - padding &&
        x <= bounds.maxX + padding &&
        y >= bounds.minY - padding &&
        y <= bounds.maxY + padding
      ) {
        hovered = shape;
        break;
      }
    }
    if (hovered && hovered.id !== hoveredShapeId) {
      if (hoveredShapeId) hidePorts(hoveredShapeId);
      setHoveredShapeId(hovered.id);
      showPorts(hovered);
    } else if (!hovered && hoveredShapeId && !activePortHighlight) {
      hidePorts(hoveredShapeId);
      setHoveredShapeId(null);
    }

    const targetElement = target as SVGElement | null;
    const portElFromTarget = targetElement?.getAttribute?.('data-port-id') ? targetElement : null;
    const portEl = portElFromTarget || findNearestPortElement(x, y);
    if (portEl) {
      const shapeId = portEl.getAttribute('data-shape-id');
      const portId = portEl.getAttribute('data-port-id');
      if (shapeId && portId) {
        if (!activePortHighlight || activePortHighlight.shapeId !== shapeId || activePortHighlight.portId !== portId) {
          if (activePortHighlight) {
            const prev = portElementsRef.value
              .get(activePortHighlight.shapeId)
              ?.find((p) => p.getAttribute('data-port-id') === activePortHighlight.portId);
            if (prev) resetPortStyle(prev as SVGCircleElement);
          }
          highlightPortStyle(portEl as SVGCircleElement);
          setActivePortHighlight({ shapeId, portId });
        }
      }
    }
  }

  return true;
};
