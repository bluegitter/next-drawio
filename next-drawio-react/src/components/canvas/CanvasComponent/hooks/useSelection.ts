import { useCallback } from 'react';
import type React from 'react';
import type { ShapeDefinition } from '@drawio/core';
import type { SVGShape } from '../types';

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
      svgRef.current!.appendChild(outline);
      created.push(outline);
    }
    const points = [
      { id: 'nw', x: bounds.x, y: bounds.y },
      { id: 'ne', x: bounds.x + bounds.w, y: bounds.y },
      { id: 'sw', x: bounds.x, y: bounds.y + bounds.h },
      { id: 'se', x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    ];
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

    cornerHandles.forEach(corner => {
      const handle = createSVGElement('rect');
      if (!handle) return;
      const size = 10;
      handle.setAttribute('x', String(corner.x - size / 2));
      handle.setAttribute('y', String(corner.y - size / 2));
      handle.setAttribute('width', String(size));
      handle.setAttribute('height', String(size));
      handle.setAttribute('fill', '#f59e0b');
      handle.setAttribute('stroke', '#d97706');
      handle.setAttribute('stroke-width', '2');
      handle.setAttribute('data-corner-handle', corner.type);
      handle.setAttribute('data-shape-id', shape.id);
      handle.setAttribute('cursor', corner.cursor);
      handle.setAttribute('transform', `rotate(45 ${corner.x} ${corner.y})`);
      handle.style.opacity = '0.8';

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
  }, [createSVGElement, cornerHandlesRef, getDef, getPointerPosition, hideCornerHandles, setDragStart, setDraggingCornerHandle, setIsResizing, svgRef]);

  const refreshResizeHandles = useCallback((shape: SVGShape) => {
    const handles = resizeHandlesRef.current.get(shape.id);
    if (!handles || handles.length === 0) return;
    const bounds = getBounds(shape);
    handles.forEach(h => {
      const id = h.getAttribute('data-resize');
      if (id === 'outline') {
        h.setAttribute('x', String(bounds.x));
        h.setAttribute('y', String(bounds.y));
        h.setAttribute('width', String(bounds.w));
        h.setAttribute('height', String(bounds.h));
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
      h.setAttribute('x', String(p.x - 6));
      h.setAttribute('y', String(p.y - 6));
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
    hideTextSelection,
    showTextSelection,
  };
};
