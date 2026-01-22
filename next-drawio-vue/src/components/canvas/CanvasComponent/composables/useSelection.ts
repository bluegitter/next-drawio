import type { Ref } from 'vue';
import type { ShapeDefinition } from '@drawio/core';
import type { SVGShape } from '../types';

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
      svgRef.value.appendChild(outline);
      created.push(outline);
    }
    const points = [
      { id: 'nw', x: bounds.x, y: bounds.y },
      { id: 'ne', x: bounds.x + bounds.w, y: bounds.y },
      { id: 'sw', x: bounds.x, y: bounds.y + bounds.h },
      { id: 'se', x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    ];
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

    cornerHandles.forEach((corner) => {
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
        const pos = getPointerPosition(e.clientX, e.clientY);
        setDragStart({ x: pos.x, y: pos.y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
      };

      handle.addEventListener('mousedown', onCornerMouseDown);
      svgRef.value?.appendChild(handle);
      created.push(handle);
    });

    cornerHandlesRef.value.set(shape.id, created);
  };

  const refreshResizeHandles = (shape: SVGShape) => {
    const handles = resizeHandlesRef.value.get(shape.id);
    if (!handles || handles.length === 0) return;
    const bounds = getBounds(shape);
    handles.forEach((h) => {
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
    showCornerHandles,
    hideResizeHandles,
    hideCornerHandles,
    showTextSelection,
    hideTextSelection,
  };
};
