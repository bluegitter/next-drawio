"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EnhancedToolbar, ToolType } from '@/components/EnhancedToolbar';
import InteractiveCanvasComponent, { CanvasComponentRef } from '@/components/InteractiveCanvasComponent';
import PropertyPanel from '@/components/PropertyPanel';
import { SHAPE_ICONS, CHECK_ICON, GENERAL_SHAPE_LIBRARY } from '@/constants/svgIcons';
import { sidebarIcons, getIconUrl, primaryEquipmentIcons } from '@/constants/iconList';
import {
  PanelsLeftRight,
  LayoutTemplate,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Trash2,
  MousePointerSquareDashed,
  Clipboard,
  ClipboardPaste,
  PencilLine,
  Paintbrush,
  ArrowRight,
  Goal,
  Plus,
  Copy,
  Table2,
  Shrink,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import './globals.css';

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 700;
const PAGE_MARGIN = 200;
const GRID_BG = 'data:image/svg+xml;base64,PHN2ZyBzdHlsZT0iY29sb3Itc2NoZW1lOiBsaWdodCBkYXJrOyIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMCAxMCBMIDQwIDEwIE0gMTAgMCBMIDEwIDQwIE0gMCAyMCBMIDQwIDIwIE0gMjAgMCBMIDIwIDQwIE0gMCAzMCBMIDQwIDMwIE0gMzAgMCBMIDMwIDQwIiBmaWxsPSJub25lIiBzdHlsZT0ic3Ryb2tlOmxpZ2h0LWRhcmsoI2QwZDBkMCwgIzQyNDI0Mik7IiBzdHJva2U9IiNkMGQwZDAiIG9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0eWxlPSJzdHJva2U6bGlnaHQtZGFyaygjZDBkMGQwLCAjNDI0MjQyKTsiIHN0cm9rZT0iI2QwZDBkMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+';

export default function Home() {
  const [canvasWidth, setCanvasWidth] = useState<number>(PAGE_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState<number>(PAGE_HEIGHT);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedShape, setSelectedShape] = useState<SVGElement | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;
  const zoomOptions = [50, 75, 90, 100, 110, 125, 150, 200, 300];
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [zoomInput, setZoomInput] = useState('100');
  const zoomDropdownRef = useRef<HTMLDivElement | null>(null);
  const [canPaste, setCanPaste] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; open: boolean }>({ x: 0, y: 0, open: false });
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [pageCountX, setPageCountX] = useState(1);
  const [pageCountY, setPageCountY] = useState(1);
  const canvasRef = useRef<CanvasComponentRef | null>(null);
  const canvasMethodsRef = useRef<CanvasComponentRef | null>(null);

  const refreshHistoryState = useCallback(() => {
    if (!canvasMethodsRef.current) return;
    const nextUndo = canvasMethodsRef.current.canUndo();
    const nextRedo = canvasMethodsRef.current.canRedo();
    requestAnimationFrame(() => {
      setCanUndo(nextUndo);
      setCanRedo(nextRedo);
    });
  }, []);

  const handleCanvasReady = useCallback((canvas: SVGSVGElement, methods: CanvasComponentRef) => {
    console.log('Advanced Canvas initialized:', canvas);
    canvasMethodsRef.current = methods;
    canvasRef.current = methods;
    refreshHistoryState();
    setZoom(methods.getZoom ? methods.getZoom() : 1);
    setCanPaste(methods.hasClipboard ? methods.hasClipboard() : false);
    setSelectionCount(methods.getSelectionCount ? methods.getSelectionCount() : 0);
  }, [refreshHistoryState, setZoom]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasMethodsRef.current = canvasRef.current;
    }
  });

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (!zoomDropdownRef.current) return;
      if (!zoomDropdownRef.current.contains(e.target as Node)) {
        setZoomDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  useEffect(() => {
    setZoomInput(String(Math.round(zoom * 100)));
  }, [zoom]);

  useEffect(() => {
    setCanvasWidth(PAGE_WIDTH * pageCountX);
    setCanvasHeight(PAGE_HEIGHT * pageCountY);
  }, [pageCountX, pageCountY]);

  useEffect(() => {
    if (!contextMenu.open || !contextMenuRef.current) return;
    const rect = contextMenuRef.current.getBoundingClientRect();
    const padding = 8;
    const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
    const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
    const nextX = Math.min(contextMenu.x, maxX);
    const nextY = Math.min(contextMenu.y, maxY);
    if (nextX !== contextMenu.x || nextY !== contextMenu.y) {
      setContextMenu(prev => ({ ...prev, x: nextX, y: nextY }));
    }
  }, [contextMenu]);

  const handleCanvasError = useCallback((error: Error) => {
    console.error('Canvas initialization failed:', error);
  }, []);

  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool);
    setIsConnecting(tool === 'connect');
    
    if (canvasMethodsRef.current) {
      switch (tool) {
        case 'rectangle':
          canvasMethodsRef.current.addRectangle();
          break;
        case 'roundedRect':
          canvasMethodsRef.current.addRoundedRect();
          break;
        case 'circle':
          canvasMethodsRef.current.addCircle();
          break;
        case 'triangle':
          canvasMethodsRef.current.addTriangle();
          break;
        case 'line':
          canvasMethodsRef.current.addLine();
          break;
        case 'polyline':
          canvasMethodsRef.current.addPolyline();
          break;
        case 'text':
          canvasMethodsRef.current.addText();
          break;
        case 'delete':
          canvasMethodsRef.current.deleteSelected();
          break;
        case 'clear':
          if (window.confirm('确定要清空画布吗？此操作可能可以通过撤销恢复。')) {
            canvasMethodsRef.current.clearCanvas();
          }
          break;
        case 'connect':
          break;
      }
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleExport = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.exportCanvas(format);
    }
  }, []);

  const handleShapeSelect = useCallback((shape: SVGElement | null) => {
    setSelectedShape(shape);
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    } else {
      setSelectionCount(shape ? 1 : 0);
    }
  }, []);

  const handleCanvasChange = useCallback(() => {
    refreshHistoryState();
  }, [refreshHistoryState]);

  // 属性面板处理函数
  const handleFillChange = useCallback((color: string) => {
    console.log('[PropertyPanel] fill change', { color, hasCanvas: !!canvasMethodsRef.current });
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedFill(color);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleStrokeChange = useCallback((color: string) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedStroke(color);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedStrokeWidth(width);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleRotationChange = useCallback((rotation: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.rotateSelected(rotation);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleScaleChange = useCallback((scale: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.scaleSelected(scale);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleOpacityChange = useCallback((opacity: number) => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.changeSelectedOpacity(opacity);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleArrowChange = useCallback((mode: 'none' | 'start' | 'end' | 'both') => {
    canvasMethodsRef.current?.changeSelectedArrow?.(mode);
  }, []);

  const handleDelete = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.deleteSelected();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleDuplicate = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.duplicateSelected();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleBringToFront = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.bringToFront();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleSendToBack = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.sendToBack();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleSelectAll = useCallback(() => {
    canvasMethodsRef.current?.selectAll?.();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
    setSelectedShape(canvasMethodsRef.current?.getSelectedShape?.() || null);
  }, []);

  const handleClearSelection = useCallback(() => {
    canvasMethodsRef.current?.clearSelection?.();
    setSelectionCount(0);
    setSelectedShape(null);
  }, []);

  const handleRotateLeft = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.rotateSelectedBy(-90);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleRotateRight = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.rotateSelectedBy(90);
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleFlipHorizontal = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.flipSelectedHorizontal();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleFlipVertical = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.flipSelectedVertical();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleUndo = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.undo();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const handleRedo = useCallback(() => {
    if (canvasMethodsRef.current) {
      canvasMethodsRef.current.redo();
      refreshHistoryState();
    }
  }, [refreshHistoryState]);

  const clientToCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const svg = canvasMethodsRef.current?.getCanvas?.();
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((clientX - rect.left) * canvasWidth) / rect.width,
      y: ((clientY - rect.top) * canvasHeight) / rect.height,
    };
  }, [canvasHeight, canvasWidth]);

  const handleCopy = useCallback(() => {
    if (!canvasMethodsRef.current?.copySelection) return;
    const count = canvasMethodsRef.current.copySelection();
    const nextCanPaste = canvasMethodsRef.current.hasClipboard?.() ?? count > 0;
    setCanPaste(nextCanPaste);
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, []);

  const handlePaste = useCallback(() => {
    if (!canvasMethodsRef.current?.pasteClipboard) return;
    const count = canvasMethodsRef.current.pasteClipboard();
    const nextCanPaste = (canvasMethodsRef.current.hasClipboard?.() ?? (count > 0)) || canPaste;
    setCanPaste(nextCanPaste);
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [canPaste, refreshHistoryState]);

  const handleClipboardChange = useCallback((hasClipboard: boolean) => {
    setCanPaste(hasClipboard);
  }, []);

  const handleCut = useCallback(() => {
    handleCopy();
    handleDelete();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [handleCopy, handleDelete]);

  const handleMoveForward = useCallback(() => {
    canvasMethodsRef.current?.moveForward?.();
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [refreshHistoryState]);

  const handleMoveBackward = useCallback(() => {
    canvasMethodsRef.current?.moveBackward?.();
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [refreshHistoryState]);

  const handleUngroup = useCallback(() => {
    canvasMethodsRef.current?.ungroupSelected?.();
    refreshHistoryState();
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    }
  }, [refreshHistoryState]);

  const handleZoomIn = useCallback(() => {
    if (canvasMethodsRef.current?.zoomIn) {
      const nextZoom = canvasMethodsRef.current.zoomIn();
      setZoom(nextZoom);
    }
    setZoomDropdownOpen(false);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (canvasMethodsRef.current?.zoomOut) {
      const nextZoom = canvasMethodsRef.current.zoomOut();
      setZoom(nextZoom);
    }
    setZoomDropdownOpen(false);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (canvasMethodsRef.current?.setZoom) {
      const nextZoom = canvasMethodsRef.current.setZoom(1);
      setZoom(nextZoom);
    } else {
      setZoom(1);
    }
    setZoomDropdownOpen(false);
  }, []);

  const handleSelectZoomPercent = useCallback((percent: number) => {
    const target = percent / 100;
    if (canvasMethodsRef.current?.setZoom) {
      const nextZoom = canvasMethodsRef.current.setZoom(target);
      setZoom(nextZoom);
    } else {
      setZoom(target);
    }
    setZoomDropdownOpen(false);
  }, []);

  const handleApplyCustomZoom = useCallback(() => {
    const parsed = parseFloat(zoomInput);
    if (Number.isNaN(parsed)) return;
    const clampedPercent = Math.min(MAX_ZOOM * 100, Math.max(MIN_ZOOM * 100, parsed));
    const target = clampedPercent / 100;
    if (canvasMethodsRef.current?.setZoom) {
      const nextZoom = canvasMethodsRef.current.setZoom(target);
      setZoom(nextZoom);
      setZoomInput(String(Math.round(nextZoom * 100)));
    } else {
      setZoom(target);
      setZoomInput(String(Math.round(target * 100)));
    }
    setZoomDropdownOpen(false);
  }, [MAX_ZOOM, MIN_ZOOM, zoomInput]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, open: false }));
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasMethodsRef.current) return;
    const point = clientToCanvasPoint(e.clientX, e.clientY);
    if (!point) return;
    const { x, y } = point;
    const shapeType = e.dataTransfer.getData('application/x-draw-shape');
    const iconUrl = e.dataTransfer.getData('application/x-draw-icon');
    const iconName = e.dataTransfer.getData('application/x-draw-icon-name');

    if (shapeType) {
      const typeMap: Record<string, string> = {
        rectangle: 'rect',
        roundedRect: 'roundedRect',
        circle: 'circle',
        ellipse: 'ellipse',
        triangle: 'triangle',
        diamond: 'diamond',
        trapezoid: 'trapezoid',
        hexagon: 'hexagon',
        pentagon: 'pentagon',
        speech: 'speech',
        wave: 'wave',
        cloud: 'cloud',
        cylinder: 'cylinder',
        line: 'line',
        polyline: 'polyline',
        text: 'text',
        connect: 'connector',
      };
      const mappedType = typeMap[shapeType] || shapeType;
      canvasMethodsRef.current.addShapeAt(mappedType, { x, y });
    } else if (iconUrl) {
      canvasMethodsRef.current.addSvgIcon(iconUrl, { width: 80, height: 60, position: { x, y }, iconName: iconName || undefined });
    }
  }, [clientToCanvasPoint]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleBoundsChange = useCallback((bounds: { minX: number; minY: number; maxX: number; maxY: number }) => {
    const nextPageCountX = Math.max(1, Math.ceil((bounds.maxX + PAGE_MARGIN) / PAGE_WIDTH));
    const nextPageCountY = Math.max(1, Math.ceil((bounds.maxY + PAGE_MARGIN) / PAGE_HEIGHT));
    setPageCountX(prev => (prev === nextPageCountX ? prev : nextPageCountX));
    setPageCountY(prev => (prev === nextPageCountY ? prev : nextPageCountY));
  }, []);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, open: true });
  }, []);

  const selectionCountFromCanvas = canvasMethodsRef.current?.getSelectionCount?.() ?? selectionCount;
  const hasSelection = selectionCountFromCanvas > 0 || !!selectedShape;
  const multiSelected = selectionCountFromCanvas > 1;
  const clipboardReady = canvasMethodsRef.current?.hasClipboard?.() ?? canPaste;

  const menuData = React.useMemo(() => [
    {
      key: '文件',
      items: [
        { label: '新建...' },
        { label: '从...打开', children: [{ label: '本地文件' }, { label: 'URL' }] },
        { label: '打开最近使用的文件', children: [{ label: '最近文件1' }, { label: '最近文件2' }] },
        'divider',
        { label: '保存', shortcut: '⌘+S' },
        { label: '另存为...', shortcut: '⌘+⇧+S' },
        'divider',
        { label: '共享...' },
        'divider',
        { label: '重命名...' },
        { label: '创建副本...' },
        'divider',
        { label: '从...导入', children: [{ label: 'SVG' }, { label: 'PNG' }] },
        { label: '导出为', children: [{ label: 'PNG' }, { label: 'SVG' }, { label: 'PDF' }] },
        'divider',
        { label: '嵌入', children: [{ label: 'HTML' }, { label: 'Iframe' }] },
        { label: '发布', children: [{ label: '链接' }, { label: '图像' }] },
        'divider',
        { label: '新增库', children: [{ label: '新建库' }, { label: '导入库' }] },
        { label: '从...打开库', children: [{ label: '本地库' }, { label: 'URL 库' }] },
        'divider',
        { label: '属性...' },
        'divider',
        { label: '页面设置...' },
        { label: '打印...', shortcut: '⌘+P' },
        'divider',
        { label: '关闭' },
      ],
    },
    {
      key: '编辑',
      items: [
        { label: '撤销', shortcut: '⌘+Z', action: handleUndo, disabled: !canUndo },
        { label: '重做', shortcut: '⌘+⇧+Z', action: handleRedo, disabled: !canRedo },
        'divider',
        { label: '剪切', shortcut: '⌘+X', action: handleCut, disabled: !hasSelection },
        { label: '复制', shortcut: '⌘+C', action: handleCopy, disabled: !hasSelection },
        { label: '复制为图像', shortcut: '⌘+⌥+X' },
        { label: '复制为 SVG', shortcut: '⌘+⌥+⇧+X' },
        { label: '粘贴', shortcut: '⌘+V', action: handlePaste, disabled: !clipboardReady },
        { label: '删除', action: handleDelete, disabled: !hasSelection },
        { label: '创建副本', shortcut: '⌘+D', action: handleDuplicate, disabled: !hasSelection },
        'divider',
        { label: '查找/替换', shortcut: '⌘+F' },
        { label: '编辑数据...', shortcut: '⌘+M' },
        'divider',
        { label: '选择顶点', shortcut: '⌘+⇧+I' },
        { label: '选择边线', shortcut: '⌘+⇧+E' },
        { label: '全选', shortcut: '⌘+A', action: handleSelectAll },
        { label: '全不选', shortcut: '⌘+⇧+A', action: handleClearSelection },
      ],
    },
    {
      key: '查看',
      items: [
        { label: '格式', shortcut: '⌘+⇧+P', checked: true },
        { label: '缩略图', shortcut: '⌘+⇧+O' },
        { label: '图层', shortcut: '⌘+⇧+L' },
        { label: '标签', shortcut: '⌘+K' },
        'divider',
        { label: '搜索图形' },
        { label: '便笺本', checked: true },
        { label: '形状', checked: true, shortcut: '⌘+⇧+K' },
        'divider',
        { label: '页面视图', checked: true },
        { label: '页面标签', checked: true },
        { label: '标尺' },
        'divider',
        { label: '提示', checked: true },
        { label: '动画', checked: true },
        'divider',
        { label: '网格', shortcut: '⌘+⇧+G', checked: showGrid, action: () => setShowGrid(v => !v) },
        { label: '参考线', checked: true },
        { label: '连接箭头', shortcut: '⌥+⇧+A' },
        { label: '连接点', shortcut: '⌥+⇧+O' },
        'divider',
        { label: '重置视图', shortcut: 'Enter/Home' },
        { label: '放大', shortcut: '⌘ + / Alt+Mousewheel' },
        { label: '缩小', shortcut: '⌘ - / Alt+Mousewheel' },
        { label: '全屏' },
      ],
    },
    {
      key: '调整图形',
      items: [
        { label: '移至最前', shortcut: '⌘+⇧+F', disabled: true },
        { label: '移至最后', shortcut: '⌘+⇧+B', disabled: true },
        { label: '上移一层', shortcut: '⌘+Alt+Shift+F', disabled: true },
        { label: '下移一层', shortcut: '⌘+Alt+Shift+B', disabled: true },
        'divider',
        { label: '方向', children: [{ label: '水平' }, { label: '垂直' }], disabled: true },
        { label: '旋转90°/翻转', shortcut: '⌘+R', disabled: true },
        { label: '对齐', children: [{ label: '左对齐' }, { label: '居中' }], disabled: true },
        { label: '等距分布', disabled: true },
        'divider',
        { label: '导航' },
        { label: '插入', children: [{ label: '连接' }, { label: '图形' }] },
        { label: '布局', children: [{ label: '自动布局' }, { label: '层次布局' }] },
        'divider',
        { label: '组合', shortcut: '⌘+G', action: () => { canvasMethodsRef.current?.combineSelected(); refreshHistoryState(); }, disabled: !multiSelected },
        { label: '取消组合', shortcut: '⌘+⇧+U', action: handleUngroup, disabled: !hasSelection },
        { label: '移出组合', disabled: true },
        'divider',
        { label: '清除航点', shortcut: '⌥+⇧+R', disabled: true },
        { label: '自动调整', shortcut: '⌥+⇧+Y', disabled: true },
      ],
    },
    {
      key: '其它',
      items: [
        { label: '语言', children: [{ label: '中文' }, { label: 'English' }] },
        { label: '外观', children: [{ label: '浅色' }, { label: '深色' }] },
        { label: '主题', children: [{ label: '默认' }, { label: '灰色' }] },
        'divider',
        { label: '自适应颜色' },
        { label: '数学排版' },
        'divider',
        { label: '显示开始画面', checked: true },
        { label: '自动保存', disabled: true },
        'divider',
        { label: '连接时复制' },
        { label: '折叠/展开', checked: true },
        { label: '绘图语言', children: [{ label: '左右' }, { label: '上下' }] },
        { label: '编辑绘图...' },
        { label: '插件...' },
        { label: '配置...' },
      ],
    },
    {
      key: '帮助',
      items: [
        { label: '快捷键...' },
        { label: '快速入门视频...' },
        { label: '获取桌面版...' },
        { label: '支持...' },
        'divider',
        { label: 'v29.2.3', disabled: true },
      ],
    },
    ], [clipboardReady, canRedo, canUndo, handleArrowChange, handleBringToFront, handleClearSelection, handleCopy, handleCut, handleDelete, handleDuplicate, handleMoveBackward, handleMoveForward, handlePaste, handleRedo, handleSelectAll, handleSendToBack, handleUndo, handleUngroup, hasSelection, multiSelected, showGrid]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    网络: true,
    一次设备: true,
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const renderMenu = (items: any[], isSub?: boolean) => (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg py-1"
      style={{ minWidth: 220, marginTop: isSub ? -24 : 0, marginLeft: isSub ? 200 : 0, fontFamily: 'Arial', fontSize: 14 }}
      onMouseLeave={() => isSub && setOpenSub(null)}
    >
      {items.map((item, idx) => {
        if (item === 'divider') {
          return <div key={idx} className="my-1 border-t border-gray-200" />;
        }
        const disabled = item.disabled;
        const hasChildren = !!item.children;
        return (
          <div
            key={item.label}
            className={`px-3 py-2 grid grid-cols-[20px_1fr_auto] items-center text-sm ${
              disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
            }`}
            onMouseEnter={() => hasChildren && setOpenSub(item.label)}
            onClick={() => {
              if (disabled || hasChildren) return;
              item.action?.();
              setOpenMenu(null);
              setOpenSub(null);
            }}
            style={{ fontFamily: 'Arial', fontSize: 14 }}
          >
            <div className="flex justify-center">
              {item.checked && <img src={CHECK_ICON} alt="checked" className="w-4 h-3" />}
            </div>
            <div className="flex items-center gap-1">
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              {item.shortcut && <span>{item.shortcut}</span>}
              {hasChildren && <span>▶</span>}
            </div>
            {hasChildren && openSub === item.label && renderMenu(item.children, true)}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[#f5f5f5] flex flex-col text-sm text-gray-700">
      {/* 顶部菜单栏 */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f7c266] rounded flex items-center justify-center text-white font-bold">IO</div>
          <span className="font-medium text-gray-800">未命名绘图</span>
          <div className="flex items-center gap-1 text-gray-600 relative">
            {menuData.map(menu => (
              <div key={menu.key} className="relative">
                <button
                  className={`px-3 py-2 rounded ${openMenu === menu.key ? 'bg-gray-200 text-gray-900' : 'hover:text-gray-800'}`}
                  onMouseEnter={() => { setOpenMenu(menu.key); setOpenSub(null); }}
                  onMouseLeave={() => { /* keep open until leave container */ }}
                  onClick={() => setOpenMenu(openMenu === menu.key ? null : menu.key)}
                >
                  {menu.key}
                </button>
                {openMenu === menu.key && (
                  <div
                    className="absolute left-0 top-full mt-1"
                    onMouseLeave={() => { setOpenMenu(null); setOpenSub(null); }}
                  >
                    {renderMenu(menu.items)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="ml-4 px-3 py-1 bg-[#fce7e7] text-[#c24141] border border-[#f2bebe] rounded text-xs">
            修改未保存，点击此处以保存。
          </div>
        </div>
        <div className="ml-auto">
          <Button size="sm" variant="ghost" className="border border-gray-300">🧑‍💻 共享</Button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="h-12 bg-[#f8f9fa] border-b border-gray-200 flex items-center px-4 gap-2 text-base">
        {[
          { icon: <PanelsLeftRight size={18} />, label: '折叠边栏' },
          { icon: <LayoutTemplate size={18} />, label: '页面标签' },
        ].map((item, idx) => (
          <button
            key={idx}
            className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
            title={item.label}
          >
            {item.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="relative" ref={zoomDropdownRef}>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
            onClick={() => setZoomDropdownOpen(prev => !prev)}
            title="点击选择或重置缩放"
          >
            <span className="font-medium">{`${Math.round(zoom * 100)}%`}</span>
            <ChevronDown size={14} />
          </div>
          {zoomDropdownOpen && (
            <div className="absolute z-50 mt-1 w-36 bg-white border border-gray-200 rounded shadow-md">
              <div className="max-h-56 overflow-auto py-1">
                {zoomOptions.map(percent => {
                  const active = Math.round(zoom * 100) === percent;
                  return (
                    <button
                      key={percent}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        active ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => handleSelectZoomPercent(percent)}
                    >
                      {percent}%
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 px-3 py-2">
                <div className="text-xs text-gray-500 mb-1">自定义</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={zoomInput}
                    onChange={(e) => setZoomInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCustomZoom(); }}
                    className="h-8 text-sm"
                    min={MIN_ZOOM * 100}
                    max={MAX_ZOOM * 100}
                  />
                  <span className="text-sm text-gray-500">%</span>
                  <Button size="sm" onClick={handleApplyCustomZoom}>确定</Button>
                </div>
                <button
                  className="mt-2 w-full text-left text-xs text-blue-600 hover:text-blue-700"
                  onClick={handleResetZoom}
                >
                  重置为 100%
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${zoom >= MAX_ZOOM ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
          title="放大"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
        >
          <ZoomIn size={18} />
        </button>
        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${zoom <= MIN_ZOOM ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
          title="缩小"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
        >
          <ZoomOut size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={handleUndo}
          disabled={!canUndo}
          title="撤销"
        >
          <Undo2 size={18} />
        </button>
        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${canRedo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={handleRedo}
          disabled={!canRedo}
          title="重做"
        >
          <Redo2 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* 旋转 / 翻转 */}
        <div className="flex items-center gap-1">
          <button
            className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
            title="左旋转 90°"
            onClick={handleRotateLeft}
          >
            <RotateCcw size={18} />
          </button>
          <button
            className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
            title="右旋转 90°"
            onClick={handleRotateRight}
          >
            <RotateCw size={18} />
          </button>
          <button
            className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
            title="水平翻转"
            onClick={handleFlipHorizontal}
          >
            <FlipHorizontal size={18} />
          </button>
          <button
            className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
            title="垂直翻转"
            onClick={handleFlipVertical}
          >
            <FlipVertical size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="删除"
          onClick={handleDelete}
          disabled={!hasSelection}
        >
          <Trash2 size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="框选">
          <MousePointerSquareDashed size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="粘贴样式">
          <Clipboard size={18} />
        </button>
        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="复制"
          onClick={handleCopy}
          disabled={!hasSelection}
        >
          <Copy size={18} />
        </button>
        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${clipboardReady ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="粘贴"
          onClick={handlePaste}
          disabled={!clipboardReady}
        >
          <ClipboardPaste size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="编辑">
          <PencilLine size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="填充">
          <Paintbrush size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="直连">
          <ArrowRight size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="折线路径">
          <Goal size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="添加">
          <Plus size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="表格">
          <Table2 size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="轨迹">
          <Shrink size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="效果">
          <Sparkles size={18} />
        </button>
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* 左侧形状库 */}
        <div className="w-[320px] min-w-[280px] bg-[#f1f3f5] border-r border-gray-200 flex flex-col h-full min-h-0">
          <div className="px-4 pt-4 flex-shrink-0">
            <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                placeholder="键入 / 进行搜索"
              />
              <Search size={18} className="text-gray-500" />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0 px-4 py-4 space-y-4">
            <div>
              <button
                className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
                onClick={() => toggleSection('general')}
              >
                {expandedSections.general ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>通用</span>
              </button>
              {expandedSections.general && (
                <>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'rectangle', label: '矩形' },
                      { key: 'roundedRect', label: '圆角矩形' },
                      { key: 'circle', label: '圆形' },
                      { key: 'triangle', label: '三角形' },
                      { key: 'line', label: '直线' },
                      { key: 'polyline', label: '折线' },
                      { key: 'text', label: '文本' },
                      { key: 'connect', label: '连接' },
                    ].map(item => (
                    <button
                      key={item.key}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-draw-shape', item.key);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleToolChange(item.key as ToolType)}
                      className="h-12 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition"
                      title={item.key}
                    >
                        <img src={SHAPE_ICONS[item.key]} alt={item.label} className="w-5 h-5 mb-1" />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">常用符号库</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {GENERAL_SHAPE_LIBRARY.map(item => (
                        <button
                          key={item.key}
                          className="h-12 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition"
                          title={item.label}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-draw-shape', item.key);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => canvasMethodsRef.current?.addShapeAt(item.key, { x: 120, y: 120 })}
                        >
                          <img src={item.icon} alt={item.label} className="w-7 h-7 object-contain mb-1" />
                          <span className="text-[10px] text-center leading-tight px-1">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
                onClick={() => toggleSection('网络')}
              >
                {expandedSections['网络'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>网络</span>
              </button>
              {expandedSections['网络'] && (
                <div className="grid grid-cols-4 gap-2">
                  {sidebarIcons.map(icon => (
                    <button
                      key={icon.name}
                      draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-draw-icon', getIconUrl(icon));
                      e.dataTransfer.setData('application/x-draw-icon-name', icon.name);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                      className="h-11 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition px-1.5 py-2"
                      onClick={() => canvasMethodsRef.current?.addSvgIcon(getIconUrl(icon), { width: 80, height: 60, iconName: icon.name })}
                      title={icon.name}
                    >
                      <img src={getIconUrl(icon)} alt={icon.name} className="w-8 h-8 object-contain mb-0.5" />
                      <span className="text-[9px] text-center leading-tight">{icon.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
                onClick={() => toggleSection('一次设备')}
              >
                {expandedSections['一次设备'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>一次设备</span>
              </button>
              {expandedSections['一次设备'] && (
                <div className="grid grid-cols-4 gap-2">
                  {primaryEquipmentIcons.map(icon => (
                    <button
                      key={icon.name}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-draw-icon', getIconUrl(icon));
                        e.dataTransfer.setData('application/x-draw-icon-name', icon.name);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="h-11 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition px-1.5 py-2"
                      onClick={() => canvasMethodsRef.current?.addSvgIcon(getIconUrl(icon), { width: 80, height: 60, iconName: icon.name })}
                      title={icon.name}
                    >
                      <img src={getIconUrl(icon)} alt={icon.name} className="w-8 h-8 object-contain mb-0.5" />
                      <span className="text-[9px] text-center leading-tight">{icon.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 text-gray-700 text-sm">
              {['杂项', '高级', '基本', '箭头', '流程图', '实体关系', 'UML', '机箱'].map(cat => (
                <div key={cat} className="space-y-1">
                  <button
                    className="flex w-full items-center gap-2 text-left hover:text-gray-900"
                    onClick={() => toggleSection(cat)}
                  >
                    {expandedSections[cat] ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                    <span>{cat}</span>
                  </button>
                  {expandedSections[cat] && (
                    <div className="ml-6 text-xs text-gray-400">
                      暂无该分类图形
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <button className="w-full bg-[#d8e9ff] text-[#2563eb] font-semibold rounded-md py-3 text-sm hover:bg-[#cbe1fb]">
              + 更多图形
            </button>
          </div>
        </div>

        {/* 画布区 */}
        <div
          className="flex-1 bg-[#eaeaea] overflow-auto flex justify-center items-start p-4"
          onContextMenu={handleCanvasContextMenu}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
        >
          <div className="relative" style={{ backgroundColor: '#ffffff', width: PAGE_WIDTH * pageCountX * zoom, height: canvasHeight * zoom }}>
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#ffffff',
                  backgroundImage: `url(${GRID_BG})`,
                  backgroundPosition: '-1px -1px',
                  overflow: 'hidden',
                  zIndex: 0,
                  width: PAGE_WIDTH * pageCountX * zoom,
                  height: canvasHeight * zoom,
                }}
              />
            )}
            <InteractiveCanvasComponent
              ref={canvasRef}
              width={PAGE_WIDTH * pageCountX}
              height={PAGE_HEIGHT * pageCountY}
              backgroundColor={showGrid ? 'transparent' : backgroundColor}
              pageWidth={PAGE_WIDTH}
              pageCountX={pageCountX}
              pageHeight={PAGE_HEIGHT}
              pageCountY={pageCountY}
              onBoundsChange={handleBoundsChange}
              onReady={handleCanvasReady}
              onError={handleCanvasError}
              onShapeSelect={handleShapeSelect}
              onCanvasChange={handleCanvasChange}
              onClipboardChange={handleClipboardChange}
              autoResize={false}
            />
          </div>
        </div>

        {/* 右侧属性栏 */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <PropertyPanel
              selectedShape={selectedShape}
              onFillChange={handleFillChange}
              onStrokeChange={handleStrokeChange}
              onStrokeWidthChange={handleStrokeWidthChange}
              onRotationChange={handleRotationChange}
              onScaleChange={handleScaleChange}
              onOpacityChange={handleOpacityChange}
              onArrowChange={handleArrowChange}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
            />
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="bg-white border-t border-gray-200 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">＋</span>
          <span>第 1 页 ▼</span>
        </div>
        <div className="text-gray-500">画布: {canvasWidth} × {canvasHeight}px · 当前工具: {currentTool}</div>
        <div className="text-gray-500">支持网格、对齐、自由绘制</div>
      </div>

      {/* 右键菜单 */}
      {contextMenu.open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
            onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
          />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] text-sm text-gray-700"
            ref={contextMenuRef}
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {[
              { label: '删除', danger: true, action: handleDelete, disabled: !hasSelection, badge: multiSelected ? String(selectionCount) : undefined },
              'divider',
              { label: '剪切', action: handleCut, disabled: !hasSelection },
              { label: '复制', action: handleCopy, disabled: !hasSelection },
              { label: '复制为图像', disabled: true },
              { label: '复制为 SVG', disabled: true },
              { label: '创建副本', action: handleDuplicate, disabled: !hasSelection },
              'divider',
              { label: '锁定 / 解锁', disabled: true },
              { label: '设置为默认样式', disabled: true },
              'divider',
              { label: '组合', action: () => { canvasMethodsRef.current?.combineSelected(); refreshHistoryState(); }, disabled: !multiSelected },
              { label: '取消组合', action: handleUngroup, disabled: !hasSelection },
              { label: '对齐', disabled: true },
              { label: '等距分布', disabled: true },
              'divider',
              { label: '移至最前', action: handleBringToFront, disabled: !hasSelection },
              { label: '移至最后', action: handleSendToBack, disabled: !hasSelection },
              { label: '上移一层', action: handleMoveForward, disabled: !hasSelection },
              { label: '下移一层', action: handleMoveBackward, disabled: !hasSelection },
            ].map((item, idx) => {
              if (item === 'divider') {
                return <div key={`divider-${idx}`} className="border-t border-gray-100 my-1" />;
              }
              return (
                <button
                  key={item.label}
                  className={`w-full text-left px-3 py-2 ${
                    item.danger ? 'text-red-600 font-semibold' : item.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (item.disabled) return;
                    item.action?.();
                    closeContextMenu();
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
