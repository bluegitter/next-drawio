import type { SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue, setRefValue } from '../../utils/refs';

export type UseSelectionActionsArgs = {
  svgRef: RefLike<SVGSVGElement>;
  shapes: MaybeRef<SVGShape[]>;
  shapesRef: RefLike<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  selectedIdsRef: RefLike<Set<string>>;
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
  const getShapes = () => getRefValue(shapes) ?? [];
  const getShapesRef = () => getRefValue(shapesRef) ?? [];
  const getSelectedIds = () => getRefValue(selectedIds) ?? new Set<string>();
  const getSelectedIdsRef = () => getRefValue(selectedIdsRef) ?? new Set<string>();

  const updateSelectedShape = (updater: (shape: SVGShape) => void, options?: { skipHistory?: boolean }) => {
    const targetIds = getSelectedIdsRef();
    if (!targetIds.size) return;

    const shapesValue = getShapes();
    const currentShapes = getShapesRef().length ? getShapesRef() : shapesValue;
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
    const currentSel = getSelectedIdsRef();
    if (currentSel.size < 2) return;
    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const updatedShapes = getShapes().map((shape) => {
      if (currentSel.has(shape.id)) {
        return { ...shape, data: { ...shape.data, groupId } };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  };

  const ungroupSelected = () => {
    const currentSel = getSelectedIdsRef();
    if (currentSel.size === 0) return;
    const shapesValue = getShapes();
    const targetGroup = shapesValue.find((s) => currentSel.has(s.id) && s.data.groupId)?.data.groupId;
    if (!targetGroup) return;
    const updatedShapes = shapesValue.map((shape) => {
      if (shape.data.groupId === targetGroup) {
        const newData = { ...shape.data };
        delete newData.groupId;
        return { ...shape, data: newData };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  };

  const deleteSelected = () => {
    const selected = getSelectedIds();
    const svg = getRefValue(svgRef);
    if (selected.size === 0 || !svg) return;

    let updatedShapes = [...getShapes()];
    const connectorIds = new Set<string>();

    updatedShapes.forEach((shape) => {
      if (selected.has(shape.id) && shape.type === 'connector') {
        connectorIds.add(shape.id);
      }
      if (shape.type === 'connector' && shape.connections) {
        const [a, b] = shape.connections;
        if ((a && selected.has(a)) || (b && selected.has(b))) {
          connectorIds.add(shape.id);
        }
      }
    });

    const idsToRemove = new Set<string>([...Array.from(selected), ...Array.from(connectorIds)]);

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
      if (element && svg.contains(element)) {
        svg.removeChild(element);
      }
    });

    setShapesState(() => updatedShapes);
    const empty = new Set<string>();
    setSelectedIds(empty);
    setRefValue(selectedIdsRef, empty);
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
    setRefValue(selectedIdsRef, empty);
    setSelectedIds(empty);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
  };

  const selectAllShapes = () => {
    const shapesValue = getShapes();
    if (shapesValue.length === 0) {
      clearSelection();
      return;
    }
    const allIds = shapesValue.map((s) => s.id);
    const next = new Set(allIds);
    setRefValue(selectedIdsRef, next);
    setSelectedIds(next);
    const first = shapesValue[0];
    if (first) {
      onShapeSelect?.(first.element);
    }
  };

  const clearCanvas = () => {
    const svg = getRefValue(svgRef);
    if (!svg) return;

    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideCornerHandles();
    hideTextSelection();
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
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

  const getSelectionCount = () => getSelectedIdsRef().size;

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
