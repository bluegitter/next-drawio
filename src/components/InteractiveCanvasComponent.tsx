"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { shapeRegistry } from '../shapes';
import type { ShapeDefinition } from '../shapes/types';

export interface CanvasComponentRef {
  addRectangle: () => void;
  addRoundedRect: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addPolyline: () => void;
  addText: () => void;
  addSvgIcon: (href: string, options?: { width?: number; height?: number; position?: { x: number; y: number }; iconName?: string }) => void;
  addShapeAt: (type: string, position: { x: number; y: number }) => void;
   combineSelected: () => void;
   ungroupSelected: () => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  getCanvas: () => SVGSVGElement | null;
  getSelectedShape: () => SVGElement | null;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  rotateSelected: (angle: number) => void;
  scaleSelected: (scale: number) => void;
  changeSelectedFill: (color: string) => void;
  changeSelectedStroke: (color: string) => void;
  changeSelectedStrokeWidth: (width: number) => void;
  changeSelectedOpacity: (opacity: number) => void;
  undo: () => void;
  redo: () => void;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export interface CanvasComponentProps {
  width: number;
  height: number;
  backgroundColor?: string;
  onReady?: (canvas: SVGSVGElement, methods: CanvasComponentRef) => void;
  onError?: (error: Error) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  onCanvasChange?: () => void;
  autoResize?: boolean; // 是否自动调整画布大小
}

interface SVGShape {
  id: string;
  type: 'rect' | 'roundedRect' | 'circle' | 'triangle' | 'line' | 'polyline' | 'text' | 'connector' | 'image';
  element: SVGElement;
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    cornerRadius?: number; // 圆角矩形的圆角半径
    points?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    letterSpacing?: string;
    lineHeight?: string;
    startPortId?: string | null;
    endPortId?: string | null;
    groupId?: string | null;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
  connections?: Array<string | null>; // 连接到的图形ID
}

interface ResizeHandle {
  id: string;
  type: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  x: number;
  y: number;
  shape: SVGShape;
}

interface HistoryState {
  shapes: SVGShape[];
  selectedIds: string[];
}

export const CanvasComponent = forwardRef<CanvasComponentRef, CanvasComponentProps>(({
  width,
  height,
  backgroundColor = '#ffffff',
  onReady,
  onError,
  onShapeSelect,
  onCanvasChange,
  autoResize = false,
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [shapes, setShapes] = useState<SVGShape[]>([]);
  const shapesRef = useRef<SVGShape[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryState[]>([{ shapes: [], selectedIds: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [tempLine, setTempLine] = useState<SVGElement | null>(null);
  const shapeIdCounter = useRef(0);
  const hasCalledReady = useRef(false);
  const methodsRef = useRef<CanvasComponentRef | null>(null);
  const portElementsRef = useRef<Map<string, SVGElement[]>>(new Map());
  const selectedIdsRef = useRef<Set<string>>(new Set());
  const [connectionStartPort, setConnectionStartPort] = useState<string | null>(null);
  const connectorHandleRef = useRef<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>(new Map());
  const skipNextCanvasClickClear = useRef(false);
  const [editingText, setEditingText] = useState<{
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
  } | null>(null);
  const editingInputRef = useRef<HTMLInputElement | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<{
    connectorId: string;
    end: 'start' | 'end';
    original: {
      x: number;
      y: number;
      shapeId?: string | null;
      portId?: string | null;
      dash?: string | null;
    };
  } | null>(null);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [activePortHighlight, setActivePortHighlight] = useState<{ shapeId: string; portId: string } | null>(null);
  const handleConnectionRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number; clientX: number; clientY: number }>({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const resizeHandlesRef = useRef<Map<string, SVGElement[]>>(new Map());
  const cornerHandlesRef = useRef<Map<string, SVGElement[]>>(new Map());
  const textSelectionRef = useRef<Map<string, SVGRectElement>>(new Map());
  const copyBufferRef = useRef<string[]>([]);
  const [draggingPolylinePoint, setDraggingPolylinePoint] = useState<{ shapeId: string; index: number } | null>(null);
  const [draggingCornerHandle, setDraggingCornerHandle] = useState<{
    shapeId: string;
    handleType: string;
    startCornerRadius: number;
  } | null>(null);
  const selectedShape = useMemo(() => {
    const first = selectedIds.values().next();
    return first.done ? null : first.value;
  }, [selectedIds]);
  const setSelectedShape = useCallback((id: string | null) => {
    const next = id ? new Set([id]) : new Set<string>();
    selectedIdsRef.current = next;
    setSelectedIds(next);
  }, []);
  const setSelectedShapes = useCallback((ids: string[]) => {
    const next = new Set(ids);
    selectedIdsRef.current = next;
    setSelectedIds(next);
  }, []);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const setShapesState = useCallback((updater: (prev: SVGShape[]) => SVGShape[]) => {
    setShapes(prev => {
      const next = updater(prev);
      shapesRef.current = next;
      return next;
    });
  }, []);

  // 生成唯一ID
  const generateId = useCallback(() => {
    return `shape-${++shapeIdCounter.current}`;
  }, []);

  // 保存到历史记录
  const saveToHistory = useCallback((snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => {
    const shapesToStore = (snapshotShapes ?? shapes).map(shape => ({
      ...shape,
      data: { ...shape.data },
      connections: shape.connections ? [...shape.connections] : [],
      element: shape.element.cloneNode(true) as SVGElement,
    }));

    let selectedToStore: string[];
    if (snapshotSelectedIds === null) {
      selectedToStore = [];
    } else if (snapshotSelectedIds instanceof Set) {
      selectedToStore = Array.from(snapshotSelectedIds);
    } else if (Array.isArray(snapshotSelectedIds)) {
      selectedToStore = snapshotSelectedIds;
    } else if (typeof snapshotSelectedIds === 'string') {
      selectedToStore = [snapshotSelectedIds];
    } else {
      selectedToStore = Array.from(selectedIds);
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ shapes: shapesToStore, selectedIds: selectedToStore });

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onCanvasChange?.();
  }, [history, historyIndex, onCanvasChange, selectedIds, shapes]);

  // 创建命名空间
  const createSVGElement = useCallback((tagName: string) => {
    if (!svgRef.current) return null;
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }, []);

  const getDef = useCallback((shapeOrType: SVGShape | string): ShapeDefinition | undefined => {
    const type = typeof shapeOrType === 'string' ? shapeOrType : shapeOrType.type;
    return shapeRegistry[type];
  }, []);

  // 获取图形的中心点
  const getShapeCenter = useCallback((shape: SVGShape) => {
    const def = getDef(shape);
    if (def?.getCenter) return def.getCenter(shape);
    return { x: 0, y: 0 };
  }, [getDef]);

  const getPortPositions = useCallback((shape: SVGShape) => {
    const def = getDef(shape);
    if (def?.getPorts) return def.getPorts(shape);
    return [];
  }, [getDef]);

  const getPortPositionById = useCallback((shape: SVGShape, portId?: string | null) => {
    if (!portId) return null;
    const ports = getPortPositions(shape);
    return ports.find(p => p.id === portId) || null;
  }, [getPortPositions]);

  // 点到线段距离
  const pointToSegmentDistance = useCallback((px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  }, []);
  
  // 直线是否已连接到其他图元
  const isLineConnected = useCallback((shape: SVGShape) => {
    if (shape.type !== 'line' && shape.type !== 'connector') return true;
    if (!shape.connections || shape.connections.length === 0) return false;
    const [from, to] = shape.connections as Array<string | null | undefined>;
    return Boolean(from) || Boolean(to);
  }, []);

  const getShapeBounds = useCallback((shape: SVGShape) => {
    const def = getDef(shape);
    if (def?.getBounds) return def.getBounds(shape);
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }, [getDef]);

  const groupSelectionBounds = useMemo(() => {
    if (selectedIds.size <= 1) return null;
    // 仅当当前选中图元共享同一 groupId 时显示组合外框
    const selectedShapes = shapes.filter(s => selectedIds.has(s.id));
    const groupIds = new Set(selectedShapes.map(s => s.data.groupId).filter(Boolean) as string[]);
    if (groupIds.size !== 1) return null;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    selectedShapes.forEach(shape => {
      const b = getShapeBounds(shape);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return null;
    const padding = 10;
    return {
      x: minX - padding,
      y: minY - padding,
      w: (maxX - minX) + padding * 2,
      h: (maxY - minY) + padding * 2,
    };
  }, [getShapeBounds, selectedIds, shapes]);

  const polylineHandles = useMemo(() => {
    const handles: Array<{ shapeId: string; index: number; x: number; y: number }> = [];
    selectedIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (shape && shape.type === 'polyline' && shape.data.points) {
        const pts = shape.data.points.split(' ').map(p => p.split(',').map(Number));
        pts.forEach(([px, py], idx) => {
          handles.push({ shapeId: id, index: idx, x: px, y: py });
        });
      }
    });
    return handles;
  }, [selectedIds, shapes]);

  const getBounds = useCallback((shape: SVGShape) => {
    const b = getShapeBounds(shape);
    return { x: b.minX, y: b.minY, w: b.maxX - b.minX, h: b.maxY - b.minY };
  }, [getShapeBounds]);

  const refreshPortsPosition = useCallback((shape: SVGShape) => {
    const ports = portElementsRef.current.get(shape.id);
    if (!ports || ports.length === 0) return;
    const portPositions = getPortPositions(shape);
    ports.forEach(portEl => {
      const portId = portEl.getAttribute('data-port-id');
      const pos = portPositions.find(p => p.id === portId);
      if (pos) {
        portEl.setAttribute('cx', String(pos.x));
        portEl.setAttribute('cy', String(pos.y));
      }
    });
  }, [getPortPositions]);

  const resetPortStyle = useCallback((portEl: SVGElement) => {
    portEl.setAttribute('fill', '#22c55e');
    portEl.setAttribute('stroke', '#0f9f4f');
    portEl.setAttribute('stroke-width', '2');
    portEl.setAttribute('r', '5');
  }, []);

  const highlightPortStyle = useCallback((portEl: SVGElement) => {
    portEl.setAttribute('fill', '#fbbf24');
    portEl.setAttribute('stroke', '#d97706');
    portEl.setAttribute('stroke-width', '2.5');
    portEl.setAttribute('r', '7');
  }, []);

  // 开始文本内联编辑
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
    // 隐藏原文本，避免编辑时重影
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
  }, [setSelectedShape]);

  const findNearestPortElement = useCallback((x: number, y: number, maxDistance = 14) => {
    let nearest: { el: SVGElement; dist: number } | null = null;
    for (const portList of portElementsRef.current.values()) {
      for (const port of portList) {
        const cx = Number(port.getAttribute('cx'));
        const cy = Number(port.getAttribute('cy'));
        const dist = Math.hypot(cx - x, cy - y);
        if (dist <= maxDistance && (!nearest || dist < nearest.dist)) {
          nearest = { el: port, dist };
        }
      }
    }
    return nearest ? nearest.el : null;
  }, []);

  const hideResizeHandles = useCallback((shapeId?: string) => {
    if (shapeId) {
      const handles = resizeHandlesRef.current.get(shapeId);
      handles?.forEach(h => h.remove());
      resizeHandlesRef.current.delete(shapeId);
      return;
    }
    resizeHandlesRef.current.forEach(list => list.forEach(h => h.remove()));
    resizeHandlesRef.current.clear();
  }, []);

  const hideCornerHandles = useCallback((shapeId?: string) => {
    if (shapeId) {
      const handles = cornerHandlesRef.current.get(shapeId);
      handles?.forEach(h => h.remove());
      cornerHandlesRef.current.delete(shapeId);
      return;
    }
    cornerHandlesRef.current.forEach(list => list.forEach(h => h.remove()));
    cornerHandlesRef.current.clear();
  }, []);

  const showResizeHandles = useCallback((shape: SVGShape) => {
    if (!svgRef.current) return;
    if (shape.type === 'line' || shape.type === 'connector') return; // 线段已有端点手柄
    hideResizeHandles(shape.id);
    const bounds = getBounds(shape);
    // 选中虚线框
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
        const rect = svgRef.current!.getBoundingClientRect();
        setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      };
      handle.addEventListener('mousedown', onDown);
      svgRef.current!.appendChild(handle);
      created.push(handle);
    });
    resizeHandlesRef.current.set(shape.id, created);
  }, [createSVGElement, getBounds, hideResizeHandles, onShapeSelect]);

  const showCornerHandles = useCallback((shape: SVGShape) => {
    if (!svgRef.current || shape.type !== 'roundedRect') return;
    
    hideCornerHandles(shape.id);
    const def = getDef(shape);
    if (!def?.getCornerHandles) return;
    
    const cornerHandles = def.getCornerHandles(shape);
    const created: SVGElement[] = [];

    cornerHandles.forEach(corner => {
      const handle = createSVGElement('circle');
      if (!handle) return;
      
      handle.setAttribute('cx', String(corner.x));
      handle.setAttribute('cy', String(corner.y));
      handle.setAttribute('r', '6');
      handle.setAttribute('fill', '#f59e0b'); // 橙色用于区分圆角手柄
      handle.setAttribute('stroke', '#d97706');
      handle.setAttribute('stroke-width', '2');
      handle.setAttribute('data-corner-handle', corner.type);
      handle.setAttribute('data-shape-id', shape.id);
      handle.setAttribute('cursor', corner.cursor);
      handle.style.opacity = '0.8';

      const onCornerMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        console.log('圆角手柄被点击:', corner.type, '当前圆角:', shape.data.cornerRadius);
        setDraggingCornerHandle({
          shapeId: shape.id,
          handleType: corner.type,
          startCornerRadius: shape.data.cornerRadius || 0
        });
        setIsResizing(true);
        // 不要设置 resizeHandle，因为圆角调整有自己独立的逻辑
        const rect = svgRef.current!.getBoundingClientRect();
        setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      };

      handle.addEventListener('mousedown', onCornerMouseDown);
      svgRef.current!.appendChild(handle);
      created.push(handle);
    });

    cornerHandlesRef.current.set(shape.id, created);
  }, [createSVGElement, getDef, hideCornerHandles]);

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
  }, [getBounds]);

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
  }, []);

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
  }, [createSVGElement, hideTextSelection]);

  // 开始连接（依赖于端口坐标计算，因此放在端口渲染之前）
  const startConnection = useCallback((fromShape: string, fromPortId?: string) => {
    setIsConnecting(true);
    setConnectionStart(fromShape);
    setConnectionStartPort(fromPortId || null);
    
    if (!svgRef.current) return;
    
    const temp = createSVGElement('line');
    if (temp) {
      temp.setAttribute('stroke', '#6b7280');
      temp.setAttribute('stroke-width', '2');
      temp.setAttribute('stroke-dasharray', '5,5');
      temp.setAttribute('pointer-events', 'none');
      
      const fromShapeObj = shapes.find(s => s.id === fromShape);
      if (fromShapeObj) {
        const portPos = fromPortId ? getPortPositionById(fromShapeObj, fromPortId) : null;
        const startPoint = portPos || getShapeCenter(fromShapeObj);
        temp.setAttribute('x1', String(startPoint.x));
        temp.setAttribute('y1', String(startPoint.y));
        temp.setAttribute('x2', String(startPoint.x));
        temp.setAttribute('y2', String(startPoint.y));
      }
      
      svgRef.current.appendChild(temp);
      setTempLine(temp);
    }
  }, [createSVGElement, getPortPositionById, getShapeCenter, shapes]);

  const hidePorts = useCallback((shapeId?: string) => {
    if (shapeId) {
      const ports = portElementsRef.current.get(shapeId);
      ports?.forEach(port => resetPortStyle(port));
      ports?.forEach(port => port.remove());
      portElementsRef.current.delete(shapeId);
      if (activePortHighlight?.shapeId === shapeId) {
        setActivePortHighlight(null);
      }
      return;
    }
    portElementsRef.current.forEach(portList => {
      portList.forEach(port => resetPortStyle(port));
      portList.forEach(port => port.remove());
    });
    portElementsRef.current.clear();
    setActivePortHighlight(null);
  }, [activePortHighlight?.shapeId, resetPortStyle]);

  const showPorts = useCallback((shape: SVGShape) => {
    if (!svgRef.current) return;
    hidePorts(shape.id);
    const ports = getPortPositions(shape);
    const created: SVGElement[] = [];

    ports.forEach(port => {
      const portCircle = createSVGElement('circle');
      if (!portCircle) return;
      portCircle.setAttribute('cx', String(port.x));
      portCircle.setAttribute('cy', String(port.y));
      portCircle.setAttribute('r', '5');
      portCircle.setAttribute('fill', '#22c55e');
      portCircle.setAttribute('stroke', '#0f9f4f');
      portCircle.setAttribute('stroke-width', '1.5');
      portCircle.setAttribute('data-shape-id', shape.id);
      portCircle.setAttribute('data-port-id', port.id);
      portCircle.setAttribute('cursor', 'crosshair');
      portCircle.style.opacity = '0.9';

      const handlePortMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        startConnection(shape.id, port.id);
      };

      portCircle.addEventListener('mousedown', handlePortMouseDown);
      created.push(portCircle);
      svgRef.current!.appendChild(portCircle);

      // cleanup for this port on removal
      portCircle.dataset.listenerId = 'port';
    });

    portElementsRef.current.set(shape.id, created);
  }, [createSVGElement, getPortPositions, hidePorts, startConnection]);

  const hideConnectorHandles = useCallback((connectorId?: string) => {
    if (connectorId) {
      const handles = connectorHandleRef.current.get(connectorId);
      if (handles) {
        handles.start.remove();
        handles.end.remove();
      }
      connectorHandleRef.current.delete(connectorId);
      return;
    }
    connectorHandleRef.current.forEach(pair => {
      pair.start.remove();
      pair.end.remove();
    });
    connectorHandleRef.current.clear();
  }, []);

  const showConnectorHandles = useCallback((connector: SVGShape) => {
    if (!svgRef.current) return;
    if (connector.type !== 'connector' && connector.type !== 'line') return;
    hideConnectorHandles(connector.id);
    const createHandle = (x: number, y: number, end: 'start' | 'end') => {
      const c = createSVGElement('circle') as SVGCircleElement | null;
      if (!c) return null;
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', '6');
      c.setAttribute('fill', '#22c55e');
      c.setAttribute('stroke', '#0f9f4f');
      c.setAttribute('stroke-width', '2');
      c.setAttribute('data-connector-id', connector.id);
      c.setAttribute('data-end', end);
      c.setAttribute('cursor', 'default');
      c.style.opacity = '0.9';

      const onHandleMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        const original = end === 'start'
          ? { x: connector.data.x1 || 0, y: connector.data.y1 || 0, shapeId: connector.connections?.[0], portId: connector.data.startPortId, dash: connector.element.getAttribute('stroke-dasharray') }
          : { x: connector.data.x2 || 0, y: connector.data.y2 || 0, shapeId: connector.connections?.[1], portId: connector.data.endPortId, dash: connector.element.getAttribute('stroke-dasharray') };
        setDraggingHandle({ connectorId: connector.id, end, original });
        handleConnectionRef.current = true;
        setIsConnecting(true);
        connector.element.setAttribute('stroke-dasharray', '6,4');
      };

      c.addEventListener('mousedown', onHandleMouseDown);
      svgRef.current!.appendChild(c);
      return c;
    };

    const startHandle = createHandle(connector.data.x1 || 0, connector.data.y1 || 0, 'start');
    const endHandle = createHandle(connector.data.x2 || 0, connector.data.y2 || 0, 'end');
    if (startHandle && endHandle) {
      connectorHandleRef.current.set(connector.id, { start: startHandle, end: endHandle });
    }
  }, [createSVGElement, hideConnectorHandles]);

  // 应用旋转与缩放变换
  const applyTransform = useCallback((shape: SVGShape) => {
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;

    if (rotation === 0 && scale === 1) {
      shape.element.removeAttribute('transform');
      return;
    }

    const center = getShapeCenter(shape);
    const transforms = [
      `translate(${center.x} ${center.y})`,
      rotation !== 0 ? `rotate(${rotation})` : null,
      scale !== 1 ? `scale(${scale})` : null,
      `translate(${-center.x} ${-center.y})`,
    ].filter((value): value is string => Boolean(value));

    if (transforms.length) {
      shape.element.setAttribute('transform', transforms.join(' '));
    }
  }, [getShapeCenter]);

  // 更新连接线位置
  const updateConnectionLine = useCallback((connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => {
    const source = shapeList || shapes;
    const shape = source.find(s => s.id === shapeId);
    if (!shape) return;

    const [fromShapeId, toShapeId] = (connLine.connections || []) as Array<string | null | undefined>;
    const isStart = fromShapeId === shapeId;
    const isEnd = toShapeId === shapeId;

    if (!isStart && !isEnd) return;

    const portId = isStart ? connLine.data.startPortId : connLine.data.endPortId;
    const anchor = portId ? getPortPositionById(shape, portId) : null;
    const point = anchor || getShapeCenter(shape);

    if (isStart) {
      connLine.element.setAttribute('x1', String(point.x));
      connLine.element.setAttribute('y1', String(point.y));
      connLine.data.x1 = point.x;
      connLine.data.y1 = point.y;
    }
    if (isEnd) {
      connLine.element.setAttribute('x2', String(point.x));
      connLine.element.setAttribute('y2', String(point.y));
      connLine.data.x2 = point.x;
      connLine.data.y2 = point.y;
    }
  }, [getPortPositionById, getShapeCenter, shapes]);

  // 更新图形位置
  const updateShapePosition = useCallback((shape: SVGShape, dx: number, dy: number) => {
    const def = getDef(shape);
    if (def?.move) def.move(shape, dx, dy);

    refreshPortsPosition(shape);
    applyTransform(shape);

    // 更新连接线
    if (shape.connections) {
      shape.connections.forEach(connId => {
        const connLine = shapes.find(s => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
  }, [applyTransform, shapes]);
  const updateTextContent = useCallback((shape: SVGShape, content: string) => {
    if (shape.type !== 'text') return;
    const safeText = content || shape.data.text || '';
    if (shape.element instanceof SVGForeignObjectElement) {
      const div = shape.element.firstChild as HTMLElement | null;
      if (div) div.textContent = safeText;
    } else {
      shape.element.textContent = safeText;
    }
    shape.data.text = safeText;
    refreshResizeHandles(shape);
    showTextSelection(shape);
    if (shape.connections) {
      shape.connections.forEach(connId => {
        const connLine = shapes.find(s => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
    saveToHistory(shapes, selectedIds);
  }, [refreshResizeHandles, saveToHistory, selectedIds, shapes, showTextSelection, updateConnectionLine]);

  const commitEditingText = useCallback((apply: boolean) => {
    if (!editingText) return;
    const { id, value } = editingText;
    if (apply) {
      const shape = shapes.find(s => s.id === id);
      if (shape) {
        updateTextContent(shape, value);
      }
    }
    const shape = shapes.find(s => s.id === id);
    if (shape) {
      const prev = (shape.element as any).dataset?.prevOpacity;
      shape.element.style.opacity = prev ?? '';
      if ((shape.element as any).dataset) delete (shape.element as any).dataset.prevOpacity;
    }
    setEditingText(null);
  }, [editingText, shapes, updateTextContent]);

  useEffect(() => {
    if (!editingText) return;
    const exists = shapes.some(s => s.id === editingText.id);
    if (!exists) {
      setEditingText(null);
    }
  }, [editingText, shapes]);

  // 更新图形大小
  const updateShapeSize = useCallback((shape: SVGShape, handle: string, dx: number, dy: number) => {
    const def = getDef(shape);
    if (def?.resize) def.resize(shape, handle, dx, dy);
    refreshPortsPosition(shape);
    applyTransform(shape);
    if (shape.connections) {
      shape.connections.forEach(connId => {
        const connLine = shapes.find(s => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
  }, [applyTransform, refreshPortsPosition]);

  const restoreHistoryState = useCallback((state: HistoryState) => {
    if (!svgRef.current) return;

    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    portElementsRef.current.forEach(portList => portList.forEach(port => port.remove()));
    portElementsRef.current.clear();
    setConnectionStartPort(null);

    const restoredShapes = state.shapes.map(shape => {
      const clonedElement = shape.element.cloneNode(true) as SVGElement;
      svgRef.current!.appendChild(clonedElement);
      return { ...shape, element: clonedElement };
    });

    setShapesState(() => restoredShapes);
    setSelectedIds(new Set(state.selectedIds || []));
    setIsConnecting(false);
    setConnectionStart(null);
    setTempLine(null);

    const primary = state.selectedIds?.[0] ?? null;
    if (primary) {
      const targetElement = restoredShapes.find(s => s.id === primary)?.element ?? null;
      onShapeSelect?.(targetElement || null);
    } else {
      onShapeSelect?.(null);
    }
  }, [onShapeSelect]);

  const updateSelectedShape = useCallback((updater: (shape: SVGShape) => void, options?: { skipHistory?: boolean }) => {
    if (!selectedShape) return;
    const shapeIndex = shapes.findIndex(s => s.id === selectedShape);
    if (shapeIndex === -1) return;

    const updatedShapes = [...shapes];
    updater(updatedShapes[shapeIndex]);
    setShapesState(() => updatedShapes);

    if (!options?.skipHistory) {
      saveToHistory(updatedShapes, selectedIds);
    }
  }, [saveToHistory, selectedIds, selectedShape, shapes]);

  const combineSelected = useCallback(() => {
    const currentSel = selectedIdsRef.current;
    if (currentSel.size < 2) return;
    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const updatedShapes = shapes.map(shape => {
      if (currentSel.has(shape.id)) {
        return { ...shape, data: { ...shape.data, groupId } };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  }, [saveToHistory, shapes]);

  const ungroupSelected = useCallback(() => {
    const currentSel = selectedIdsRef.current;
    if (currentSel.size === 0) return;
    const targetGroup = shapes.find(s => currentSel.has(s.id) && s.data.groupId)?.data.groupId;
    if (!targetGroup) return;
    const updatedShapes = shapes.map(shape => {
      if (shape.data.groupId === targetGroup) {
        const newData = { ...shape.data };
        delete newData.groupId;
        return { ...shape, data: newData };
      }
      return shape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, currentSel);
  }, [saveToHistory, shapes]);

  // 通用新增图元
  const addShape = useCallback((type: string, options?: any, dropPosition?: { x: number; y: number }) => {
    if (!svgRef.current) return;
    const def = getDef(type);
    if (!def?.create) return;
    try {
      const created = def.create({ createSVGElement, generateId }, options) as SVGShape;
      const newShape: SVGShape = {
        ...created,
        type: (def.type as SVGShape['type']) || (type as SVGShape['type']),
        connections: created.connections ?? [],
      };
      svgRef.current.appendChild(newShape.element);

      // 若指定了投放位置，创建后立即平移到指定位置
      if (dropPosition) {
        const bounds = getShapeBounds(newShape);
        const dx = dropPosition.x - bounds.minX;
        const dy = dropPosition.y - bounds.minY;
        const def = getDef(newShape);
        if (def?.move) {
          def.move(newShape, dx, dy);
        } else {
          if ('x' in newShape.data && 'y' in newShape.data) {
            const nextX = (newShape.data.x || 0) + dx;
            const nextY = (newShape.data.y || 0) + dy;
            newShape.element.setAttribute('x', String(nextX));
            newShape.element.setAttribute('y', String(nextY));
            newShape.data.x = nextX;
            newShape.data.y = nextY;
          }
        }
      }

      setShapesState(prev => {
        const updated = [...prev, newShape];
        saveToHistory(updated, newShape.id);
        return updated;
      });
      setSelectedShape(newShape.id);
      onShapeSelect?.(newShape.element);
    } catch (err) {
      console.error('Failed to create shape', err);
    }
  }, [createSVGElement, generateId, getDef, onShapeSelect, saveToHistory, setSelectedShape]);

  const addRectangle = useCallback(() => addShape('rect'), [addShape]);
  const addRoundedRect = useCallback(() => addShape('roundedRect'), [addShape]);
  const addCircle = useCallback(() => addShape('circle'), [addShape]);
  const addTriangle = useCallback(() => addShape('triangle'), [addShape]);
  const addLine = useCallback(() => addShape('line'), [addShape]);
  const addPolyline = useCallback(() => addShape('polyline'), [addShape]);
  const addText = useCallback(() => addShape('text'), [addShape]);

  const decodeDataUri = useCallback((href: string) => {
    try {
      const base64 = href.split(',')[1];
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return '';
    }
  }, []);

  const toDataUri = useCallback((svgText: string) => {
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
    } catch {
      return '';
    }
  }, []);

  const tintSvgText = useCallback((svgText: string, color: string) => {
    console.log('[tintSvgText] start', { color, inputLength: svgText?.length });
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const paths = Array.from(doc.querySelectorAll('path'));
      paths.forEach(path => {
        path.setAttribute('fill', color);
      });
      const serialized = new XMLSerializer().serializeToString(doc.documentElement);
      console.log('[tintSvgText] done', { pathCount: paths.length, outputLength: serialized.length });
      return serialized;
    } catch (err) {
      console.warn('DOM parse tint failed, fallback to regex', err);
      return svgText
        .replace(/stroke="[^"]*"/g, `stroke="${color}"`)
        .replace(/(fill=")(?!none")[^"]*"/g, `$1${color}"`)
        .replace(/stroke%3D%22[^%]*%22/g, `stroke%3D%22${encodeURIComponent(color)}%22`)
        .replace(/fill%3D%22(?!none)[^%]*%22/g, `fill%3D%22${encodeURIComponent(color)}%22`);
    }
  }, []);

  const tintDataUri = useCallback((href: string, color: string) => {
    if (!href.startsWith('data:image/svg+xml')) return href;
    try {
      const decoded = decodeDataUri(href);
      const tinted = tintSvgText(decoded, color);
      const uri = toDataUri(tinted) || href;
      console.log('[tintDataUri] success', { color, producedUri: !!uri, inputPreview: href.slice(0, 40) });
      return uri;
    } catch (err) {
      console.warn('Tint svg icon failed, fallback original', err);
      return href;
    }
  }, [decodeDataUri, tintSvgText, toDataUri]);
  const addSvgIcon = useCallback((href: string, options?: { width?: number; height?: number; position?: { x: number; y: number }; iconName?: string }) => {
    const { position, iconName, ...rest } = options || {};
    const isDataUri = href.startsWith('data:image/svg+xml');
    if (isDataUri) {
      const svgText = decodeDataUri(href);
      addShape('image', { href, width: rest.width, height: rest.height, svgText, iconName }, position);
      return;
    }

    if (href.endsWith('.svg') || href.startsWith('/')) {
      (async () => {
        try {
          const res = await fetch(href);
          const text = await res.text();
          const dataUri = toDataUri(text);
          addShape('image', { href: dataUri || href, width: rest.width, height: rest.height, svgText: text, iconName }, position);
        } catch (err) {
          console.warn('Failed to load svg icon, fallback original href', err);
          addShape('image', { href, width: rest.width, height: rest.height, iconName }, position);
        }
      })();
    } else {
      addShape('image', { href, width: rest.width, height: rest.height, iconName }, position);
    }
  }, [addShape, decodeDataUri, toDataUri]);

  const addShapeAt = useCallback((type: string, position: { x: number; y: number }) => {
    addShape(type, undefined, position);
  }, [addShape]);

  // 连接图形
  const connectShapes = useCallback((fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => {
    if (!svgRef.current || fromShape === toShape) return;

    const fromShapeObj = shapes.find(s => s.id === fromShape);
    const toShapeObj = shapes.find(s => s.id === toShape);
    
    if (!fromShapeObj || !toShapeObj) return;

    const fromPoint = (fromPortId ? getPortPositionById(fromShapeObj, fromPortId) : null) || getShapeCenter(fromShapeObj);
    const toPoint = (toPortId ? getPortPositionById(toShapeObj, toPortId) : null) || getShapeCenter(toShapeObj);

    const connector = createSVGElement('line');
    if (!connector) return;

    const connId = generateId();
    connector.setAttribute('id', connId);
    connector.setAttribute('x1', String(fromPoint.x));
    connector.setAttribute('y1', String(fromPoint.y));
    connector.setAttribute('x2', String(toPoint.x));
    connector.setAttribute('y2', String(toPoint.y));
    connector.setAttribute('stroke', '#6b7280');
    connector.setAttribute('stroke-width', '2');
    connector.setAttribute('cursor', 'pointer');

    const newShape: SVGShape = {
      id: connId,
      type: 'connector',
      element: connector,
      data: {
        x1: fromPoint.x,
        y1: fromPoint.y,
        x2: toPoint.x,
        y2: toPoint.y,
        startPortId: fromPortId || null,
        endPortId: toPortId || null,
        fill: 'none',
        stroke: '#6b7280',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [fromShape, toShape],
    };

    svgRef.current.appendChild(connector);

    const updatedShapes = shapes.map(shape => {
      if (shape.id === fromShape) {
        return { ...shape, connections: [...(shape.connections || []), connId] };
      }
      if (shape.id === toShape) {
        return { ...shape, connections: [...(shape.connections || []), connId] };
      }
      return shape;
    });

    const finalShapes = [...updatedShapes, newShape];
    setShapesState(() => finalShapes);
    
    // 清理临时线
    if (tempLine) {
      svgRef.current.removeChild(tempLine);
      setTempLine(null);
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionStartPort(null);
    saveToHistory(finalShapes, selectedIds);
  }, [createSVGElement, generateId, getPortPositionById, getShapeCenter, saveToHistory, selectedIds, shapes, tempLine]);

  // 鼠标移动事件处理
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPointerRef.current = { x, y, clientX: e.clientX, clientY: e.clientY };

    if (draggingHandle) {
      const { connectorId, end } = draggingHandle;
      const connector = shapes.find(s => s.id === connectorId);
      if (connector && (connector.type === 'connector' || connector.type === 'line')) {
        if (end === 'start') {
          connector.element.setAttribute('x1', String(x));
          connector.element.setAttribute('y1', String(y));
          connector.data.x1 = x;
          connector.data.y1 = y;
          connector.data.startPortId = null;
          if (connector.connections) connector.connections[0] = null;
        } else {
          connector.element.setAttribute('x2', String(x));
          connector.element.setAttribute('y2', String(y));
          connector.data.x2 = x;
          connector.data.y2 = y;
          connector.data.endPortId = null;
          if (connector.connections) connector.connections[1] = null;
        }
        const handles = connectorHandleRef.current.get(connectorId);
        if (handles) {
          const handleEl = end === 'start' ? handles.start : handles.end;
          handleEl.setAttribute('cx', String(x));
          handleEl.setAttribute('cy', String(y));
        }

        // 预显示附近图元端口
        const padding = 10;
        let hovered: SVGShape | null = null;
        for (let i = shapes.length - 1; i >= 0; i--) {
          const shape = shapes[i];
          if (shape.type === 'connector') continue;
          const bounds = getShapeBounds(shape);
          if (
            x >= bounds.minX - padding &&
            x <= bounds.maxX + padding &&
            y >= bounds.minY - padding &&
            y <= bounds.maxY + padding
          ) {
            hovered = shape;
            break;
          }
        }
        if (hovered && hovered.id !== hoveredShapeId) {
          if (hoveredShapeId) hidePorts(hoveredShapeId);
          setHoveredShapeId(hovered.id);
          showPorts(hovered);
        } else if (!hovered && hoveredShapeId && !activePortHighlight) {
          hidePorts(hoveredShapeId);
          setHoveredShapeId(null);
        }

        // 高亮当前指向的 port
        const portElFromTarget = (e.target as SVGElement | null)?.getAttribute?.('data-port-id')
          ? (e.target as SVGElement)
          : null;
        const portEl = portElFromTarget || findNearestPortElement(x, y);
        if (portEl) {
          const shapeId = portEl.getAttribute('data-shape-id');
          const portId = portEl.getAttribute('data-port-id');
          if (shapeId && portId) {
            if (!activePortHighlight || activePortHighlight.shapeId !== shapeId || activePortHighlight.portId !== portId) {
              if (activePortHighlight) {
                const prev = portElementsRef.current.get(activePortHighlight.shapeId)?.find(p => p.getAttribute('data-port-id') === activePortHighlight.portId);
                if (prev) resetPortStyle(prev);
              }
              highlightPortStyle(portEl);
              setActivePortHighlight({ shapeId, portId });
            }
          }
        }
      }
    } else if (draggingPolylinePoint) {
      const { shapeId, index } = draggingPolylinePoint;
      const shape = shapes.find(s => s.id === shapeId);
      if (shape && shape.type === 'polyline') {
        const pts = shape.data.points?.split(' ').map((p: string) => p.split(',').map(Number)) || [];
        if (pts[index]) {
          const dx = x - dragStart.x;
          const dy = y - dragStart.y;
          pts[index] = [pts[index][0] + dx, pts[index][1] + dy];
          const newPoints = pts.map(([px, py]) => `${px},${py}`).join(' ');
          shape.element.setAttribute('points', newPoints);
          shape.data.points = newPoints;
          const updatedShapes = shapes.map(s => s.id === shape.id ? { ...shape, data: { ...shape.data }, element: shape.element } : s);
          setShapesState(() => updatedShapes);
          setDragStart({ x, y });
        }
      }
    } else if (isConnecting && tempLine && connectionStart) {
      // 更新临时连接线
      const fromShapeObj = shapes.find(s => s.id === connectionStart);
      if (fromShapeObj) {
        const center = getShapeCenter(fromShapeObj);
        tempLine.setAttribute('x2', String(x));
        tempLine.setAttribute('y2', String(y));
      }
    } else if (isDragging && selectedIds.size > 0) {
      // 拖拽选中的图形集合
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      if (dx !== 0 || dy !== 0) {
        selectedIds.forEach(id => {
          const shape = shapes.find(s => s.id === id);
          if (shape) {
            if ((shape.type === 'line' || shape.type === 'connector') && isLineConnected(shape)) {
              return;
            }
            updateShapePosition(shape, dx, dy);
            refreshResizeHandles(shape);
          }
        });

        const nextShapes = shapes.map(s => selectedIds.has(s.id)
          ? { ...s, data: { ...s.data }, connections: s.connections ? [...s.connections] : undefined, element: s.element }
          : s);

        selectedIds.forEach(id => {
          const moved = nextShapes.find(s => s.id === id);
          if (moved && moved.connections) {
            moved.connections.forEach(connId => {
              const connLine = nextShapes.find(s => s.id === connId);
              if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
                updateConnectionLine(connLine, moved.id, nextShapes);
              }
            });
          }
        });

        setShapesState(() => nextShapes);
      }
      
      setDragStart({ x, y });
    } else if (isResizing) {
      // 调整大小或圆角
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      if (draggingCornerHandle) {
        console.log('处理圆角调整:', draggingCornerHandle, 'dx:', dx, 'dy:', dy);
        // 专门处理圆角调整
        const shape = shapes.find(s => s.id === draggingCornerHandle.shapeId);
        if (shape && shape.type === 'roundedRect') {
          console.log('找到圆角矩形，当前圆角:', shape.data.cornerRadius);
          const adjustment = Math.abs(dx) + Math.abs(dy);
          const maxRadius = Math.min((shape.data.width || 0), (shape.data.height || 0)) / 4;
          
          // 使用当前shape的圆角而不是开始时的圆角，避免被重置
          const currentCornerRadius = shape.data.cornerRadius || 0;
          
          // 增大调整幅度 - 使用更大的系数
          let newCornerRadius;
          if (dx > 0) {
            // 向右拖拽 - 增加圆角
            newCornerRadius = Math.min(maxRadius, currentCornerRadius + adjustment * 0.3);
          } else if (dx < 0) {
            // 向左拖拽 - 减少圆角
            newCornerRadius = Math.max(0, currentCornerRadius - adjustment * 0.3);
          } else {
            // 纯垂直拖拽，不做改变
            newCornerRadius = currentCornerRadius;
          }
          
          console.log('新的圆角半径:', newCornerRadius, '从:', currentCornerRadius, 'max:', maxRadius);
          
          // 直接更新SVG元素和内存中的数据
          const currentRx = shape.element.getAttribute('rx');
          
          shape.element.setAttribute('rx', String(newCornerRadius));
          shape.element.setAttribute('ry', String(newCornerRadius));
          
          // 强制触发SVG重绘 - 通过临时修改transform属性
          const currentTransform = shape.element.getAttribute('transform') || '';
          shape.element.setAttribute('transform', currentTransform + ' translate(0.001,0.001)');
          setTimeout(() => {
            shape.element.setAttribute('transform', currentTransform);
          }, 0);
          
          console.log('SVG属性更新前:', currentRx, '更新后:', shape.element.getAttribute('rx'));
          
          // 更新内存数据
          const updatedShape = {
            ...shape,
            data: {
              ...shape.data,
              cornerRadius: newCornerRadius
            }
          };
          
          const nextShapes = shapes.map(s => s.id === shape.id ? updatedShape : s);
          setShapesState(() => nextShapes);
          
          // 更新拖拽状态，使用当前的圆角值
          setDraggingCornerHandle({
            ...draggingCornerHandle,
            startCornerRadius: newCornerRadius
          });
          
          // 延迟更新圆角手柄，避免覆盖SVG属性
          setTimeout(() => {
            showCornerHandles(updatedShape);
          }, 0);
        }
      } else if (selectedShape && resizeHandle) {
        // 普通的大小调整
        const shape = shapes.find(s => s.id === selectedShape);
        if (shape) {
          updateShapeSize(shape, resizeHandle, dx, dy);
          refreshResizeHandles(shape);
          
          // 如果是圆角矩形，也更新圆角手柄
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
    } else if (isSelectingBox && selectionRect) {
      const w = x - selectionRect.x;
      const h = y - selectionRect.y;
      setSelectionRect({
        x: w >= 0 ? selectionRect.x : x,
        y: h >= 0 ? selectionRect.y : y,
        w: Math.abs(w),
        h: Math.abs(h),
      });
    } else if (!isConnecting && !isDragging && !isResizing && !draggingHandle) {
      const padding = 10;
      let hovered: SVGShape | null = null;

      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.type === 'connector') continue;
        const bounds = getShapeBounds(shape);
        if (
          x >= bounds.minX - padding &&
          x <= bounds.maxX + padding &&
          y >= bounds.minY - padding &&
          y <= bounds.maxY + padding
        ) {
          hovered = shape;
          break;
        }
      }

      if (hovered && hovered.id !== hoveredShapeId) {
        if (hoveredShapeId) hidePorts(hoveredShapeId);
        setHoveredShapeId(hovered.id);
        showPorts(hovered);
      } else if (!hovered && hoveredShapeId) {
        hidePorts(hoveredShapeId);
        setHoveredShapeId(null);
      }
    }
  }, [activePortHighlight, dragStart, draggingHandle, findNearestPortElement, getShapeBounds, getShapeCenter, hidePorts, highlightPortStyle, hoveredShapeId, isConnecting, isDragging, isResizing, isSelectingBox, isLineConnected, resetPortStyle, selectedIds, selectionRect, shapes, resizeHandle, showPorts, tempLine, connectionStart, updateShapePosition, updateShapeSize, refreshResizeHandles, updateConnectionLine]);

  // 鼠标释放事件处理
  const finalizeHandleConnection = useCallback((targetEl: SVGElement | null, point: { x: number; y: number }) => {
    if (!draggingHandle) return;
    const { connectorId, end, original } = draggingHandle;

    // 优先使用当前高亮的 port，否则尝试用指针附近最近的 port，再退化到当前 target
    let targetPortId = activePortHighlight?.portId || null;
    let targetPortShapeId = activePortHighlight?.shapeId || null;
    if (!targetPortId) {
      const nearest = findNearestPortElement(point.x, point.y);
      if (nearest) {
        targetPortId = nearest.getAttribute('data-port-id');
        targetPortShapeId = nearest.getAttribute('data-shape-id');
      }
    }
    if (!targetPortId && targetEl && targetEl.getAttribute?.('data-port-id')) {
      targetPortId = targetEl.getAttribute('data-port-id');
      targetPortShapeId = targetEl.getAttribute('data-shape-id');
    }

    const connectorIndex = shapes.findIndex(s => s.id === connectorId);
    if (connectorIndex >= 0) {
      const edge = { ...shapes[connectorIndex], data: { ...shapes[connectorIndex].data }, connections: [...(shapes[connectorIndex].connections || [])] };
      const newShapes = shapes.map((shape, idx) => idx === connectorIndex ? edge : shape);

      const applyResult = (newPoint: { x: number; y: number }, newShapeId: string | null, newPortId: string | null) => {
        if (end === 'start') {
          edge.data.x1 = newPoint.x;
          edge.data.y1 = newPoint.y;
          edge.data.startPortId = newPortId;
          edge.element.setAttribute('x1', String(newPoint.x));
          edge.element.setAttribute('y1', String(newPoint.y));
        } else {
          edge.data.x2 = newPoint.x;
          edge.data.y2 = newPoint.y;
          edge.data.endPortId = newPortId;
          edge.element.setAttribute('x2', String(newPoint.x));
          edge.element.setAttribute('y2', String(newPoint.y));
        }
        edge.connections = (edge.connections as Array<string | null> | undefined) || [null, null];
        edge.connections[end === 'start' ? 0 : 1] = newShapeId;
      };

      const connectToShape = (targetShape: SVGShape, portId: string | null) => {
        let newPoint = point;
        let newPortId = portId;
        if (portId) {
          const pos = getPortPositionById(targetShape, portId);
          if (pos) newPoint = { x: pos.x, y: pos.y };
        } else {
          const center = getShapeCenter(targetShape);
          newPoint = center;
          newPortId = null;
        }
        applyResult(newPoint, targetShape.id, newPortId);
      };

      if (edge.type === 'connector' || edge.type === 'line') {
        const oldShapeId = original.shapeId || null;
        if (targetPortId && targetPortShapeId) {
          const targetShape = newShapes.find(s => s.id === targetPortShapeId);
          if (targetShape) connectToShape(targetShape, targetPortId);
        } else {
          const targetShape = newShapes.find(s => targetEl && (s.element === targetEl || s.element.contains(targetEl)));
          if (targetShape) connectToShape(targetShape, null);
        }

        const updatedShapes = newShapes.map(shape => {
          if (shape.type === 'connector') return shape;
          let connections = shape.connections || [];
          if (oldShapeId && shape.id === oldShapeId) {
            connections = connections.filter(c => c !== connectorId);
          }
          const newShapeId = edge.connections?.[end === 'start' ? 0 : 1];
          if (newShapeId && shape.id === newShapeId && !connections.includes(connectorId)) {
            connections = [...connections, connectorId];
          }
          if (connections !== shape.connections) {
            return { ...shape, connections };
          }
          return shape;
        });

        edge.element.setAttribute('stroke-dasharray', original.dash || '');
        showConnectorHandles(edge);

        const finalShapes = updatedShapes.map(shape => shape.id === connectorId ? edge : shape);
        setShapesState(() => finalShapes);
        setSelectedShape(connectorId);
        onShapeSelect?.(edge.element);
        saveToHistory(finalShapes, selectedIds);
      }
    }

    setDraggingHandle(null);
    if (handleConnectionRef.current) {
      setIsConnecting(false);
      handleConnectionRef.current = false;
    }
    if (activePortHighlight) {
      const prev = portElementsRef.current.get(activePortHighlight.shapeId)?.find(p => p.getAttribute('data-port-id') === activePortHighlight.portId);
      if (prev) resetPortStyle(prev);
      setActivePortHighlight(null);
    }
    if (hoveredShapeId) {
      hidePorts(hoveredShapeId);
      setHoveredShapeId(null);
    }
  }, [activePortHighlight, draggingHandle, findNearestPortElement, getPortPositionById, getShapeCenter, handleConnectionRef, hidePorts, hoveredShapeId, onShapeSelect, refreshResizeHandles, resetPortStyle, saveToHistory, selectedIds, setSelectedShape, shapes, showConnectorHandles, showTextSelection, updateConnectionLine]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingHandle) {
      finalizeHandleConnection(e.target as SVGElement, { x: lastPointerRef.current.x, y: lastPointerRef.current.y });
      return;
    }
    if (draggingPolylinePoint) {
      saveToHistory();
      setDraggingPolylinePoint(null);
      return;
    }

    if (isConnecting && connectionStart) {
      const target = e.target as SVGElement;
      const targetPortId = target?.getAttribute('data-port-id') || null;
      const targetPortShapeId = target?.getAttribute('data-shape-id') || null;

      if (targetPortId && targetPortShapeId && targetPortShapeId !== connectionStart) {
        connectShapes(connectionStart, targetPortShapeId, connectionStartPort || undefined, targetPortId);
      } else {
        const targetShape = shapes.find(s => s.element === target || s.element.contains(target));
        if (targetShape && targetShape.id !== connectionStart) {
          connectShapes(connectionStart, targetShape.id, connectionStartPort || undefined, undefined);
        } else {
          if (tempLine && svgRef.current) {
            svgRef.current.removeChild(tempLine);
            setTempLine(null);
          }
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionStartPort(null);
        }
      }
    } else if (isDragging || isResizing) {
      saveToHistory();
    } else if (isSelectingBox && selectionRect) {
      const selectedList = shapes.filter(shape => {
        if (shape.type === 'connector') return false;
        const b = getShapeBounds(shape);
        return b.minX >= selectionRect.x &&
          b.maxX <= selectionRect.x + selectionRect.w &&
          b.minY >= selectionRect.y &&
          b.maxY <= selectionRect.y + selectionRect.h;
      });
      if (selectedList.length) {
        const ids = selectedList.map(s => s.id);
        setSelectedShapes(ids);
        onShapeSelect?.(selectedList[0].element);
        skipNextCanvasClickClear.current = true;
      }
    }

    setIsSelectingBox(false);
    setSelectionRect(null);

    // 保持线段/连接线选中状态
    const target = e.target as SVGElement;
    const targetShape = shapes.find(s => s.element === target || s.element.contains(target));
    if (targetShape && (targetShape.type === 'line' || targetShape.type === 'connector')) {
      setSelectedShape(targetShape.id);
      onShapeSelect?.(targetShape.element);
    }
    // 如果当前已选中的是线段/连接线，强制保持选中状态
    if (!targetShape && selectedShape) {
      const currentSelected = shapes.find(s => s.id === selectedShape);
      if (currentSelected && (currentSelected.type === 'line' || currentSelected.type === 'connector')) {
        setSelectedShape(currentSelected.id);
        onShapeSelect?.(currentSelected.element);
      }
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
      setDraggingCornerHandle(null);
      setDragStart({ x: 0, y: 0 });
    // 清理框选态
    setSelectionRect(null);
  }, [connectShapes, connectionStart, connectionStartPort, getShapeBounds, isConnecting, isDragging, isResizing, isSelectingBox, onShapeSelect, saveToHistory, selectionRect, setSelectedShape, setSelectedShapes, shapes, tempLine]);

  // 图形鼠标按下事件处理
  const handleShapeMouseDown = useCallback((e: React.MouseEvent, shape: SVGShape) => {
    e.stopPropagation();
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 右键点击时保持当前选择，不打断框选/多选
    if (e.button === 2) {
      if (selectedIds.size === 0) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
      }
      return;
    }

    if (isConnecting) {
      if (!connectionStart) {
        startConnection(shape.id);
      } else if (connectionStart !== shape.id) {
        connectShapes(connectionStart, shape.id, connectionStartPort || undefined, undefined);
      }
      return;
    }

    if (e.shiftKey && selectedShape) {
      // Shift+点击创建连接
      startConnection(selectedShape);
    } else {
      if (e.metaKey || e.ctrlKey) {
        console.log('Ctrl/Cmd+Click for multi-selection');
        const next = new Set(selectedIds);
        if (next.has(shape.id)) {
          next.delete(shape.id);
          console.log('Removing shape from selection:', shape.id);
        } else {
          next.add(shape.id);
          console.log('Adding shape to selection:', shape.id);
        }
        console.log('New selection:', Array.from(next));
        setSelectedIds(next);
        // 如果还有选中的图形，调用onShapeSelect
        if (next.size > 0) {
          const firstSelectedId = Array.from(next)[0];
          const firstSelectedShape = shapes.find(s => s.id === firstSelectedId);
          if (firstSelectedShape) {
            onShapeSelect?.(firstSelectedShape.element);
          }
        } else {
          onShapeSelect?.(null);
        }
        return;
      }
      
      const groupId = shape.data.groupId;
      const alreadyMultiSelected = selectedIds.size > 1 && selectedIds.has(shape.id);

      if (alreadyMultiSelected) {
        // 维持当前多选集合，直接进入拖拽
        onShapeSelect?.(shape.element);
        setIsDragging(true);
        setDragStart({ x, y });
        return;
      }

      if (groupId) {
        const groupIds = shapes.filter(s => s.data.groupId === groupId).map(s => s.id);
        console.log('Shape is in group, selecting all group members:', groupIds);
        setSelectedIds(new Set(groupIds));
        onShapeSelect?.(shape.element);
      } else {
        // 普通点击，只选中当前图形
        console.log('Normal click, selecting single shape:', shape.id);
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
      }
      // 连接线/直线：无连接时可整体拖动；有连接时仅选中
      if ((shape.type === 'line' || shape.type === 'connector') && !isLineConnected(shape)) {
        setIsDragging(true);
        setDragStart({ x, y });
      } else if (shape.type !== 'line' && shape.type !== 'connector') {
        // 记录拖拽起始位置
        setIsDragging(true);
        setDragStart({ x, y });
      } else {
        setIsDragging(false);
      }
    }
  }, [connectShapes, connectionStart, connectionStartPort, isConnecting, isLineConnected, onShapeSelect, selectedIds, selectedShape, startConnection]);

  // 删除选中图形及关联连接线
  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0 || !svgRef.current) return;

    let updatedShapes = [...shapes];
    const connectorIds = new Set<string>();

    updatedShapes.forEach(shape => {
      // 已选中的连接线
      if (selectedIds.has(shape.id) && shape.type === 'connector') {
        connectorIds.add(shape.id);
      }
      // 连接到已选中图元的连接线
      if (shape.type === 'connector' && shape.connections) {
        const [a, b] = shape.connections;
        if ((a && selectedIds.has(a)) || (b && selectedIds.has(b))) {
          connectorIds.add(shape.id);
        }
      }
    });

    const idsToRemove = new Set<string>([...Array.from(selectedIds), ...Array.from(connectorIds)]);

    updatedShapes = updatedShapes
      .filter(shape => !idsToRemove.has(shape.id))
      .map(shape => ({
        ...shape,
        connections: shape.connections?.filter(connId => connId && !idsToRemove.has(connId)),
      }));

    idsToRemove.forEach(id => {
      hidePorts(id);
      hideConnectorHandles(id);
      hideResizeHandles(id);
      hideCornerHandles(id);
      const element = document.getElementById(id);
      if (element && svgRef.current?.contains(element)) {
        svgRef.current.removeChild(element);
      }
    });

    setShapesState(() => updatedShapes);
    setSelectedIds(new Set());
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory(updatedShapes, []);
  }, [hideConnectorHandles, hidePorts, hideResizeHandles, hideCornerHandles, onShapeSelect, saveToHistory, selectedIds, shapes]);

  const clearCanvas = useCallback(() => {
    if (!svgRef.current) return;

    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideCornerHandles();
    hideTextSelection();
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    setShapesState(() => []);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory([], null);
  }, [hideConnectorHandles, hidePorts, hideResizeHandles, hideCornerHandles, onShapeSelect, saveToHistory]);

  const getSelectedShape = useCallback((): SVGElement | null => {
    const el = selectedShape ? document.getElementById(selectedShape) : null;
    return el instanceof SVGElement ? el : null;
  }, [selectedShape]);

  const cloneShapeWithDef = useCallback((shape: SVGShape, offset: number) => {
    const def = getDef(shape);
    if (def?.clone) {
      const cloned = def.clone(shape, { createSVGElement, generateId }, offset) as SVGShape;
      cloned.connections = cloned.connections ?? [];
      return cloned;
    }
    const clonedElement = shape.element.cloneNode(true) as SVGElement;
    const id = generateId();
    clonedElement.setAttribute('id', id);
    return { ...shape, id, element: clonedElement, connections: [] as Array<string | null> };
  }, [createSVGElement, generateId, getDef]);

  const duplicateSelected = useCallback((ids?: Set<string> | string[]) => {
    const targetIds = ids ? (ids instanceof Set ? ids : new Set(ids)) : selectedIds;
    if (targetIds.size === 0 || !svgRef.current) return;

    const offset = 20;
    const idMap = new Map<string, string>();
    const newShapes: SVGShape[] = [];
    const ctxShapes = [...shapes];

    // 先复制非连接类图元（包含未连接的线）
    shapes.forEach(sourceShape => {
      if (!targetIds.has(sourceShape.id)) return;
      const isConnectionLine = (sourceShape.type === 'line' || sourceShape.type === 'connector') && (sourceShape.connections?.some(Boolean));
      if (sourceShape.type === 'connector' || isConnectionLine) return;

      const duplicatedShape = cloneShapeWithDef(sourceShape, offset);
      idMap.set(sourceShape.id, duplicatedShape.id);
      applyTransform(duplicatedShape);
      svgRef.current!.appendChild(duplicatedShape.element);
      newShapes.push(duplicatedShape);
    });

    // 再复制连接线（两端都在选中集合才复制）
    shapes.forEach(sourceShape => {
      if (!targetIds.has(sourceShape.id)) return;
      if (sourceShape.type !== 'line' && sourceShape.type !== 'connector') return;

      const [from, to] = (sourceShape.connections || []) as Array<string | null | undefined>;
      if (!from || !to) {
        // 未连接的线直接克隆
        const duplicatedShape = cloneShapeWithDef(sourceShape, offset);
        idMap.set(sourceShape.id, duplicatedShape.id);
        applyTransform(duplicatedShape);
        svgRef.current!.appendChild(duplicatedShape.element);
        newShapes.push(duplicatedShape);
        return;
      }

      const newFrom = idMap.get(from);
      const newTo = idMap.get(to);
      if (!newFrom || !newTo) return;

      const fromShape = [...newShapes, ...ctxShapes].find(s => s.id === newFrom);
      const toShape = [...newShapes, ...ctxShapes].find(s => s.id === newTo);
      if (!fromShape || !toShape) return;

      const connector = createSVGElement('line');
      if (!connector || !svgRef.current) return;
      const newId = generateId();
      connector.setAttribute('id', newId);
      connector.setAttribute('stroke', sourceShape.data.stroke);
      connector.setAttribute('stroke-width', String(sourceShape.data.strokeWidth || 2));
      connector.setAttribute('fill', 'none');
      connector.setAttribute('cursor', 'pointer');

      const startPoint = getPortPositionById(fromShape, sourceShape.data.startPortId) || getShapeCenter(fromShape);
      const endPoint = getPortPositionById(toShape, sourceShape.data.endPortId) || getShapeCenter(toShape);
      connector.setAttribute('x1', String(startPoint.x));
      connector.setAttribute('y1', String(startPoint.y));
      connector.setAttribute('x2', String(endPoint.x));
      connector.setAttribute('y2', String(endPoint.y));

      const duplicatedShape: SVGShape = {
        ...sourceShape,
        id: newId,
        element: connector,
        data: {
          ...sourceShape.data,
          x1: startPoint.x,
          y1: startPoint.y,
          x2: endPoint.x,
          y2: endPoint.y,
        },
        connections: [newFrom, newTo],
      };
      svgRef.current.appendChild(connector);
      newShapes.push(duplicatedShape);
    });

    if (newShapes.length === 0) return;

    const mergedShapes = [...shapes, ...newShapes];
    setShapesState(() => mergedShapes);
    const newIds = newShapes.map(s => s.id);
    setSelectedIds(new Set(newIds));
    copyBufferRef.current = newIds;
    onShapeSelect?.(mergedShapes.find(s => s.id === newIds[0])?.element || null);
    saveToHistory(mergedShapes, newIds);
    return newIds;
  }, [applyTransform, cloneShapeWithDef, createSVGElement, generateId, getPortPositionById, getShapeCenter, onShapeSelect, saveToHistory, selectedIds, shapes]);

  const bringToFront = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;
    const target = shapes.find(shape => shape.id === selectedShape);
    if (!target) return;

    svgRef.current.appendChild(target.element);
    const reordered = [...shapes.filter(shape => shape.id !== selectedShape), target];
    setShapesState(() => reordered);
    saveToHistory(reordered, selectedIds);
  }, [saveToHistory, selectedIds, selectedShape, shapes]);

  const sendToBack = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;
    const target = shapes.find(shape => shape.id === selectedShape);
    if (!target) return;

    const firstChild = svgRef.current.firstChild;
    if (firstChild) {
      svgRef.current.insertBefore(target.element, firstChild);
    }
    const reordered = [target, ...shapes.filter(shape => shape.id !== selectedShape)];
    setShapesState(() => reordered);
    saveToHistory(reordered, selectedIds);
  }, [saveToHistory, selectedIds, selectedShape, shapes]);

  const rotateSelected = useCallback((angle: number) => {
    updateSelectedShape(shape => {
      shape.data.rotation = angle;
      applyTransform(shape);
    });
  }, [applyTransform, updateSelectedShape]);

  const scaleSelected = useCallback((scale: number) => {
    const safeScale = Math.max(0.1, scale);
    updateSelectedShape(shape => {
      shape.data.scale = safeScale;
      applyTransform(shape);
    });
  }, [applyTransform, updateSelectedShape]);

  const changeSelectedFill = useCallback((color: string) => {
    const targetIds = selectedIdsRef.current.size ? selectedIdsRef.current : selectedIds;
    if (targetIds.size === 0) {
      console.warn('[changeSelectedFill] no targets', { selectedIds: Array.from(selectedIds) });
      return;
    }
    const currentShapes = shapesRef.current;
    console.log('[changeSelectedFill] apply', { color, targetCount: targetIds.size, targetIds: Array.from(targetIds), shapesCount: currentShapes.length });
    const updatedShapes = currentShapes.map(shape => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data } };
      nextShape.data.fill = color;
      if (nextShape.type === 'line' || nextShape.type === 'polyline' || nextShape.type === 'connector') {
        nextShape.element.setAttribute('fill', 'none');
      } else if (nextShape.type === 'image') {
        const originalSvg = nextShape.data.originalSvgText || decodeDataUri(nextShape.data.originalHref || nextShape.data.href || '');
        console.log('[changeSelectedFill:image] start', {
          shapeId: nextShape.id,
          iconName: nextShape.data.iconName,
          color,
          hasOriginalSvg: !!nextShape.data.originalSvgText,
          decodedLen: originalSvg?.length ?? 0,
        });
        if (originalSvg) {
          const tintedText = tintSvgText(originalSvg, color);
          const tintedUri = toDataUri(tintedText);
          if (tintedUri) {
            nextShape.data.href = tintedUri;
            (nextShape.element as SVGImageElement).setAttribute('href', tintedUri);
            (nextShape.element as SVGImageElement).setAttributeNS('http://www.w3.org/1999/xlink', 'href', tintedUri);
            console.log('[changeSelectedFill:image] applied tintedUri', { tintedUriLength: tintedUri.length });
          } else {
            console.warn('[changeSelectedFill:image] toDataUri empty');
          }
        } else {
          const href = nextShape.data.originalHref || nextShape.data.href || '';
          const tinted = tintDataUri(href, color);
          nextShape.data.href = tinted;
          (nextShape.element as SVGImageElement).setAttribute('href', tinted);
          (nextShape.element as SVGImageElement).setAttributeNS('http://www.w3.org/1999/xlink', 'href', tinted);
          console.log('[changeSelectedFill:image] fallback tintDataUri applied', { tintedLength: tinted.length });
        }
      } else {
        nextShape.element.setAttribute('fill', color);
      }
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    console.log('[changeSelectedFill] shapes updated, saving history');
    saveToHistory(updatedShapes, targetIds);
  }, [decodeDataUri, saveToHistory, selectedIds, tintDataUri, tintSvgText, toDataUri]);

  const changeSelectedStroke = useCallback((color: string) => {
    const targetIds = selectedIdsRef.current.size ? selectedIdsRef.current : selectedIds;
    if (targetIds.size === 0) return;
    const updatedShapes = shapes.map(shape => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data, stroke: color } };
      nextShape.element.setAttribute('stroke', color);
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  }, [saveToHistory, selectedIds, shapes]);

  const changeSelectedStrokeWidth = useCallback((width: number) => {
    const targetIds = selectedIdsRef.current.size ? selectedIdsRef.current : selectedIds;
    if (targetIds.size === 0) return;
    const updatedShapes = shapes.map(shape => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data, strokeWidth: width } };
      nextShape.element.setAttribute('stroke-width', String(width));
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  }, [saveToHistory, selectedIds, shapes]);

  const changeSelectedOpacity = useCallback((opacity: number) => {
    const targetIds = selectedIdsRef.current.size ? selectedIdsRef.current : selectedIds;
    if (targetIds.size === 0) return;
    const safeOpacity = Math.min(1, Math.max(0, opacity));
    const updatedShapes = shapes.map(shape => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data, opacity: safeOpacity } };
      nextShape.element.setAttribute('opacity', String(safeOpacity));
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  }, [saveToHistory, selectedIds, shapes]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const prevState = history[prevIndex];
    restoreHistoryState(prevState);
    setHistoryIndex(prevIndex);
    onCanvasChange?.();
  }, [history, historyIndex, onCanvasChange, restoreHistoryState]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const nextState = history[nextIndex];
    restoreHistoryState(nextState);
    setHistoryIndex(nextIndex);
    onCanvasChange?.();
  }, [history, historyIndex, onCanvasChange, restoreHistoryState]);

  const canUndo = useCallback(() => historyIndex > 0, [historyIndex]);
  const canRedo = useCallback(() => historyIndex < history.length - 1, [history.length, historyIndex]);

  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (!svgRef.current) return;

    switch (format) {
      case 'svg':
        const svgData = new XMLSerializer().serializeToString(svgRef.current!);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const svgLink = document.createElement('a');
        svgLink.download = 'canvas.svg';
        svgLink.href = svgUrl;
        svgLink.click();
        URL.revokeObjectURL(svgUrl);
        break;
      case 'png':
      case 'jpg':
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const svgString = new XMLSerializer().serializeToString(svgRef.current);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.download = `canvas.${format}`;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, `image/${format}`, format === 'jpg' ? 0.8 : 1);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        break;
    }
  }, [width, height, backgroundColor]);

  // 自动调整画布大小
  useEffect(() => {
    if (!autoResize || !svgRef.current) return;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    let hasContent = false;

    shapes.forEach(shape => {
      hasContent = true;
      const bounds = getShapeBounds(shape);
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    });

    // 如果有内容且超出边界，通知父组件
    if (hasContent && (minX < 0 || minY < 0 || maxX > width || maxY > height)) {
      const padding = 50;
      const newWidth = Math.max(width, maxX + padding);
      const newHeight = Math.max(height, maxY + padding);
      
      // 这里可以触发回调来通知父组件调整画布大小
      console.log('Canvas needs resizing to:', { newWidth, newHeight });
    }
  }, [autoResize, getShapeBounds, height, shapes, width]);

  // 更新选中状态样式
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    shapes.forEach(shape => {
      const isSelected = selectedIds.has(shape.id);
      
      if (isSelected) {
        if (shape.type !== 'text') {
          const originalWidth = shape.data.strokeWidth ?? 1;
          shape.element.setAttribute('stroke', '#60a5fa');
          shape.element.setAttribute('stroke-width', String(originalWidth));
          shape.element.setAttribute('stroke-dasharray', '4,4');
        } else {
          showTextSelection(shape);
          shape.element.setAttribute('stroke', shape.data.stroke);
          shape.element.setAttribute('stroke-width', String(shape.data.strokeWidth));
          shape.element.removeAttribute('stroke-dasharray');
        }
      } else {
        shape.element.setAttribute('stroke', shape.data.stroke);
        shape.element.setAttribute('stroke-width', String(shape.data.strokeWidth));
        shape.element.removeAttribute('stroke-dasharray');
        if (shape.type === 'text') {
          hideTextSelection(shape.id);
        }
      }

      const handleMouseDown = (e: MouseEvent) =>
        handleShapeMouseDown(e as unknown as React.MouseEvent<SVGElement>, shape);
      const handleDblClick = (e: MouseEvent) => {
        if (shape.type === 'text') {
          e.stopPropagation();
          beginEditText(shape);
        }
      };
      const handleMouseEnter = () => {
        if (!isSelected) {
          shape.element.style.filter = 'brightness(1.2)';
        }
        if (shape.type === 'connector' || shape.type === 'line') {
          showConnectorHandles(shape);
          hideResizeHandles(shape.id);
        } else {
          showPorts(shape);
          // 非选中状态不再显示缩放手柄
          if (isSelected) {
            showResizeHandles(shape);
            // 如果是圆角矩形，显示圆角手柄
            if (shape.type === 'roundedRect') {
              showCornerHandles(shape);
            }
          } else {
            hideResizeHandles(shape.id);
            hideCornerHandles(shape.id);
          }
        }
      };
      const handleMouseLeave = (ev: MouseEvent) => {
        if (!isSelected) {
          shape.element.style.filter = '';
        }
        if (shape.type === 'connector' || shape.type === 'line') {
          if (!isSelected && !draggingHandle) {
            hideConnectorHandles(shape.id);
          }
        } else {
          const related = ev.relatedTarget as HTMLElement | null;
          const movingToPort = related?.getAttribute?.('data-port-id');
          if (!isConnecting && !movingToPort) {
            hidePorts(shape.id);
          }
          // 隐藏圆角手柄
          if (!isSelected) {
            hideCornerHandles(shape.id);
          }
        }
      };

      shape.element.addEventListener('mousedown', handleMouseDown);
      shape.element.addEventListener('dblclick', handleDblClick);
      shape.element.addEventListener('mouseenter', handleMouseEnter);
      shape.element.addEventListener('mouseleave', handleMouseLeave);

      cleanups.push(() => {
        shape.element.removeEventListener('mousedown', handleMouseDown);
        shape.element.removeEventListener('dblclick', handleDblClick);
        shape.element.removeEventListener('mouseenter', handleMouseEnter);
        shape.element.removeEventListener('mouseleave', handleMouseLeave);
      });

      if ((shape.type === 'connector' || shape.type === 'line') && isSelected) {
        showConnectorHandles(shape);
      } else if ((shape.type === 'connector' || shape.type === 'line') && !isSelected && !draggingHandle) {
        hideConnectorHandles(shape.id);
      }

      // 仅选中图元显示缩放手柄
      if (shape.type !== 'line' && shape.type !== 'connector') {
        if (isSelected) {
          showResizeHandles(shape);
          // 如果是圆角矩形，显示圆角手柄
          if (shape.type === 'roundedRect') {
            showCornerHandles(shape);
          }
        } else {
          hideResizeHandles(shape.id);
          hideCornerHandles(shape.id);
        }
      }
    });

    return () => {
      cleanups.forEach(clean => clean());
    };
  }, [draggingCornerHandle, draggingHandle, handleShapeMouseDown, hideConnectorHandles, hidePorts, hideResizeHandles, hideCornerHandles, isConnecting, selectedIds, shapes, showConnectorHandles, showPorts, showResizeHandles, showCornerHandles, showTextSelection, hideTextSelection, beginEditText, updateTextContent]);

  // 画布点击事件（取消选择）
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsSelectingBox(true);
      setSelectionRect({ x, y, w: 0, h: 0 });
      setSelectedShape(null);
      onShapeSelect?.(null);
    }
  }, [onShapeSelect]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      if (skipNextCanvasClickClear.current) {
        skipNextCanvasClickClear.current = false;
        return;
      }
      let shouldClear = true;

      // 对线/连接线增加容错：点击位置若靠近当前选中的线，则保持选中
      if (selectedShape) {
        const current = shapes.find(s => s.id === selectedShape);
        if (current && (current.type === 'line' || current.type === 'connector') && svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const dist = pointToSegmentDistance(x, y, current.data.x1 || 0, current.data.y1 || 0, current.data.x2 || 0, current.data.y2 || 0);
          const tolerance = 8; // 像素容差
          if (dist <= tolerance) {
            shouldClear = false;
            setSelectedShape(current.id);
            onShapeSelect?.(current.element);
          }
        }
      }

      if (shouldClear) {
        setSelectedShape(null);
        onShapeSelect?.(null);
      }
      
      // 取消连接
      if (isConnecting && tempLine && svgRef.current) {
        svgRef.current.removeChild(tempLine);
        setTempLine(null);
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionStartPort(null);
    }
  }, [onShapeSelect, isConnecting, tempLine, pointToSegmentDistance, selectedShape, shapes]);

  // 全局键盘快捷键
  useEffect(() => {
    const isTextInput = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || target.isContentEditable || tag === 'select';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return;

      const meta = e.metaKey || e.ctrlKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (meta && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyBufferRef.current = Array.from(selectedIds);
      } else if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (meta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (copyBufferRef.current.length > 0) {
          const newIds = duplicateSelected(copyBufferRef.current);
          if (newIds && newIds.length) {
            copyBufferRef.current = newIds;
          }
        }
      } else if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (meta && (e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
      } else if (meta && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          ungroupSelected();
        } else {
          combineSelected();
        }
      } else if (e.key === 'Escape') {
        if (isConnecting) {
          if (tempLine && svgRef.current?.contains(tempLine)) {
            svgRef.current.removeChild(tempLine);
          }
          setTempLine(null);
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionStartPort(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combineSelected, deleteSelected, duplicateSelected, isConnecting, redo, tempLine, undo, selectedIds, ungroupSelected]);

  // 创建方法对象
  const methods: CanvasComponentRef = {
    addRectangle,
    addRoundedRect,
    addCircle,
    addTriangle,
    addLine,
    addPolyline,
    addText,
    addSvgIcon,
    combineSelected,
    ungroupSelected,
    deleteSelected,
    clearCanvas,
    exportCanvas,
    getCanvas: () => svgRef.current,
    getSelectedShape,
    duplicateSelected,
    bringToFront,
    sendToBack,
    rotateSelected,
    scaleSelected,
    changeSelectedFill,
    changeSelectedStroke,
    changeSelectedStrokeWidth,
    changeSelectedOpacity,
    undo,
    redo,
    startConnection,
    connectShapes,
    canUndo,
    canRedo,
    addShapeAt,
  };

  useEffect(() => {
    methodsRef.current = methods;
  }, [methods]);

  useImperativeHandle(ref, () => methodsRef.current as CanvasComponentRef, [methods]);

  // 处理在画布外释放鼠标时终止端点拖拽
  useEffect(() => {
    const onWindowMouseUp = () => {
      if (!draggingHandle) return;
      const targetEl = document.elementFromPoint(lastPointerRef.current.clientX, lastPointerRef.current.clientY) as SVGElement | null;
      finalizeHandleConnection(targetEl, { x: lastPointerRef.current.x, y: lastPointerRef.current.y });
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, [draggingHandle, finalizeHandleConnection]);

  // 初始化（仅调用一次）
  useEffect(() => {
    if (svgRef.current && onReady && methodsRef.current && !hasCalledReady.current) {
      onReady(svgRef.current, methodsRef.current);
      hasCalledReady.current = true;
    }
  }, [onReady]);

  return (
    <div className="relative border border-gray-300 rounded">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ backgroundColor }}
        className="block"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      />
      {editingText && (
        <input
          ref={editingInputRef}
          className="absolute outline-none bg-transparent"
          style={{
            left: editingText.x,
            top: editingText.y,
            width: editingText.width,
            height: editingText.height,
            padding: 0,
            margin: 0,
            border: 'none',
            boxShadow: 'none',
            fontSize: editingText.fontSize,
            fontFamily: editingText.fontFamily,
            fontWeight: editingText.fontWeight,
            fontStyle: editingText.fontStyle,
            letterSpacing: editingText.letterSpacing,
            lineHeight: editingText.lineHeight || `${editingText.fontSize}px`,
            color: editingText.color,
          }}
          value={editingText.value}
          onChange={e => setEditingText(prev => (prev ? { ...prev, value: e.target.value } : prev))}
          onBlur={() => commitEditingText(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitEditingText(true);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              commitEditingText(false);
            }
          }}
          onMouseDown={e => e.stopPropagation()}
        />
      )}
      {selectionRect && (
        <div
          className="absolute border-2 border-blue-400 border-dashed bg-blue-200/20 pointer-events-none"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.w,
            height: selectionRect.h,
          }}
        />
      )}
      {groupSelectionBounds && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: groupSelectionBounds.x,
            top: groupSelectionBounds.y,
            width: groupSelectionBounds.w,
            height: groupSelectionBounds.h,
          }}
        >
          <div className="absolute inset-0 border-2 border-dashed border-[#36a7ff]" />
          {[
            { x: 0, y: 0 },
            { x: 0.5, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0.5 },
            { x: 1, y: 0.5 },
            { x: 0, y: 1 },
            { x: 0.5, y: 1 },
            { x: 1, y: 1 },
          ].map((p, idx) => (
            <div
              key={idx}
              className="absolute w-4 h-4 bg-[#36a7ff] rounded-full border-2 border-white"
              style={{
                left: `calc(${p.x * 100}% - 8px)`,
                top: `calc(${p.y * 100}% - 8px)`,
              }}
            />
          ))}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-[#36a7ff] rounded-full flex items-center justify-center text-xs text-[#36a7ff]"
            style={{
              right: -18,
              top: -18,
            }}
          >
            ⟳
          </div>
        </div>
      )}
      {polylineHandles.map(handle => (
        <div
          key={`${handle.shapeId}-${handle.index}`}
          className="absolute w-3 h-3 bg-[#36a7ff] rounded-full border-2 border-white cursor-move"
          style={{
            left: handle.x - 6,
            top: handle.y - 6,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            setDraggingPolylinePoint({ shapeId: handle.shapeId, index: handle.index });
            setDragStart({ x: handle.x, y: handle.y });
          }}
        />
      ))}
      {isConnecting && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
          连接模式 - 点击目标图形完成连接
        </div>
      )}
    </div>
  );
});

export default CanvasComponent;
