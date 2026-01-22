import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseSelectionActionsArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  shapesRef: { value: SVGShape[] };
  selectedIds: Ref<Set<string>>;
  selectedIdsRef: { value: Set<string> };
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: (next: Set<string>) => void;
  setSelectedShape: (id: string | null) => void;
  setHoveredShapeId: (next: string | null) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  hidePorts: (shapeId?: string) => void;
  hideConnectorHandles: (connectorId?: string) => void;
  hideResizeHandles: (shapeId?: string) => void;
  hideCornerHandles: (shapeId?: string) => void;
  hideTextSelection: (shapeId?: string) => void;
};

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
  const updateSelectedShape = (updater: (shape: SVGShape) => void, options?: { skipHistory?: boolean }) => {
    const targetIds = selectedIdsRef.value;
    if (!targetIds.size) return;

    const currentShapes = shapesRef.value.length ? shapesRef.value : shapes.value;
    const updatedShapes = currentShapes.map((shape) => {
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
  };

  const combineSelected = () => {
    const currentSel = selectedIdsRef.value;
    if (currentSel.size < 2) return;
    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const updatedShapes = shapes.value.map((shape) => {
      if (currentSel.has(shape.id)) {
        return { ...shape, data: { ...shape.data, groupId } };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  };

  const ungroupSelected = () => {
    const currentSel = selectedIdsRef.value;
    if (currentSel.size === 0) return;
    const targetGroup = shapes.value.find((s) => currentSel.has(s.id) && s.data.groupId)?.data.groupId;
    if (!targetGroup) return;
    const updatedShapes = shapes.value.map((shape) => {
      if (shape.data.groupId === targetGroup) {
        return { ...shape, data: { ...shape.data, groupId: undefined } };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  };

  const deleteSelected = () => {
    if (selectedIds.value.size === 0 || !svgRef.value) return;

    let updatedShapes = [...shapes.value];
    const connectorIds = new Set<string>();

    updatedShapes.forEach((shape) => {
      if (selectedIds.value.has(shape.id) && shape.type === 'connector') {
        connectorIds.add(shape.id);
      }
      if (shape.type === 'connector' && shape.connections) {
        const [a, b] = shape.connections;
        if ((a && selectedIds.value.has(a)) || (b && selectedIds.value.has(b))) {
          connectorIds.add(shape.id);
        }
      }
    });

    const idsToRemove = new Set<string>([...Array.from(selectedIds.value), ...Array.from(connectorIds)]);

    updatedShapes = updatedShapes
      .filter((shape) => !idsToRemove.has(shape.id))
      .map((shape) => ({
        ...shape,
        connections: shape.connections?.filter((connId) => connId && !idsToRemove.has(connId)),
      }));

    idsToRemove.forEach((id) => {
      hidePorts(id);
      hideConnectorHandles(id);
      hideResizeHandles(id);
      hideCornerHandles(id);
      const element = document.getElementById(id);
      if (element && svgRef.value?.contains(element)) {
        svgRef.value.removeChild(element);
      }
    });

    setShapesState(() => updatedShapes);
    setSelectedIds(new Set());
    selectedIdsRef.value = new Set();
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory(updatedShapes, []);
  };

  const clearSelection = () => {
    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideCornerHandles();
    hideTextSelection();
    const empty = new Set<string>();
    selectedIdsRef.value = empty;
    setSelectedIds(empty);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
  };

  const selectAllShapes = () => {
    if (shapes.value.length === 0) {
      clearSelection();
      return;
    }
    const allIds = shapes.value.map((s) => s.id);
    const next = new Set(allIds);
    selectedIdsRef.value = next;
    setSelectedIds(next);
    const first = shapes.value[0];
    if (first) {
      onShapeSelect?.(first.element);
    }
  };

  const clearCanvas = () => {
    if (!svgRef.value) return;

    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideCornerHandles();
    hideTextSelection();
    while (svgRef.value.firstChild) {
      svgRef.value.removeChild(svgRef.value.firstChild);
    }
    setShapesState(() => []);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory([], null);
  };

  const getSelectedShape = (selectedShapeId: string | null): SVGElement | null => {
    const el = selectedShapeId ? document.getElementById(selectedShapeId) : null;
    return el instanceof SVGElement ? el : null;
  };

  const getSelectionCount = () => selectedIdsRef.value.size;

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
