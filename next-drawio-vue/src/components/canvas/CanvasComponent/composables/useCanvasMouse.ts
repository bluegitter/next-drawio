import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseCanvasMouseArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  selectedShape: Ref<string | null>;
  isConnecting: Ref<boolean>;
  tempLine: Ref<SVGElement | null>;
  skipNextCanvasClickClear: { value: boolean };
  disableSelectionBox?: boolean;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  pointToPolylineDistance: (x: number, y: number, points: Array<[number, number]>) => number;
  setIsSelectingBox: (next: boolean) => void;
  setSelectionRect: (next: { x: number; y: number; w: number; h: number } | null) => void;
  setSelectedShape: (id: string | null) => void;
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setConnectionStartPort: (next: string | null) => void;
  setTempLine: (next: SVGElement | null) => void;
  selectionOriginRef: { value: { x: number; y: number } | null };
  onShapeSelect?: (shape: SVGElement | null) => void;
};

export const useCanvasMouse = ({
  svgRef,
  shapes,
  selectedShape,
  isConnecting,
  tempLine,
  skipNextCanvasClickClear,
  disableSelectionBox = false,
  getPointerPosition,
  getConnectorPoints,
  pointToPolylineDistance,
  setIsSelectingBox,
  setSelectionRect,
  setSelectedShape,
  setIsConnecting,
  setConnectionStart,
  setConnectionStartPort,
  setTempLine,
  selectionOriginRef,
  onShapeSelect,
}: UseCanvasMouseArgs) => {
  const handleCanvasMouseDown = (e: MouseEvent) => {
    if (disableSelectionBox) return;
    if (e.target === svgRef.value) {
      const { x, y } = getPointerPosition(e.clientX, e.clientY);
      setIsSelectingBox(true);
      setSelectionRect({ x, y, w: 0, h: 0 });
      selectionOriginRef.value = { x, y };
      setSelectedShape(null);
      onShapeSelect?.(null);
    }
  };

  const handleCanvasClick = (e: MouseEvent) => {
    if (e.target === svgRef.value) {
      if (skipNextCanvasClickClear.value) {
        skipNextCanvasClickClear.value = false;
        return;
      }
      let shouldClear = true;

      if (selectedShape.value) {
        const current = shapes.value.find((s) => s.id === selectedShape.value);
        if (current && (current.type === 'line' || current.type === 'connector') && svgRef.value) {
          const { x, y } = getPointerPosition(e.clientX, e.clientY);
          const points: [number, number][] =
            current.type === 'connector'
              ? getConnectorPoints(current)
              : [
                  [current.data.x1 || 0, current.data.y1 || 0],
                  [current.data.x2 || 0, current.data.y2 || 0],
                ];
          const dist = pointToPolylineDistance(x, y, points);
          const tolerance = 8;
          if (dist <= tolerance) {
            shouldClear = false;
            setSelectedShape(current.id);
            onShapeSelect?.(current.element);
          }
        }
      }

      if (shouldClear) {
        setSelectedShape(null);
        onShapeSelect?.(null);
      }

      if (isConnecting.value && tempLine.value && svgRef.value) {
        svgRef.value.removeChild(tempLine.value);
        setTempLine(null);
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionStartPort(null);
    }
  };

  return { handleCanvasMouseDown, handleCanvasClick };
};
