/**
 * 连接功能模块导出
 * 
 * 提供完整的图元连接功能，包括：
 * - 连接管理器
 * - 连接渲染器  
 * - 路径计算器
 * - 连接点生成器
 * - 类型定义
 */

// 类型定义
export * from '@/types/connection';

// 连接管理器和渲染器
export { ConnectionManager } from './manager';
export { 
  ConnectionRenderer, 
  ConnectionPathCalculator, 
  DefaultConnectionPointGenerator 
} from './renderer';

// 默认导出连接管理器
export { ConnectionManager as default } from './manager';
