"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
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
  const canvasRef = useRef<CanvasComponentRef | null>(null);
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
    canvasRef.current = methods;
    refreshHistoryState();
  }, [refreshHistoryState]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasMethodsRef.current = canvasRef.current;
    }
  });

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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col text-sm text-gray-700">
      {/* 顶部菜单栏 */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f7c266] rounded flex items-center justify-center text-white font-bold">IO</div>
          <span className="font-medium text-gray-800">未命名绘图</span>
          <div className="flex items-center gap-4 text-gray-600">
            {['文件','编辑','查看','调整图形','其它','帮助'].map(item => (
              <button key={item} className="hover:text-gray-800">{item}</button>
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
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 text-base">
        <span className="text-gray-500 cursor-pointer">◻</span>
        <span className="text-gray-500 cursor-pointer">☰</span>
        <select className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none">
          <option>100%</option>
          <option>75%</option>
          <option>50%</option>
        </select>
        <div className="flex items-center gap-3 text-gray-600">
          {['↺','↻','◴','🖨','🖉','✏','✂','◌','↦','☐','＋','☐','▦','✶'].map((t, i) => (
            <button key={i} className="hover:text-gray-800">{t}</button>
          ))}
        </div>
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧形状库 */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-3 py-2">
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              placeholder="输入搜索"
            />
          </div>
          <div className="overflow-y-auto flex-1 px-2 pb-4">
          <div className="text-xs font-semibold text-gray-500 px-2 py-2 border-b">便捷本</div>
          <div className="grid grid-cols-4 gap-2 px-2 py-2">
              {[
                { key: 'rectangle', label: '▭' },
                { key: 'roundedRect', label: '▢' },
                { key: 'circle', label: '◯' },
                { key: 'triangle', label: '△' },
                { key: 'line', label: '／' },
                { key: 'polyline', label: '⎍' },
                { key: 'text', label: 'T' },
                { key: 'connect', label: '↔' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => handleToolChange(item.key as ToolType)}
                  className="h-12 border border-gray-200 rounded bg-white hover:border-blue-400 flex items-center justify-center text-gray-600"
                  title={item.key}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-gray-500 px-2 py-2 border-b">
              <div className="flex items-center justify-between mb-2">
                <span>组合</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="border border-gray-200 text-xs px-2"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Combine button clicked, canvasMethodsRef.current:', canvasMethodsRef.current);
                    if (canvasMethodsRef.current) {
                      canvasMethodsRef.current.combineSelected();
                      }
                    }}
                  >
                    组合
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="border border-gray-200 text-xs px-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      canvasMethodsRef.current?.ungroupSelected();
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-400 px-2">
                提示：按住 Ctrl/Cmd 键点击多个图形进行多选
              </div>
            </div>

            <div className="text-xs font-semibold text-gray-500 px-2 py-2 border-b">网络图标</div>
            <div className="grid grid-cols-3 gap-3 px-2 py-3 max-h-96 overflow-y-auto">
              {sidebarIcons.map(icon => (
                <button
                  key={icon.name}
                  className="flex flex-col items-center gap-1 border border-gray-200 rounded p-2 hover:border-blue-400 hover:shadow-sm transition bg-white"
                  onClick={() => canvasMethodsRef.current?.addSvgIcon(icon.src, { width: 80, height: 60 })}
                  title={icon.name}
                >
                  <img src={icon.src} alt={icon.name} className="w-12 h-12 object-contain" />
                  <span className="text-xs text-gray-600 truncate w-full text-center">{icon.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t px-2 py-2 text-blue-500 text-sm cursor-pointer hover:underline">+ 更多图形</div>
        </div>

        {/* 画布区 */}
        <div className="flex-1 bg-[#eaeaea] overflow-auto flex justify-center items-start p-4">
          <div
            className="relative"
            style={{
              backgroundImage:
                'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <InteractiveCanvasComponent
              ref={canvasRef}
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

        {/* 右侧属性栏 */}
        <div className="w-72 bg-white border-l border-gray-200 p-4 space-y-3">
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

          <div className="space-y-2 text-sm text-gray-700 border-t pt-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> <span>网格</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> <span>页面视图图</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" /> <span>背景</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" /> <span>背景色</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" /> <span>阴影</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> <span>连接箭头</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> <span>连接点</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> <span>参考线</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">页面尺寸</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
                <option>A4 (210 mm x 297 mm)</option>
                <option>A3 (297 mm x 420 mm)</option>
              </select>
              <div className="flex items-center gap-2 text-xs">
                <input type="radio" name="orientation" defaultChecked /> 竖向
                <input type="radio" name="orientation" className="ml-3" /> 横向
              </div>
              <Button size="sm" variant="ghost" className="w-full border mt-1">清除默认风格</Button>
            </div>
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
    </div>
  );
}
