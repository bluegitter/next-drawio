import type { SVGShape } from '../types';
import { DEFAULTS } from '../../constants';
import type { RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

// 安全地获取CORNER_HANDLE常量
const CORNER_HANDLE = DEFAULTS?.CORNER_HANDLE || {
  size: 5,
  offset: 6,
  fill: '#f59e0b',
  stroke: '#d97706',
  strokeWidth: 2,
  opacity: 0.8,
};

type HandleResizeArgs = {
  shapes: SVGShape[];
  dx: number;
  dy: number;
  x: number;
  y: number;
  resizeHandle: string | null;
  selectedShape: string | null;
  draggingCornerHandle: { shapeId: string; handleType: string; startCornerRadius: number } | null;
  cornerHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setDraggingCornerHandle: (next: { shapeId: string; handleType: string; startCornerRadius: number } | null) => void;
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  updateShapeSize: (shape: SVGShape, handle: string, dx: number, dy: number) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
  refreshCornerHandles: (shape: SVGShape) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
  viewBoxMinX: number;
  viewBoxMinY: number;
};

export const handleResizeMove = ({
  shapes,
  dx,
  dy,
  x,
  y,
  resizeHandle,
  selectedShape,
  draggingCornerHandle,
  cornerHandlesRef,
  setShapesState,
  setDraggingCornerHandle,
  setDragStart,
  updateShapeSize,
  refreshResizeHandles,
  refreshCornerHandles,
  updateConnectionLine,
  viewBoxMinX,
  viewBoxMinY,
}: HandleResizeArgs) => {
  if (draggingCornerHandle) {
    const shapeIndex = shapes.findIndex((s) => s.id === draggingCornerHandle.shapeId);
    if (shapeIndex === -1) return false;
    
    const shape = shapes[shapeIndex];
    if (shape.type === 'roundedRect') {
      const { x: shapeX = 0, y: shapeY = 0, width: shapeWidth = 0, height: shapeHeight = 0 } = shape.data;
      const maxRadius = Math.min(shapeWidth, shapeHeight) / 2;
      const currentCornerRadius = shape.data.cornerRadius || 0;
      // 反转逻辑：向左移动(dx为负)增大圆角，向右移动(dx为正)减小圆角
      const newCornerRadius = Math.max(0, Math.min(maxRadius, currentCornerRadius - dx));

      shape.element.setAttribute('rx', String(newCornerRadius));
      shape.element.setAttribute('ry', String(newCornerRadius));

      // 创建新的shape对象以确保Vue响应式更新
      const updatedShape = {
        ...shape,
        data: {
          ...shape.data,
          cornerRadius: newCornerRadius,
        },
      };

      // 计算新的handle位置（基于新的圆角大小）
      const offset = shapeHeight / 8;
      const radiusRatio = newCornerRadius / maxRadius;  // 新的圆角比例
      const rightTopX = shapeX + shapeWidth;
      const rightTopY = shapeY;
      const handleX = rightTopX - (radiusRatio * shapeHeight / 3);  // 圆角为0时，handle在最右边
      const handleY = rightTopY + offset;

      // 获取形状的旋转变换
      const rotation = shape.data.rotation || 0;
      const scale = shape.data.scale || 1;
      const centerX = shapeX + shapeWidth / 2;
      const centerY = shapeY + shapeHeight / 2;

      // 应用旋转变换到handle位置
      const toRadians = (degrees: number) => degrees * Math.PI / 180;
      const rotatePoint = (x: number, y: number, cx: number, cy: number, angle: number) => {
        const rad = toRadians(angle);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return {
          x: (x - cx) * cos - (y - cy) * sin + cx,
          y: (x - cx) * sin + (y - cy) * cos + cy
        };
      };

      const scalePoint = (x: number, y: number, cx: number, cy: number, s: number) => {
        return {
          x: (x - cx) * s + cx,
          y: (y - cy) * s + cy
        };
      };

      // 先缩放再旋转
      let transformedHandle = scalePoint(handleX, handleY, centerX, centerY, scale);
      transformedHandle = rotatePoint(transformedHandle.x, transformedHandle.y, centerX, centerY, rotation);

      const handles = getRefValue(cornerHandlesRef)?.get(shape.id);
      const handleEl = handles?.find(
        (h) => h.getAttribute('data-corner-handle') === draggingCornerHandle.handleType
      );
      
      if (handleEl) {
        const size = CORNER_HANDLE.size || 5;
        const newHandleX = transformedHandle.x - size / 2;
        const newHandleY = transformedHandle.y - size / 2;
        
        handleEl.setAttribute('x', String(newHandleX));
        handleEl.setAttribute('y', String(newHandleY));
      }

      // 更新shapes数组以触发Vue响应式
      const nextShapes = [...shapes];
      nextShapes[shapeIndex] = updatedShape;
      setShapesState(() => nextShapes);

      setDraggingCornerHandle({
        ...draggingCornerHandle,
        startCornerRadius: newCornerRadius,
      });

      setDragStart({ x, y, viewBoxMinX, viewBoxMinY });
      return true;
    }
  } else if (selectedShape && resizeHandle) {
    const shape = shapes.find((s) => s.id === selectedShape);
    if (shape) {
      updateShapeSize(shape, resizeHandle, dx, dy);
      refreshResizeHandles(shape);
      refreshCornerHandles(shape);
      
      // 移除不必要的showCornerHandles调用

      const nextShapes = shapes.map((s) =>
        s.id === shape.id
          ? { ...shape, data: { ...shape.data }, connections: shape.connections ? [...shape.connections] : undefined, element: shape.element }
          : s
      );
      shape.connections?.forEach((connId) => {
        const connLine = nextShapes.find((s) => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id, nextShapes);
        }
      });
      setShapesState(() => nextShapes);
    }
  }

  setDragStart({ x, y, viewBoxMinX, viewBoxMinY });
  return true;
};
