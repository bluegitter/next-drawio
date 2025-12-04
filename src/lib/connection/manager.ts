import { Point } from '@/types/common';
import { 
  ConnectionPoint, 
  ConnectionData, 
  ConnectionConfig,
  ConnectionManager as IConnectionManager,
  ConnectionEventMap 
} from '@/types/connection';
import { ConnectionRenderer, ConnectionPathCalculator, DefaultConnectionPointGenerator } from './renderer';

/**
 * 连接管理器实现
 */
export class ConnectionManager implements IConnectionManager {
  private connections: Map<string, ConnectionData> = new Map();
  private shapeConnectionPoints: Map<string, ConnectionPoint[]> = new Map();
  private renderer: ConnectionRenderer;
  private pathCalculator: ConnectionPathCalculator;
  private pointGenerator: DefaultConnectionPointGenerator;
  private config: ConnectionConfig;
  private eventListeners: Map<keyof ConnectionEventMap, Function[]> = new Map();

  constructor(config: Partial<ConnectionConfig> = {}) {
    this.config = {
      enabled: true,
      showConnectionPoints: true,
      snapToPoints: true,
      snapThreshold: 10,
      defaultStyle: 'straight',
      defaultStroke: '#6b7280',
      defaultStrokeWidth: 2,
      defaultEndStyle: 'arrow',
      allowCurvedConnections: true,
      allowSelfConnections: false,
      maxConnectionPoints: 8,
      ...config
    };

    this.renderer = new ConnectionRenderer();
    this.pathCalculator = new ConnectionPathCalculator();
    this.pointGenerator = new DefaultConnectionPointGenerator();
  }

  // 事件系统
  on<K extends keyof ConnectionEventMap>(event: K, listener: (data: ConnectionEventMap[K]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off<K extends keyof ConnectionEventMap>(event: K, listener: (data: ConnectionEventMap[K]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof ConnectionEventMap>(event: K, data: ConnectionEventMap[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // 连接点管理
  getConnectionPoints(shapeId: string): ConnectionPoint[] {
    return this.shapeConnectionPoints.get(shapeId) || [];
  }

  addConnectionPoint(shapeId: string, point: ConnectionPoint): void {
    const points = this.getConnectionPoints(shapeId);
    
    if (points.length >= this.config.maxConnectionPoints) {
      throw new Error(`Maximum connection points (${this.config.maxConnectionPoints}) reached for shape ${shapeId}`);
    }

    points.push(point);
    this.shapeConnectionPoints.set(shapeId, points);
    this.emit('connection-point:created', { shapeId, point });
  }

  removeConnectionPoint(shapeId: string, pointId: string): void {
    const points = this.getConnectionPoints(shapeId);
    const index = points.findIndex(p => p.id === pointId);
    
    if (index > -1) {
      const removedPoint = points[index];
      points.splice(index, 1);
      this.shapeConnectionPoints.set(shapeId, points);
      
      // 检查是否有连接使用了这个点
      this.connections.forEach((connection, connId) => {
        if (connection.fromPoint.id === pointId || connection.toPoint.id === pointId) {
          this.deleteConnection(connId);
        }
      });
      
      this.emit('connection-point:deleted', { shapeId, pointId });
    }
  }

  updateConnectionPoint(shapeId: string, pointId: string, updates: Partial<ConnectionPoint>): void {
    const points = this.getConnectionPoints(shapeId);
    const point = points.find(p => p.id === pointId);
    
    if (point) {
      Object.assign(point, updates);
      this.shapeConnectionPoints.set(shapeId, points);
      
      // 更新使用此连接点的连接
      this.connections.forEach((connection, connId) => {
        if (connection.fromPoint.id === pointId) {
          this.updateConnection(connId, { fromPoint: { ...connection.fromPoint, ...updates } });
        } else if (connection.toPoint.id === pointId) {
          this.updateConnection(connId, { toPoint: { ...connection.toPoint, ...updates } });
        }
      });
    }
  }

  // 连接线管理
  getConnection(connectionId: string): ConnectionData | null {
    return this.connections.get(connectionId) || null;
  }

  getConnections(shapeId: string): ConnectionData[] {
    return Array.from(this.connections.values()).filter(
      connection => connection.fromShape === shapeId || connection.toShape === shapeId
    );
  }

  createConnection(
    fromShape: string, 
    toShape: string, 
    fromPoint: ConnectionPoint, 
    toPoint: ConnectionPoint
  ): ConnectionData {
    if (!this.config.allowSelfConnections && fromShape === toShape) {
      throw new Error('Self connections are not allowed');
    }

    const connectionId = `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: ConnectionData = {
      id: connectionId,
      fromShape,
      toShape,
      fromPoint,
      toPoint,
      path: this.pathCalculator.calculatePath(fromPoint.position, toPoint.position, this.config.defaultStyle),
      style: this.config.defaultStyle,
      stroke: this.config.defaultStroke,
      strokeWidth: this.config.defaultStrokeWidth,
      opacity: 1,
      startStyle: 'none',
      endStyle: this.config.defaultEndStyle,
      selected: false,
      hovering: false
    };

    this.connections.set(connectionId, connection);
    this.emit('connection:created', { connection });
    
    return connection;
  }

  deleteConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      this.emit('connection:deleted', { connectionId });
    }
  }

  updateConnection(connectionId: string, updates: Partial<ConnectionData>): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      const updatedConnection = { ...connection, ...updates };
      
      // 如果位置发生变化，重新计算路径
      if (updates.fromPoint || updates.toPoint || updates.style) {
        const fromPos = updates.fromPoint?.position || connection.fromPoint.position;
        const toPos = updates.toPoint?.position || connection.toPoint.position;
        const style = updates.style || connection.style;
        
        updatedConnection.path = this.pathCalculator.calculatePath(fromPos, toPos, style);
      }
      
      this.connections.set(connectionId, updatedConnection);
      this.emit('connection:updated', { connectionId, changes: updates });
    }
  }

  // 连接查询
  findPath(fromShape: string, toShape: string): ConnectionData[] | null {
    // 使用 BFS 查找最短路径
    const queue: string[] = [fromShape];
    const visited: Set<string> = new Set([fromShape]);
    const parent: Map<string, string> = new Map();

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === toShape) {
        // 构建路径
        const path: ConnectionData[] = [];
        let node = toShape;
        
        while (parent.has(node)) {
          const prevNode = parent.get(node)!;
          const connection = Array.from(this.connections.values()).find(
            conn => (conn.fromShape === prevNode && conn.toShape === node) ||
                   (conn.fromShape === node && conn.toShape === prevNode)
          );
          
          if (connection) {
            path.unshift(connection);
          }
          
          node = prevNode;
        }
        
        return path;
      }

      const connections = this.getConnections(current);
      for (const connection of connections) {
        const nextNode = connection.fromShape === current ? connection.toShape : connection.fromShape;
        
        if (!visited.has(nextNode)) {
          visited.add(nextNode);
          parent.set(nextNode, current);
          queue.push(nextNode);
        }
      }
    }

    return null;
  }

  getConnectedShapes(shapeId: string): string[] {
    const connected = new Set<string>();
    const connections = this.getConnections(shapeId);
    
    connections.forEach(connection => {
      if (connection.fromShape === shapeId) {
        connected.add(connection.toShape);
      } else {
        connected.add(connection.fromShape);
      }
    });
    
    return Array.from(connected);
  }

  canConnect(fromShape: string, toShape: string): boolean {
    if (!this.config.allowSelfConnections && fromShape === toShape) {
      return false;
    }

    // 检查是否已经存在连接
    const existingConnection = Array.from(this.connections.values()).find(
      conn => (conn.fromShape === fromShape && conn.toShape === toShape) ||
             (conn.fromShape === toShape && conn.toShape === fromShape)
    );

    return !existingConnection;
  }

  // 渲染支持
  renderConnection(connection: ConnectionData): string {
    return this.renderer.renderConnection(connection);
  }

  renderConnectionPoint(point: ConnectionPoint, position: Point): string {
    return this.renderer.renderConnectionPoint(point, position);
  }

  // 高级功能
  highlightConnectionPoints(shapeId: string, highlight: boolean): void {
    const points = this.getConnectionPoints(shapeId);
    points.forEach(point => {
      point.highlighted = highlight;
    });
  }

  selectConnection(connectionId: string, selected: boolean = true): void {
    const connection = this.connections.get(connectionId);
    if (connection && connection.selected !== selected) {
      connection.selected = selected;
      this.emit(selected ? 'connection:selected' : 'connection:deselected', { connectionId });
    }
  }

  hoverConnection(connectionId: string, hovering: boolean = true): void {
    const connection = this.connections.get(connectionId);
    if (connection && connection.hovering !== hovering) {
      connection.hovering = hovering;
      this.emit(hovering ? 'connection:hover' : 'connection:unhover', { connectionId });
    }
  }

  // 批量操作
  selectConnections(connectionIds: string[], selected: boolean = true): void {
    connectionIds.forEach(id => this.selectConnection(id, selected));
  }

  deleteConnections(shapeId: string): void {
    const connections = this.getConnections(shapeId);
    connections.forEach(connection => {
      this.deleteConnection(connection.id);
    });
  }

  updateConnectionsForShape(shapeId: string, newPosition: Point): void {
    const connections = this.getConnections(shapeId);
    
    connections.forEach(connection => {
      if (connection.fromShape === shapeId) {
        // 更新起始点
        const fromPoint = { ...connection.fromPoint, position: newPosition };
        this.updateConnection(connection.id, { fromPoint });
      } else if (connection.toShape === shapeId) {
        // 更新目标点
        const toPoint = { ...connection.toPoint, position: newPosition };
        this.updateConnection(connection.id, { toPoint });
      }
    });
  }

  // 工具方法
  getConnectionById(connectionId: string): ConnectionData | null {
    return this.connections.get(connectionId) || null;
  }

  getAllConnections(): ConnectionData[] {
    return Array.from(this.connections.values());
  }

  clear(): void {
    this.connections.clear();
    this.shapeConnectionPoints.clear();
  }

  getConfig(): ConnectionConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ConnectionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
