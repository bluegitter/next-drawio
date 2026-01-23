import type { CanvasComponentProps, SVGShape } from '../types';
import { useCanvasControllerBase as useCanvasControllerBaseCore } from '@drawio/core';
import type { CanvasState } from './useCanvasState';

export const useCanvasControllerBase = ({
  props,
  state,
}: {
  props: CanvasComponentProps;
  state: CanvasState;
}) => {
  const setShapesState = (updater: (prev: SVGShape[]) => SVGShape[]) => {
    const next = updater(state.shapes.value);
    state.setShapes(next);
    state.shapesRef.value = next;
  };

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
      setSelectedIds: state.setSelectedIds,
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
