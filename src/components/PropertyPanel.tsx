"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface PropertyPanelProps {
  selectedShape: SVGElement | null;
  onFillChange?: (color: string) => void;
  onStrokeChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onRotationChange?: (rotation: number) => void;
  onScaleChange?: (scale: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedShape,
  onFillChange,
  onStrokeChange,
  onStrokeWidthChange,
  onRotationChange,
  onScaleChange,
  onOpacityChange,
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

  // 从选中图形中提取属性
  useEffect(() => {
    if (!selectedShape) return;

    const fill = selectedShape.getAttribute('fill') || '#000000';
    const stroke = selectedShape.getAttribute('stroke') || '#000000';
    const strokeWidthAttr = selectedShape.getAttribute('stroke-width') || '2';
    const opacityAttr = selectedShape.getAttribute('opacity') || '1';

    setFillColor(fill === 'none' ? '#000000' : fill);
    setStrokeColor(stroke === 'none' ? '#000000' : stroke);
    setStrokeWidth(parseFloat(strokeWidthAttr));
    setOpacity(parseFloat(opacityAttr));

    // 从transform中提取旋转和缩放
    const transform = selectedShape.getAttribute('transform') || '';
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);

    if (rotateMatch) {
      const angle = parseFloat(rotateMatch[1].split(' ')[0]);
      setRotation(angle);
    } else {
      setRotation(0);
    }

    if (scaleMatch) {
      const scaleFactor = parseFloat(scaleMatch[1]);
      setScale(scaleFactor);
    } else {
      setScale(1);
    }
  }, [selectedShape]);

  const handleFillChange = useCallback((color: string) => {
    setFillColor(color);
    onFillChange?.(color);
  }, [onFillChange]);

  const handleStrokeChange = useCallback((color: string) => {
    setStrokeColor(color);
    onStrokeChange?.(color);
  }, [onStrokeChange]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    onStrokeWidthChange?.(width);
  }, [onStrokeWidthChange]);

  const handleRotationChange = useCallback((angle: number) => {
    setRotation(angle);
    onRotationChange?.(angle);
  }, [onRotationChange]);

  const handleScaleChange = useCallback((scaleValue: number) => {
    setScale(scaleValue);
    onScaleChange?.(scaleValue);
  }, [onScaleChange]);

  const handleOpacityChange = useCallback((opacityValue: number) => {
    setOpacity(opacityValue);
    onOpacityChange?.(opacityValue);
  }, [onOpacityChange]);

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#000000', '#6b7280', '#ffffff'
  ];

  if (!selectedShape) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">属性面板</h3>
        <div className="text-gray-500 text-sm">
          选择一个图形来编辑其属性
        </div>
      </div>
    );
  }

  const shapeType = selectedShape.tagName.toLowerCase();

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">属性面板</h3>
      
      {/* 图形类型信息 */}
      <div className="mb-4 p-2 bg-gray-50 rounded">
        <div className="text-sm font-medium text-gray-700">
          图形类型: {shapeType === 'rect' ? '矩形' : 
                     shapeType === 'circle' ? '圆形' : 
                     shapeType === 'polygon' ? '三角形' : 
                     shapeType === 'line' ? '线条' : '文字'}
        </div>
      </div>

      <div className="space-y-4">
        {/* 填充颜色 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">填充颜色</label>
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={fillColor}
              onChange={handleFillChange}
              className="w-16 h-8"
            />
            <Input
              type="text"
              value={fillColor}
              onChange={(value) => handleFillChange(value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {presetColors.map(color => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: color }}
                onClick={() => handleFillChange(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 边框颜色 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">边框颜色</label>
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={strokeColor}
              onChange={handleStrokeChange}
              className="w-16 h-8"
            />
            <Input
              type="text"
              value={strokeColor}
              onChange={(value) => handleStrokeChange(value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        {/* 边框宽度 */}
        {shapeType !== 'text' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">边框宽度</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <Input
                type="number"
                value={String(strokeWidth)}
                onChange={(value) => handleStrokeWidthChange(parseFloat(value))}
                placeholder="2"
                className="w-16"
                min="0"
                max="20"
              />
            </div>
          </div>
        )}

        {/* 旋转 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">旋转角度</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <Input
              type="number"
              value={String(rotation)}
              onChange={(value) => handleRotationChange(parseFloat(value))}
              placeholder="0"
              className="w-16"
              min="-180"
              max="180"
            />
          </div>
        </div>

        {/* 缩放 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">缩放比例</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <Input
              type="number"
              value={String(scale)}
              onChange={(value) => handleScaleChange(parseFloat(value))}
              placeholder="1"
              className="w-16"
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
        </div>

        {/* 透明度 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">透明度</label>
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
            <Input
              type="number"
              value={String(opacity)}
              onChange={(value) => handleOpacityChange(parseFloat(value))}
              placeholder="1"
              className="w-16"
              min="0"
              max="1"
              step="0.1"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onDuplicate}
              className="w-full"
            >
              复制
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="w-full"
            >
              删除
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onBringToFront}
              className="w-full"
            >
              置顶
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onSendToBack}
              className="w-full"
            >
              置底
            </Button>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">快捷键</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <div>删除: Delete键</div>
            <div>复制: Ctrl/Cmd + D</div>
            <div>撤销: Ctrl/Cmd + Z</div>
            <div>重做: Ctrl/Cmd + Shift + Z</div>
            <div>重做: Ctrl/Cmd + Y</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;