/**
 * 选择管理器 - 框架无关的选择逻辑
 */
import { SVGShape } from './types';

export class SelectionManager {
  private selectedIds = new Set<string>();

  /**
   * 选择单个形状
   */
  selectSingle(id: string): void {
    this.selectedIds.clear();
    this.selectedIds.add(id);
  }

  /**
   * 选择多个形状
   */
  selectMultiple(ids: string[]): void {
    this.selectedIds.clear();
    ids.forEach(id => this.selectedIds.add(id));
  }

  /**
   * 添加到选择
   */
  addToSelection(ids: string[]): void {
    ids.forEach(id => this.selectedIds.add(id));
  }

  /**
   * 从选择中移除
   */
  removeFromSelection(ids: string[]): void {
    ids.forEach(id => this.selectedIds.delete(id));
  }

  /**
   * 选择所有形状
   */
  selectAll(shapeIds: string[]): void {
    this.selectedIds = new Set(shapeIds);
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this.selectedIds.clear();
  }

  /**
   * 切换选择状态
   */
  toggleSelection(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  /**
   * 获取选中的形状
   */
  getSelectedShapes(allShapes: SVGShape[]): SVGShape[] {
    return allShapes.filter(shape => this.selectedIds.has(shape.id));
  }

  /**
   * 获取选中的形状ID
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedIds);
  }

  /**
   * 获取选中的第一个形状ID
   */
  getFirstSelectedId(): string | null {
    if (this.selectedIds.size === 0) return null;
    const firstValue = this.selectedIds.values().next().value;
    return firstValue ?? null;
  }

  /**
   * 检查是否选中了特定形状
   */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * 检查是否有选择
   */
  hasSelection(): boolean {
    return this.selectedIds.size > 0;
  }

  /**
   * 获取选择数量
   */
  getSelectionCount(): number {
    return this.selectedIds.size;
  }

  /**
   * 设置选择状态（用于外部同步）
   */
  setSelection(ids: string[] | Set<string>): void {
    this.selectedIds = ids instanceof Set ? new Set(ids) : new Set(ids);
  }

  /**
   * 获取选择状态的副本
   */
  getSelectionCopy(): Set<string> {
    return new Set(this.selectedIds);
  }
}