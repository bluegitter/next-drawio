import type { HistoryState, SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

type UseHistoryArgs = {
  svgRef: RefLike<SVGSVGElement>;
  shapes: MaybeRef<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  history: MaybeRef<HistoryState[]>;
  historyIndex: MaybeRef<number>;
  setHistory: (next: HistoryState[]) => void;
  setHistoryIndex: (next: number) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: (next: Set<string>) => void;
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setTempLine: (next: SVGElement | null) => void;
  setConnectionStartPort: (next: string | null) => void;
  portElementsRef: RefLike<Map<string, SVGElement[]>>;
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
    const currentShapes = snapshotShapes ?? getRefValue(shapes) ?? [];
    const shapesToStore = currentShapes.map((shape) => ({
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
      selectedToStore = Array.from(getRefValue(selectedIds) ?? new Set<string>());
    }

    const historyList = getRefValue(history) ?? [];
    const historyCursor = getRefValue(historyIndex) ?? 0;
    const newHistory = historyList.slice(0, historyCursor + 1);
    newHistory.push({ shapes: shapesToStore, selectedIds: selectedToStore });

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onCanvasChange?.();
  };

  const restoreHistoryState = (state: HistoryState) => {
    const svg = getRefValue(svgRef);
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const portElements = getRefValue(portElementsRef);
    if (portElements) {
      portElements.forEach((portList) => portList.forEach((port) => port.remove()));
      portElements.clear();
    }
    setConnectionStartPort(null);

    const restoredShapes = state.shapes.map((shape) => {
      const clonedElement = shape.element.cloneNode(true) as SVGElement;
      svg.appendChild(clonedElement);
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
    const historyList = getRefValue(history) ?? [];
    const historyCursor = getRefValue(historyIndex) ?? 0;
    if (historyCursor <= 0) return;
    const prevIndex = historyCursor - 1;
    const prevState = historyList[prevIndex];
    restoreHistoryState(prevState);
    setHistoryIndex(prevIndex);
    onCanvasChange?.();
  };

  const redo = () => {
    const historyList = getRefValue(history) ?? [];
    const historyCursor = getRefValue(historyIndex) ?? 0;
    if (historyCursor >= historyList.length - 1) return;
    const nextIndex = historyCursor + 1;
    const nextState = historyList[nextIndex];
    restoreHistoryState(nextState);
    setHistoryIndex(nextIndex);
    onCanvasChange?.();
  };

  const canUndo = () => (getRefValue(historyIndex) ?? 0) > 0;
  const canRedo = () => {
    const historyList = getRefValue(history) ?? [];
    const historyCursor = getRefValue(historyIndex) ?? 0;
    return historyCursor < historyList.length - 1;
  };

  return {
    saveToHistory,
    restoreHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
