/**
 * 状态管理模块统一导出
 */

// 导出类型定义
export * from './types';

// 导出管理器类
export { SelectionManager } from './selectionManager';
export { HistoryManager } from './historyManager';
export { CanvasStateManager } from './canvasStateManager';

// 便捷工厂函数
import { CanvasStateManager } from './canvasStateManager';
import { CanvasStateConfig } from './types';

export function createCanvasStateManager(config?: CanvasStateConfig): CanvasStateManager {
  return new CanvasStateManager(config);
}