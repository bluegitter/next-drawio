import { Point } from '@/types/common';
import { 
  ConnectionPoint, 
  ConnectionData, 
  ConnectionLineStyle, 
  ConnectionEndStyle,
  PathCalculator 
} from '@/types/connection';

/**
 * 连接路径计算器
 */
export class ConnectionPathCalculator implements PathCalculator {
  
  /**
   * 计算连接路径
   */
  calculatePath(
    fromPoint: Point,
    toPoint: Point,
    style: ConnectionLineStyle = 'straight',
    obstacles: string[] = []
  ): Point[] {
    switch (style) {
      case 'straight':
        return [fromPoint, toPoint];
      case 'orthogonal':
        return this.calculateOrthogonalPath(fromPoint, toPoint, obstacles);
      case 'curved':
        return this.calculateBezierPath(fromPoint, toPoint);
      case 'polyline':
        return this.calculatePolylinePath(fromPoint, toPoint, obstacles);
      case 'bezier':
        return this.calculateBezierPath(fromPoint, toPoint, 100);
      default:
        return [fromPoint, toPoint];
    }
  }

  /**
   * 计算正交路径（直角连接）
   */
  calculateOrthogonalPath(
    fromPoint: Point,
    toPoint: Point,
    obstacles: string[] = []
  ): Point[] {
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    
    // 确定主要方向和次要方向
    const primaryHorizontal = Math.abs(dx) > Math.abs(dy);
    
    const midX = fromPoint.x + dx * 0.5;
    const midY = fromPoint.y + dy * 0.5;
    
    if (primaryHorizontal) {
      // 水平为主，先水平再垂直
      return [
        fromPoint,
        { x: midX, y: fromPoint.y },
        { x: midX, y: toPoint.y },
        toPoint
      ];
    } else {
      // 垂直为主，先垂直再水平
      return [
        fromPoint,
        { x: fromPoint.x, y: midY },
        { x: toPoint.x, y: midY },
        toPoint
      ];
    }
  }

  /**
   * 计算贝塞尔曲线路径
   */
  calculateBezierPath(
    fromPoint: Point,
    toPoint: Point,
    controlPointOffset: number = 50
  ): Point[] {
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    
    // 计算控制点
    const control1X = fromPoint.x + controlPointOffset;
    const control1Y = fromPoint.y;
    const control2X = toPoint.x - controlPointOffset;
    const control2Y = toPoint.y;
    
    return [
      fromPoint,
      { x: control1X, y: control1Y },
      { x: control2X, y: control2Y },
      toPoint
    ];
  }

  /**
   * 计算多段线路径
   */
  calculatePolylinePath(
    fromPoint: Point,
    toPoint: Point,
    obstacles: string[] = []
  ): Point[] {
    // 简单的3点折线实现
    const midX = (fromPoint.x + toPoint.x) / 2;
    const midY = (fromPoint.y + toPoint.y) / 2;
    
    return [
      fromPoint,
      { x: midX, y: fromPoint.y },
      { x: midX, y: midY },
      { x: toPoint.x, y: midY },
      toPoint
    ];
  }

  /**
   * 计算自适应路径（根据连接点位置）
   */
  calculateAdaptivePath(
    fromPoint: Point,
    toPoint: Point,
    fromConnectionType: string,
    toConnectionType: string
  ): Point[] {
    // 根据连接点类型智能选择路径
    const getOppositeDirection = (type: string): string => {
      switch (type) {
        case 'top': return 'bottom';
        case 'bottom': return 'top';
        case 'left': return 'right';
        case 'right': return 'left';
        default: return 'center';
      }
    };

    const preferredPath = `${fromConnectionType}-${toConnectionType}`;
    
    switch (preferredPath) {
      case 'right-left':
      case 'left-right':
        // 水平连接
        return [
          fromPoint,
          { x: (fromPoint.x + toPoint.x) / 2, y: fromPoint.y },
          { x: (fromPoint.x + toPoint.x) / 2, y: toPoint.y },
          toPoint
        ];
      
      case 'top-bottom':
      case 'bottom-top':
        // 垂直连接
        return [
          fromPoint,
          { x: fromPoint.x, y: (fromPoint.y + toPoint.y) / 2 },
          { x: toPoint.x, y: (fromPoint.y + toPoint.y) / 2 },
          toPoint
        ];
      
      default:
        // 默认正交路径
        return this.calculateOrthogonalPath(fromPoint, toPoint);
    }
  }
}

/**
 * 连接线渲染器
 */
export class ConnectionRenderer {
  private pathCalculator: ConnectionPathCalculator;

  constructor() {
    this.pathCalculator = new ConnectionPathCalculator();
  }

  /**
   * 生成SVG路径字符串
   */
  generateSVGPath(connection: ConnectionData): string {
    const points = connection.path;
    if (points.length < 2) return '';

    const firstPoint = points[0];
    let pathData = `M ${firstPoint.x} ${firstPoint.y}`;

    if (connection.style === 'bezier' && points.length === 4) {
      // 贝塞尔曲线
      pathData += ` C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
    } else {
      // 折线或直线
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return pathData;
  }

  /**
   * 生成箭头标记
   */
  generateArrowMarker(id: string, style: ConnectionEndStyle, stroke: string = '#6b7280'): string {
    const markerId = `arrow-${id}-${style}`;
    
    switch (style) {
      case 'arrow':
        return `
          <defs>
            <marker id="${markerId}" markerWidth="10" markerHeight="10" 
                    refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="${stroke}" />
            </marker>
          </defs>
        `;
      
      case 'filled-arrow':
        return `
          <defs>
            <marker id="${markerId}" markerWidth="10" markerHeight="10" 
                    refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="${stroke}" />
            </marker>
          </defs>
        `;
      
      case 'circle':
        return `
          <defs>
            <marker id="${markerId}" markerWidth="8" markerHeight="8" 
                    refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
              <circle cx="4" cy="4" r="3" fill="white" stroke="${stroke}" stroke-width="1" />
            </marker>
          </defs>
        `;
      
      case 'diamond':
      case 'filled-diamond':
        return `
          <defs>
            <marker id="${markerId}" markerWidth="10" markerHeight="10" 
                    refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,5 L5,0 L10,5 L5,10 z" 
                    fill="${style === 'filled-diamond' ? stroke : 'white'}" 
                    stroke="${stroke}" stroke-width="1" />
            </marker>
          </defs>
        `;
      
      default:
        return '';
    }
  }

  /**
   * 渲染连接线SVG元素
   */
  renderConnection(connection: ConnectionData): string {
    const pathData = this.generateSVGPath(connection);
    const strokeDasharray = connection.strokeDasharray?.join(',') || '';
    
    let markers = '';
    if (connection.startStyle !== 'none') {
      markers += this.generateArrowMarker(`start-${connection.id}`, connection.startStyle, connection.stroke);
    }
    if (connection.endStyle !== 'none') {
      markers += this.generateArrowMarker(`end-${connection.id}`, connection.endStyle, connection.stroke);
    }

    const markerStart = connection.startStyle !== 'none' ? `url(#arrow-start-${connection.id}-${connection.startStyle})` : '';
    const markerEnd = connection.endStyle !== 'none' ? `url(#arrow-end-${connection.id}-${connection.endStyle})` : '';

    return `
      ${markers}
      <path
        id="${connection.id}"
        d="${pathData}"
        stroke="${connection.stroke}"
        stroke-width="${connection.strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        opacity="${connection.opacity}"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        marker-start="${markerStart}"
        marker-end="${markerEnd}"
        class="connection-path ${connection.selected ? 'selected' : ''} ${connection.hovering ? 'hovering' : ''}"
        style="cursor: pointer;"
      />
      ${this.renderConnectionLabel(connection)}
    `;
  }

  /**
   * 渲染连接线标签
   */
  private renderConnectionLabel(connection: ConnectionData): string {
    if (!connection.label) return '';

    const pathPoints = connection.path;
    if (pathPoints.length < 2) return '';

    let labelPosition: Point;
    
    switch (connection.labelPosition) {
      case 'start':
        labelPosition = pathPoints[0];
        break;
      case 'end':
        labelPosition = pathPoints[pathPoints.length - 1];
        break;
      case 'middle':
      default:
        const midIndex = Math.floor(pathPoints.length / 2);
        labelPosition = pathPoints[midIndex];
        break;
    }

    return `
      <text
        id="${connection.id}-label"
        x="${labelPosition.x}"
        y="${labelPosition.y - 8}"
        text-anchor="middle"
        font-size="12"
        font-family="Arial, sans-serif"
        fill="#374151"
        class="connection-label"
        style="pointer-events: none; user-select: none;"
      >
        ${connection.label}
      </text>
    `;
  }

  /**
   * 渲染连接点
   */
  renderConnectionPoint(point: ConnectionPoint, position: Point): string {
    const radius = point.highlighted ? 6 : 4;
    const color = point.highlighted ? '#3b82f6' : '#6b7280';
    
    if (!point.visible) return '';

    return `
      <circle
        id="${point.id}"
        cx="${position.x}"
        cy="${position.y}"
        r="${radius}"
        fill="${color}"
        stroke="white"
        stroke-width="2"
        class="connection-point ${point.highlighted ? 'highlighted' : ''}"
        style="cursor: crosshair;"
        data-type="${point.type}"
      />
    `;
  }

  /**
   * 更新连接路径（当图形移动时）
   */
  updateConnectionPath(connection: ConnectionData, fromPos: Point, toPos: Point): ConnectionData {
    const newPath = this.pathCalculator.calculatePath(fromPos, toPos, connection.style);
    
    return {
      ...connection,
      path: newPath,
      fromPoint: { ...connection.fromPoint, position: fromPos },
      toPoint: { ...connection.toPoint, position: toPos }
    };
  }
}

/**
 * 连接点生成器
 */
export class DefaultConnectionPointGenerator {
  /**
   * 为图形生成连接点
   */
  generatePoints(shapeType: string, geometry: any): ConnectionPoint[] {
    switch (shapeType) {
      case 'rect':
      case 'rectangle':
        return this.generateRectanglePoints(geometry);
      case 'circle':
        return this.generateCirclePoints(geometry);
      case 'triangle':
        return this.generateTrianglePoints(geometry);
      case 'text':
        return this.generateTextPoints(geometry);
      default:
        return this.generateDefaultPoints(geometry);
    }
  }

  private generateRectanglePoints(geometry: any): ConnectionPoint[] {
    const { x = 0, y = 0, width = 100, height = 60 } = geometry;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return [
      {
        id: `point-top-${Date.now()}`,
        type: 'top',
        position: { x: centerX, y },
        offset: { x: 0, y: -height / 2 },
        visible: true,
        highlighted: false
      },
      {
        id: `point-right-${Date.now()}`,
        type: 'right',
        position: { x: x + width, y: centerY },
        offset: { x: width / 2, y: 0 },
        visible: true,
        highlighted: false
      },
      {
        id: `point-bottom-${Date.now()}`,
        type: 'bottom',
        position: { x: centerX, y: y + height },
        offset: { x: 0, y: height / 2 },
        visible: true,
        highlighted: false
      },
      {
        id: `point-left-${Date.now()}`,
        type: 'left',
        position: { x, y: centerY },
        offset: { x: -width / 2, y: 0 },
        visible: true,
        highlighted: false
      },
      {
        id: `point-center-${Date.now()}`,
        type: 'center',
        position: { x: centerX, y: centerY },
        offset: { x: 0, y: 0 },
        visible: true,
        highlighted: false
      }
    ];
  }

  private generateCirclePoints(geometry: any): ConnectionPoint[] {
    const { x = 0, y = 0, radius = 40 } = geometry;

    return [
      {
        id: `point-top-${Date.now()}`,
        type: 'top',
        position: { x, y: y - radius },
        offset: { x: 0, y: -radius },
        visible: true,
        highlighted: false
      },
      {
        id: `point-right-${Date.now()}`,
        type: 'right',
        position: { x: x + radius, y },
        offset: { x: radius, y: 0 },
        visible: true,
        highlighted: false
      },
      {
        id: `point-bottom-${Date.now()}`,
        type: 'bottom',
        position: { x, y: y + radius },
        offset: { x: 0, y: radius },
        visible: true,
        highlighted: false
      },
      {
        id: `point-left-${Date.now()}`,
        type: 'left',
        position: { x: x - radius, y },
        offset: { x: -radius, y: 0 },
        visible: true,
        highlighted: false
      },
      {
        id: `point-center-${Date.now()}`,
        type: 'center',
        position: { x, y },
        offset: { x: 0, y: 0 },
        visible: true,
        highlighted: false
      }
    ];
  }

  private generateTrianglePoints(geometry: any): ConnectionPoint[] {
    const points = geometry.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
    if (points.length === 0) return [];

    const centerX = points.reduce((sum: number, p: number[]) => sum + p[0], 0) / points.length;
    const centerY = points.reduce((sum: number, p: number[]) => sum + p[1], 0) / points.length;

    return [
      {
        id: `point-center-${Date.now()}`,
        type: 'center',
        position: { x: centerX, y: centerY },
        offset: { x: 0, y: 0 },
        visible: true,
        highlighted: false
      }
    ];
  }

  private generateTextPoints(geometry: any): ConnectionPoint[] {
    const { x = 0, y = 0 } = geometry;

    return [
      {
        id: `point-center-${Date.now()}`,
        type: 'center',
        position: { x, y },
        offset: { x: 0, y: 0 },
        visible: true,
        highlighted: false
      }
    ];
  }

  private generateDefaultPoints(geometry: any): ConnectionPoint[] {
    const { x = 0, y = 0 } = geometry;

    return [
      {
        id: `point-center-${Date.now()}`,
        type: 'center',
        position: { x, y },
        offset: { x: 0, y: 0 },
        visible: true,
        highlighted: false
      }
    ];
  }

  /**
   * 获取特定类型的连接点位置
   */
  getPointPosition(shapeType: string, geometry: any, pointType: string): Point {
    const points = this.generatePoints(shapeType, geometry);
    const point = points.find(p => p.type === pointType);
    return point?.position || { x: geometry.x || 0, y: geometry.y || 0 };
  }
}
