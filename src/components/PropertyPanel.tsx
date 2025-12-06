"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/components/ui/utils';

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
  onArrowChange?: (mode: 'none' | 'start' | 'end' | 'both') => void;
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
  onArrowChange,
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


  useEffect(() => {
    if (!selectedShape) return;
    const fill = selectedShape.getAttribute('fill') || '#000000';
    const stroke = selectedShape.getAttribute('stroke') || '#000000';
    const strokeWidthAttr = selectedShape.getAttribute('stroke-width') || '2';
    const opacityAttr = selectedShape.getAttribute('opacity') || '1';

    const fillIsNone = fill === 'none';
    const strokeIsNone = stroke === 'none';

    setFillEnabled(!fillIsNone);
    setStrokeEnabled(!strokeIsNone);
    setFillColor(fillIsNone ? '#000000' : fill);
    setStrokeColor(strokeIsNone ? '#000000' : stroke);
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

    if (selectedShape.tagName.toLowerCase() === 'line') {
      const start = selectedShape.getAttribute('marker-start');
      const end = selectedShape.getAttribute('marker-end');
      let mode: 'none' | 'start' | 'end' | 'both' = 'none';
      if (start && end) mode = 'both';
      else if (end) mode = 'end';
      else if (start) mode = 'start';
      setArrowMode(mode);
      if (tab !== 'shape') setTab('shape');
    } else {
      setArrowMode('none');
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

  const isText = useMemo(() => selectedShape?.tagName.toLowerCase() === 'foreignobject', [selectedShape]);
  const isLine = useMemo(() => selectedShape?.tagName.toLowerCase() === 'line', [selectedShape]);

  if (!selectedShape) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">属性面板</h3>
        <div className="text-gray-500 text-sm">
          选择一个图形来编辑其属性
        </div>
      </div>
    );
  }

  const shapeType = selectedShape.tagName.toLowerCase();

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-0 flex flex-col min-h-0">
      <div className="grid grid-cols-3 text-sm border-b border-gray-200 flex-shrink-0">
        {(['style', 'text', 'shape'] as const).map(key => (
          <button
            key={key}
            className={cn(
              'py-2',
              tab === key ? 'bg-gray-100 font-semibold text-gray-800' : 'hover:bg-gray-50 text-gray-600'
            )}
            onClick={() => setTab(key)}
          >
            {key === 'style' ? '样式' : key === 'text' ? '文本' : '调整图形'}
          </button>
        ))}
      </div>

      <div className="pl-4 pr-3 py-4 overflow-y-auto space-y-4 flex-1 min-h-0">
        {/* 样式 */}
        {tab === 'style' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {presetColors.slice(0, 16).map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                  onClick={() => handleFillChange(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fillEnabled}
                onChange={(e) => {
                  setFillEnabled(e.target.checked);
                  if (e.target.checked) handleFillChange(fillColor);
                  else handleFillChange('none');
                }}
              />
              <span className="text-sm text-gray-700">填充</span>
              <Input
                type="color"
                value={fillColor}
                disabled={!fillEnabled}
                onChange={handleFillChange}
                className="w-10 h-8 ml-auto"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={strokeEnabled}
                onChange={(e) => {
                  setStrokeEnabled(e.target.checked);
                  if (e.target.checked) handleStrokeChange(strokeColor);
                  else handleStrokeChange('none');
                }}
              />
              <span className="text-sm text-gray-700">线条</span>
              <Input
                type="color"
                value={strokeColor}
                disabled={!strokeEnabled}
                onChange={handleStrokeChange}
                className="w-10 h-8 ml-auto"
              />
            </div>

            {shapeType !== 'text' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">线宽</span>
                <Input
                  type="number"
                  value={String(strokeWidth)}
                  disabled={!strokeEnabled}
                  onChange={(value) => handleStrokeWidthChange(parseFloat(value || '0'))}
                  className="w-20"
                  min="0"
                  max="20"
                  step="0.5"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>不透明度</span>
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* 文本 */}
        {tab === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">字体</span>
              <select className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm bg-white" disabled={!isText}>
                <option>Helvetica</option>
                <option>Arial</option>
                <option>Roboto</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={!isText}>B</Button>
              <Button size="sm" variant="outline" disabled={!isText}><em>I</em></Button>
              <Button size="sm" variant="outline" disabled={!isText}><u>U</u></Button>
              <Input
                type="number"
                value="14"
                onChange={() => {}}
                className="w-16"
                disabled={!isText}
              />
            </div>
            <div className="text-xs text-gray-400">
              文本样式暂仅支持颜色/大小基础控件，更多文字编辑请双击文本直接编辑。
            </div>
          </div>
        )}

        {/* 调整图形 */}
        {tab === 'shape' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={onBringToFront}>移至最前</Button>
              <Button size="sm" variant="outline" onClick={onSendToBack}>移至最后</Button>
            </div>
            {isLine && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">箭头</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={arrowMode}
                  onChange={(e) => {
                    const mode = e.target.value as 'none' | 'start' | 'end' | 'both';
                    setArrowMode(mode);
                    onArrowChange?.(mode);
                  }}
                >
                  <option value="none">无</option>
                  <option value="end">单向</option>
                  <option value="both">双向</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">旋转</span>
              <Input
                type="number"
                value={String(rotation)}
                onChange={(value) => handleRotationChange(parseFloat(value || '0'))}
                className="w-20"
                min="-180"
                max="180"
              />
              <span className="text-sm text-gray-500">°</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">缩放</span>
              <Input
                type="number"
                value={String(scale)}
                onChange={(value) => handleScaleChange(parseFloat(value || '1'))}
                className="w-20"
                min="0.1"
                max="5"
                step="0.1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={onDuplicate}>创建副本</Button>
              <Button size="sm" variant="outline" onClick={onDelete}>删除</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
