import { useCallback } from 'react';
import type React from 'react';
import type { HistoryState, SVGShape } from '../types';

interface UseHistoryArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  history: HistoryState[];
  historyIndex: number;
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
  setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
  portElementsRef: React.MutableRefObject<Map<string, SVGElement[]>>;
  onShapeSelect?: (shape: SVGElement | null) => void;
  onCanvasChange?: () => void;
}

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
  const saveToHistory = useCallback((snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => {
    const shapesToStore = (snapshotShapes ?? shapes).map(shape => ({
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
      selectedToStore = Array.from(selectedIds);
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ shapes: shapesToStore, selectedIds: selectedToStore });

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onCanvasChange?.();
  }, [history, historyIndex, onCanvasChange, selectedIds, setHistory, setHistoryIndex, shapes]);

  const restoreHistoryState = useCallback((state: HistoryState) => {
    if (!svgRef.current) return;

    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    portElementsRef.current.forEach(portList => portList.forEach(port => port.remove()));
    portElementsRef.current.clear();
    setConnectionStartPort(null);

    const restoredShapes = state.shapes.map(shape => {
      const clonedElement = shape.element.cloneNode(true) as SVGElement;
      svgRef.current!.appendChild(clonedElement);
      return { ...shape, element: clonedElement };
    });

    setShapesState(() => restoredShapes);
    setSelectedIds(new Set(state.selectedIds || []));
    setIsConnecting(false);
    setConnectionStart(null);
    setTempLine(null);

    const primary = state.selectedIds?.[0] ?? null;
    if (primary) {
      const targetElement = restoredShapes.find(s => s.id === primary)?.element ?? null;
      onShapeSelect?.(targetElement || null);
    } else {
      onShapeSelect?.(null);
    }
  }, [onShapeSelect, portElementsRef, setConnectionStart, setConnectionStartPort, setIsConnecting, setSelectedIds, setShapesState, setTempLine, svgRef]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const prevState = history[prevIndex];
    restoreHistoryState(prevState);
    setHistoryIndex(prevIndex);
    onCanvasChange?.();
  }, [history, historyIndex, onCanvasChange, restoreHistoryState, setHistoryIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const nextState = history[nextIndex];
    restoreHistoryState(nextState);
    setHistoryIndex(nextIndex);
    onCanvasChange?.();
  }, [history, historyIndex, onCanvasChange, restoreHistoryState, setHistoryIndex]);

  const canUndo = useCallback(() => historyIndex > 0, [historyIndex]);
  const canRedo = useCallback(() => historyIndex < history.length - 1, [history.length, historyIndex]);

  return {
    saveToHistory,
    restoreHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
