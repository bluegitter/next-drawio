import type { SVGShape } from '../types';

type FinalizeHandleConnectionArgs = {
  draggingHandle: { connectorId: string; end: 'start' | 'end'; original: any } | null;
  point: { x: number; y: number };
  targetEl: SVGElement | null;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  activePortHighlight: { shapeId: string; portId: string } | null;
  hoveredShapeId: string | null;
  handleConnectionRef: { value: boolean };
  portElementsRef: { value: Map<string, SVGCircleElement[]> };
  setDraggingHandle: (next: { connectorId: string; end: 'start' | 'end'; original: any } | null) => void;
  setIsConnecting: (next: boolean) => void;
  setSelectedShape: (id: string | null) => void;
  setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
  setHoveredShapeId: (next: string | null) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  findNearestPortElement: (x: number, y: number) => SVGCircleElement | null;
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  showConnectorHandles: (shape: SVGShape) => void;
  hidePorts: (shapeId: string) => void;
  resetPortStyle: (el: SVGCircleElement) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
};

export const finalizeHandleConnection = ({
  draggingHandle,
  point,
  targetEl,
  shapes,
  selectedIds,
  activePortHighlight,
  hoveredShapeId,
  handleConnectionRef,
  portElementsRef,
  setDraggingHandle,
  setIsConnecting,
  setSelectedShape,
  setActivePortHighlight,
  setHoveredShapeId,
  setShapesState,
  findNearestPortElement,
  getConnectorPoints,
  getPortPositionById,
  getShapeCenter,
  updateConnectorPoints,
  showConnectorHandles,
  hidePorts,
  resetPortStyle,
  onShapeSelect,
  saveToHistory,
}: FinalizeHandleConnectionArgs) => {
  if (!draggingHandle) return;
  const { connectorId, end, original } = draggingHandle;

  let targetPortId = activePortHighlight?.portId || null;
  let targetPortShapeId = activePortHighlight?.shapeId || null;
  if (!targetPortId) {
    const nearest = findNearestPortElement(point.x, point.y);
    if (nearest) {
      targetPortId = nearest.getAttribute('data-port-id');
      targetPortShapeId = nearest.getAttribute('data-shape-id');
    }
  }
  if (!targetPortId && targetEl && targetEl.getAttribute?.('data-port-id')) {
    targetPortId = targetEl.getAttribute('data-port-id');
    targetPortShapeId = targetEl.getAttribute('data-shape-id');
  }

  const connectorIndex = shapes.findIndex((s) => s.id === connectorId);
  if (connectorIndex >= 0) {
    const edge = {
      ...shapes[connectorIndex],
      data: { ...shapes[connectorIndex].data },
      connections: [...(shapes[connectorIndex].connections || [])],
    };
    const newShapes = shapes.map((shape, idx) => (idx === connectorIndex ? edge : shape));

    const applyResult = (newPoint: { x: number; y: number }, newShapeId: string | null, newPortId: string | null) => {
      if (edge.type === 'connector' && (edge.data.points || edge.element instanceof SVGPolylineElement)) {
        const points = getConnectorPoints(edge);
        if (end === 'start') {
          points[0] = [newPoint.x, newPoint.y];
          edge.data.startPortId = newPortId;
        } else {
          points[points.length - 1] = [newPoint.x, newPoint.y];
          edge.data.endPortId = newPortId;
        }
        updateConnectorPoints(edge, points);
      } else if (end === 'start') {
        edge.data.x1 = newPoint.x;
        edge.data.y1 = newPoint.y;
        edge.data.startPortId = newPortId;
        edge.element.setAttribute('x1', String(newPoint.x));
        edge.element.setAttribute('y1', String(newPoint.y));
      } else {
        edge.data.x2 = newPoint.x;
        edge.data.y2 = newPoint.y;
        edge.data.endPortId = newPortId;
        edge.element.setAttribute('x2', String(newPoint.x));
        edge.element.setAttribute('y2', String(newPoint.y));
      }
      edge.connections = (edge.connections as Array<string | null> | undefined) || [null, null];
      edge.connections[end === 'start' ? 0 : 1] = newShapeId;
    };

    const connectToShape = (targetShape: SVGShape, portId: string | null) => {
      let newPoint = point;
      let newPortId = portId;
      if (portId) {
        const pos = getPortPositionById(targetShape, portId);
        if (pos) newPoint = { x: pos.x, y: pos.y };
      } else {
        const center = getShapeCenter(targetShape);
        newPoint = center;
        newPortId = null;
      }
      applyResult(newPoint, targetShape.id, newPortId);
    };

    if (edge.type === 'connector' || edge.type === 'line') {
      const oldShapeId = original.shapeId || null;
      if (targetPortId && targetPortShapeId) {
        const targetShape = newShapes.find((s) => s.id === targetPortShapeId);
        if (targetShape) connectToShape(targetShape, targetPortId);
      } else {
        const targetShape = newShapes.find((s) => targetEl && (s.element === targetEl || s.element.contains(targetEl)));
        if (targetShape) connectToShape(targetShape, null);
      }

      const updatedShapes = newShapes.map((shape) => {
        if (shape.type === 'connector') return shape;
        let connections = shape.connections || [];
        if (oldShapeId && shape.id === oldShapeId) {
          connections = connections.filter((c) => c !== connectorId);
        }
        const newShapeId = edge.connections?.[end === 'start' ? 0 : 1];
        if (newShapeId && shape.id === newShapeId && !connections.includes(connectorId)) {
          connections = [...connections, connectorId];
        }
        if (connections !== shape.connections) {
          return { ...shape, connections };
        }
        return shape;
      });

      edge.element.setAttribute('stroke-dasharray', original.dash || '');
      showConnectorHandles(edge);

      const finalShapes = updatedShapes.map((shape) => (shape.id === connectorId ? edge : shape));
      setShapesState(() => finalShapes);
      setSelectedShape(connectorId);
      onShapeSelect?.(edge.element);
      saveToHistory(finalShapes, selectedIds);
    }
  }

  setDraggingHandle(null);
  if (handleConnectionRef.value) {
    setIsConnecting(false);
    handleConnectionRef.value = false;
  }
  if (activePortHighlight) {
    const prev = portElementsRef.value
      .get(activePortHighlight.shapeId)
      ?.find((p) => p.getAttribute('data-port-id') === activePortHighlight.portId);
    if (prev) resetPortStyle(prev);
    setActivePortHighlight(null);
  }
  if (hoveredShapeId) {
    hidePorts(hoveredShapeId);
    setHoveredShapeId(null);
  }
};
