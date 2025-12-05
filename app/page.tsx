"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EnhancedToolbar, ToolType } from '@/components/EnhancedToolbar';
import InteractiveCanvasComponent, { CanvasComponentRef } from '@/components/InteractiveCanvasComponent';
import PropertyPanel from '@/components/PropertyPanel';
import { sidebarIcons, getIconUrl } from '@/constants/iconList';
import { SHAPE_ICONS, CHECK_ICON } from '@/constants/svgIcons';
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
} from 'lucide-react';
import './globals.css';

export default function Home() {
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(700);
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

  const menuData = [
    {
      key: '文件',
      items: [
        { label: '新建...' },
        { label: '从...打开', children: [{ label: '本地文件' }, { label: 'URL' }] },
        { label: '打开最近使用的文件', children: [{ label: '最近文件1' }, { label: '最近文件2' }] },
        'divider',
        { label: '保存', shortcut: '⌘+S' },
        { label: '另存为...', shortcut: '⌘+⇧+S' },
        'divider',
        { label: '共享...' },
        'divider',
        { label: '重命名...' },
        { label: '创建副本...' },
        'divider',
        { label: '从...导入', children: [{ label: 'SVG' }, { label: 'PNG' }] },
        { label: '导出为', children: [{ label: 'PNG' }, { label: 'SVG' }, { label: 'PDF' }] },
        'divider',
        { label: '嵌入', children: [{ label: 'HTML' }, { label: 'Iframe' }] },
        { label: '发布', children: [{ label: '链接' }, { label: '图像' }] },
        'divider',
        { label: '新增库', children: [{ label: '新建库' }, { label: '导入库' }] },
        { label: '从...打开库', children: [{ label: '本地库' }, { label: 'URL 库' }] },
        'divider',
        { label: '属性...' },
        'divider',
        { label: '页面设置...' },
        { label: '打印...', shortcut: '⌘+P' },
        'divider',
        { label: '关闭' },
      ],
    },
    {
      key: '编辑',
      items: [
        { label: '撤销', shortcut: '⌘+Z' },
        { label: '重做', shortcut: '⌘+⇧+Z', disabled: true },
        'divider',
        { label: '剪切', shortcut: '⌘+X', disabled: true },
        { label: '复制', shortcut: '⌘+C', disabled: true },
        { label: '复制为图像', shortcut: '⌘+⌥+X' },
        { label: '复制为 SVG', shortcut: '⌘+⌥+⇧+X' },
        { label: '粘贴', shortcut: '⌘+V' },
        { label: '删除', disabled: true },
        { label: '创建副本', shortcut: '⌘+D', disabled: true },
        'divider',
        { label: '查找/替换', shortcut: '⌘+F' },
        { label: '编辑数据...', shortcut: '⌘+M' },
        'divider',
        { label: '选择顶点', shortcut: '⌘+⇧+I' },
        { label: '选择边线', shortcut: '⌘+⇧+E' },
        { label: '全选', shortcut: '⌘+A' },
        { label: '全不选', shortcut: '⌘+⇧+A' },
      ],
    },
    {
      key: '查看',
      items: [
        { label: '格式', shortcut: '⌘+⇧+P', checked: true },
        { label: '缩略图', shortcut: '⌘+⇧+O' },
        { label: '图层', shortcut: '⌘+⇧+L' },
        { label: '标签', shortcut: '⌘+K' },
        'divider',
        { label: '搜索图形' },
        { label: '便笺本', checked: true },
        { label: '形状', checked: true, shortcut: '⌘+⇧+K' },
        'divider',
        { label: '页面视图', checked: true },
        { label: '页面标签', checked: true },
        { label: '标尺' },
        'divider',
        { label: '提示', checked: true },
        { label: '动画', checked: true },
        'divider',
        { label: '网格', checked: true, shortcut: '⌘+⇧+G' },
        { label: '参考线', checked: true },
        { label: '连接箭头', shortcut: '⌥+⇧+A' },
        { label: '连接点', shortcut: '⌥+⇧+O' },
        'divider',
        { label: '重置视图', shortcut: 'Enter/Home' },
        { label: '放大', shortcut: '⌘ + / Alt+Mousewheel' },
        { label: '缩小', shortcut: '⌘ - / Alt+Mousewheel' },
        { label: '全屏' },
      ],
    },
    {
      key: '调整图形',
      items: [
        { label: '移至最前', shortcut: '⌘+⇧+F', disabled: true },
        { label: '移至最后', shortcut: '⌘+⇧+B', disabled: true },
        { label: '上移一层', shortcut: '⌘+Alt+Shift+F', disabled: true },
        { label: '下移一层', shortcut: '⌘+Alt+Shift+B', disabled: true },
        'divider',
        { label: '方向', children: [{ label: '水平' }, { label: '垂直' }], disabled: true },
        { label: '旋转90°/翻转', shortcut: '⌘+R', disabled: true },
        { label: '对齐', children: [{ label: '左对齐' }, { label: '居中' }], disabled: true },
        { label: '等距分布', disabled: true },
        'divider',
        { label: '导航' },
        { label: '插入', children: [{ label: '连接' }, { label: '图形' }] },
        { label: '布局', children: [{ label: '自动布局' }, { label: '层次布局' }] },
        'divider',
        { label: '组合', shortcut: '⌘+G', disabled: true },
        { label: '取消组合', shortcut: '⌘+⇧+U', disabled: true },
        { label: '移出组合', disabled: true },
        'divider',
        { label: '清除航点', shortcut: '⌥+⇧+R', disabled: true },
        { label: '自动调整', shortcut: '⌥+⇧+Y', disabled: true },
      ],
    },
    {
      key: '其它',
      items: [
        { label: '语言', children: [{ label: '中文' }, { label: 'English' }] },
        { label: '外观', children: [{ label: '浅色' }, { label: '深色' }] },
        { label: '主题', children: [{ label: '默认' }, { label: '灰色' }] },
        'divider',
        { label: '自适应颜色' },
        { label: '数学排版' },
        'divider',
        { label: '显示开始画面', checked: true },
        { label: '自动保存', disabled: true },
        'divider',
        { label: '连接时复制' },
        { label: '折叠/展开', checked: true },
        { label: '绘图语言', children: [{ label: '左右' }, { label: '上下' }] },
        { label: '编辑绘图...' },
        { label: '插件...' },
        { label: '配置...' },
      ],
    },
    {
      key: '帮助',
      items: [
        { label: '快捷键...' },
        { label: '快速入门视频...' },
        { label: '获取桌面版...' },
        { label: '支持...' },
        'divider',
        { label: 'v29.2.3', disabled: true },
      ],
    },
  ];

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);

  const renderMenu = (items: any[], isSub?: boolean) => (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg py-1"
      style={{ minWidth: 220, marginTop: isSub ? -24 : 0, marginLeft: isSub ? 200 : 0, fontFamily: 'Arial', fontSize: 14 }}
      onMouseLeave={() => isSub && setOpenSub(null)}
    >
      {items.map((item, idx) => {
        if (item === 'divider') {
          return <div key={idx} className="my-1 border-t border-gray-200" />;
        }
        const disabled = item.disabled;
        const hasChildren = !!item.children;
        return (
          <div
            key={item.label}
            className={`px-3 py-2 grid grid-cols-[20px_1fr_auto] items-center text-sm ${
              disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
            }`}
            onMouseEnter={() => hasChildren && setOpenSub(item.label)}
            style={{ fontFamily: 'Arial', fontSize: 14 }}
          >
            <div className="flex justify-center">
              {item.checked && <img src={CHECK_ICON} alt="checked" className="w-4 h-3" />}
            </div>
            <div className="flex items-center gap-1">
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              {item.shortcut && <span>{item.shortcut}</span>}
              {hasChildren && <span>▶</span>}
            </div>
            {hasChildren && openSub === item.label && renderMenu(item.children, true)}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col text-sm text-gray-700">
      {/* 顶部菜单栏 */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f7c266] rounded flex items-center justify-center text-white font-bold">IO</div>
          <span className="font-medium text-gray-800">未命名绘图</span>
          <div className="flex items-center gap-1 text-gray-600 relative">
            {menuData.map(menu => (
              <div key={menu.key} className="relative">
                <button
                  className={`px-3 py-2 rounded ${openMenu === menu.key ? 'bg-gray-200 text-gray-900' : 'hover:text-gray-800'}`}
                  onMouseEnter={() => { setOpenMenu(menu.key); setOpenSub(null); }}
                  onMouseLeave={() => { /* keep open until leave container */ }}
                  onClick={() => setOpenMenu(openMenu === menu.key ? null : menu.key)}
                >
                  {menu.key}
                </button>
                {openMenu === menu.key && (
                  <div
                    className="absolute left-0 top-full mt-1"
                    onMouseLeave={() => { setOpenMenu(null); setOpenSub(null); }}
                  >
                    {renderMenu(menu.items)}
                  </div>
                )}
              </div>
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

        <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-gray-700 text-sm">
          <span className="font-medium">{'100%'}</span>
          <ChevronDown size={14} />
        </div>

        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="放大">
          <ZoomIn size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="缩小">
          <ZoomOut size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={handleUndo}
          disabled={!canUndo}
          title="撤销"
        >
          <Undo2 size={18} />
        </button>
        <button
          className={`h-9 w-9 flex items-center justify-center rounded ${canRedo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={handleRedo}
          disabled={!canRedo}
          title="重做"
        >
          <Redo2 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="删除">
          <Trash2 size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="框选">
          <MousePointerSquareDashed size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="粘贴样式">
          <Clipboard size={18} />
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded text-gray-400 cursor-not-allowed" title="粘贴">
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
        <button className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600" title="复制">
          <Copy size={18} />
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
                  onClick={() => handleToolChange(item.key as ToolType)}
                  className="h-14 border border-gray-200 rounded bg-white hover:border-blue-400 flex flex-col items-center justify-center text-gray-600"
                  title={item.key}
                >
                  <img src={SHAPE_ICONS[item.key]} alt={item.label} className="w-6 h-6 mb-1" />
                  <span className="text-[11px]">{item.label}</span>
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
                  onClick={() => canvasMethodsRef.current?.addSvgIcon(getIconUrl(icon), { width: 80, height: 60 })}
                  title={icon.name}
                >
                  <img src={getIconUrl(icon)} alt={icon.name} className="w-12 h-12 object-contain" />
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
