import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseConnectionActionsArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  createSVGElement: (tagName: string) => SVGElement | null;
  getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setConnectionStartPort: (next: string | null) => void;
  setTempLine: (next: SVGElement | null) => void;
  setDraggingHandle: (next: { connectorId: string; end: 'start' | 'end'; original: any } | null) => void;
  handleConnectionRef: { value: boolean };
};

export const useConnectionActions = ({
  svgRef,
  shapes,
  createSVGElement,
  getPortPositionById,
  getShapeCenter,
  setIsConnecting,
  setConnectionStart,
  setConnectionStartPort,
  setTempLine,
  setDraggingHandle,
  handleConnectionRef,
}: UseConnectionActionsArgs) => {
  const startConnection = (fromShape: string, fromPortId?: string) => {
    setIsConnecting(true);
    setConnectionStart(fromShape);
    setConnectionStartPort(fromPortId || null);

    if (!svgRef.value) return;

    const temp = createSVGElement('line');
    if (temp) {
      temp.setAttribute('stroke', '#6b7280');
      temp.setAttribute('stroke-width', '2');
      temp.setAttribute('stroke-dasharray', '5,5');
      temp.setAttribute('pointer-events', 'none');

      const fromShapeObj = shapes.value.find((s) => s.id === fromShape);
      if (fromShapeObj) {
        const portPos = fromPortId ? getPortPositionById(fromShapeObj, fromPortId) : null;
        const startPoint = portPos || getShapeCenter(fromShapeObj);
        temp.setAttribute('x1', String(startPoint.x));
        temp.setAttribute('y1', String(startPoint.y));
        temp.setAttribute('x2', String(startPoint.x));
        temp.setAttribute('y2', String(startPoint.y));
      }

      svgRef.value.appendChild(temp);
      setTempLine(temp);
    }
  };

  const getConnectorHandleMouseDown = (connector: SVGShape, end: 'start' | 'end') => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      const original =
        end === 'start'
          ? {
              x: connector.data.x1 || 0,
              y: connector.data.y1 || 0,
              shapeId: connector.connections?.[0],
              portId: connector.data.startPortId,
              dash: connector.element.getAttribute('stroke-dasharray'),
            }
          : {
              x: connector.data.x2 || 0,
              y: connector.data.y2 || 0,
              shapeId: connector.connections?.[1],
              portId: connector.data.endPortId,
              dash: connector.element.getAttribute('stroke-dasharray'),
            };
      setDraggingHandle({ connectorId: connector.id, end, original });
      handleConnectionRef.value = true;
      setIsConnecting(true);
      connector.element.setAttribute('stroke-dasharray', '6,4');
    };
  };

  return { startConnection, getConnectorHandleMouseDown };
};
