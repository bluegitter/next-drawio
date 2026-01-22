import React from 'react';

type ContextMenuState = { x: number; y: number; open: boolean };

type ContextMenuProps = {
  contextMenu: ContextMenuState;
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  hasSelection: boolean;
  multiSelected: boolean;
  selectionCount: number;
  onDelete: () => void;
  onCut: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onCombineSelected: () => void;
};

export default function ContextMenu({
  contextMenu,
  contextMenuRef,
  onClose,
  hasSelection,
  multiSelected,
  selectionCount,
  onDelete,
  onCut,
  onCopy,
  onDuplicate,
  onUngroup,
  onBringToFront,
  onSendToBack,
  onMoveForward,
  onMoveBackward,
  onCombineSelected,
}: ContextMenuProps) {
  if (!contextMenu.open) return null;

  const items = [
    { label: '删除', danger: true, action: onDelete, disabled: !hasSelection, badge: multiSelected ? String(selectionCount) : undefined },
    { type: 'divider' as const },
    { label: '剪切', action: onCut, disabled: !hasSelection },
    { label: '复制', action: onCopy, disabled: !hasSelection },
    { label: '复制为图像', disabled: true },
    { label: '复制为 SVG', disabled: true },
    { label: '创建副本', action: onDuplicate, disabled: !hasSelection },
    { type: 'divider' as const },
    { label: '锁定 / 解锁', disabled: true },
    { label: '设置为默认样式', disabled: true },
    { type: 'divider' as const },
    { label: '组合', action: onCombineSelected, disabled: !multiSelected },
    { label: '取消组合', action: onUngroup, disabled: !hasSelection },
    { label: '对齐', disabled: true },
    { label: '等距分布', disabled: true },
    { type: 'divider' as const },
    { label: '移至最前', action: onBringToFront, disabled: !hasSelection },
    { label: '移至最后', action: onSendToBack, disabled: !hasSelection },
    { label: '上移一层', action: onMoveForward, disabled: !hasSelection },
    { label: '下移一层', action: onMoveBackward, disabled: !hasSelection },
  ] as const;

  type DividerItem = { type: 'divider' };
  type ActionItem = {
    label: string;
    action?: () => void;
    disabled?: boolean;
    danger?: boolean;
    badge?: string;
  };
  const isDivider = (item: DividerItem | ActionItem): item is DividerItem => 'type' in item;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] text-sm text-gray-700"
        ref={contextMenuRef}
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        {items.map((item, idx) => {
          if (isDivider(item)) {
            return <div key={`divider-${idx}`} className="border-t border-gray-100 my-1" />;
          }
          
          const actionItem = item as ActionItem;
          return (
            <button
              key={idx}
              className={`w-full text-left px-3 py-2 ${
                actionItem.danger ? 'text-red-600 font-semibold' : actionItem.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                if (actionItem.disabled) return;
                actionItem.action?.();
                onClose();
              }}
            >
              {actionItem.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
