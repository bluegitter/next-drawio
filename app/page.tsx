"use client";

import React, { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EnhancedToolbar, ToolType } from '@/components/EnhancedToolbar';
import InteractiveCanvasComponent, { CanvasComponentRef } from '@/components/InteractiveCanvasComponent';
import PropertyPanel from '@/components/PropertyPanel';
import { sidebarIcons } from '@/constants/iconList';
import './globals.css';

export default function Home() {
  const [canvasWidth, setCanvasWidth] = useState<number>(1800);
  const [canvasHeight, setCanvasHeight] = useState<number>(900);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedShape, setSelectedShape] = useState<SVGElement | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const canvasMethodsRef = useRef<CanvasComponentRef | null>(null);

  const refreshHistoryState = useCallback(() => {
    if (canvasMethodsRef.current) {
      setCanUndo(canvasMethodsRef.current.canUndo());
      setCanRedo(canvasMethodsRef.current.canRedo());
    }
  }, []);

  const handleCanvasReady = useCallback((canvas: SVGSVGElement, methods: CanvasComponentRef) => {
    console.log('Advanced Canvas initialized:', canvas);
    canvasMethodsRef.current = methods;
    refreshHistoryState();
  }, [refreshHistoryState]);

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
  }, []);

  const handleCanvasChange = useCallback(() => {
    refreshHistoryState();
  }, [refreshHistoryState]);

  // 属性面板处理函数
  const handleFillChange = useCallback((color: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 增强工具栏 */}
      <EnhancedToolbar 
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        disabled={false}
        isConnecting={isConnecting}
      />

      {/* 主工作区 */}
      <div className="flex flex-1">
        {/* 左侧工具 + 图标面板 */}
        <div className="w-64 bg-white border-r border-gray-200 p-3 space-y-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <Button size="sm" variant="ghost" title="选择工具" onClick={() => handleToolChange('select')}>↖</Button>
            <Button size="sm" variant="ghost" title="矩形工具" onClick={() => handleToolChange('rectangle')}>▢</Button>
            <Button size="sm" variant="ghost" title="圆角矩形工具" onClick={() => handleToolChange('roundedRect')}>▭</Button>
            <Button size="sm" variant="ghost" title="圆形工具" onClick={() => handleToolChange('circle')}>○</Button>
            <Button size="sm" variant="ghost" title="三角形工具" onClick={() => handleToolChange('triangle')}>△</Button>
            <Button size="sm" variant="ghost" title="直线工具" onClick={() => handleToolChange('line')}>╱</Button>
            <Button size="sm" variant="ghost" title="折线工具" onClick={() => handleToolChange('polyline')}>⎍</Button>
            <Button size="sm" variant="ghost" title="文字工具" onClick={() => handleToolChange('text')}>T</Button>
            <Button size="sm" variant="ghost" title="连接工具" onClick={() => handleToolChange('connect')}>🔗</Button>
          </div>
          <div className="h-px bg-gray-200" />
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">网络图标</div>
            <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {sidebarIcons.map(icon => (
                <button
                  key={icon.name}
                  className="flex flex-col items-center gap-1 border border-gray-200 rounded p-2 hover:border-blue-400 hover:shadow-sm transition"
                  onClick={() => canvasMethodsRef.current?.addSvgIcon(icon.src, { width: 80, height: 60 })}
                  title={icon.name}
                >
                  <img src={icon.src} alt={icon.name} className="w-12 h-12 object-contain" />
                  <span className="text-xs text-gray-600 truncate w-full">{icon.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 画布区域 */}
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
          <div className="flex items-center justify-center min-h-full">
            <InteractiveCanvasComponent
              width={canvasWidth}
              height={canvasHeight}
              backgroundColor={backgroundColor}
              onReady={handleCanvasReady}
              onError={handleCanvasError}
              onShapeSelect={handleShapeSelect}
              onCanvasChange={handleCanvasChange}
              autoResize={false}
            />
          </div>
        </div>

        {/* 属性面板 */}
        <PropertyPanel
          selectedShape={selectedShape}
          onFillChange={handleFillChange}
          onStrokeChange={handleStrokeChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          onRotationChange={handleRotationChange}
          onScaleChange={handleScaleChange}
          onOpacityChange={handleOpacityChange}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
        />

        {/* 右侧设置面板 */}
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">画布设置</h3>
          
          <div className="space-y-4">
            {/* 画布设置 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">画布宽度</label>
              <Input
                type="number"
                value={String(canvasWidth)}
                onChange={(value) => setCanvasWidth(Number(value))}
                placeholder="宽度"
                min="100"
                max="2000"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">画布高度</label>
              <Input
                type="number"
                value={String(canvasHeight)}
                onChange={(value) => setCanvasHeight(Number(value))}
                placeholder="高度"
                min="100"
                max="2000"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">背景颜色</label>
              <Input
                type="color"
                value={backgroundColor}
                onChange={setBackgroundColor}
                placeholder="背景颜色"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">画布操作</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={handleUndo}
                >
                  撤销
                </button>
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={handleRedo}
                >
                  重做
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="bg-gray-800 text-white px-4 py-1">
        <div className="flex items-center justify-between text-xs">
          <span>Next-DrawIO Pro v3.0.0 - 高级版</span>
          <span>画布: {canvasWidth} × {canvasHeight}px</span>
          <span>当前工具: {currentTool === 'select' ? '选择' : 
                      currentTool === 'rectangle' ? '矩形' :
                      currentTool === 'roundedRect' ? '圆角矩形' :
                      currentTool === 'circle' ? '圆形' :
                      currentTool === 'triangle' ? '三角形' :
                      currentTool === 'line' ? '直线' :
                      currentTool === 'polyline' ? '折线' :
                      currentTool === 'text' ? '文字' :
                      currentTool === 'connect' ? '连接' : currentTool}</span>
          <span>支持网格、对齐、自由绘制</span>
        </div>
      </div>
    </div>
  );
}
