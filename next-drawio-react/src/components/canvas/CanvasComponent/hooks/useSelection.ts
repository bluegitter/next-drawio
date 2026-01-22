import { useCallback } from 'react';
import type React from 'react';
import type { ShapeDefinition } from '@drawio/core';
import { DEFAULTS } from '@drawio/core';
import type { SVGShape } from '../types';

// 安全地获取CORNER_HANDLE常量
const CORNER_HANDLE = DEFAULTS?.CORNER_HANDLE || {
  size: 5,
  offset: 6,
  fill: '#f59e0b',
  stroke: '#d97706',
  strokeWidth: 2,
  rotation: 45,
  opacity: 0.8,
};

interface UseSelectionArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  createSVGElement: (tagName: string) => SVGElement | null;
  getBounds: (shape: SVGShape) => { x: number; y: number; w: number; h: number };
  getDef: (shapeOrType: SVGShape | string) => ShapeDefinition | undefined;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  onShapeSelect?: (shape: SVGElement | null) => void;
  setSelectedShape: (id: string | null) => void;
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
  resizeHandlesRef: React.MutableRefObject<Map<string, SVGElement[]>>;
  cornerHandlesRef: React.MutableRefObject<Map<string, SVGElement[]>>;
  textSelectionRef: React.MutableRefObject<Map<string, SVGRectElement>>;
  editingInputRef: React.MutableRefObject<HTMLInputElement | null>;
  setEditingText: React.Dispatch<React.SetStateAction<{
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
  } | null>>;
}

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
}: UseSelectionArgs) => {
  const beginEditText = useCallback((shape: SVGShape) => {
    if (!svgRef.current || shape.type !== 'text') return;
    const svgBox = svgRef.current.getBoundingClientRect();
    const rectBox = shape.element.getBoundingClientRect();
    const padding = 1.5;
    const width = Math.max(rectBox.width + padding * 2, 60);
    const height = Math.max(rectBox.height + padding * 2, rectBox.height || 20);
    setSelectedShape(shape.id);
    const cs = window.getComputedStyle(shape.element);
    const fontSize = Number(shape.element.getAttribute('font-size')) || parseFloat(cs.fontSize) || shape.data.fontSize || 20;
    const fontFamily = shape.element.getAttribute('font-family') || (shape.data as any).fontFamily || cs.fontFamily;
    const fontWeight = shape.element.getAttribute('font-weight') || (shape.data as any).fontWeight || cs.fontWeight;
    const fontStyle = shape.element.getAttribute('font-style') || cs.fontStyle;
    const letterSpacing = cs.letterSpacing;
    const lineHeight = cs.lineHeight;
    const color = shape.element.getAttribute('fill') || shape.data.fill || cs.fill;
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
    setTimeout(() => editingInputRef.current?.focus(), 0);
  }, [editingInputRef, setEditingText, setSelectedShape, svgRef]);

  const hideResizeHandles = useCallback((shapeId?: string) => {
    if (shapeId) {
      const handles = resizeHandlesRef.current.get(shapeId);
      handles?.forEach(h => h.remove());
      resizeHandlesRef.current.delete(shapeId);
      return;
    }
    resizeHandlesRef.current.forEach(list => list.forEach(h => h.remove()));
    resizeHandlesRef.current.clear();
  }, [resizeHandlesRef]);

  const hideCornerHandles = useCallback((shapeId?: string) => {
    if (shapeId) {
      const handles = cornerHandlesRef.current.get(shapeId);
      handles?.forEach(h => h.remove());
      cornerHandlesRef.current.delete(shapeId);
      return;
    }
    cornerHandlesRef.current.forEach(list => list.forEach(h => h.remove()));
    cornerHandlesRef.current.clear();
  }, [cornerHandlesRef]);

  const showResizeHandles = useCallback((shape: SVGShape) => {
    if (!svgRef.current) return;
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
      
      svgRef.current!.appendChild(outline);
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
    points.forEach(p => {
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
        setDragStart(getPointerPosition(e.clientX, e.clientY));
      };
      handle.addEventListener('mousedown', onDown);
      svgRef.current!.appendChild(handle);
      created.push(handle);
    });
    resizeHandlesRef.current.set(shape.id, created);
  }, [createSVGElement, getBounds, getPointerPosition, hideResizeHandles, onShapeSelect, resizeHandlesRef, setDragStart, setIsResizing, setResizeHandle, setSelectedShape, svgRef]);

  const showCornerHandles = useCallback((shape: SVGShape) => {
    if (!svgRef.current || shape.type !== 'roundedRect') return;
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

    cornerHandles.forEach(corner => {
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
      // 圆角handle自身的旋转也要考虑形状的旋转
      handle.setAttribute('transform', `rotate(${CORNER_HANDLE.rotation + rotation} ${point.x} ${point.y})`);
      handle.style.opacity = String(CORNER_HANDLE.opacity);

      const onCornerMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        setDraggingCornerHandle({
          shapeId: shape.id,
          handleType: corner.type,
          startCornerRadius: shape.data.cornerRadius || 0,
        });
        setIsResizing(true);
        setDragStart(getPointerPosition(e.clientX, e.clientY));
      };

      handle.addEventListener('mousedown', onCornerMouseDown);
      svgRef.current!.appendChild(handle);
      created.push(handle);
    });

    cornerHandlesRef.current.set(shape.id, created);
  }, [createSVGElement, cornerHandlesRef, getDef, getPointerPosition, hideCornerHandles, setDragStart, setDraggingCornerHandle, setIsResizing, svgRef, getBounds]);

  const refreshCornerHandles = useCallback((shape: SVGShape) => {
    const handles = cornerHandlesRef.current.get(shape.id);
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
      // 圆角handle自身的旋转也要考虑形状的旋转
      handle.setAttribute('transform', `rotate(${CORNER_HANDLE.rotation + rotation} ${point.x} ${point.y})`);
    });
  }, [getBounds, cornerHandlesRef, getDef]);

  const refreshResizeHandles = useCallback((shape: SVGShape) => {
    const handles = resizeHandlesRef.current.get(shape.id);
    if (!handles || handles.length === 0) return;
    const bounds = getBounds(shape);
    
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;
    
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    handles.forEach(h => {
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
  }, [getBounds, resizeHandlesRef]);

  const hideTextSelection = useCallback((shapeId?: string) => {
    if (shapeId) {
      const box = textSelectionRef.current.get(shapeId);
      if (box) {
        box.remove();
        textSelectionRef.current.delete(shapeId);
      }
      return;
    }
    textSelectionRef.current.forEach(box => box.remove());
    textSelectionRef.current.clear();
  }, [textSelectionRef]);

  const showTextSelection = useCallback((shape: SVGShape) => {
    if (!svgRef.current || shape.type !== 'text') return;
    hideTextSelection(shape.id);
    const bbox = (shape.element as SVGGraphicsElement).getBBox();
    const padding = 2;
    const rect = createSVGElement('rect') as SVGRectElement | null;
    if (!rect) return;
    rect.setAttribute('x', String(bbox.x - padding));
    rect.setAttribute('y', String(bbox.y - padding));
    rect.setAttribute('width', String(bbox.width + padding * 2));
    rect.setAttribute('height', String(bbox.height + padding * 2));
    rect.setAttribute('fill', 'none');
    const strokeWidth = Math.max(1, shape.data.strokeWidth || 1);
    rect.setAttribute('stroke', '#60a5fa');
    rect.setAttribute('stroke-width', String(strokeWidth));
    rect.setAttribute('stroke-dasharray', '4,4');
    rect.setAttribute('pointer-events', 'none');
    rect.setAttribute('data-text-selection', shape.id);
    svgRef.current.appendChild(rect);
    textSelectionRef.current.set(shape.id, rect as SVGRectElement);
  }, [createSVGElement, hideTextSelection, svgRef, textSelectionRef]);

  return {
    beginEditText,
    hideResizeHandles,
    hideCornerHandles,
    showResizeHandles,
    showCornerHandles,
    refreshResizeHandles,
    refreshCornerHandles,
    hideTextSelection,
    showTextSelection,
  };
};
