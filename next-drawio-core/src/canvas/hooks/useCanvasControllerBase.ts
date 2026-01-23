import type { CanvasComponentProps, SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { useHistory } from './useHistory';
import { useCanvasGeometry } from './useCanvasGeometry';
import { useCanvasDerived } from './useCanvasDerived';
import { parsePoints } from '../utils/points';

export type UseCanvasControllerBaseArgs = {
  props: CanvasComponentProps;
  state: {
    svgRef: RefLike<SVGSVGElement>;
    shapes: MaybeRef<SVGShape[]>;
    selectedIds: MaybeRef<Set<string>>;
    history: MaybeRef<any[]>;
    historyIndex: MaybeRef<number>;
    setHistory: (next: any[]) => void;
    setHistoryIndex: (next: number) => void;
    setSelectedIds: (next: Set<string>) => void;
    setIsConnecting: (next: boolean) => void;
    setConnectionStart: (next: string | null) => void;
    setConnectionStartPort: (next: string | null) => void;
    setTempLine: (next: SVGElement | null) => void;
    shapeIdCounter: RefLike<number>;
    portElementsRef: RefLike<Map<string, SVGCircleElement[]>>;
    setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  };
};

export const useCanvasControllerBase = ({ props, state }: UseCanvasControllerBaseArgs) => {
  const { onShapeSelect, onCanvasChange } = props;

  const historyActions = useHistory({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    history: state.history,
    historyIndex: state.historyIndex,
    setHistory: state.setHistory,
    setHistoryIndex: state.setHistoryIndex,
    setShapesState: state.setShapesState,
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
    setShapesState: state.setShapesState,
    historyActions,
    geometry,
    derived,
  };
};
