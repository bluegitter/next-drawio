import type { CanvasComponentProps, SVGShape } from '../types';
import { useHistory } from './useHistory';
import { useCanvasGeometry } from './useCanvasGeometry';
import { useCanvasDerived } from './useCanvasDerived';
import { parsePoints } from '@drawio/core';
import type { CanvasState } from './useCanvasState';

export const useCanvasControllerBase = ({
  props,
  state,
}: {
  props: CanvasComponentProps;
  state: CanvasState;
}) => {
  const { onShapeSelect, onCanvasChange } = props;

  const setShapesState = (updater: (prev: SVGShape[]) => SVGShape[]) => {
    const next = updater(state.shapes.value);
    state.setShapes(next);
    state.shapesRef.value = next;
  };

  const historyActions = useHistory({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    history: state.history,
    historyIndex: state.historyIndex,
    setHistory: state.setHistory,
    setHistoryIndex: state.setHistoryIndex,
    setShapesState,
    setSelectedIds: state.setSelectedIds,
    setIsConnecting: state.setIsConnecting,
    setConnectionStart: state.setConnectionStart,
    setTempLine: state.setTempLine,
    setConnectionStartPort: state.setConnectionStartPort,
    portElementsRef: state.portElementsRef,
    onShapeSelect,
    onCanvasChange,
  });

  const geometry = useCanvasGeometry({
    svgRef: state.svgRef,
    shapes: state.shapes,
    shapeIdCounter: state.shapeIdCounter,
  });

  const derived = useCanvasDerived({
    shapes: state.shapes,
    selectedIds: state.selectedIds,
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
