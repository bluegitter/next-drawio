import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CHECK_ICON } from '@drawio/core';

type MenuItem = {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  checked?: boolean;
  badge?: string;
  children?: Array<MenuItem | 'divider'>;
};

type TopMenuBarProps = {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  multiSelected: boolean;
  clipboardReady: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onCombineSelected: () => void;
  onSaveFile: () => void;
  onOpenFile: (file?: File) => void;
};

export default function TopMenuBar({
  canUndo,
  canRedo,
  hasSelection,
  multiSelected,
  clipboardReady,
  showGrid,
  onToggleGrid,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectAll,
  onClearSelection,
  onUngroup,
  onBringToFront,
  onSendToBack,
  onMoveForward,
  onMoveBackward,
  onCombineSelected,
  onSaveFile,
  onOpenFile,
}: TopMenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const menuData = useMemo(() => [
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
        { label: '撤销', shortcut: '⌘+Z', action: onUndo, disabled: !canUndo },
        { label: '重做', shortcut: '⌘+⇧+Z', action: onRedo, disabled: !canRedo },
        'divider',
        { label: '剪切', shortcut: '⌘+X', action: onCut, disabled: !hasSelection },
        { label: '复制', shortcut: '⌘+C', action: onCopy, disabled: !hasSelection },
        { label: '复制为图像', shortcut: '⌘+⌥+X' },
        { label: '复制为 SVG', shortcut: '⌘+⌥+⇧+X' },
        { label: '粘贴', shortcut: '⌘+V', action: onPaste, disabled: !clipboardReady },
        { label: '删除', action: onDelete, disabled: !hasSelection },
        { label: '创建副本', shortcut: '⌘+D', action: onDuplicate, disabled: !hasSelection },
        'divider',
        { label: '查找/替换', shortcut: '⌘+F' },
        { label: '编辑数据...', shortcut: '⌘+M' },
        'divider',
        { label: '选择顶点', shortcut: '⌘+⇧+I' },
        { label: '选择边线', shortcut: '⌘+⇧+E' },
        { label: '全选', shortcut: '⌘+A', action: onSelectAll },
        { label: '全不选', shortcut: '⌘+⇧+A', action: onClearSelection },
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
        { label: '网格', shortcut: '⌘+⇧+G', checked: showGrid, action: onToggleGrid },
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
        { label: '移至最前', shortcut: '⌘+⇧+F', action: onBringToFront, disabled: !hasSelection },
        { label: '移至最后', shortcut: '⌘+⇧+B', action: onSendToBack, disabled: !hasSelection },
        { label: '上移一层', shortcut: '⌘+Alt+Shift+F', action: onMoveForward, disabled: !hasSelection },
        { label: '下移一层', shortcut: '⌘+Alt+Shift+B', action: onMoveBackward, disabled: !hasSelection },
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
        { label: '组合', shortcut: '⌘+G', action: onCombineSelected, disabled: !multiSelected },
        { label: '取消组合', shortcut: '⌘+⇧+U', action: onUngroup, disabled: !hasSelection },
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
  ] as Array<{ key: string; items: Array<MenuItem | 'divider'> }>, [
    canRedo,
    canUndo,
    clipboardReady,
    hasSelection,
    multiSelected,
    onBringToFront,
    onClearSelection,
    onCombineSelected,
    onCopy,
    onCut,
    onDelete,
    onDuplicate,
    onMoveBackward,
    onMoveForward,
    onPaste,
    onRedo,
    onSelectAll,
    onSendToBack,
    onToggleGrid,
    onUndo,
    onUngroup,
    showGrid,
  ]);

  const renderMenu = (items: Array<MenuItem | 'divider'>, isSub?: boolean) => (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg py-1"
      style={{ minWidth: 220, marginTop: isSub ? -24 : 0, marginLeft: isSub ? 200 : 0, fontFamily: 'Arial', fontSize: 14 }}
      onMouseLeave={() => isSub && setOpenSub(null)}
    >
      {items.map((item, idx) => {
        if (item === 'divider') {
          return <div key={`divider-${idx}`} className="my-1 border-t border-gray-200" />;
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
            onClick={() => {
              if (disabled || hasChildren) return;
              item.action?.();
              setOpenMenu(null);
              setOpenSub(null);
            }}
            style={{ fontFamily: 'Arial', fontSize: 14 }}
          >
            <div className="flex justify-center">
              {item.checked && <img src={CHECK_ICON} alt="checked" className="w-4 h-3" />}
            </div>
            <div className="flex items-center gap-1">
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              {item.shortcut && <span>{item.shortcut}</span>}
              {hasChildren && <span>▶</span>}
            </div>
            {hasChildren && openSub === item.label && renderMenu(item.children || [], true)}
          </div>
        );
      })}
    </div>
  );

  return (
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
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="border border-gray-300" onClick={onSaveFile}>保存</Button>
          <Button size="sm" variant="ghost" className="border border-gray-300" onClick={() => fileInputRef.current?.click()}>打开</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => onOpenFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}
