"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

export interface CanvasComponentRef {
  addRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addPolyline: () => void;
  addText: () => void;
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
  type: 'rect' | 'circle' | 'triangle' | 'line' | 'polyline' | 'text' | 'connector';
  element: SVGElement;
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    text?: string;
    startPortId?: string | null;
    endPortId?: string | null;
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

export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  width,
  height,
  backgroundColor = '#ffffff',
  onReady,
  onError,
  onShapeSelect,
  onCanvasChange,
  autoResize = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [shapes, setShapes] = useState<SVGShape[]>([]);
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
  const [connectionStartPort, setConnectionStartPort] = useState<string | null>(null);
  const connectorHandleRef = useRef<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>(new Map());
  const skipNextCanvasClickClear = useRef(false);
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
  const textSelectionRef = useRef<Map<string, SVGRectElement>>(new Map());
  const selectedShape = useMemo(() => {
    const first = selectedIds.values().next();
    return first.done ? null : first.value;
  }, [selectedIds]);
  const setSelectedShape = useCallback((id: string | null) => {
    setSelectedIds(id ? new Set([id]) : new Set());
  }, []);
  const setSelectedShapes = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
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

  // 获取图形的中心点
  const getShapeCenter = useCallback((shape: SVGShape) => {
    switch (shape.type) {
      case 'rect':
        return {
          x: (shape.data.x || 0) + (shape.data.width || 0) / 2,
          y: (shape.data.y || 0) + (shape.data.height || 0) / 2,
        };
      case 'circle':
        return { x: shape.data.x || 0, y: shape.data.y || 0 };
      case 'triangle':
        // 计算三角形中心点
        const points = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        if (!points.length) return { x: 0, y: 0 };
        const centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
        return { x: centerX, y: centerY };
      case 'text':
        return { x: shape.data.x || 0, y: shape.data.y || 0 };
      case 'line':
      case 'connector': {
        const x1 = shape.data.x1 || 0;
        const y1 = shape.data.y1 || 0;
        const x2 = shape.data.x2 || 0;
        const y2 = shape.data.y2 || 0;
        return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
      }
      case 'polyline': {
        const pts = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        if (!pts.length) return { x: 0, y: 0 };
        const polyX = pts.reduce((sum, [x]) => sum + x, 0) / pts.length;
        const polyY = pts.reduce((sum, [, y]) => sum + y, 0) / pts.length;
        return { x: polyX, y: polyY };
      }
      default:
        return { x: 0, y: 0 };
    }
  }, []);

  const getPortPositions = useCallback((shape: SVGShape) => {
    const cross = (a: { x: number; y: number }, b: { x: number; y: number }) => a.x * b.y - a.y * b.x;
    const subtract = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: a.x - b.x, y: a.y - b.y });
    const intersectRaySegment = (
      origin: { x: number; y: number },
      dir: { x: number; y: number },
      a: { x: number; y: number },
      b: { x: number; y: number }
    ) => {
      const seg = subtract(b, a);
      const denom = cross(dir, seg);
      if (Math.abs(denom) < 1e-6) return null;
      const diff = subtract(a, origin);
      const t = cross(diff, seg) / denom; // ray factor
      const u = cross(diff, dir) / denom; // segment factor
      if (t <= 0 || u < 0 || u > 1) return null;
      return { x: origin.x + dir.x * t, y: origin.y + dir.y * t, t };
    };

    switch (shape.type) {
      case 'rect': {
        const x = shape.data.x || 0;
        const y = shape.data.y || 0;
        const w = shape.data.width || 0;
        const h = shape.data.height || 0;
        const midX = x + w / 2;
        const midY = y + h / 2;
        return [
          { id: `${shape.id}-port-top`, x: midX, y: y, position: 'top' },
          { id: `${shape.id}-port-right`, x: x + w, y: midY, position: 'right' },
          { id: `${shape.id}-port-bottom`, x: midX, y: y + h, position: 'bottom' },
          { id: `${shape.id}-port-left`, x: x, y: midY, position: 'left' },
        ];
      }
      case 'circle': {
        const cx = shape.data.x || 0;
        const cy = shape.data.y || 0;
        const r = shape.data.radius || 0;
        return [
          { id: `${shape.id}-port-top`, x: cx, y: cy - r, position: 'top' },
          { id: `${shape.id}-port-right`, x: cx + r, y: cy, position: 'right' },
          { id: `${shape.id}-port-bottom`, x: cx, y: cy + r, position: 'bottom' },
          { id: `${shape.id}-port-left`, x: cx - r, y: cy, position: 'left' },
        ];
      }
      case 'triangle': {
        const pts = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        if (pts.length === 0) return [];
        const vertices = pts.slice(0, 3).map(([x, y]) => ({ x, y }));
        const centroid = {
          x: vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length,
          y: vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length,
        };
        const edges = [
          [vertices[0], vertices[1]],
          [vertices[1], vertices[2]],
          [vertices[2], vertices[0]],
        ] as const;
        const directions = [
          { id: `${shape.id}-port-top`, dir: { x: 0, y: -1 }, position: 'top' },
          { id: `${shape.id}-port-right`, dir: { x: 1, y: 0 }, position: 'right' },
          { id: `${shape.id}-port-bottom`, dir: { x: 0, y: 1 }, position: 'bottom' },
          { id: `${shape.id}-port-left`, dir: { x: -1, y: 0 }, position: 'left' },
        ] as const;
        return directions.map(portDir => {
          let best: { x: number; y: number; t: number } | null = null;
          edges.forEach(([a, b]) => {
            const hit = intersectRaySegment(centroid, portDir.dir, a, b);
            if (hit && (!best || hit.t < best.t)) {
              best = hit;
            }
          });
          return best
            ? { id: portDir.id, x: best.x, y: best.y, position: portDir.position }
            : { id: portDir.id, x: centroid.x, y: centroid.y, position: portDir.position };
        });
      }
      default:
        return [];
    }
  }, []);

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
    switch (shape.type) {
      case 'rect':
        return {
          minX: shape.data.x || 0,
          maxX: (shape.data.x || 0) + (shape.data.width || 0),
          minY: shape.data.y || 0,
          maxY: (shape.data.y || 0) + (shape.data.height || 0),
        };
      case 'circle':
        return {
          minX: (shape.data.x || 0) - (shape.data.radius || 0),
          maxX: (shape.data.x || 0) + (shape.data.radius || 0),
          minY: (shape.data.y || 0) - (shape.data.radius || 0),
          maxY: (shape.data.y || 0) + (shape.data.radius || 0),
        };
      case 'triangle': {
        const pts = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        const xs = pts.map(([x]) => x);
        const ys = pts.map(([, y]) => y);
        return {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
        };
      }
      case 'text':
        if (shape.element instanceof SVGTextElement) {
          const bbox = shape.element.getBBox();
          return {
            minX: bbox.x,
            maxX: bbox.x + bbox.width,
            minY: bbox.y,
            maxY: bbox.y + bbox.height,
          };
        }
        return {
          minX: shape.data.x || 0,
          maxX: (shape.data.x || 0) + 100,
          minY: (shape.data.y || 0) - 20,
          maxY: (shape.data.y || 0) + 20,
        };
      case 'polyline': {
        const pts = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        const xs = pts.map(([x]) => x);
        const ys = pts.map(([, y]) => y);
        return {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
        };
      }
      case 'line':
      case 'connector':
        return {
          minX: Math.min(shape.data.x1 || 0, shape.data.x2 || 0),
          maxX: Math.max(shape.data.x1 || 0, shape.data.x2 || 0),
          minY: Math.min(shape.data.y1 || 0, shape.data.y2 || 0),
          maxY: Math.max(shape.data.y1 || 0, shape.data.y2 || 0),
        };
      default:
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
  }, []);

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

  const findNearestPortElement = useCallback((x: number, y: number, maxDistance = 14) => {
    let nearest: { el: SVGElement; dist: number } | null = null;
    portElementsRef.current.forEach(portList => {
      portList.forEach(port => {
        const cx = Number(port.getAttribute('cx'));
        const cy = Number(port.getAttribute('cy'));
        const dist = Math.hypot(cx - x, cy - y);
        if (dist <= maxDistance && (!nearest || dist < nearest.dist)) {
          nearest = { el: port, dist };
        }
      });
    });
    return nearest?.el ?? null;
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

  const showResizeHandles = useCallback((shape: SVGShape) => {
    if (!svgRef.current) return;
    if (shape.type === 'line' || shape.type === 'connector') return; // 线段已有端点手柄
    hideResizeHandles(shape.id);
    const bounds = getBounds(shape);
    const points = [
      { id: 'nw', x: bounds.x, y: bounds.y },
      { id: 'ne', x: bounds.x + bounds.w, y: bounds.y },
      { id: 'sw', x: bounds.x, y: bounds.y + bounds.h },
      { id: 'se', x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    ];
    const created: SVGElement[] = [];
    points.forEach(p => {
      const handle = createSVGElement('rect');
      if (!handle) return;
      handle.setAttribute('x', String(p.x - 5));
      handle.setAttribute('y', String(p.y - 5));
      handle.setAttribute('width', '10');
      handle.setAttribute('height', '10');
      handle.setAttribute('fill', '#ffffff');
      handle.setAttribute('stroke', '#2563eb');
      handle.setAttribute('stroke-width', '2');
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

  const refreshResizeHandles = useCallback((shape: SVGShape) => {
    const handles = resizeHandlesRef.current.get(shape.id);
    if (!handles || handles.length === 0) return;
    const bounds = getBounds(shape);
    const pos = {
      nw: { x: bounds.x, y: bounds.y },
      ne: { x: bounds.x + bounds.w, y: bounds.y },
      sw: { x: bounds.x, y: bounds.y + bounds.h },
      se: { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    } as const;
    handles.forEach(h => {
      const id = h.getAttribute('data-resize') as 'nw' | 'ne' | 'sw' | 'se' | null;
      if (!id) return;
      const p = pos[id];
      h.setAttribute('x', String(p.x - 5));
      h.setAttribute('y', String(p.y - 5));
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
    const bbox = shape.element.getBBox();
    const padding = 2;
    const rect = createSVGElement('rect');
    if (!rect) return;
    rect.setAttribute('x', String(bbox.x - padding));
    rect.setAttribute('y', String(bbox.y - padding));
    rect.setAttribute('width', String(bbox.width + padding * 2));
    rect.setAttribute('height', String(bbox.height + padding * 2));
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#dc2626');
    rect.setAttribute('stroke-width', '1.5');
    rect.setAttribute('stroke-dasharray', '5,3');
    rect.setAttribute('pointer-events', 'none');
    rect.setAttribute('data-text-selection', shape.id);
    svgRef.current.appendChild(rect);
    textSelectionRef.current.set(shape.id, rect);
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
      const c = createSVGElement('circle');
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
    switch (shape.type) {
      case 'rect':
        const newX = (shape.data.x || 0) + dx;
        const newY = (shape.data.y || 0) + dy;
        shape.element.setAttribute('x', String(newX));
        shape.element.setAttribute('y', String(newY));
        shape.data.x = newX;
        shape.data.y = newY;
        break;
      case 'circle':
        const newCx = (shape.data.x || 0) + dx;
        const newCy = (shape.data.y || 0) + dy;
        shape.element.setAttribute('cx', String(newCx));
        shape.element.setAttribute('cy', String(newCy));
        shape.data.x = newCx;
        shape.data.y = newCy;
        break;
      case 'triangle':
        const points = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        const newPoints = points.map(([x, y]) => `${x + dx},${y + dy}`).join(' ');
        shape.element.setAttribute('points', newPoints);
        shape.data.points = newPoints;
        break;
      case 'text':
        const newTextX = (shape.data.x || 0) + dx;
        const newTextY = (shape.data.y || 0) + dy;
        shape.element.setAttribute('x', String(newTextX));
        shape.element.setAttribute('y', String(newTextY));
        shape.data.x = newTextX;
        shape.data.y = newTextY;
        break;
      case 'line':
      case 'connector': {
        const newX1 = (shape.data.x1 || 0) + dx;
        const newY1 = (shape.data.y1 || 0) + dy;
        const newX2 = (shape.data.x2 || 0) + dx;
        const newY2 = (shape.data.y2 || 0) + dy;
        shape.element.setAttribute('x1', String(newX1));
        shape.element.setAttribute('y1', String(newY1));
        shape.element.setAttribute('x2', String(newX2));
        shape.element.setAttribute('y2', String(newY2));
        shape.data.x1 = newX1;
        shape.data.y1 = newY1;
        shape.data.x2 = newX2;
        shape.data.y2 = newY2;
        break;
      }
      case 'polyline': {
        const polyPoints = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        const shiftedPoints = polyPoints.map(([px, py]) => `${px + dx},${py + dy}`).join(' ');
        shape.element.setAttribute('points', shiftedPoints);
        shape.data.points = shiftedPoints;
        break;
      }
    }

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
    shape.element.textContent = safeText;
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

  // 更新图形大小
  const updateShapeSize = useCallback((shape: SVGShape, handle: string, dx: number, dy: number) => {
    switch (shape.type) {
      case 'rect':
        let newX = shape.data.x || 0;
        let newY = shape.data.y || 0;
        let newWidth = shape.data.width || 0;
        let newHeight = shape.data.height || 0;

        switch (handle) {
          case 'se':
            newWidth = Math.max(20, newWidth + dx);
            newHeight = Math.max(20, newHeight + dy);
            break;
          case 'sw':
            newX = Math.min(newX + newWidth - 20, newX + dx);
            newWidth = Math.max(20, newWidth - dx);
            newHeight = Math.max(20, newHeight + dy);
            break;
          case 'ne':
            newY = Math.min(newY + newHeight - 20, newY + dy);
            newWidth = Math.max(20, newWidth + dx);
            newHeight = Math.max(20, newHeight - dy);
            break;
          case 'nw':
            newX = Math.min(newX + newWidth - 20, newX + dx);
            newY = Math.min(newY + newHeight - 20, newY + dy);
            newWidth = Math.max(20, newWidth - dx);
            newHeight = Math.max(20, newHeight - dy);
            break;
          case 'n':
            newY = Math.min(newY + newHeight - 20, newY + dy);
            newHeight = Math.max(20, newHeight - dy);
            break;
          case 's':
            newHeight = Math.max(20, newHeight + dy);
            break;
          case 'e':
            newWidth = Math.max(20, newWidth + dx);
            break;
          case 'w':
            newX = Math.min(newX + newWidth - 20, newX + dx);
            newWidth = Math.max(20, newWidth - dx);
            break;
        }

        shape.element.setAttribute('x', String(newX));
        shape.element.setAttribute('y', String(newY));
        shape.element.setAttribute('width', String(newWidth));
        shape.element.setAttribute('height', String(newHeight));
        
        shape.data.x = newX;
        shape.data.y = newY;
        shape.data.width = newWidth;
        shape.data.height = newHeight;
        break;

      case 'circle':
        const centerX = shape.data.x || 0;
        const centerY = shape.data.y || 0;
        const radius = shape.data.radius || 0;
        
        // 根据拖动方向调整半径
        const deltaX = handle.includes('e') ? dx : handle.includes('w') ? -dx : 0;
        const deltaY = handle.includes('s') ? dy : handle.includes('n') ? -dy : 0;
        const avgDelta = (deltaX + deltaY) / 2;
        const newRadius = Math.max(10, radius + avgDelta);
        
        shape.element.setAttribute('r', String(newRadius));
        shape.data.radius = newRadius;
        break;
      case 'triangle': {
        const pts = shape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        if (pts.length === 0) break;
        const xs = pts.map(([px]) => px);
        const ys = pts.map(([, py]) => py);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const width = maxX - minX || 1;
        const height = maxY - minY || 1;

        const anchor = {
          x: handle.includes('w') ? maxX : minX,
          y: handle.includes('n') ? maxY : minY,
        };

        const widthDelta = handle.includes('e') ? dx : -dx;
        const heightDelta = handle.includes('s') ? dy : -dy;
        const newWidth = Math.max(20, width + widthDelta);
        const newHeight = Math.max(20, height + heightDelta);
        const scaleX = newWidth / width;
        const scaleY = newHeight / height;

        const scaled = pts.map(([px, py]) => {
          const nx = anchor.x + (px - anchor.x) * scaleX;
          const ny = anchor.y + (py - anchor.y) * scaleY;
          return [nx, ny] as [number, number];
        });
        const newPointsStr = scaled.map(([px, py]) => `${px},${py}`).join(' ');
        shape.element.setAttribute('points', newPointsStr);
        shape.data.points = newPointsStr;
        break;
      }
    }
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

    setShapes(restoredShapes);
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
    setShapes(updatedShapes);

    if (!options?.skipHistory) {
      saveToHistory(updatedShapes, selectedIds);
    }
  }, [saveToHistory, selectedIds, selectedShape, shapes]);

  // 添加矩形
  const addRectangle = useCallback(() => {
    if (!svgRef.current) return;

    const rect = createSVGElement('rect');
    if (!rect) return;

    const id = generateId();
    const x = 100 + Math.random() * 100;
    const y = 100 + Math.random() * 100;
    
    rect.setAttribute('id', id);
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '60');
    rect.setAttribute('fill', '#3b82f6');
    rect.setAttribute('stroke', '#1e40af');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '5');
    rect.setAttribute('ry', '5');
    rect.setAttribute('cursor', 'move');

    const newShape: SVGShape = {
      id,
      type: 'rect',
      element: rect,
      data: {
        x,
        y,
        width: 100,
        height: 60,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [null, null],
    };

    svgRef.current.appendChild(rect);
    setShapes(prev => {
      const updated = [...prev, newShape];
      saveToHistory(updated, id);
      return updated;
    });
    setSelectedShape(id);
    onShapeSelect?.(rect);
  }, [createSVGElement, generateId, onShapeSelect, saveToHistory]);

  // 添加圆形
  const addCircle = useCallback(() => {
    if (!svgRef.current) return;

    const circle = createSVGElement('circle');
    if (!circle) return;

    const id = generateId();
    const cx = 200 + Math.random() * 100;
    const cy = 150 + Math.random() * 100;
    
    circle.setAttribute('id', id);
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', '40');
    circle.setAttribute('fill', '#10b981');
    circle.setAttribute('stroke', '#059669');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('cursor', 'move');

    const newShape: SVGShape = {
      id,
      type: 'circle',
      element: circle,
      data: {
        x: cx,
        y: cy,
        radius: 40,
        fill: '#10b981',
        stroke: '#059669',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [null, null],
    };

    svgRef.current.appendChild(circle);
    setShapes(prev => {
      const updated = [...prev, newShape];
      saveToHistory(updated, id);
      return updated;
    });
    setSelectedShape(id);
    onShapeSelect?.(circle);
  }, [createSVGElement, generateId, onShapeSelect, saveToHistory]);

  // 添加三角形
  const addTriangle = useCallback(() => {
    if (!svgRef.current) return;

    const polygon = createSVGElement('polygon');
    if (!polygon) return;

    const id = generateId();
    const x = 200 + Math.random() * 100;
    const y = 100 + Math.random() * 100;
    const size = 50;
    const points = `${x},${y} ${x + size},${y + size * 0.866} ${x - size},${y + size * 0.866}`;
    
    polygon.setAttribute('id', id);
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', '#f59e0b');
    polygon.setAttribute('stroke', '#d97706');
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('cursor', 'move');

    const newShape: SVGShape = {
      id,
      type: 'triangle',
      element: polygon,
      data: {
        x,
        y,
        points,
        fill: '#f59e0b',
        stroke: '#d97706',
        strokeWidth: 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [null, null],
    };

    svgRef.current.appendChild(polygon);
    setShapes(prev => {
      const updated = [...prev, newShape];
      saveToHistory(updated, id);
      return updated;
    });
    setSelectedShape(id);
    onShapeSelect?.(polygon);
  }, [createSVGElement, generateId, onShapeSelect, saveToHistory]);

  // 添加直线
  const addLine = useCallback(() => {
    if (!svgRef.current) return;

    const line = createSVGElement('line');
    if (!line) return;

    const id = generateId();
    const x1 = 50 + Math.random() * 100;
    const y1 = 200 + Math.random() * 100;
    const x2 = x1 + 200;
    const y2 = y1;
    
    line.setAttribute('id', id);
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', '#ef4444');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('cursor', 'move');

    const newShape: SVGShape = {
      id,
      type: 'line',
      element: line,
      data: {
        x1,
        y1,
        x2,
        y2,
        fill: 'none',
        stroke: '#ef4444',
        strokeWidth: 3,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [null, null],
    };

    svgRef.current.appendChild(line);
    setShapes(prev => {
      const updated = [...prev, newShape];
      saveToHistory(updated, id);
      return updated;
    });
    setSelectedShape(id);
    onShapeSelect?.(line);
  }, [createSVGElement, generateId, onShapeSelect, saveToHistory]);

  // 添加折线
  const addPolyline = useCallback(() => {
    if (!svgRef.current) return;

    const polyline = createSVGElement('polyline');
    if (!polyline) return;

    const id = generateId();
    const points = [
      [50 + Math.random() * 100, 200 + Math.random() * 100],
      [150 + Math.random() * 100, 180 + Math.random() * 100],
      [250 + Math.random() * 100, 220 + Math.random() * 100],
      [350 + Math.random() * 100, 200 + Math.random() * 100],
    ].map(([x, y]) => `${x},${y}`).join(' ');
    
    polyline.setAttribute('id', id);
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#8b5cf6');
    polyline.setAttribute('stroke-width', '3');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    polyline.setAttribute('cursor', 'move');

    const newShape: SVGShape = {
      id,
      type: 'polyline',
      element: polyline,
      data: {
        points,
        fill: 'none',
        stroke: '#8b5cf6',
        strokeWidth: 3,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [null, null],
    };

    svgRef.current.appendChild(polyline);
    setShapes(prev => {
      const updated = [...prev, newShape];
      saveToHistory(updated, id);
      return updated;
    });
    setSelectedShape(id);
    onShapeSelect?.(polyline);
  }, [createSVGElement, generateId, onShapeSelect, saveToHistory]);

  // 添加文字
  const addText = useCallback(() => {
    if (!svgRef.current) return;

    const text = createSVGElement('text');
    if (!text) return;

    const id = generateId();
    const x = 100 + Math.random() * 100;
    const y = 250 + Math.random() * 50;
    
    text.setAttribute('id', id);
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('font-size', '20');
    text.setAttribute('fill', '#1f2937');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('cursor', 'move');

    text.textContent = '点击编辑文字';

    const newShape: SVGShape = {
      id,
      type: 'text',
      element: text,
      data: {
        x,
        y,
        text: text.textContent || '点击编辑文字',
        fill: '#1f2937',
        stroke: 'none',
        strokeWidth: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      connections: [],
    };

    svgRef.current.appendChild(text);
    setShapes(prev => {
      const updated = [...prev, newShape];
      saveToHistory(updated, id);
      return updated;
    });
    setSelectedShape(id);
    onShapeSelect?.(text);
  }, [createSVGElement, generateId, onShapeSelect, saveToHistory]);

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
    setShapes(finalShapes);
    
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

        setShapes(nextShapes);
      }
      
      setDragStart({ x, y });
    } else if (isResizing && selectedShape && resizeHandle) {
      // 调整大小
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      const shape = shapes.find(s => s.id === selectedShape);
      if (shape) {
        updateShapeSize(shape, resizeHandle, dx, dy);
        refreshResizeHandles(shape);
        const nextShapes = shapes.map(s => s.id === shape.id ? { ...shape, data: { ...shape.data }, connections: shape.connections ? [...shape.connections] : undefined, element: shape.element } : s);
        shape.connections?.forEach(connId => {
          const connLine = nextShapes.find(s => s.id === connId);
          if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
            updateConnectionLine(connLine, shape.id, nextShapes);
          }
        });
        setShapes(nextShapes);
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
        setShapes(finalShapes);
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
    setDragStart({ x: 0, y: 0 });
  }, [connectShapes, connectionStart, connectionStartPort, getShapeBounds, isConnecting, isDragging, isResizing, isSelectingBox, onShapeSelect, saveToHistory, selectionRect, setSelectedShape, setSelectedShapes, shapes, tempLine]);

  // 图形鼠标按下事件处理
  const handleShapeMouseDown = useCallback((e: React.MouseEvent, shape: SVGShape) => {
    e.stopPropagation();
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
      const alreadySelected = selectedIds.has(shape.id);
      if (!alreadySelected) {
        setSelectedShape(shape.id);
      }
      onShapeSelect?.(shape.element);
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
    if (!selectedShape || !svgRef.current) return;

    let updatedShapes = [...shapes];
    const targetShape = updatedShapes.find(shape => shape.id === selectedShape);
    if (!targetShape) return;

    const connectorIds = new Set<string>();

    // 选中的是连接线
    if (targetShape.type === 'connector') {
      connectorIds.add(targetShape.id);
    } else {
      // 移除与该图形相关的所有连接线
      updatedShapes.forEach(shape => {
        if (shape.type === 'connector' && shape.connections?.includes(selectedShape)) {
          connectorIds.add(shape.id);
        }
      });
      targetShape.connections?.forEach(id => connectorIds.add(id));
    }

    const idsToRemove = new Set<string>([selectedShape, ...Array.from(connectorIds)]);

    updatedShapes = updatedShapes
      .filter(shape => !idsToRemove.has(shape.id))
      .map(shape => ({
        ...shape,
        connections: shape.connections?.filter(connId => !idsToRemove.has(connId)),
      }));

    idsToRemove.forEach(id => {
      hidePorts(id);
      hideConnectorHandles(id);
      hideResizeHandles(id);
      const element = document.getElementById(id);
      if (element && svgRef.current?.contains(element)) {
        svgRef.current.removeChild(element);
      }
    });

    setShapes(updatedShapes);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory(updatedShapes, null);
  }, [hideConnectorHandles, hidePorts, onShapeSelect, saveToHistory, selectedShape, shapes]);

  const clearCanvas = useCallback(() => {
    if (!svgRef.current) return;

    hidePorts();
    hideConnectorHandles();
    hideResizeHandles();
    hideTextSelection();
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    setShapes([]);
    setSelectedShape(null);
    setHoveredShapeId(null);
    onShapeSelect?.(null);
    saveToHistory([], null);
  }, [hideConnectorHandles, hidePorts, onShapeSelect, saveToHistory]);

  const getSelectedShape = useCallback(() => {
    return selectedShape ? document.getElementById(selectedShape) : null;
  }, [selectedShape]);

  const duplicateSelected = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;
    const sourceShape = shapes.find(shape => shape.id === selectedShape);
    if (!sourceShape) return;

    const offset = 20;
    const newId = generateId();
    const clonedElement = sourceShape.element.cloneNode(true) as SVGElement;
    clonedElement.setAttribute('id', newId);

    const newData = { ...sourceShape.data };

    switch (sourceShape.type) {
      case 'rect':
        newData.x = (sourceShape.data.x || 0) + offset;
        newData.y = (sourceShape.data.y || 0) + offset;
        clonedElement.setAttribute('x', String(newData.x));
        clonedElement.setAttribute('y', String(newData.y));
        break;
      case 'circle':
        newData.x = (sourceShape.data.x || 0) + offset;
        newData.y = (sourceShape.data.y || 0) + offset;
        clonedElement.setAttribute('cx', String(newData.x));
        clonedElement.setAttribute('cy', String(newData.y));
        break;
      case 'triangle':
        const srcPoints = sourceShape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        const shiftedPoints = srcPoints.map(([x, y]) => `${x + offset},${y + offset}`).join(' ');
        newData.points = shiftedPoints;
        clonedElement.setAttribute('points', shiftedPoints);
        break;
      case 'text':
        newData.x = (sourceShape.data.x || 0) + offset;
        newData.y = (sourceShape.data.y || 0) + offset;
        clonedElement.setAttribute('x', String(newData.x));
        clonedElement.setAttribute('y', String(newData.y));
        break;
      case 'line':
      case 'connector':
        newData.x1 = (sourceShape.data.x1 || 0) + offset;
        newData.y1 = (sourceShape.data.y1 || 0) + offset;
        newData.x2 = (sourceShape.data.x2 || 0) + offset;
        newData.y2 = (sourceShape.data.y2 || 0) + offset;
        clonedElement.setAttribute('x1', String(newData.x1));
        clonedElement.setAttribute('y1', String(newData.y1));
        clonedElement.setAttribute('x2', String(newData.x2));
        clonedElement.setAttribute('y2', String(newData.y2));
        break;
      case 'polyline':
        const polyPoints = sourceShape.data.points?.split(' ').map(p => p.split(',').map(Number)) || [];
        const newPolyPoints = polyPoints.map(([x, y]) => `${x + offset},${y + offset}`).join(' ');
        newData.points = newPolyPoints;
        clonedElement.setAttribute('points', newPolyPoints);
        break;
    }

    const duplicatedShape: SVGShape = {
      ...sourceShape,
      id: newId,
      element: clonedElement,
      data: newData,
      connections: [],
    };

    applyTransform(duplicatedShape);
    svgRef.current.appendChild(clonedElement);

    setShapes(prev => {
      const updated = [...prev, duplicatedShape];
      saveToHistory(updated, newId);
      return updated;
    });
    setSelectedShape(newId);
    onShapeSelect?.(clonedElement);
  }, [applyTransform, generateId, onShapeSelect, saveToHistory, selectedShape, shapes]);

  const bringToFront = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;
    const target = shapes.find(shape => shape.id === selectedShape);
    if (!target) return;

    svgRef.current.appendChild(target.element);
    const reordered = [...shapes.filter(shape => shape.id !== selectedShape), target];
    setShapes(reordered);
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
    setShapes(reordered);
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
    updateSelectedShape(shape => {
      shape.data.fill = color;
      if (shape.type === 'line' || shape.type === 'polyline' || shape.type === 'connector') {
        shape.element.setAttribute('fill', 'none');
      } else {
        shape.element.setAttribute('fill', color);
      }
    });
  }, [updateSelectedShape]);

  const changeSelectedStroke = useCallback((color: string) => {
    updateSelectedShape(shape => {
      shape.data.stroke = color;
      shape.element.setAttribute('stroke', color);
    });
  }, [updateSelectedShape]);

  const changeSelectedStrokeWidth = useCallback((width: number) => {
    updateSelectedShape(shape => {
      shape.data.strokeWidth = width;
      shape.element.setAttribute('stroke-width', String(width));
    });
  }, [updateSelectedShape]);

  const changeSelectedOpacity = useCallback((opacity: number) => {
    const safeOpacity = Math.min(1, Math.max(0, opacity));
    updateSelectedShape(shape => {
      shape.data.opacity = safeOpacity;
      shape.element.setAttribute('opacity', String(safeOpacity));
    });
  }, [updateSelectedShape]);

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
      const bounds = shape.element.getBoundingClientRect();
      const svgBounds = svgRef.current!.getBoundingClientRect();
      
      const relativeLeft = bounds.left - svgBounds.left;
      const relativeTop = bounds.top - svgBounds.top;
      const relativeRight = bounds.right - svgBounds.left;
      const relativeBottom = bounds.bottom - svgBounds.top;

      switch (shape.type) {
        case 'rect':
          minX = Math.min(minX, shape.data.x || 0);
          minY = Math.min(minY, shape.data.y || 0);
          maxX = Math.max(maxX, (shape.data.x || 0) + (shape.data.width || 0));
          maxY = Math.max(maxY, (shape.data.y || 0) + (shape.data.height || 0));
          break;
        case 'circle':
          const radius = shape.data.radius || 0;
          minX = Math.min(minX, (shape.data.x || 0) - radius);
          minY = Math.min(minY, (shape.data.y || 0) - radius);
          maxX = Math.max(maxX, (shape.data.x || 0) + radius);
          maxY = Math.max(maxY, (shape.data.y || 0) + radius);
          break;
        case 'text':
          minX = Math.min(minX, shape.data.x || 0);
          minY = Math.min(minY, (shape.data.y || 0) - 20);
          maxX = Math.max(maxX, (shape.data.x || 0) + 100);
          maxY = Math.max(maxY, (shape.data.y || 0) + 20);
          break;
      }
    });

    // 如果有内容且超出边界，通知父组件
    if (hasContent && (minX < 0 || minY < 0 || maxX > width || maxY > height)) {
      const padding = 50;
      const newWidth = Math.max(width, maxX + padding);
      const newHeight = Math.max(height, maxY + padding);
      
      // 这里可以触发回调来通知父组件调整画布大小
      console.log('Canvas needs resizing to:', { newWidth, newHeight });
    }
  }, [shapes, width, height, autoResize]);

  // 更新选中状态样式
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    shapes.forEach(shape => {
      const isSelected = selectedIds.has(shape.id);
      
      if (isSelected) {
        if (shape.type !== 'text') {
          shape.element.setAttribute('stroke', '#dc2626');
          shape.element.setAttribute('stroke-width', '3');
          shape.element.setAttribute('stroke-dasharray', '5,5');
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

      const handleMouseDown = (e: MouseEvent) => handleShapeMouseDown(e as React.MouseEvent, shape);
      const handleDblClick = (e: MouseEvent) => {
        if (shape.type === 'text') {
          e.stopPropagation();
          const current = (shape.element as SVGTextElement).textContent || '';
          const next = window.prompt('编辑文字', current);
          if (next !== null) {
            updateTextContent(shape, next);
          }
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
          } else {
            hideResizeHandles(shape.id);
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
        } else {
          hideResizeHandles(shape.id);
        }
      }
    });

    return () => {
      cleanups.forEach(clean => clean());
    };
  }, [draggingHandle, handleShapeMouseDown, hideConnectorHandles, hidePorts, hideResizeHandles, isConnecting, selectedIds, shapes, showConnectorHandles, showPorts, showResizeHandles, showTextSelection, hideTextSelection, updateTextContent]);

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
      } else if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
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
  }, [deleteSelected, duplicateSelected, isConnecting, redo, tempLine, undo]);

  // 创建方法对象
  const methods: CanvasComponentRef = {
    addRectangle,
    addCircle,
    addTriangle,
    addLine,
    addPolyline,
    addText,
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
  };

  useEffect(() => {
    methodsRef.current = methods;
  }, [methods]);

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
      {isConnecting && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
          连接模式 - 点击目标图形完成连接
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
