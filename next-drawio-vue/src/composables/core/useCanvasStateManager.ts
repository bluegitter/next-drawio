/**
 * Vue 适配层 - 将核心状态管理器适配为 Vue composables
 */
import { computed, ref } from 'vue';
import { CanvasStateManager, CanvasStateConfig } from '@drawio/core';

export interface UseCanvasStateManagerResult {
  // 状态
  shapes: ReturnType<typeof ref>;
  selectedIds: ReturnType<typeof ref>;
  zoom: ReturnType<typeof ref>;
  canUndo: Readonly<ReturnType<typeof computed>>;
  canRedo: Readonly<ReturnType<typeof computed>>;

  // 形状操作
  addShape: (shape: any) => void;
  removeShape: (id: string) => void;
  updateShape: (id: string, updates: Partial<any>) => void;
  clearShapes: () => void;

  // 选择操作
  selectSingle: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;

  // 历史操作
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;

  // 缩放操作
  setZoom: (zoom: number) => void;
  zoomBy: (delta: number) => void;

  // 内部管理器（高级用法）
  manager: CanvasStateManager;
}

export function useCanvasStateManager(
  config: CanvasStateConfig = {}
): UseCanvasStateManagerResult {
  // 创建管理器实例
  const manager = new CanvasStateManager(config);

  // 响应式状态
  const shapes = ref(manager.getShapes());
  const selectedIds = ref(manager.selection.getSelectedIds());
  const zoom = ref(manager.getZoom());
  const canUndo = computed({
    get: () => manager.history.canUndo(),
    set: () => {} // 只读计算属性
  });
  const canRedo = computed({
    get: () => manager.history.canRedo(),
    set: () => {} // 只读计算属性
  });

  // 订阅状态变化
  manager.subscribe(() => {
    // 当核心状态变化时，更新 Vue 响应式状态
    shapes.value = [...manager.getShapes()];
    selectedIds.value = manager.selection.getSelectedIds();
    zoom.value = manager.getZoom();
  });

  // 形状操作
  const addShape = (shape: any): void => {
    manager.addShape(shape);
    shapes.value = [...manager.getShapes()];
  };

  const removeShape = (id: string): void => {
    manager.removeShape(id);
    shapes.value = [...manager.getShapes()];
    selectedIds.value = manager.selection.getSelectedIds();
  };

  const updateShape = (id: string, updates: Partial<any>): void => {
    manager.updateShape(id, updates);
    shapes.value = [...manager.getShapes()];
  };

  const clearShapes = (): void => {
    manager.clearShapes();
    shapes.value = [];
    selectedIds.value = [];
  };

  // 选择操作
  const selectSingle = (id: string): void => {
    manager.selection.selectSingle(id);
    selectedIds.value = manager.selection.getSelectedIds();
  };

  const selectMultiple = (ids: string[]): void => {
    manager.selection.selectMultiple(ids);
    selectedIds.value = manager.selection.getSelectedIds();
  };

  const selectAll = (ids: string[]): void => {
    manager.selection.selectAll(ids);
    selectedIds.value = manager.selection.getSelectedIds();
  };

  const clearSelection = (): void => {
    manager.selection.clearSelection();
    selectedIds.value = [];
  };

  const toggleSelection = (id: string): void => {
    manager.selection.toggleSelection(id);
    selectedIds.value = manager.selection.getSelectedIds();
  };

  // 历史操作
  const undo = (): void => {
    if (manager.undo()) {
      shapes.value = [...manager.getShapes()];
      selectedIds.value = manager.selection.getSelectedIds();
      zoom.value = manager.getZoom();
    }
  };

  const redo = (): void => {
    if (manager.redo()) {
      shapes.value = [...manager.getShapes()];
      selectedIds.value = manager.selection.getSelectedIds();
      zoom.value = manager.getZoom();
    }
  };

  const saveSnapshot = (): void => {
    manager.saveSnapshot();
  };

  // 缩放操作
  const setZoom = (newZoom: number): void => {
    manager.setZoom(newZoom);
    zoom.value = manager.getZoom();
  };

  const zoomBy = (delta: number): void => {
    manager.zoomBy(delta);
    zoom.value = manager.getZoom();
  };

  return {
    // 状态
    shapes,
    selectedIds,
    zoom,
    canUndo,
    canRedo,

    // 形状操作
    addShape,
    removeShape,
    updateShape,
    clearShapes,

    // 选择操作
    selectSingle,
    selectMultiple,
    selectAll,
    clearSelection,
    toggleSelection,

    // 历史操作
    undo,
    redo,
    saveSnapshot,

    // 缩放操作
    setZoom,
    zoomBy,

    // 内部管理器
    manager
  };
}