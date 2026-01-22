import type React from 'react';
import type { SVGShape } from '../types';

// 圆角handle常量（与useSelection中的定义保持一致）
const CORNER_HANDLE = {
  size: 5,
  offset: 6,
  fill: '#f59e0b',
  stroke: '#d97706',
  strokeWidth: 2,
  opacity: 0.8,
};

interface HandleResizeArgs {
  shapes: SVGShape[];
  dx: number;
  dy: number;
  x: number;
  y: number;
  resizeHandle: string | null;
  selectedShape: string | null;
  draggingCornerHandle: { shapeId: string; handleType: string; startCornerRadius: number } | null;
  cornerHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  updateShapeSize: (shape: SVGShape, handle: string, dx: number, dy: number) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
  refreshCornerHandles: (shape: SVGShape) => void;
  showCornerHandles: (shape: SVGShape) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
}

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
  showCornerHandles,
  updateConnectionLine,
}: HandleResizeArgs) => {
  if (draggingCornerHandle) {
    const shape = shapes.find(s => s.id === draggingCornerHandle.shapeId);
    if (shape && shape.type === 'roundedRect') {
      const { x: shapeX = 0, y: shapeY = 0, width: shapeWidth = 0, height: shapeHeight = 0 } = shape.data;
      const maxRadius = Math.min(shapeWidth, shapeHeight) / 2;
      const currentCornerRadius = shape.data.cornerRadius || 0;
      // 反转逻辑：向左移动(dx为负)增大圆角，向右移动(dx为正)减小圆角
      const newCornerRadius = Math.max(0, Math.min(maxRadius, currentCornerRadius - dx));

      shape.element.setAttribute('rx', String(newCornerRadius));
      shape.element.setAttribute('ry', String(newCornerRadius));

      // 计算新的handle位置（基于新的圆角大小）
      const offset = shapeHeight / 8;
      const radiusRatio = newCornerRadius / maxRadius;  // 新的圆角比例
      const rightTopX = shapeX + shapeWidth;
      const rightTopY = shapeY;
      const handleX = rightTopX - (radiusRatio * shapeHeight / 3);  // 圆角为0时，handle在最右边
      const handleY = rightTopY + offset;

      const handles = cornerHandlesRef.current.get(shape.id);
      const handleEl = handles?.find(h => h.getAttribute('data-corner-handle') === draggingCornerHandle.handleType);
      if (handleEl) {
        const size = Number(handleEl.getAttribute('width')) || 10;
        handleEl.setAttribute('x', String(handleX - size / 2));
        handleEl.setAttribute('y', String(handleY - size / 2));
      }

      const updatedShape = {
        ...shape,
        data: {
          ...shape.data,
          cornerRadius: newCornerRadius
        }
      };

      const nextShapes = shapes.map(s => s.id === shape.id ? updatedShape : s);
      setShapesState(() => nextShapes);

      setDraggingCornerHandle({
        ...draggingCornerHandle,
        startCornerRadius: newCornerRadius
      });

      setDragStart({ x, y });
      return true;
    }
  } else if (selectedShape && resizeHandle) {
    const shape = shapes.find(s => s.id === selectedShape);
    if (shape) {
      updateShapeSize(shape, resizeHandle, dx, dy);
      refreshResizeHandles(shape);
      refreshCornerHandles(shape);

      if (shape.type === 'roundedRect') {
        showCornerHandles(shape);
      }
    }

    if (shape) {
      const nextShapes = shapes.map(s => s.id === shape.id ? { ...shape, data: { ...shape.data }, connections: shape.connections ? [...shape.connections] : undefined, element: shape.element } : s);
      shape.connections?.forEach(connId => {
        const connLine = nextShapes.find(s => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id, nextShapes);
        }
      });
      setShapesState(() => nextShapes);
    }
  }

  setDragStart({ x, y });
  return true;
};
