import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

type ToolbarProps = {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  zoomOptions: number[];
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  clipboardReady: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSelectZoomPercent: (percent: number) => void;
  onApplyCustomZoom: (percent: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
};

export default function Toolbar({
  zoom,
  minZoom,
  maxZoom,
  zoomOptions,
  canUndo,
  canRedo,
  hasSelection,
  clipboardReady,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSelectZoomPercent,
  onApplyCustomZoom,
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
}: ToolbarProps) {
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [zoomInput, setZoomInput] = useState('100');
  const zoomDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setZoomInput(String(Math.round(zoom * 100)));
  }, [zoom]);

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

  const zoomDisplay = zoomInput.trim() === '' ? String(Math.round(zoom * 100)) : zoomInput;

  const handleApplyCustomZoom = () => {
    const parsed = parseFloat(zoomInput);
    if (Number.isNaN(parsed)) return;
    const clampedPercent = Math.min(maxZoom * 100, Math.max(minZoom * 100, parsed));
    onApplyCustomZoom(clampedPercent);
    setZoomDropdownOpen(false);
  };

  return (
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
          <span className="font-medium">{`${zoomDisplay}%`}</span>
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
                    onClick={() => { onSelectZoomPercent(percent); setZoomDropdownOpen(false); }}
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
                  onChange={(value) => setZoomInput(value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCustomZoom(); }}
                  className="h-8 text-sm"
                  min={minZoom * 100}
                  max={maxZoom * 100}
                />
                <span className="text-sm text-gray-500">%</span>
                <Button size="sm" onClick={handleApplyCustomZoom}>确定</Button>
              </div>
              <button
                className="mt-2 w-full text-left text-xs text-blue-600 hover:text-blue-700"
                onClick={() => { onResetZoom(); setZoomDropdownOpen(false); }}
              >
                重置为 100%
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        className={`h-9 w-9 flex items-center justify-center rounded ${zoom >= maxZoom ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
        title="放大"
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
      >
        <ZoomIn size={18} />
      </button>
      <button
        className={`h-9 w-9 flex items-center justify-center rounded ${zoom <= minZoom ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
        title="缩小"
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
      >
        <ZoomOut size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        className={`h-9 w-9 flex items-center justify-center rounded ${canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        onClick={onUndo}
        disabled={!canUndo}
        title="撤销"
      >
        <Undo2 size={18} />
      </button>
      <button
        className={`h-9 w-9 flex items-center justify-center rounded ${canRedo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        onClick={onRedo}
        disabled={!canRedo}
        title="重做"
      >
        <Redo2 size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <div className="flex items-center gap-1">
        <button
          className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="左旋转 90°"
          onClick={onRotateLeft}
        >
          <RotateCcw size={18} />
        </button>
        <button
          className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="右旋转 90°"
          onClick={onRotateRight}
        >
          <RotateCw size={18} />
        </button>
        <button
          className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="水平翻转"
          onClick={onFlipHorizontal}
        >
          <FlipHorizontal size={18} />
        </button>
        <button
          className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="垂直翻转"
          onClick={onFlipVertical}
        >
          <FlipVertical size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        className={`h-9 w-9 flex items-center justify-center rounded ${hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        title="删除"
        onClick={onDelete}
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
        onClick={onCopy}
        disabled={!hasSelection}
      >
        <Copy size={18} />
      </button>
      <button
        className={`h-9 w-9 flex items-center justify-center rounded ${clipboardReady ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        title="粘贴"
        onClick={onPaste}
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
  );
}
