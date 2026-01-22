/**
 * React 适配层 - 将核心状态管理器适配为 React hooks
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CanvasStateManager, CanvasStateConfig, SVGShape } from '@drawio/core';

export interface UseCanvasStateManagerResult {
  // 状态
  shapes: SVGShape[];
  selectedIds: string[];
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;

  // 形状操作
  addShape: (shape: SVGShape) => void;
  removeShape: (id: string) => void;
  updateShape: (id: string, updates: Partial<SVGShape>) => void;
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
  const manager = useMemo(() => new CanvasStateManager(config), []);

  // 本地状态（用于触发 React 重渲染）
  const [shapes, setShapes] = useState<SVGShape[]>(manager.getShapes());
  const [selectedIds, setSelectedIds] = useState<string[]>(manager.selection.getSelectedIds());
  const [zoom, setZoom] = useState<number>(manager.getZoom());
  const [canUndo, setCanUndo] = useState<boolean>(manager.history.canUndo());
  const [canRedo, setCanRedo] = useState<boolean>(manager.history.canRedo());

  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      // 当核心状态变化时，更新 React 状态
      setShapes([...manager.getShapes()]);
      setSelectedIds(manager.selection.getSelectedIds());
      setZoom(manager.getZoom());
      setCanUndo(manager.history.canUndo());
      setCanRedo(manager.history.canRedo());
    });

    return unsubscribe;
  }, [manager]);

  // 形状操作
  const addShape = useCallback((shape: SVGShape) => {
    manager.addShape(shape);
    setShapes([...manager.getShapes()]);
  }, [manager]);

  const removeShape = useCallback((id: string) => {
    manager.removeShape(id);
    setShapes([...manager.getShapes()]);
    setSelectedIds(manager.selection.getSelectedIds());
  }, [manager]);

  const updateShape = useCallback((id: string, updates: Partial<SVGShape>) => {
    manager.updateShape(id, updates);
    setShapes([...manager.getShapes()]);
  }, [manager]);

  const clearShapes = useCallback(() => {
    manager.clearShapes();
    setShapes([]);
    setSelectedIds([]);
  }, [manager]);

  // 选择操作
  const selectSingle = useCallback((id: string) => {
    manager.selection.selectSingle(id);
    setSelectedIds(manager.selection.getSelectedIds());
  }, [manager]);

  const selectMultiple = useCallback((ids: string[]) => {
    manager.selection.selectMultiple(ids);
    setSelectedIds(manager.selection.getSelectedIds());
  }, [manager]);

  const selectAll = useCallback((ids: string[]) => {
    manager.selection.selectAll(ids);
    setSelectedIds(manager.selection.getSelectedIds());
  }, [manager]);

  const clearSelection = useCallback(() => {
    manager.selection.clearSelection();
    setSelectedIds([]);
  }, [manager]);

  const toggleSelection = useCallback((id: string) => {
    manager.selection.toggleSelection(id);
    setSelectedIds(manager.selection.getSelectedIds());
  }, [manager]);

  // 历史操作
  const undo = useCallback(() => {
    if (manager.undo()) {
      setShapes([...manager.getShapes()]);
      setSelectedIds(manager.selection.getSelectedIds());
      setZoom(manager.getZoom());
      setCanUndo(manager.history.canUndo());
      setCanRedo(manager.history.canRedo());
    }
  }, [manager]);

  const redo = useCallback(() => {
    if (manager.redo()) {
      setShapes([...manager.getShapes()]);
      setSelectedIds(manager.selection.getSelectedIds());
      setZoom(manager.getZoom());
      setCanUndo(manager.history.canUndo());
      setCanRedo(manager.history.canRedo());
    }
  }, [manager]);

  const saveSnapshot = useCallback(() => {
    manager.saveSnapshot();
    setCanUndo(manager.history.canUndo());
    setCanRedo(manager.history.canRedo());
  }, [manager]);

  // 缩放操作
  const setZoomCallback = useCallback((newZoom: number) => {
    manager.setZoom(newZoom);
    setZoom(manager.getZoom());
  }, [manager]);

  const zoomBy = useCallback((delta: number) => {
    manager.zoomBy(delta);
    setZoom(manager.getZoom());
  }, [manager]);

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
    setZoom: setZoomCallback,
    zoomBy,

    // 内部管理器
    manager
  };
}