"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/components/ui/utils';
import { CanvasStateManager } from '@drawio/core';

export interface PropertyPanelProps {
  // 保持与旧版本的兼容性
  selectedShape: SVGElement | null;
  // 新的状态管理器（可选）
  manager?: CanvasStateManager;
  // 旧的回调函数（保持兼容性）
  onFillChange?: (color: string) => void;
  onStrokeChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onRotationChange?: (rotation: number) => void;
  onScaleChange?: (scale: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onArrowChange?: (mode: 'none' | 'start' | 'end' | 'both') => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedShape,
  manager,
  onFillChange,
  onStrokeChange,
  onStrokeWidthChange,
  onRotationChange,
  onScaleChange,
  onOpacityChange,
  onArrowChange,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}) => {
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [arrowMode, setArrowMode] = useState<'none' | 'start' | 'end' | 'both'>('none');
  const [tab, setTab] = useState<'style' | 'text' | 'shape'>('style');
  const [fillEnabled, setFillEnabled] = useState(true);
  const [strokeEnabled, setStrokeEnabled] = useState(true);

  // 从SVGElement中获取属性值的辅助函数
  const getShapeAttribute = useCallback((attr: string, defaultValue: any) => {
    if (!selectedShape) return defaultValue;
    const value = selectedShape.getAttribute(attr);
    if (value === null) return defaultValue;

    // 类型转换
    if (attr === 'fill' || attr === 'stroke') return value;
    if (attr === 'stroke-width' || attr === 'rotation' || attr === 'opacity') {
      return parseFloat(value);
    }
    return value;
  }, [selectedShape]);

  useEffect(() => {
    if (!selectedShape) return;

    // 从SVG元素直接读取当前属性值
    setFillColor(getShapeAttribute('fill', '#3b82f6'));
    setStrokeColor(getShapeAttribute('stroke', '#1e40af'));
    setStrokeWidth(getShapeAttribute('stroke-width', 2));
    setRotation(getShapeAttribute('rotation', 0));
    setScale(getShapeAttribute('scale', 1));
    setOpacity(getShapeAttribute('opacity', 1));

    const fill = getShapeAttribute('fill', '#3b82f6');
    setFillEnabled(fill !== 'transparent' && fill !== 'none');
    setStrokeEnabled(getShapeAttribute('stroke-width', 0) > 0);
  }, [selectedShape, getShapeAttribute]);

  const handleFillChange = useCallback((color: string) => {
    setFillColor(color);
    if (onFillChange) {
      onFillChange(color);
    }
  }, [onFillChange]);

  const handleStrokeChange = useCallback((color: string) => {
    setStrokeColor(color);
    if (onStrokeChange) {
      onStrokeChange(color);
    }
  }, [onStrokeChange]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    if (onStrokeWidthChange) {
      onStrokeWidthChange(width);
    }
  }, [onStrokeWidthChange]);

  const handleRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation);
    if (onRotationChange) {
      onRotationChange(newRotation);
    }
  }, [onRotationChange]);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  }, [onScaleChange]);

  const handleOpacityChange = useCallback((newOpacity: number) => {
    setOpacity(newOpacity);
    if (onOpacityChange) {
      onOpacityChange(newOpacity);
    }
  }, [onOpacityChange]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    } else if (manager && selectedShape?.id) {
      manager.removeShape(selectedShape.id);
      manager.selection.clearSelection();
      manager.saveSnapshot();
    }
  }, [manager, selectedShape, onDelete]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate();
    }
    // 如果使用新的状态管理器，这里需要实现复制逻辑
  }, [onDuplicate]);

  const handleBringToFront = useCallback(() => {
    if (onBringToFront) {
      onBringToFront();
    }
  }, [onBringToFront]);

  const handleSendToBack = useCallback(() => {
    if (onSendToBack) {
      onSendToBack();
    }
  }, [onSendToBack]);

  if (!selectedShape) {
    return (
      <div className="w-full h-full p-4 bg-white border-l border-gray-200 shadow-lg flex flex-col">
        <h3 className="mb-4 text-sm font-medium text-gray-500">属性面板</h3>
        <p className="text-sm text-gray-400">请选择一个形状以编辑属性</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 bg-white border-l border-gray-200 shadow-lg flex flex-col">
      <h3 className="mb-4 text-sm font-medium text-gray-700">属性面板</h3>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 标签页切换 */}
      <div className="flex p-1 mb-4 space-x-1 bg-gray-100 rounded">
        <button
          onClick={() => setTab('style')}
          className={cn(
            "flex-1 py-1 px-2 text-xs font-medium rounded transition-colors",
            tab === 'style' ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-900"
          )}
        >
          样式
        </button>
        <button
          onClick={() => setTab('text')}
          className={cn(
            "flex-1 py-1 px-2 text-xs font-medium rounded transition-colors",
            tab === 'text' ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-900"
          )}
        >
          文本
        </button>
        <button
          onClick={() => setTab('shape')}
          className={cn(
            "flex-1 py-1 px-2 text-xs font-medium rounded transition-colors",
            tab === 'shape' ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-900"
          )}
        >
          形状
        </button>
      </div>

      {tab === 'style' && (
        <div className="space-y-3">
          {/* 填充颜色 */}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              <div className="flex items-center justify-between">
                <span>填充颜色</span>
                <input
                  type="checkbox"
                  checked={fillEnabled}
                  onChange={(e) => {
                    setFillEnabled(e.target.checked);
                    handleFillChange(e.target.checked ? fillColor : 'transparent');
                  }}
                  className="w-3 h-3"
                />
              </div>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => handleFillChange(e.target.value)}
                disabled={!fillEnabled}
                className="w-8 h-8 border-0 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={fillColor}
                onChange={(e) => handleFillChange(e as any)}
                disabled={!fillEnabled}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>

          {/* 描边颜色 */}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              <div className="flex items-center justify-between">
                <span>描边颜色</span>
                <input
                  type="checkbox"
                  checked={strokeEnabled}
                  onChange={(e) => {
                    setStrokeEnabled(e.target.checked);
                    handleStrokeWidthChange(e.target.checked ? strokeWidth : 0);
                  }}
                  className="w-3 h-3"
                />
              </div>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e.target.value)}
                disabled={!strokeEnabled}
                className="w-8 h-8 border-0 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e as any)}
                disabled={!strokeEnabled}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>

          {/* 描边宽度 */}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              描边宽度
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
                disabled={!strokeEnabled}
                className="flex-1"
              />
              <span className="w-8 text-xs text-right text-gray-600">{strokeWidth}</span>
            </div>
          </div>

          {/* 旋转 */}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              旋转角度
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-xs text-right text-gray-600">{rotation}°</span>
            </div>
          </div>

          {/* 缩放 */}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              缩放比例
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-xs text-right text-gray-600">{scale.toFixed(1)}x</span>
            </div>
          </div>

          {/* 透明度 */}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              透明度
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-xs text-right text-gray-600">{Math.round(opacity * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'text' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">文本编辑功能</p>
          <p className="text-xs text-gray-400">此功能将在后续版本中实现</p>
        </div>
      )}

      {tab === 'shape' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">形状高级属性</p>
          <p className="text-xs text-gray-400">此功能将在后续版本中实现</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="pt-4 mt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDuplicate}
            className="text-xs"
          >
            复制
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="text-xs text-red-600 hover:text-red-700"
          >
            删除
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBringToFront}
            className="text-xs"
          >
            置于顶层
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendToBack}
            className="text-xs"
          >
            置于底层
          </Button>
        </div>
      </div>

      {/* 历史记录按钮 - 仅在使用新的状态管理器时显示 */}
      {manager && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => manager.undo()}
              disabled={!manager.history.canUndo()}
              className="flex-1 text-xs"
            >
              撤销
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => manager.redo()}
              disabled={!manager.history.canRedo()}
              className="flex-1 text-xs"
            >
              重做
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};