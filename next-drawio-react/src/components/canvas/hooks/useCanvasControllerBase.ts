import { useCallback } from 'react';
import type React from 'react';
import type { CanvasComponentProps, SVGShape } from '../canvas-types';
import { useCanvasControllerBase as useCanvasControllerBaseCore } from '@drawio/core';

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
  const setShapesState = useCallback((updater: (prev: SVGShape[]) => SVGShape[]) => {
    state.setShapes((prev) => {
      const next = updater(prev);
      state.shapesRef.current = next;
      return next;
    });
  }, [state]);

  return useCanvasControllerBaseCore({
    props,
    state: {
      svgRef: state.svgRef,
      shapes: state.shapes,
      selectedIds: state.selectedIds,
      history: state.history,
      historyIndex: state.historyIndex,
      setHistory: state.setHistory,
      setHistoryIndex: state.setHistoryIndex,
      setSelectedIds: (next) => state.setSelectedIds(next),
      setIsConnecting: state.setIsConnecting,
      setConnectionStart: state.setConnectionStart,
      setConnectionStartPort: state.setConnectionStartPort,
      setTempLine: state.setTempLine,
      shapeIdCounter: state.shapeIdCounter,
      portElementsRef: state.portElementsRef,
      setShapesState,
    },
  });
};
