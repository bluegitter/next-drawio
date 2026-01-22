import { Point } from './common';

// 连接点类型
export type ConnectionPointType = 
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'center'
  | 'custom';

// 连接线样式
export type ConnectionLineStyle = 
  | 'straight'
  | 'polyline'
  | 'curved'
  | 'orthogonal'
  | 'bezier';

// 连接端点样式
export type ConnectionEndStyle = 
  | 'none'
  | 'arrow'
  | 'filled-arrow'
  | 'circle'
  | 'diamond'
  | 'filled-diamond';

// 连接点位置
export interface ConnectionPoint {
  id: string;
  type: ConnectionPointType;
  position: Point;
  offset: Point; // 相对于图形中心的偏移
  visible: boolean;
  highlighted: boolean;
}

// 连接线数据
export interface ConnectionData {
  id: string;
  fromShape: string;
  toShape: string;
  fromPoint: ConnectionPoint;
  toPoint: ConnectionPoint;
  path: Point[]; // 连接路径点
  style: ConnectionLineStyle;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: number[];
  opacity: number;
  startStyle: ConnectionEndStyle;
  endStyle: ConnectionEndStyle;
  label?: string;
  labelPosition?: 'start' | 'middle' | 'end' | 'auto';
  selected: boolean;
  hovering: boolean;
}

// 连接配置
export interface ConnectionConfig {
  enabled: boolean;
  showConnectionPoints: boolean;
  snapToPoints: boolean;
  snapThreshold: number;
  defaultStyle: ConnectionLineStyle;
  defaultStroke: string;
  defaultStrokeWidth: number;
  defaultEndStyle: ConnectionEndStyle;
  allowCurvedConnections: boolean;
  allowSelfConnections: boolean;
  maxConnectionPoints: number;
}

// 连接事件
export interface ConnectionEventMap {
  'connection:started': { fromShape: string; fromPoint: ConnectionPoint };
  'connection:preview': { fromShape: string; toShape: string; toPoint?: ConnectionPoint };
  'connection:created': { connection: ConnectionData };
  'connection:deleted': { connectionId: string };
  'connection:updated': { connectionId: string; changes: Partial<ConnectionData> };
  'connection:selected': { connectionId: string };
  'connection:deselected': { connectionId: string };
  'connection:hover': { connectionId: string };
  'connection:unhover': { connectionId: string };
  'connection-point:created': { shapeId: string; point: ConnectionPoint };
  'connection-point:deleted': { shapeId: string; pointId: string };
  'connection-point:hover': { shapeId: string; pointId: string };
  'connection-point:unhover': { shapeId: string; pointId: string };
}

// 连接点生成器
export interface ConnectionPointGenerator {
  generatePoints(shapeType: string, geometry: any): ConnectionPoint[];
  getPointPosition(shapeType: string, geometry: any, pointType: ConnectionPointType): Point;
}

// 路径计算器
export interface PathCalculator {
  calculatePath(
    fromPoint: Point,
    toPoint: Point,
    style: ConnectionLineStyle,
    obstacles?: string[]
  ): Point[];
  
  calculateOrthogonalPath(
    fromPoint: Point,
    toPoint: Point,
    obstacles?: string[]
  ): Point[];
  
  calculateBezierPath(
    fromPoint: Point,
    toPoint: Point,
    controlPointOffset?: number
  ): Point[];
}

// 连接管理器接口
export interface ConnectionManager {
  // 连接点管理
  getConnectionPoints(shapeId: string): ConnectionPoint[];
  addConnectionPoint(shapeId: string, point: ConnectionPoint): void;
  removeConnectionPoint(shapeId: string, pointId: string): void;
  updateConnectionPoint(shapeId: string, pointId: string, updates: Partial<ConnectionPoint>): void;
  
  // 连接线管理
  getConnection(connectionId: string): ConnectionData | null;
  getConnections(shapeId: string): ConnectionData[];
  createConnection(fromShape: string, toShape: string, fromPoint: ConnectionPoint, toPoint: ConnectionPoint): ConnectionData;
  deleteConnection(connectionId: string): void;
  updateConnection(connectionId: string, updates: Partial<ConnectionData>): void;
  
  // 连接查询
  findPath(fromShape: string, toShape: string): ConnectionData[] | null;
  getConnectedShapes(shapeId: string): string[];
  canConnect(fromShape: string, toShape: string): boolean;
  
  // 渲染支持
  renderConnection(connection: ConnectionData): string; // SVG path data
  renderConnectionPoint(point: ConnectionPoint, position: Point): string; // SVG element
}

// 连接工具配置
export interface ConnectionToolConfig {
  mode: 'connect' | 'edit';
  activeFromShape?: string;
  activeToPoint?: Point;
  tempPath?: Point[];
  showGuides: boolean;
  snapToGrid: boolean;
  gridSize: number;
}