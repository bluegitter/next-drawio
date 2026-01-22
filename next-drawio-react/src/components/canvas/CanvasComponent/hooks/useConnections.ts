import { useCallback } from 'react';
import type React from 'react';
import { getPortsForShape } from '@drawio/core';
import type { SVGShape } from '../types';

interface UseConnectionsArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  portElementsRef: React.MutableRefObject<Map<string, SVGElement[]>>;
  connectorHandleRef: React.MutableRefObject<
    Map<string, { start: SVGCircleElement; end: SVGCircleElement }>
  >;
  activePortHighlight: { shapeId: string; portId: string } | null;
  setActivePortHighlight: React.Dispatch<
    React.SetStateAction<{ shapeId: string; portId: string } | null>
  >;
  createSVGElement: (tagName: string) => SVGElement | null;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  getConnectorHandleMouseDown: (
    connector: SVGShape,
    end: 'start' | 'end'
  ) => (e: MouseEvent) => void;
}

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
  const resetPortStyle = useCallback((portEl: SVGElement) => {
    portEl.setAttribute('fill', '#22c55e');
    portEl.setAttribute('stroke', '#0f9f4f');
    portEl.setAttribute('stroke-width', '2');
    portEl.setAttribute('r', '5');
  }, []);

  const highlightPortStyle = useCallback((portEl: SVGElement) => {
    portEl.setAttribute('fill', '#fbbf24');
    portEl.setAttribute('stroke', '#d97706');
    portEl.setAttribute('stroke-width', '2.5');
    portEl.setAttribute('r', '7');
  }, []);

  const findNearestPortElement = useCallback(
    (x: number, y: number, maxDistance = 14) => {
      let nearest: { el: SVGCircleElement; dist: number } | null = null;
      for (const portList of portElementsRef.current.values()) {
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
    },
    [portElementsRef]
  );

  const hidePorts = useCallback(
    (shapeId?: string) => {
      if (shapeId) {
        const ports = portElementsRef.current.get(shapeId);
        ports?.forEach(port => resetPortStyle(port));
        ports?.forEach(port => port.remove());
        portElementsRef.current.delete(shapeId);
        return;
      }
      portElementsRef.current.forEach(portList => {
        portList.forEach(port => resetPortStyle(port));
        portList.forEach(port => port.remove());
      });
      portElementsRef.current.clear();
      if (activePortHighlight?.shapeId) {
        setActivePortHighlight(null);
      }
    },
    [activePortHighlight?.shapeId, portElementsRef, resetPortStyle, setActivePortHighlight]
  );

  const showPorts = useCallback(
    (shape: SVGShape) => {
      if (!svgRef.current) return;
      hidePorts(shape.id);
      const ports = getPortsForShape(shape);
      const created: SVGElement[] = [];

      ports.forEach(port => {
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
        svgRef.current!.appendChild(portCircle);
        portCircle.dataset.listenerId = 'port';
      });

      portElementsRef.current.set(shape.id, created);
    },
    [createSVGElement, hidePorts, portElementsRef, startConnection, svgRef]
  );

  const hideConnectorHandles = useCallback(
    (connectorId?: string) => {
      if (connectorId) {
        const handles = connectorHandleRef.current.get(connectorId);
        if (handles) {
          handles.start.remove();
          handles.end.remove();
        }
        connectorHandleRef.current.delete(connectorId);
        return;
      }
      connectorHandleRef.current.forEach(pair => {
        pair.start.remove();
        pair.end.remove();
      });
      connectorHandleRef.current.clear();
    },
    [connectorHandleRef]
  );

  const showConnectorHandles = useCallback(
    (connector: SVGShape) => {
      if (!svgRef.current) return;
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
        svgRef.current!.appendChild(c);
        return c;
      };

      const startHandle = createHandle(connector.data.x1 || 0, connector.data.y1 || 0, 'start');
      const endHandle = createHandle(connector.data.x2 || 0, connector.data.y2 || 0, 'end');
      if (startHandle && endHandle) {
        connectorHandleRef.current.set(connector.id, { start: startHandle, end: endHandle });
      }
    },
    [
      connectorHandleRef,
      createSVGElement,
      getConnectorHandleMouseDown,
      hideConnectorHandles,
      svgRef,
    ]
  );

  const refreshPortsPosition = useCallback(
    (shape: SVGShape) => {
      const ports = portElementsRef.current.get(shape.id);
      if (!ports || ports.length === 0) return;
      const portPositions = getPortsForShape(shape);
      ports.forEach(portEl => {
        const portId = portEl.getAttribute('data-port-id');
        const pos = portPositions.find(p => p.id === portId);
        if (pos) {
          portEl.setAttribute('cx', String(pos.x));
          portEl.setAttribute('cy', String(pos.y));
        }
      });
    },
    [portElementsRef]
  );

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
