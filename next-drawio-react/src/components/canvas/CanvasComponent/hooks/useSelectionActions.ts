import { useCallback } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseSelectionActionsArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  shapesRef: React.MutableRefObject<SVGShape[]>;
  selectedIds: Set<string>;
  selectedIdsRef: React.MutableRefObject<Set<string>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedShape: (id: string | null) => void;
  setHoveredShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  onShapeSelect?: (shape: SVGElement | null) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  hidePorts: (shapeId?: string) => void;
  hideConnectorHandles: (connectorId?: string) => void;
  hideResizeHandles: (shapeId?: string) => void;
  hideCornerHandles: (shapeId?: string) => void;
  hideTextSelection: (shapeId?: string) => void;
}

export const useSelectionActions = ({
  svgRef,
  shapes,
  shapesRef,
  selectedIds,
  selectedIdsRef,
  setShapesState,
  setSelectedIds,
  setSelectedShape,
  setHoveredShapeId,
  onShapeSelect,
  saveToHistory,
  hidePorts,
  hideConnectorHandles,
  hideResizeHandles,
  hideCornerHandles,
  hideTextSelection,
}: UseSelectionActionsArgs) => {
  const updateSelectedShape = useCallback((updater: (shape: SVGShape) => void, options?: { skipHistory?: boolean }) => {
    const targetIds = selectedIdsRef.current;
    if (!targetIds.size) return;

    const currentShapes = shapesRef.current.length ? shapesRef.current : shapes;
    const updatedShapes = currentShapes.map(shape => {
      if (targetIds.has(shape.id)) {
        const cloned = { ...shape, data: { ...shape.data } };
        updater(cloned);
        return cloned;
      }
      return shape;
    });

    const changed = updatedShapes.some((s, idx) => s !== currentShapes[idx]);
    if (!changed) return;

    setShapesState(() => updatedShapes);

    if (!options?.skipHistory) {
      saveToHistory(updatedShapes, targetIds);
    }
  }, [saveToHistory, selectedIdsRef, setShapesState, shapes, shapesRef]);

  const combineSelected = useCallback(() => {
    const currentSel = selectedIdsRef.current;
    if (currentSel.size < 2) return;
    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const updatedShapes = shapes.map(shape => {
      if (currentSel.has(shape.id)) {
        return { ...shape, data: { ...shape.data, groupId } };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  }, [saveToHistory, selectedIdsRef, setShapesState, shapes]);

  const ungroupSelected = useCallback(() => {
    const currentSel = selectedIdsRef.current;
    if (currentSel.size === 0) return;
    const targetGroup = shapes.find(s => currentSel.has(s.id) && s.data.groupId)?.data.groupId;
    if (!targetGroup) return;
    const updatedShapes = shapes.map(shape => {
      if (shape.data.groupId === targetGroup) {
        const newData = { ...shape.data };
        delete newData.groupId;
        return { ...shape, data: newData };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  }, [saveToHistory, selectedIdsRef, setShapesState, shapes]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0 || !svgRef.current) return;

    let updatedShapes = [...shapes];
    const connectorIds = new Set<string>();

    updatedShapes.forEach(shape => {
      if (selectedIds.has(shape.id) && shape.type === 'connector') {
        connectorIds.add(shape.id);
      }
      if (shape.type === 'connector' && shape.connections) {
        const [a, b] = shape.connections;
        if ((a && selectedIds.has(a)) || (b && selectedIds.has(b))) {
          connectorIds.add(shape.id);
        }
      }
    });

    const idsToRemove = new Set<string>([...Array.from(selectedIds), ...Array.from(connectorIds)]);

    updatedShapes = updatedShapes
      .filter(shape => !idsToRemove.has(shape.id))
      .map(shape => ({
        ...shape,
        connections: shape.connections?.filter(connId => connId && !idsToRemove.has(connId)),
      }));

    idsToRemove.forEach(id => {
      hidePorts(id);
      hideConnectorHandles(id);
      hideResizeHandles(id);
      hideCornerHandles(id);
      const element = document.getElementById(id);
      if (element && svgRef.current?.contains(element)) {
        svgRef.current.removeChild(element);
      }
    });

    setShapesState(() => updatedShapes);
    setSelectedIds(new Set());
    selectedIdsRef.current = new Set();
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory(updatedShapes, []);
  }, [hideConnectorHandles, hideCornerHandles, hidePorts, hideResizeHandles, onShapeSelect, saveToHistory, selectedIds, selectedIdsRef, setHoveredShapeId, setSelectedIds, setShapesState, shapes, svgRef]);

  const clearSelection = useCallback(() => {
    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideCornerHandles();
    hideTextSelection();
    const empty = new Set<string>();
    selectedIdsRef.current = empty;
    setSelectedIds(empty);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
  }, [hideConnectorHandles, hideCornerHandles, hidePorts, hideResizeHandles, hideTextSelection, onShapeSelect, selectedIdsRef, setHoveredShapeId, setSelectedIds, setSelectedShape]);

  const selectAllShapes = useCallback(() => {
    if (shapes.length === 0) {
      clearSelection();
      return;
    }
    const allIds = shapes.map(s => s.id);
    const next = new Set(allIds);
    selectedIdsRef.current = next;
    setSelectedIds(next);
    const first = shapes[0];
    if (first) {
      onShapeSelect?.(first.element);
    }
  }, [clearSelection, onShapeSelect, selectedIdsRef, setSelectedIds, shapes]);

  const clearCanvas = useCallback(() => {
    if (!svgRef.current) return;

    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideCornerHandles();
    hideTextSelection();
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    setShapesState(() => []);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory([], null);
  }, [hideConnectorHandles, hideCornerHandles, hidePorts, hideResizeHandles, hideTextSelection, onShapeSelect, saveToHistory, setHoveredShapeId, setSelectedShape, setShapesState, svgRef]);

  const getSelectedShape = useCallback((selectedShapeId: string | null): SVGElement | null => {
    const el = selectedShapeId ? document.getElementById(selectedShapeId) : null;
    return el instanceof SVGElement ? el : null;
  }, []);

  const getSelectionCount = useCallback(() => selectedIdsRef.current.size, [selectedIdsRef]);

  return {
    updateSelectedShape,
    combineSelected,
    ungroupSelected,
    deleteSelected,
    clearSelection,
    selectAllShapes,
    clearCanvas,
    getSelectedShape,
    getSelectionCount,
  };
};
