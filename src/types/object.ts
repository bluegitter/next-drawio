import { CanvasObject, ObjectType, ObjectGeometry, ObjectStyle, ObjectMetadata } from './canvas';
import { Point, Size, Transform } from './common';

// 图形对象工厂选项
export interface ObjectFactoryOptions {
  id?: string;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
}

// 矩形对象
export interface RectangleObject extends CanvasObject {
  type: 'rectangle';
  geometry: ObjectGeometry & {
    width: number;
    height: number;
    cornerRadius?: number;
  };
}

// 圆形对象
export interface CircleObject extends CanvasObject {
  type: 'circle';
  geometry: ObjectGeometry & {
    x: number;
    y: number;
    radius: number;
  };
}

// 椭圆对象
export interface EllipseObject extends CanvasObject {
  type: 'ellipse';
  geometry: ObjectGeometry & {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
  };
}

// 直线对象
export interface LineObject extends CanvasObject {
  type: 'line';
  geometry: ObjectGeometry & {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

// 路径对象
export interface PathObject extends CanvasObject {
  type: 'path';
  geometry: ObjectGeometry & {
    path: import('./canvas').PathData;
    closed: boolean;
    smooth: boolean;
    simplifyTolerance?: number;
  };
}

// 文字对象
export interface TextObject extends CanvasObject {
  type: 'text';
  geometry: ObjectGeometry & {
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight?: string | number;
    fontStyle?: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    letterSpacing?: number;
    lineHeight?: number;
    maxWidth?: number;
    wordWrap?: boolean;
  };
}

// 图片对象
export interface ImageObject extends CanvasObject {
  type: 'image';
  geometry: ObjectGeometry & {
    x: number;
    y: number;
    width: number;
    height: number;
    src: string;
    image?: HTMLImageElement;
    preserveAspectRatio?: boolean;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

// 组对象
export interface GroupObject extends CanvasObject {
  type: 'group';
  geometry: ObjectGeometry & {
    objects: string[]; // 子对象ID列表
  };
  children: CanvasObject[];
}

// 符号对象
export interface SymbolObject extends CanvasObject {
  type: 'symbol';
  geometry: ObjectGeometry & {
    symbolId: string;
    instanceId?: string;
  };
}

// 多边形对象
export interface PolygonObject extends CanvasObject {
  type: 'polygon';
  geometry: ObjectGeometry & {
    points: Point[];
    closed: boolean;
  };
}

// 星形对象
export interface StarObject extends CanvasObject {
  type: 'star';
  geometry: ObjectGeometry & {
    x: number;
    y: number;
    outerRadius: number;
    innerRadius?: number;
    points: number;
    rotation?: number;
  };
}

// 自定义对象
export interface CustomObject extends CanvasObject {
  type: 'custom';
  geometry: ObjectGeometry & {
    customType: string;
    customData: Record<string, any>;
  };
}

// 对象创建数据
export interface ObjectCreateData {
  type: ObjectType;
  geometry: Partial<ObjectGeometry>;
  style?: Partial<ObjectStyle>;
  transform?: Partial<Transform>;
  metadata?: Partial<ObjectMetadata>;
  data?: Record<string, any>;
}

// 对象更新数据
export interface ObjectUpdateData {
  geometry?: Partial<ObjectGeometry>;
  style?: Partial<ObjectStyle>;
  transform?: Partial<Transform>;
  metadata?: Partial<ObjectMetadata>;
  data?: Record<string, any>;
}

// 对象选择信息
export interface ObjectSelection {
  id: string;
  object: CanvasObject;
  selected: boolean;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  handles: SelectionHandle[];
}

// 选择控制点
export interface SelectionHandle {
  id: string;
  type: 'corner' | 'edge' | 'rotate';
  position: Point;
  cursor: string;
  constrain?: boolean;
}

// 对象序列化数据
export interface SerializedObject {
  id: string;
  type: ObjectType;
  version: string;
  geometry: any;
  style: any;
  transform: Transform;
  metadata: ObjectMetadata;
  data: any;
}

// 对象克隆选项
export interface CloneOptions {
  offset?: Point;
  deep?: boolean;
  preserveId?: boolean;
  preserveMetadata?: boolean;
}

// 对象验证结果
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  property: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  property: string;
  message: string;
  suggestion?: string;
}

// 对象搜索选项
export interface SearchOptions {
  type?: ObjectType;
  name?: string;
  tags?: string[];
  visible?: boolean;
  locked?: boolean;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  style?: {
    fillColor?: string;
    strokeColor?: string;
  };
  metadata?: {
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  };
}

// 对象统计信息
export interface ObjectStats {
  total: number;
  byType: Record<ObjectType, number>;
  visible: number;
  hidden: number;
  locked: number;
  unlocked: number;
  grouped: number;
  memoryUsage: number;
}

// 对象渲染选项
export interface RenderOptions {
  omitIds?: string[];
  onlyIds?: string[];
  clipBounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  quality?: 'low' | 'medium' | 'high';
  ignoreEffects?: boolean;
  showBounds?: boolean;
  showSelection?: boolean;
}