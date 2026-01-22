import React from 'react';
import type { ToolType } from '@/components/EnhancedToolbar';

type StatusBarProps = {
  canvasWidth: number;
  canvasHeight: number;
  currentTool: ToolType;
};

export default function StatusBar({ canvasWidth, canvasHeight, currentTool }: StatusBarProps) {
  return (
    <div className="bg-white border-t border-gray-200 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">＋</span>
        <span>第 1 页 ▼</span>
      </div>
      <div className="text-gray-500">画布: {canvasWidth} × {canvasHeight}px · 当前工具: {currentTool}</div>
      <div className="text-gray-500">支持网格、对齐、自由绘制</div>
    </div>
  );
}
