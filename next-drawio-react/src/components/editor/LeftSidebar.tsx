import React, { useCallback, useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { SHAPE_ICONS, GENERAL_SHAPE_LIBRARY } from '@drawio/core';
import { sidebarIcons, getIconUrl, primaryEquipmentIcons } from '@drawio/core';
import type { ToolType } from '@/components/EnhancedToolbar';

type LeftSidebarProps = {
  onToolSelect: (tool: ToolType) => void;
  onAddShapeAt: (type: string) => void;
  onAddIcon: (url: string, name: string) => void;
};

const PLACEHOLDER_SECTIONS = ['杂项', '高级', '基本', '箭头', '流程图', '实体关系', 'UML', '机箱'];

export default function LeftSidebar({ onToolSelect, onAddShapeAt, onAddIcon }: LeftSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    网络: true,
    一次设备: true,
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="w-[320px] min-w-[280px] bg-[#f1f3f5] border-r border-gray-200 flex flex-col h-full min-h-0">
      <div className="px-4 pt-4 flex-shrink-0">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2">
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            placeholder="键入 / 进行搜索"
          />
          <Search size={18} className="text-gray-500" />
        </div>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 px-4 py-4 space-y-4">
        <div>
          <button
            className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
            onClick={() => toggleSection('general')}
          >
            {expandedSections.general ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>通用</span>
          </button>
          {expandedSections.general && (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'rectangle', label: '矩形' },
                  { key: 'roundedRect', label: '圆角矩形' },
                  { key: 'circle', label: '圆形' },
                  { key: 'triangle', label: '三角形' },
                  { key: 'line', label: '直线' },
                  { key: 'polyline', label: '折线' },
                  { key: 'text', label: '文本' },
                  { key: 'connect', label: '连接' },
                ].map(item => (
                  <button
                    key={item.key}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-draw-shape', item.key);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => onToolSelect(item.key as ToolType)}
                    className="h-12 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition"
                    title={item.key}
                  >
                    <img src={SHAPE_ICONS[item.key]} alt={item.label} className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2">常用符号库</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {GENERAL_SHAPE_LIBRARY.map((item: { key: string; label: string; icon: string }) => (
                    <button
                      key={item.key}
                      className="h-12 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition"
                      title={item.label}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-draw-shape', item.key);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => onAddShapeAt(item.key)}
                    >
                      <img src={item.icon} alt={item.label} className="w-7 h-7 object-contain mb-1" />
                      <span className="text-[10px] text-center leading-tight px-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <button
            className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
            onClick={() => toggleSection('网络')}
          >
            {expandedSections['网络'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>网络</span>
          </button>
          {expandedSections['网络'] && (
            <div className="grid grid-cols-4 gap-2">
              {sidebarIcons.map(icon => (
                <button
                  key={icon.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-draw-icon', getIconUrl(icon));
                    e.dataTransfer.setData('application/x-draw-icon-name', icon.name);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="h-11 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition px-1.5 py-2"
                  onClick={() => onAddIcon(getIconUrl(icon), icon.name)}
                  title={icon.name}
                >
                  <img src={getIconUrl(icon)} alt={icon.name} className="w-8 h-8 object-contain mb-0.5" />
                  <span className="text-[9px] text-center leading-tight">{icon.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
            onClick={() => toggleSection('一次设备')}
          >
            {expandedSections['一次设备'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>一次设备</span>
          </button>
          {expandedSections['一次设备'] && (
            <div className="grid grid-cols-4 gap-2">
              {primaryEquipmentIcons.map(icon => (
                <button
                  key={icon.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-draw-icon', getIconUrl(icon));
                    e.dataTransfer.setData('application/x-draw-icon-name', icon.name);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="h-11 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition px-1.5 py-2"
                  onClick={() => onAddIcon(getIconUrl(icon), icon.name)}
                  title={icon.name}
                >
                  <img src={getIconUrl(icon)} alt={icon.name} className="w-8 h-8 object-contain mb-0.5" />
                  <span className="text-[9px] text-center leading-tight">{icon.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 text-gray-700 text-sm">
          {PLACEHOLDER_SECTIONS.map(cat => (
            <div key={cat} className="space-y-1">
              <button
                className="flex w-full items-center gap-2 text-left hover:text-gray-900"
                onClick={() => toggleSection(cat)}
              >
                {expandedSections[cat] ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                <span>{cat}</span>
              </button>
              {expandedSections[cat] && (
                <div className="ml-6 text-xs text-gray-400">
                  暂无该分类图形
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <button className="w-full bg-[#d8e9ff] text-[#2563eb] font-semibold rounded-md py-3 text-sm hover:bg-[#cbe1fb]">
          + 更多图形
        </button>
      </div>
    </div>
  );
}
