"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';

export type ToolType = 'select' | 'rectangle' | 'roundedRect' | 'circle' | 'triangle' | 'line' | 'polyline' | 'text' | 'delete' | 'clear' | 'connect';

export interface EnhancedToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onExport: (format: 'png' | 'jpg' | 'svg') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
  isConnecting?: boolean;
}

export const EnhancedToolbar: React.FC<EnhancedToolbarProps> = ({
  currentTool,
  onToolChange,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  disabled = false,
  isConnecting = false,
}) => {
  const tools = [
    { id: 'select' as ToolType, label: '选择', icon: '↖', shortcut: 'V' },
    { id: 'rectangle' as ToolType, label: '矩形', icon: '▢', shortcut: 'R' },
    { id: 'roundedRect' as ToolType, label: '圆角矩形', icon: '▭', shortcut: 'U' },
    { id: 'circle' as ToolType, label: '圆形', icon: '○', shortcut: 'C' },
    { id: 'triangle' as ToolType, label: '三角形', icon: '△', shortcut: 'T' },
    { id: 'line' as ToolType, label: '直线', icon: '╱', shortcut: 'L' },
    { id: 'polyline' as ToolType, label: '折线', icon: '⎍', shortcut: 'P' },
    { id: 'text' as ToolType, label: '文字', icon: 'T', shortcut: 'X' },
    { id: 'connect' as ToolType, label: '连接', icon: '🔗', shortcut: 'N' },
  ] as const;

  const actionTools = [
    { id: 'delete' as ToolType, label: '删除', icon: '🗑', variant: 'outline' as const, danger: true },
    { id: 'clear' as ToolType, label: '清空', icon: '🧹', variant: 'outline' as const, danger: true },
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
              disabled={disabled || (isConnecting && tool.id !== 'select')}
              title={`${tool.label} (${tool.shortcut})`}
              className="min-w-[40px] relative group"
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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
              disabled={disabled || isConnecting}
              title={tool.label}
              className={`min-w-[40px] ${tool.danger ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
            >
              <span className="text-lg">{tool.icon}</span>
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* 撤销/重做 */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUndo?.()}
            disabled={!canUndo || disabled || isConnecting}
            title="撤销 (Ctrl+Z)"
          >
            <span className="text-lg">↶</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRedo?.()}
            disabled={!canRedo || disabled || isConnecting}
            title="重做 (Ctrl+Y)"
          >
            <span className="text-lg">↷</span>
          </Button>
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
              disabled={disabled || isConnecting}
              title={`导出为 ${option.label}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 工具提示 */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>当前工具: {tools.find(t => t.id === currentTool)?.label || currentTool}</span>
          {isConnecting && (
            <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              🔗 连接模式激活 - 选择目标图形
            </span>
          )}
        </div>
        <div className="flex gap-4">
          <span>快捷键: V-选择 R-矩形 U-圆角矩形 C-圆形 T-三角形 L-直线 P-折线 X-文字 N-连接</span>
          <span>Shift+点击: 创建连接</span>
        </div>
      </div>

      {/* 连接模式提示 */}
      {isConnecting && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center text-sm text-blue-800">
            <span className="mr-2">🔗 连接模式:</span>
            <span>点击另一个图形完成连接，或按ESC取消</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedToolbar;