<template>
  <div class="h-12 bg-white border-b border-gray-200 flex items-center px-4">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-[#f7c266] rounded flex items-center justify-center text-white font-bold">IO</div>
      <span class="font-medium text-gray-800">未命名绘图</span>
      <div class="flex items-center gap-1 text-gray-600 relative">
        <div v-for="menu in menuData" :key="menu.key" class="relative">
          <button
            class="px-3 py-2 rounded"
            :class="openMenu === menu.key ? 'bg-gray-200 text-gray-900' : 'hover:text-gray-800'"
            @mouseenter="() => handleMenuEnter(menu.key)"
            @click="() => toggleMenu(menu.key)"
          >
            {{ menu.key }}
          </button>
          <div
            v-if="openMenu === menu.key"
            class="absolute left-0 top-full mt-1"
            @mouseleave="closeMenus"
          >
            <MenuList
              :items="menu.items"
              :open-sub="openSub"
              :set-open-sub="setOpenSub"
              :on-close="closeMenus"
              :check-icon="CHECK_ICON"
            />
          </div>
        </div>
      </div>
      <div class="ml-4 px-3 py-1 bg-[#fce7e7] text-[#c24141] border border-[#f2bebe] rounded text-xs">
        修改未保存，点击此处以保存。
      </div>
    </div>
    <div class="ml-auto">
      <div class="flex items-center gap-2">
        <Button size="sm" variant="ghost" class="border border-gray-300" @click="onSaveFile">
          保存
        </Button>
        <Button size="sm" variant="ghost" class="border border-gray-300" @click="triggerFileOpen">
          打开
        </Button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change="handleFileChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MenuList from './MenuList.vue';
import Button from '@/components/ui/Button.vue';
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

const props = defineProps<{
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
}>();

const openMenu = ref<string | null>(null);
const openSub = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const menuData = computed(() => {
  return [
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
        { label: '撤销', shortcut: '⌘+Z', action: props.onUndo, disabled: !props.canUndo },
        { label: '重做', shortcut: '⌘+⇧+Z', action: props.onRedo, disabled: !props.canRedo },
        'divider',
        { label: '剪切', shortcut: '⌘+X', action: props.onCut, disabled: !props.hasSelection },
        { label: '复制', shortcut: '⌘+C', action: props.onCopy, disabled: !props.hasSelection },
        { label: '复制为图像', shortcut: '⌘+⌥+X' },
        { label: '复制为 SVG', shortcut: '⌘+⌥+⇧+X' },
        { label: '粘贴', shortcut: '⌘+V', action: props.onPaste, disabled: !props.clipboardReady },
        { label: '删除', action: props.onDelete, disabled: !props.hasSelection },
        { label: '创建副本', shortcut: '⌘+D', action: props.onDuplicate, disabled: !props.hasSelection },
        'divider',
        { label: '查找/替换', shortcut: '⌘+F' },
        { label: '编辑数据...', shortcut: '⌘+M' },
        'divider',
        { label: '选择顶点', shortcut: '⌘+⇧+I' },
        { label: '选择边线', shortcut: '⌘+⇧+E' },
        { label: '全选', shortcut: '⌘+A', action: props.onSelectAll },
        { label: '全不选', shortcut: '⌘+⇧+A', action: props.onClearSelection },
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
        { label: '网格', shortcut: '⌘+⇧+G', checked: props.showGrid, action: props.onToggleGrid },
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
        { label: '移至最前', shortcut: '⌘+⇧+F', action: props.onBringToFront, disabled: !props.hasSelection },
        { label: '移至最后', shortcut: '⌘+⇧+B', action: props.onSendToBack, disabled: !props.hasSelection },
        { label: '上移一层', shortcut: '⌘+Alt+Shift+F', action: props.onMoveForward, disabled: !props.hasSelection },
        { label: '下移一层', shortcut: '⌘+Alt+Shift+B', action: props.onMoveBackward, disabled: !props.hasSelection },
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
        { label: '组合', shortcut: '⌘+G', action: props.onCombineSelected, disabled: !props.multiSelected },
        { label: '取消组合', shortcut: '⌘+⇧+U', action: props.onUngroup, disabled: !props.hasSelection },
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
  ] as Array<{ key: string; items: Array<MenuItem | 'divider'> }>;
});

const setOpenSub = (value: string | null) => {
  openSub.value = value;
};

const handleMenuEnter = (key: string) => {
  openMenu.value = key;
  openSub.value = null;
};

const toggleMenu = (key: string) => {
  openMenu.value = openMenu.value === key ? null : key;
  openSub.value = null;
};

const closeMenus = () => {
  openMenu.value = null;
  openSub.value = null;
};

const triggerFileOpen = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  props.onOpenFile(target.files?.[0]);
};
</script>
