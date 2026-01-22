import type { Ref } from 'vue';
import type { ShapeDefinition } from '@drawio/core';
import { DEFAULTS } from '@drawio/core';
import type { SVGShape } from '../types';

// 安全地获取CORNER_HANDLE常量，避免未定义错误
const CORNER_HANDLE = DEFAULTS?.CORNER_HANDLE || {
  size: 5,
  offset: 6,
  fill: '#f59e0b',
  stroke: '#d97706',
  strokeWidth: 2,
  opacity: 0.8,
};

type UseSelectionArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  createSVGElement: (tagName: string) => SVGElement | null;
  getBounds: (shape: SVGShape) => { x: number; y: number; w: number; h: number };
  getDef: (shapeOrType: SVGShape | string) => ShapeDefinition | undefined;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  onShapeSelect?: (shape: SVGElement | null) => void;
  setSelectedShape: (id: string | null) => void;
  setIsResizing: (next: boolean) => void;
  setResizeHandle: (next: string | null) => void;
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  setDraggingCornerHandle: (next: { shapeId: string; handleType: string; startCornerRadius: number } | null) => void;
  resizeHandlesRef: { value: Map<string, SVGElement[]> };
  cornerHandlesRef: { value: Map<string, SVGElement[]> };
  textSelectionRef: { value: Map<string, SVGRectElement> };
  editingInputRef: Ref<HTMLInputElement | null>;
  setEditingText: (next: {
    id: string;
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    letterSpacing?: string;
    lineHeight?: string;
    color?: string;
  } | null) => void;
  viewBoxMinX: Ref<number>;
  viewBoxMinY: Ref<number>;
};

export const useSelection = ({
  svgRef,
  createSVGElement,
  getBounds,
  getDef,
  getPointerPosition,
  onShapeSelect,
  setSelectedShape,
  setIsResizing,
  setResizeHandle,
  setDragStart,
  setDraggingCornerHandle,
  resizeHandlesRef,
  cornerHandlesRef,
  textSelectionRef,
  editingInputRef,
  setEditingText,
  viewBoxMinX,
  viewBoxMinY,
}: UseSelectionArgs) => {
  const beginEditText = (shape: SVGShape) => {
    if (!svgRef.value || shape.type !== 'text') return;
    const svgBox = svgRef.value.getBoundingClientRect();
    const rectBox = shape.element.getBoundingClientRect();
    const padding = 1.5;
    const width = Math.max(rectBox.width + padding * 2, 60);
    const height = Math.max(rectBox.height + padding * 2, rectBox.height || 20);
    setSelectedShape(shape.id);
    const cs = window.getComputedStyle(shape.element);
    const fontSize =
      Number(shape.element.getAttribute('font-size')) || parseFloat(cs.fontSize) || shape.data.fontSize || 20;
    const fontFamily = shape.element.getAttribute('font-family') || (shape.data as any).fontFamily || cs.fontFamily;
    const fontWeight = shape.element.getAttribute('font-weight') || (shape.data as any).fontWeight || cs.fontWeight;
    const fontStyle = shape.element.getAttribute('font-style') || cs.fontStyle;
    const letterSpacing = cs.letterSpacing;
    const lineHeight = cs.lineHeight;
    const color = shape.element.getAttribute('fill') || shape.data.fill || (cs as any).fill;
    (shape.element as any).dataset.prevOpacity = shape.element.style.opacity;
    shape.element.style.opacity = '0';
    setEditingText({
      id: shape.id,
      value: shape.data.text || shape.element.textContent || '',
      x: rectBox.left - svgBox.left - padding,
      y: rectBox.top - svgBox.top - padding,
      width,
      height,
      fontSize,
      fontFamily: fontFamily || 'Arial, sans-serif',
      fontWeight: fontWeight || 'normal',
      fontStyle: fontStyle || 'normal',
      letterSpacing,
      lineHeight,
      color: color || '#000000',
    });
    setTimeout(() => editingInputRef.value?.focus(), 0);
  };

  const hideResizeHandles = (shapeId?: string) => {
    if (shapeId) {
      const handles = resizeHandlesRef.value.get(shapeId);
      handles?.forEach((h) => h.remove());
      resizeHandlesRef.value.delete(shapeId);
      return;
    }
    resizeHandlesRef.value.forEach((list) => list.forEach((h) => h.remove()));
    resizeHandlesRef.value.clear();
  };

  const hideCornerHandles = (shapeId?: string) => {
    if (shapeId) {
      const handles = cornerHandlesRef.value.get(shapeId);
      handles?.forEach((h) => h.remove());
      cornerHandlesRef.value.delete(shapeId);
      return;
    }
    cornerHandlesRef.value.forEach((list) => list.forEach((h) => h.remove()));
    cornerHandlesRef.value.clear();
  };

  const showResizeHandles = (shape: SVGShape) => {
    if (!svgRef.value) return;
    if (shape.type === 'line' || shape.type === 'connector') return;
    hideResizeHandles(shape.id);
    const bounds = getBounds(shape);
    
    // 获取形状的变换属性
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;
    
    const outline = createSVGElement('rect');
    const created: SVGElement[] = [];
    if (outline) {
      outline.setAttribute('x', String(bounds.x));
      outline.setAttribute('y', String(bounds.y));
      outline.setAttribute('width', String(bounds.w));
      outline.setAttribute('height', String(bounds.h));
      outline.setAttribute('fill', 'none');
      outline.setAttribute('stroke', '#38bdf8');
      outline.setAttribute('stroke-width', '1');
      outline.setAttribute('stroke-dasharray', '4,4');
      outline.setAttribute('pointer-events', 'none');
      outline.setAttribute('data-resize', 'outline');
      
      // 应用与形状相同的变换到选择框
      const transforms = [
        `translate(${centerX} ${centerY})`,
        rotation !== 0 ? `rotate(${rotation})` : null,
        scale !== 1 ? `scale(${scale})` : null,
        `translate(${-centerX} ${-centerY})`,
      ].filter((value): value is string => Boolean(value));
      
      if (transforms.length) {
        outline.setAttribute('transform', transforms.join(' '));
      }
      
      svgRef.value.appendChild(outline);
      created.push(outline);
    }
    
    // 计算变换后的控制点位置
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
    
    const basePoints = [
      { id: 'nw', x: bounds.x, y: bounds.y },
      { id: 'ne', x: bounds.x + bounds.w, y: bounds.y },
      { id: 'sw', x: bounds.x, y: bounds.y + bounds.h },
      { id: 'se', x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    ];
    
    // 应用缩放和旋转变换到控制点
    const points = basePoints.map(p => {
      let point = scalePoint(p.x, p.y, centerX, centerY, scale);
      point = rotatePoint(point.x, point.y, centerX, centerY, rotation);
      return { id: p.id, x: point.x, y: point.y };
    });
    
    points.forEach((p) => {
      const handle = createSVGElement('rect');
      if (!handle) return;
      handle.setAttribute('x', String(p.x - 6));
      handle.setAttribute('y', String(p.y - 6));
      handle.setAttribute('width', '12');
      handle.setAttribute('height', '12');
      handle.setAttribute('rx', '6');
      handle.setAttribute('ry', '6');
      handle.setAttribute('fill', '#38bdf8');
      handle.setAttribute('stroke', '#38bdf8');
      handle.setAttribute('stroke-width', '1');
      handle.setAttribute('data-resize', p.id);
      handle.setAttribute('cursor', `${p.id}-resize`);
      const onDown = (e: MouseEvent) => {
        e.stopPropagation();
        setSelectedShape(shape.id);
        onShapeSelect?.(shape.element);
        setIsResizing(true);
        setResizeHandle(p.id);
        const pos = getPointerPosition(e.clientX, e.clientY);
        setDragStart({ x: pos.x, y: pos.y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
      };
      handle.addEventListener('mousedown', onDown);
      svgRef.value?.appendChild(handle);
      created.push(handle);
    });
    resizeHandlesRef.value.set(shape.id, created);
  };

  const showCornerHandles = (shape: SVGShape) => {
    if (!svgRef.value || shape.type !== 'roundedRect') return;
    hideCornerHandles(shape.id);
    const def = getDef(shape);
    if (!def?.getCornerHandles) return;
    const cornerHandles = def.getCornerHandles(shape);
    const created: SVGElement[] = [];

    // 获取形状的变换属性
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const bounds = getBounds(shape);
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;

    // 计算变换后的圆角控制点位置
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

    cornerHandles.forEach((corner) => {
      const handle = createSVGElement('rect');
      if (!handle) return;
      
      // 应用缩放和旋转变换到圆角控制点
      let point = scalePoint(corner.x, corner.y, centerX, centerY, scale);
      point = rotatePoint(point.x, point.y, centerX, centerY, rotation);
      
      const size = CORNER_HANDLE.size;
      handle.setAttribute('x', String(point.x - size / 2));
      handle.setAttribute('y', String(point.y - size / 2));
      handle.setAttribute('width', String(size));
      handle.setAttribute('height', String(size));
      handle.setAttribute('fill', CORNER_HANDLE.fill);
      handle.setAttribute('stroke', CORNER_HANDLE.stroke);
      handle.setAttribute('stroke-width', String(CORNER_HANDLE.strokeWidth));
      handle.setAttribute('data-corner-handle', corner.type);
      handle.setAttribute('data-shape-id', shape.id);
      handle.setAttribute('cursor', corner.cursor);
      handle.style.opacity = String(CORNER_HANDLE.opacity);

      const onCornerMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        setDraggingCornerHandle({
          shapeId: shape.id,
          handleType: corner.type,
          startCornerRadius: shape.data.cornerRadius || 0,
        });
        setIsResizing(true);
        const pos = getPointerPosition(e.clientX, e.clientY);
        setDragStart({ x: pos.x, y: pos.y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
      };

      handle.addEventListener('mousedown', onCornerMouseDown);
      svgRef.value?.appendChild(handle);
      created.push(handle);
    });

    cornerHandlesRef.value.set(shape.id, created);
  };

  const refreshCornerHandles = (shape: SVGShape) => {
    const handles = cornerHandlesRef.value.get(shape.id);
    if (!handles || handles.length === 0 || shape.type !== 'roundedRect') return;
    
    const def = getDef(shape);
    if (!def?.getCornerHandles) return;
    
    const cornerHandles = def.getCornerHandles(shape);
    const bounds = getBounds(shape);
    
    // 获取形状的变换属性
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;
    
    // 计算变换后的圆角控制点位置
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

    handles.forEach((handle, index) => {
      const corner = cornerHandles[index];
      if (!corner) return;
      
      // 应用缩放和旋转变换到圆角控制点
      let point = scalePoint(corner.x, corner.y, centerX, centerY, scale);
      point = rotatePoint(point.x, point.y, centerX, centerY, rotation);
      
      const size = CORNER_HANDLE.size;
      handle.setAttribute('x', String(point.x - size / 2));
      handle.setAttribute('y', String(point.y - size / 2));
    });
  };

  const refreshResizeHandles = (shape: SVGShape) => {
    const handles = resizeHandlesRef.value.get(shape.id);
    if (!handles || handles.length === 0) return;
    const bounds = getBounds(shape);
    
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;
    
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    handles.forEach((h) => {
      const id = h.getAttribute('data-resize');
      if (id === 'outline') {
        h.setAttribute('x', String(bounds.x));
        h.setAttribute('y', String(bounds.y));
        h.setAttribute('width', String(bounds.w));
        h.setAttribute('height', String(bounds.h));
        
        const transforms = [
          `translate(${centerX} ${centerY})`,
          rotation !== 0 ? `rotate(${rotation})` : null,
          scale !== 1 ? `scale(${scale})` : null,
          `translate(${-centerX} ${-centerY})`,
        ].filter((value): value is string => Boolean(value));
        
        if (transforms.length) {
          h.setAttribute('transform', transforms.join(' '));
        } else {
          h.removeAttribute('transform');
        }
        return;
      }
      
      const pos = {
        nw: { x: bounds.x, y: bounds.y },
        ne: { x: bounds.x + bounds.w, y: bounds.y },
        sw: { x: bounds.x, y: bounds.y + bounds.h },
        se: { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
      } as const;
      const key = id as 'nw' | 'ne' | 'sw' | 'se' | null;
      if (!key) return;
      const p = pos[key];
      
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const scaledX = dx * scale;
      const scaledY = dy * scale;
      const rx = scaledX * cos - scaledY * sin;
      const ry = scaledX * sin + scaledY * cos;
      const transformedX = centerX + rx;
      const transformedY = centerY + ry;
      
      h.setAttribute('x', String(transformedX - 6));
      h.setAttribute('y', String(transformedY - 6));
    });
  };

  const hideTextSelection = (shapeId?: string) => {
    if (shapeId) {
      const handle = textSelectionRef.value.get(shapeId);
      handle?.remove();
      textSelectionRef.value.delete(shapeId);
      return;
    }
    textSelectionRef.value.forEach((h) => h.remove());
    textSelectionRef.value.clear();
  };

  const showTextSelection = (shape: SVGShape) => {
    if (!svgRef.value || shape.type !== 'text') return;
    hideTextSelection(shape.id);
    const bounds = getBounds(shape);
    const outline = createSVGElement('rect');
    if (!outline) return;
    outline.setAttribute('x', String(bounds.x - 4));
    outline.setAttribute('y', String(bounds.y - 4));
    outline.setAttribute('width', String(bounds.w + 8));
    outline.setAttribute('height', String(bounds.h + 8));
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#6366f1');
    outline.setAttribute('stroke-width', '1');
    outline.setAttribute('stroke-dasharray', '4,4');
    outline.setAttribute('data-text-selection', shape.id);
    outline.setAttribute('pointer-events', 'none');
    svgRef.value.appendChild(outline);
    textSelectionRef.value.set(shape.id, outline as SVGRectElement);
  };

  return {
    beginEditText,
    showResizeHandles,
    refreshResizeHandles,
    refreshCornerHandles,
    showCornerHandles,
    hideResizeHandles,
    hideCornerHandles,
    showTextSelection,
    hideTextSelection,
  };
};
