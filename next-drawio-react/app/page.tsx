"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ToolType } from '@/components/EnhancedToolbar';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';
import { PropertyPanel } from '@/components/PropertyPanel';
import TopMenuBar from '@/components/editor/TopMenuBar';
import Toolbar from '@/components/editor/Toolbar';
import LeftSidebar from '@/components/editor/LeftSidebar';
import CanvasArea from '@/components/editor/CanvasArea';
import StatusBar from '@/components/editor/StatusBar';
import ContextMenu from '@/components/editor/ContextMenu';
import { useCanvasZoom } from '@/components/editor/hooks/useCanvasZoom';
import { useCanvasBounds } from '@/components/editor/hooks/useCanvasBounds';
import { useSelectionStyleActions } from '@/components/editor/hooks/useSelectionStyleActions';
import { useCanvasActions } from '@/components/editor/hooks/useCanvasActions';
import { CanvasStateManager } from '@drawio/core';
import './globals.css';

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 700;
const GRID_BG = 'data:image/svg+xml;base64,PHN2ZyBzdHlsZT0iY29sb3Itc2NoZW1lOiBsaWdodCBkYXJrOyIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMCAxMCBMIDQwIDEwIE0gMTAgMCBMIDEwIDQwIE0gMCAyMCBMIDQwIDIwIE0gMjAgMCBMIDIwIDQwIE0gMCAzMCBMIDQwIDMwIE0gMzAgMCBMIDMwIDQwIiBmaWxsPSJub25lIiBzdHlsZT0ic3Ryb2tlOmxpZ2h0LWRhcmsoI2QwZDBkMCwgIzQyNDI0Mik7IiBzdHJva2U9IiNkMGQwZDAiIG9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0eWxlPSJzdHJva2U6bGlnaHQtZGFyaygjZDBkMGQwLCAjNDI0MjQyKTsiIHN0cm9rZT0iI2QwZDBkMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+';

export default function Home() {
  // 创建新的状态管理器实例
  const [stateManager] = useState(() => new CanvasStateManager({
    maxHistory: 50
  }));

  const [canvasWidth, setCanvasWidth] = useState<number>(PAGE_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState<number>(PAGE_HEIGHT);
  const [backgroundColor] = useState<string>('#ffffff');
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<SVGElement | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;
  const ZOOM_FACTOR = 1.2;
  const zoomOptions = [50, 75, 90, 100, 110, 125, 150, 200, 300];
  const [canPaste, setCanPaste] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; open: boolean }>({ x: 0, y: 0, open: false });
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [pageCountX, setPageCountX] = useState(1); // pages to the right/bottom from origin
  const [pageCountY, setPageCountY] = useState(1);
  const [pageNegX, setPageNegX] = useState(0); // pages to the left of origin
  const [pageNegY, setPageNegY] = useState(0); // pages above origin
  const canvasRef = useRef<CanvasComponentRef | null>(null);
  const canvasMethodsRef = useRef<CanvasComponentRef | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const refreshHistoryState = useCallback(() => {
    if (!canvasMethodsRef.current) return;
    const nextUndo = canvasMethodsRef.current.canUndo;
    const nextRedo = canvasMethodsRef.current.canRedo;
    requestAnimationFrame(() => {
      setCanUndo(nextUndo);
      setCanRedo(nextRedo);
    });
  }, []);

  const handleCanvasReady = useCallback((canvas: SVGSVGElement, methods: CanvasComponentRef) => {
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

  // 订阅状态管理器的变化
  useEffect(() => {
    const unsubscribe = stateManager.subscribe((event) => {
      if (event.type === 'selection') {
        const selectedIds = stateManager.selection.getSelectedIds();
        setSelectedShapeId(selectedIds.length > 0 ? selectedIds[0] : null);
        setSelectionCount(selectedIds.length);
      } else if (event.type === 'zoom') {
        setZoom(event.newValue);
      }
    });

    return unsubscribe;
  }, [stateManager]);

  useEffect(() => {
    const totalX = pageNegX + pageCountX;
    const totalY = pageNegY + pageCountY;
    setCanvasWidth(PAGE_WIDTH * totalX);
    setCanvasHeight(PAGE_HEIGHT * totalY);
  }, [pageCountX, pageCountY, pageNegX, pageNegY]);

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

  const handleShapeSelect = useCallback((shape: SVGElement | null) => {
    // 仍然保留旧的画布选择逻辑，但同时更新状态管理器
    if (canvasMethodsRef.current?.getSelectionCount) {
      setSelectionCount(canvasMethodsRef.current.getSelectionCount());
    } else {
      setSelectionCount(shape ? 1 : 0);
    }

    // 更新selectedShape状态
    setSelectedShape(shape);

    // 如果有形状ID，尝试同步到状态管理器
    if (shape?.id) {
      setSelectedShapeId(shape.id);
      stateManager.selection.selectSingle(shape.id);
    } else {
      setSelectedShapeId(null);
      stateManager.selection.clearSelection();
    }
  }, [stateManager]);

  const handleCanvasChange = useCallback(() => {
    refreshHistoryState();
  }, [refreshHistoryState]);

  const {
    handleFillChange,
    handleStrokeChange,
    handleStrokeWidthChange,
    handleRotationChange,
    handleScaleChange,
    handleOpacityChange,
    handleArrowChange,
  } = useSelectionStyleActions({ canvasMethodsRef, refreshHistoryState });

  const {
    handleDelete,
    handleDuplicate,
    handleBringToFront,
    handleSendToBack,
    handleSelectAll,
    handleClearSelection,
    handleRotateLeft,
    handleRotateRight,
    handleFlipHorizontal,
    handleFlipVertical,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleCut,
    handleMoveForward,
    handleMoveBackward,
    handleUngroup,
    handleCombineSelected,
  } = useCanvasActions({
    canvasMethodsRef,
    refreshHistoryState,
    setSelectionCount,
    setSelectedShape,
    setCanPaste,
    canPaste,
  });

  const clientToCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const svg = canvasMethodsRef.current?.getCanvas?.();
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const totalWidth = PAGE_WIDTH * (pageNegX + pageCountX);
    const totalHeight = PAGE_HEIGHT * (pageNegY + pageCountY);
    return {
      x: ((clientX - rect.left) * totalWidth) / rect.width - pageNegX * PAGE_WIDTH,
      y: ((clientY - rect.top) * totalHeight) / rect.height - pageNegY * PAGE_HEIGHT,
    };
  }, [pageCountX, pageCountY, pageNegX, pageNegY]);

  const handleClipboardChange = useCallback((hasClipboard: boolean) => {
    setCanPaste(hasClipboard);
  }, []);

  const {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleSelectZoomPercent,
    handleApplyCustomZoom,
  } = useCanvasZoom({
    zoom,
    setZoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    zoomFactor: ZOOM_FACTOR,
    canvasMethodsRef,
    scrollContainerRef,
  });

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

  const handleSaveFile = useCallback(() => {
    if (!canvasMethodsRef.current?.exportJson) return;
    const json = canvasMethodsRef.current.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.drawio.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleOpenFile = useCallback((file?: File) => {
    const targetFile = file;
    if (!targetFile) return;
    canvasMethodsRef.current?.clearCanvas?.();
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? '';
      canvasMethodsRef.current?.importJson?.(text);
    };
    reader.readAsText(targetFile);
  }, []);

  const handleBoundsChange = useCanvasBounds({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    pageCountX,
    pageCountY,
    pageNegX,
    pageNegY,
    setPageCountX,
    setPageCountY,
    setPageNegX,
    setPageNegY,
    scrollContainerRef,
    zoom,
  });

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, open: true });
  }, []);

  const selectionCountFromCanvas = canvasMethodsRef.current?.getSelectionCount?.() ?? selectionCount;
  const hasSelection = selectionCountFromCanvas > 0 || !!selectedShapeId;
  const multiSelected = selectionCountFromCanvas > 1;
  const clipboardReady = canvasMethodsRef.current?.hasClipboard?.() ?? canPaste;

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[#f5f5f5] flex flex-col text-sm text-gray-700">
      <TopMenuBar
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={hasSelection}
        multiSelected={multiSelected}
        clipboardReady={clipboardReady}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(v => !v)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onUngroup={handleUngroup}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onMoveForward={handleMoveForward}
        onMoveBackward={handleMoveBackward}
        onCombineSelected={handleCombineSelected}
        onSaveFile={handleSaveFile}
        onOpenFile={handleOpenFile}
      />
      <Toolbar
        zoom={zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomOptions={zoomOptions}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={hasSelection}
        clipboardReady={clipboardReady}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onSelectZoomPercent={handleSelectZoomPercent}
        onApplyCustomZoom={handleApplyCustomZoom}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftSidebar
          onToolSelect={handleToolChange}
          onAddShapeAt={(type) => canvasMethodsRef.current?.addShapeAt(type, { x: 120, y: 120 })}
          onAddIcon={(url, name) => canvasMethodsRef.current?.addSvgIcon(url, { width: 80, height: 60, iconName: name })}
        />
        <CanvasArea
          scrollContainerRef={scrollContainerRef}
          canvasRef={canvasRef}
          onContextMenu={handleCanvasContextMenu}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          showGrid={showGrid}
          backgroundColor={backgroundColor}
          gridBg={GRID_BG}
          zoom={zoom}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          pageCountX={pageNegX + pageCountX}
          pageCountY={pageNegY + pageCountY}
          pageOffsetXPages={pageNegX}
          pageOffsetYPages={pageNegY}
          onBoundsChange={handleBoundsChange}
          onReady={handleCanvasReady}
          onError={handleCanvasError}
          onShapeSelect={handleShapeSelect}
          onCanvasChange={handleCanvasChange}
          onClipboardChange={handleClipboardChange}
        />

        <div className="w-80 bg-white border-l border-gray-200 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <PropertyPanel
              selectedShape={selectedShape}
              manager={stateManager}
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

      <StatusBar canvasWidth={canvasWidth} canvasHeight={canvasHeight} currentTool={currentTool} />

      <ContextMenu
        contextMenu={contextMenu}
        contextMenuRef={contextMenuRef}
        onClose={closeContextMenu}
        hasSelection={hasSelection}
        multiSelected={multiSelected}
        selectionCount={selectionCountFromCanvas}
        onDelete={handleDelete}
        onCut={handleCut}
        onCopy={handleCopy}
        onDuplicate={handleDuplicate}
        onUngroup={handleUngroup}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onMoveForward={handleMoveForward}
        onMoveBackward={handleMoveBackward}
        onCombineSelected={handleCombineSelected}
      />
    </div>
  );
}
