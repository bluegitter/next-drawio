import { useCallback } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseCanvasMouseArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedShape: string | null;
  isConnecting: boolean;
  tempLine: SVGElement | null;
  skipNextCanvasClickClear: React.MutableRefObject<boolean>;
  disableSelectionBox?: boolean;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  pointToPolylineDistance: (x: number, y: number, points: Array<[number, number]>) => number;
  setIsSelectingBox: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectionRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
  setSelectedShape: (id: string | null) => void;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
  setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
  selectionOriginRef: React.MutableRefObject<{ x: number; y: number } | null>;
  onShapeSelect?: (shape: SVGElement | null) => void;
}

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
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (disableSelectionBox) return;
    if (e.target === svgRef.current) {
      const { x, y } = getPointerPosition(e.clientX, e.clientY);
      setIsSelectingBox(true);
      setSelectionRect({ x, y, w: 0, h: 0 });
      selectionOriginRef.current = { x, y };
      setSelectedShape(null);
      onShapeSelect?.(null);
    }
  }, [disableSelectionBox, getPointerPosition, onShapeSelect, selectionOriginRef, setIsSelectingBox, setSelectedShape, setSelectionRect, svgRef]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      if (skipNextCanvasClickClear.current) {
        skipNextCanvasClickClear.current = false;
        return;
      }
      let shouldClear = true;

      if (selectedShape) {
        const current = shapes.find(s => s.id === selectedShape);
        if (current && (current.type === 'line' || current.type === 'connector') && svgRef.current) {
          const { x, y } = getPointerPosition(e.clientX, e.clientY);
          const points: [number, number][] = current.type === 'connector'
            ? getConnectorPoints(current)
            : [[current.data.x1 || 0, current.data.y1 || 0], [current.data.x2 || 0, current.data.y2 || 0]];
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

      if (isConnecting && tempLine && svgRef.current) {
        svgRef.current.removeChild(tempLine);
        setTempLine(null);
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionStartPort(null);
    }
  }, [getConnectorPoints, getPointerPosition, isConnecting, onShapeSelect, pointToPolylineDistance, selectedShape, setConnectionStart, setConnectionStartPort, setIsConnecting, setSelectedShape, setTempLine, shapes, skipNextCanvasClickClear, svgRef, tempLine]);

  return { handleCanvasMouseDown, handleCanvasClick };
};
