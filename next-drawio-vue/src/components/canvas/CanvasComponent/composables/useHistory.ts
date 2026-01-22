import type { Ref } from 'vue';
import type { HistoryState, SVGShape } from '../types';

type UseHistoryArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  history: Ref<HistoryState[]>;
  historyIndex: Ref<number>;
  setHistory: (next: HistoryState[]) => void;
  setHistoryIndex: (next: number) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: (next: Set<string>) => void;
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setTempLine: (next: SVGElement | null) => void;
  setConnectionStartPort: (next: string | null) => void;
  portElementsRef: { value: Map<string, SVGElement[]> };
  onShapeSelect?: (shape: SVGElement | null) => void;
  onCanvasChange?: () => void;
};

export const useHistory = ({
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
}: UseHistoryArgs) => {
  const saveToHistory = (
    snapshotShapes?: SVGShape[],
    snapshotSelectedIds?: string[] | Set<string> | string | null
  ) => {
    const shapesToStore = (snapshotShapes ?? shapes.value).map((shape) => ({
      ...shape,
      data: { ...shape.data },
      connections: shape.connections ? [...shape.connections] : [],
      element: shape.element.cloneNode(true) as SVGElement,
    }));

    let selectedToStore: string[];
    if (snapshotSelectedIds === null) {
      selectedToStore = [];
    } else if (snapshotSelectedIds instanceof Set) {
      selectedToStore = Array.from(snapshotSelectedIds);
    } else if (Array.isArray(snapshotSelectedIds)) {
      selectedToStore = snapshotSelectedIds;
    } else if (typeof snapshotSelectedIds === 'string') {
      selectedToStore = [snapshotSelectedIds];
    } else {
      selectedToStore = Array.from(selectedIds.value);
    }

    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push({ shapes: shapesToStore, selectedIds: selectedToStore });

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onCanvasChange?.();
  };

  const restoreHistoryState = (state: HistoryState) => {
    if (!svgRef.value) return;

    while (svgRef.value.firstChild) {
      svgRef.value.removeChild(svgRef.value.firstChild);
    }

    portElementsRef.value.forEach((portList) => portList.forEach((port) => port.remove()));
    portElementsRef.value.clear();
    setConnectionStartPort(null);

    const restoredShapes = state.shapes.map((shape) => {
      const clonedElement = shape.element.cloneNode(true) as SVGElement;
      svgRef.value?.appendChild(clonedElement);
      return { ...shape, element: clonedElement };
    });

    setShapesState(() => restoredShapes);
    setSelectedIds(new Set(state.selectedIds || []));
    setIsConnecting(false);
    setConnectionStart(null);
    setTempLine(null);

    const primary = state.selectedIds?.[0] ?? null;
    if (primary) {
      const targetElement = restoredShapes.find((s) => s.id === primary)?.element ?? null;
      onShapeSelect?.(targetElement || null);
    } else {
      onShapeSelect?.(null);
    }
  };

  const undo = () => {
    if (historyIndex.value <= 0) return;
    const prevIndex = historyIndex.value - 1;
    const prevState = history.value[prevIndex];
    restoreHistoryState(prevState);
    setHistoryIndex(prevIndex);
    onCanvasChange?.();
  };

  const redo = () => {
    if (historyIndex.value >= history.value.length - 1) return;
    const nextIndex = historyIndex.value + 1;
    const nextState = history.value[nextIndex];
    restoreHistoryState(nextState);
    setHistoryIndex(nextIndex);
    onCanvasChange?.();
  };

  const canUndo = () => historyIndex.value > 0;
  const canRedo = () => historyIndex.value < history.value.length - 1;

  return {
    saveToHistory,
    restoreHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
