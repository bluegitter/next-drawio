import type { Ref } from 'vue';
import { getPortsForShape } from '@drawio/core';
import type { SVGShape } from '../types';

type UseConnectionsArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  portElementsRef: { value: Map<string, SVGElement[]> };
  connectorHandleRef: { value: Map<string, { start: SVGCircleElement; end: SVGCircleElement }> };
  activePortHighlight: Ref<{ shapeId: string; portId: string } | null>;
  setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
  createSVGElement: (tagName: string) => SVGElement | null;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  getConnectorHandleMouseDown: (connector: SVGShape, end: 'start' | 'end') => (e: MouseEvent) => void;
};

export const useConnections = ({
  svgRef,
  portElementsRef,
  connectorHandleRef,
  activePortHighlight,
  setActivePortHighlight,
  createSVGElement,
  startConnection,
  getConnectorHandleMouseDown,
}: UseConnectionsArgs) => {
  const resetPortStyle = (portEl: SVGElement) => {
    portEl.setAttribute('fill', '#22c55e');
    portEl.setAttribute('stroke', '#0f9f4f');
    portEl.setAttribute('stroke-width', '2');
    portEl.setAttribute('r', '5');
  };

  const highlightPortStyle = (portEl: SVGElement) => {
    portEl.setAttribute('fill', '#fbbf24');
    portEl.setAttribute('stroke', '#d97706');
    portEl.setAttribute('stroke-width', '2.5');
    portEl.setAttribute('r', '7');
  };

  const findNearestPortElement = (x: number, y: number, maxDistance = 14) => {
    let nearest: { el: SVGCircleElement; dist: number } | null = null;
    for (const portList of portElementsRef.value.values()) {
      for (const port of portList) {
        const cx = Number(port.getAttribute('cx'));
        const cy = Number(port.getAttribute('cy'));
        const dist = Math.hypot(cx - x, cy - y);
        if (dist <= maxDistance && (!nearest || dist < nearest.dist)) {
          nearest = { el: port as SVGCircleElement, dist };
        }
      }
    }
    return nearest ? nearest.el : null;
  };

  const hidePorts = (shapeId?: string) => {
    if (shapeId) {
      const ports = portElementsRef.value.get(shapeId);
      ports?.forEach((port) => resetPortStyle(port));
      ports?.forEach((port) => port.remove());
      portElementsRef.value.delete(shapeId);
      return;
    }
    portElementsRef.value.forEach((portList) => {
      portList.forEach((port) => resetPortStyle(port));
      portList.forEach((port) => port.remove());
    });
    portElementsRef.value.clear();
    if (activePortHighlight.value?.shapeId) {
      setActivePortHighlight(null);
    }
  };

  const showPorts = (shape: SVGShape) => {
    if (!svgRef.value) return;
    hidePorts(shape.id);
    const ports = getPortsForShape(shape);
    const created: SVGElement[] = [];

    ports.forEach((port) => {
      const portCircle = createSVGElement('circle');
      if (!portCircle) return;
      portCircle.setAttribute('cx', String(port.x));
      portCircle.setAttribute('cy', String(port.y));
      portCircle.setAttribute('r', '5');
      portCircle.setAttribute('fill', '#22c55e');
      portCircle.setAttribute('stroke', '#0f9f4f');
      portCircle.setAttribute('stroke-width', '1.5');
      portCircle.setAttribute('data-shape-id', shape.id);
      portCircle.setAttribute('data-port-id', port.id);
      portCircle.setAttribute('cursor', 'crosshair');
      portCircle.style.opacity = '0.9';

      const handlePortMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        startConnection(shape.id, port.id);
      };

      portCircle.addEventListener('mousedown', handlePortMouseDown);
      created.push(portCircle);
      svgRef.value?.appendChild(portCircle);
      (portCircle as SVGCircleElement).dataset.listenerId = 'port';
    });

    portElementsRef.value.set(shape.id, created);
  };

  const hideConnectorHandles = (connectorId?: string) => {
    if (connectorId) {
      const handles = connectorHandleRef.value.get(connectorId);
      if (handles) {
        handles.start.remove();
        handles.end.remove();
      }
      connectorHandleRef.value.delete(connectorId);
      return;
    }
    connectorHandleRef.value.forEach((pair) => {
      pair.start.remove();
      pair.end.remove();
    });
    connectorHandleRef.value.clear();
  };

  const showConnectorHandles = (connector: SVGShape) => {
    if (!svgRef.value) return;
    if (connector.type !== 'connector' && connector.type !== 'line') return;
    hideConnectorHandles(connector.id);

    const createHandle = (x: number, y: number, end: 'start' | 'end') => {
      const c = createSVGElement('circle') as SVGCircleElement | null;
      if (!c) return null;
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', '6');
      c.setAttribute('fill', '#22c55e');
      c.setAttribute('stroke', '#0f9f4f');
      c.setAttribute('stroke-width', '2');
      c.setAttribute('data-connector-id', connector.id);
      c.setAttribute('data-end', end);
      c.setAttribute('cursor', 'default');
      c.style.opacity = '0.9';
      c.addEventListener('mousedown', getConnectorHandleMouseDown(connector, end));
      svgRef.value?.appendChild(c);
      return c;
    };

    const startHandle = createHandle(connector.data.x1 || 0, connector.data.y1 || 0, 'start');
    const endHandle = createHandle(connector.data.x2 || 0, connector.data.y2 || 0, 'end');
    if (startHandle && endHandle) {
      connectorHandleRef.value.set(connector.id, { start: startHandle, end: endHandle });
    }
  };

  const refreshPortsPosition = (shape: SVGShape) => {
    const ports = portElementsRef.value.get(shape.id);
    if (!ports || ports.length === 0) return;
    const portPositions = getPortsForShape(shape);
    ports.forEach((portEl) => {
      const portId = portEl.getAttribute('data-port-id');
      const pos = portPositions.find((p) => p.id === portId);
      if (pos) {
        portEl.setAttribute('cx', String(pos.x));
        portEl.setAttribute('cy', String(pos.y));
      }
    });
  };

  return {
    resetPortStyle,
    highlightPortStyle,
    findNearestPortElement,
    hidePorts,
    showPorts,
    hideConnectorHandles,
    showConnectorHandles,
    refreshPortsPosition,
  };
};
