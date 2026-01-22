/**
 * 历史记录管理器 - 框架无关的撤销重做逻辑
 */
import { CanvasHistoryState, SVGShape } from './types';

export class HistoryManager {
  private history: CanvasHistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistory: number;

  constructor(maxHistory: number = 50) {
    this.maxHistory = maxHistory;
  }

  /**
   * 保存当前状态快照
   */
  saveSnapshot(shapes: SVGShape[], selectedIds: Set<string>, zoom: number): void {
    // 移除当前索引之后的所有历史（撤销后的新操作）
    this.history = this.history.slice(0, this.currentIndex + 1);

    // 添加新状态
    const newState: CanvasHistoryState = {
      shapes: JSON.parse(JSON.stringify(shapes)), // 深拷贝
      selectedIds: Array.from(selectedIds),
      zoom
    };

    this.history.push(newState);

    // 限制历史记录长度
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * 撤销操作
   */
  undo(): CanvasHistoryState | null {
    if (this.currentIndex <= 0) return null;
    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  /**
   * 重做操作
   */
  redo(): CanvasHistoryState | null {
    if (this.currentIndex >= this.history.length - 1) return null;
    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): CanvasHistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * 获取历史记录长度
   */
  getLength(): number {
    return this.history.length;
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * 设置历史记录（用于外部同步）
   */
  setHistory(history: CanvasHistoryState[], currentIndex: number): void {
    this.history = history;
    this.currentIndex = currentIndex;
  }

  /**
   * 获取历史记录副本
   */
  getHistoryCopy(): CanvasHistoryState[] {
    return JSON.parse(JSON.stringify(this.history));
  }
}