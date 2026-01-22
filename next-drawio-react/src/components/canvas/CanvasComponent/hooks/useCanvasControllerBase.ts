import { useCallback } from 'react';
import type React from 'react';
import type { CanvasComponentProps, SVGShape } from '../types';
import { useHistory } from './useHistory';
import { useCanvasGeometry } from './useCanvasGeometry';
import { useCanvasDerived } from './useCanvasDerived';
import { parsePoints } from '@drawio/core';

interface UseCanvasControllerBaseArgs {
  props: CanvasComponentProps;
  state: {
    svgRef: React.RefObject<SVGSVGElement>;
    shapes: SVGShape[];
    shapesRef: React.MutableRefObject<SVGShape[]>;
    setShapes: React.Dispatch<React.SetStateAction<SVGShape[]>>;
    selectedIds: Set<string>;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    history: any[];
    setHistory: React.Dispatch<React.SetStateAction<any[]>>;
    historyIndex: number;
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
    setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
    setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
    setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
    setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
    shapeIdCounter: React.MutableRefObject<number>;
    portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
  };
}

export const useCanvasControllerBase = ({ props, state }: UseCanvasControllerBaseArgs) => {
  const {
    onShapeSelect,
    onCanvasChange,
  } = props;
  const {
    svgRef,
    shapes,
    shapesRef,
    setShapes,
    selectedIds,
    setSelectedIds,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    setIsConnecting,
    setConnectionStart,
    setConnectionStartPort,
    setTempLine,
    shapeIdCounter,
    portElementsRef,
  } = state;

  const setShapesState = useCallback((updater: (prev: SVGShape[]) => SVGShape[]) => {
    setShapes(prev => {
      const next = updater(prev);
      shapesRef.current = next;
      return next;
    });
  }, [setShapes, shapesRef]);

  const historyActions = useHistory({
    svgRef,
    shapes,
    selectedIds,
    history,
    historyIndex,
    setHistory,
    setHistoryIndex,
    setShapesState,
    setSelectedIds,
    setIsConnecting,
    setConnectionStart,
    setTempLine,
    setConnectionStartPort,
    portElementsRef,
    onShapeSelect,
    onCanvasChange,
  });

  const geometry = useCanvasGeometry({
    svgRef,
    shapes,
    shapeIdCounter,
  });

  const derived = useCanvasDerived({
    shapes,
    selectedIds,
    getShapeBounds: geometry.getShapeBounds,
    parsePoints,
  });

  return {
    setShapesState,
    historyActions,
    geometry,
    derived,
  };
};
