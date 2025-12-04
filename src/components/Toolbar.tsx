"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';

export type ToolType = 'select' | 'rectangle' | 'roundedRect' | 'circle' | 'triangle' | 'line' | 'text' | 'delete' | 'clear';

export interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onExport: (format: 'png' | 'jpg' | 'svg') => void;
  disabled?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onExport,
  disabled = false,
}) => {
  const tools = [
    { id: 'select', label: '选择', icon: '↖', shortcut: 'V' },
    { id: 'rectangle', label: '矩形', icon: '▢', shortcut: 'R' },
    { id: 'roundedRect', label: '圆角矩形', icon: '▭', shortcut: 'U' },
    { id: 'circle', label: '圆形', icon: '○', shortcut: 'C' },
    { id: 'triangle', label: '三角形', icon: '△', shortcut: 'T' },
    { id: 'line', label: '线条', icon: '╱', shortcut: 'L' },
    { id: 'text', label: '文字', icon: 'T', shortcut: 'X' },
  ] as const;

  const actionTools = [
    { id: 'delete', label: '删除', icon: '🗑', variant: 'outline' as const, danger: true },
    { id: 'clear', label: '清空', icon: '🧹', variant: 'outline' as const, danger: true },
  ] as const;

  const exportOptions = [
    { format: 'png' as const, label: 'PNG' },
    { format: 'jpg' as const, label: 'JPG' },
    { format: 'svg' as const, label: 'SVG' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      {/* 主工具栏 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              size="sm"
              variant={currentTool === tool.id ? "default" : "ghost"}
              onClick={() => onToolChange(tool.id)}
              disabled={disabled}
              title={`${tool.label} (${tool.shortcut})`}
              className="min-w-[40px] relative group"
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tool.label} ({tool.shortcut})
              </span>
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* 操作工具 */}
        <div className="flex items-center gap-1">
          {actionTools.map((tool) => (
            <Button
              key={tool.id}
              size="sm"
              variant={tool.variant}
              onClick={() => onToolChange(tool.id)}
              disabled={disabled}
              title={tool.label}
              className={`min-w-[40px] ${tool.danger ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
            >
              <span className="text-lg">{tool.icon}</span>
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* 导出选项 */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600 mr-2">导出:</span>
          {exportOptions.map((option) => (
            <Button
              key={option.format}
              size="sm"
              variant="outline"
              onClick={() => onExport(option.format)}
              disabled={disabled}
              title={`导出为 ${option.label}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 工具提示 */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>当前工具: {tools.find(t => t.id === currentTool)?.label || currentTool}</span>
        <div className="flex gap-4">
          <span>快捷键提示: V-选择 R-矩形 U-圆角矩形 C-圆形 T-三角形 L-线条 X-文字</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;