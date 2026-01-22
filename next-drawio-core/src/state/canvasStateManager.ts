/**
 * 画布状态管理器 - 框架无关的核心状态管理逻辑
 */
import { SVGShape, CanvasStateConfig, StateChangeEvent, CanvasHistoryState } from './types';
import { SelectionManager } from './selectionManager';
import { HistoryManager } from './historyManager';

export class CanvasStateManager {
  public readonly selection: SelectionManager;
  public readonly history: HistoryManager;

  private shapes: SVGShape[] = [];
  private zoom: number = 1;
  private listeners: Set<(event: StateChangeEvent) => void> = new Set();

  constructor(config: CanvasStateConfig = {}) {
    this.shapes = config.initialShapes || [];
    this.zoom = config.initialZoom || 1;

    this.selection = new SelectionManager();
    this.history = new HistoryManager(config.maxHistory);

    // 保存初始状态
    this.saveSnapshot();
  }

  /**
   * ==================== 形状管理 ====================
   */

  /**
   * 获取所有形状
   */
  getShapes(): SVGShape[] {
    return this.shapes;
  }

  /**
   * 根据ID获取形状
   */
  getShape(id: string): SVGShape | undefined {
    return this.shapes.find(shape => shape.id === id);
  }

  /**
   * 添加形状
   */
  addShape(shape: SVGShape): void {
    this.shapes.push(shape);
    this.emit({ type: 'shapes', newValue: shape });
  }

  /**
   * 批量添加形状
   */
  addShapes(shapesToAdd: SVGShape[]): void {
    this.shapes.push(...shapesToAdd);
    this.emit({ type: 'shapes', newValue: shapesToAdd });
  }

  /**
   * 更新形状
   */
  updateShape(id: string, updates: Partial<SVGShape>): SVGShape | null {
    const index = this.shapes.findIndex(shape => shape.id === id);
    if (index === -1) return null;

    const oldShape = this.shapes[index];
    this.shapes[index] = { ...oldShape, ...updates };

    this.emit({
      type: 'shapes',
      oldValue: oldShape,
      newValue: this.shapes[index]
    });

    return this.shapes[index];
  }

  /**
   * 删除形状
   */
  removeShape(id: string): SVGShape | null {
    const index = this.shapes.findIndex(shape => shape.id === id);
    if (index === -1) return null;

    const removedShape = this.shapes.splice(index, 1)[0];
    this.selection.removeFromSelection([id]);

    this.emit({
      type: 'shapes',
      oldValue: removedShape,
      newValue: null
    });

    return removedShape;
  }

  /**
   * 批量删除形状
   */
  removeShapes(ids: string[]): SVGShape[] {
    const removedShapes: SVGShape[] = [];
    const idsSet = new Set(ids);

    this.shapes = this.shapes.filter(shape => {
      if (idsSet.has(shape.id)) {
        removedShapes.push(shape);
        return false;
      }
      return true;
    });

    this.selection.removeFromSelection(ids);

    this.emit({
      type: 'shapes',
      oldValue: removedShapes,
      newValue: null
    });

    return removedShapes;
  }

  /**
   * 清空所有形状
   */
  clearShapes(): void {
    const oldShapes = this.shapes;
    this.shapes = [];
    this.selection.clearSelection();

    this.emit({
      type: 'shapes',
      oldValue: oldShapes,
      newValue: []
    });
  }

  /**
   * ==================== 缩放管理 ====================
   */

  /**
   * 获取当前缩放
   */
  getZoom(): number {
    return this.zoom;
  }

  /**
   * 设置缩放
   */
  setZoom(newZoom: number): void {
    const oldZoom = this.zoom;
    this.zoom = Math.max(0.1, Math.min(5, newZoom)); // 限制缩放范围

    this.emit({
      type: 'zoom',
      oldValue: oldZoom,
      newValue: this.zoom
    });
  }

  /**
   * 相对缩放
   */
  zoomBy(delta: number): void {
    this.setZoom(this.zoom + delta);
  }

  /**
   * ==================== 历史记录 ====================
   */

  /**
   * 保存当前状态快照
   */
  saveSnapshot(): void {
    this.history.saveSnapshot(
      this.shapes,
      this.selection.getSelectionCopy(),
      this.zoom
    );
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    const state = this.history.undo();
    if (state) {
      this.restoreState(state);
      return true;
    }
    return false;
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    const state = this.history.redo();
    if (state) {
      this.restoreState(state);
      return true;
    }
    return false;
  }

  /**
   * 恢复历史状态
   */
  private restoreState(state: CanvasHistoryState): void {
    // 深拷贝以避免引用问题
    this.shapes = JSON.parse(JSON.stringify(state.shapes));
    this.selection.setSelection(state.selectedIds);
    this.zoom = state.zoom;

    this.emit({ type: 'history', newValue: state });
  }

  /**
   * ==================== 事件系统 ====================
   */

  /**
   * 订阅状态变化
   */
  subscribe(listener: (event: StateChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 触发事件
   */
  private emit(event: StateChangeEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * ==================== 工具方法 ====================
   */

  /**
   * 获取完整状态（用于序列化）
   */
  getSerializedState(): {
    shapes: SVGShape[];
    selectedIds: string[];
    zoom: number;
    history: any[];
    historyIndex: number;
  } {
    return {
      shapes: JSON.parse(JSON.stringify(this.shapes)),
      selectedIds: this.selection.getSelectedIds(),
      zoom: this.zoom,
      history: this.history.getHistoryCopy(),
      historyIndex: this.history.getCurrentIndex()
    };
  }
}