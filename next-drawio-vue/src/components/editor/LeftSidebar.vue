<template>
  <div class="w-[320px] min-w-[280px] bg-[#f1f3f5] border-r border-gray-200 flex flex-col h-full min-h-0">
    <div class="px-4 pt-4 flex-shrink-0">
      <div class="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2">
        <input
          class="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          placeholder="键入 / 进行搜索"
        />
        <Search :size="18" class="text-gray-500" />
      </div>
    </div>

    <div class="overflow-y-auto flex-1 min-h-0 px-4 py-4 space-y-4">
      <div>
        <button
          class="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
          @click="toggleSection('general')"
        >
          <component :is="expandedSections.general ? ChevronDown : ChevronRight" :size="16" />
          <span>通用</span>
        </button>
        <div v-if="expandedSections.general">
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="item in generalItems"
              :key="item.key"
              draggable
              class="h-12 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition"
              :title="item.key"
              @dragstart="handleShapeDrag($event, item.key)"
              @click="onToolSelect(item.key)"
            >
              <img :src="SHAPE_ICONS[item.key]" :alt="item.label" class="w-5 h-5 mb-1" />
              <span class="text-[10px]">{{ item.label }}</span>
            </button>
          </div>

          <div class="mt-3">
            <div class="text-xs text-gray-500 mb-2">常用符号库</div>
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="item in GENERAL_SHAPE_LIBRARY"
                :key="item.key"
                class="h-12 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition"
                :title="item.label"
                draggable
                @dragstart="handleShapeDrag($event, item.key)"
                @click="onAddShapeAt(item.key)"
              >
                <img :src="item.icon" :alt="item.label" class="w-7 h-7 object-contain mb-1" />
                <span class="text-[10px] text-center leading-tight px-1">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <button
          class="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
          @click="toggleSection('网络')"
        >
          <component :is="expandedSections['网络'] ? ChevronDown : ChevronRight" :size="16" />
          <span>网络</span>
        </button>
        <div v-if="expandedSections['网络']" class="grid grid-cols-4 gap-2">
          <button
            v-for="icon in sidebarIcons"
            :key="icon.name"
            draggable
            class="h-11 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition px-1.5 py-2"
            :title="icon.name"
            @dragstart="handleIconDrag($event, icon.name)"
            @click="onAddIcon(getIconUrl(icon), icon.name)"
          >
            <img :src="getIconUrl(icon)" :alt="icon.name" class="w-8 h-8 object-contain mb-0.5" />
            <span class="text-[9px] text-center leading-tight">{{ icon.name }}</span>
          </button>
        </div>
      </div>

      <div>
        <button
          class="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3 hover:text-gray-900"
          @click="toggleSection('一次设备')"
        >
          <component :is="expandedSections['一次设备'] ? ChevronDown : ChevronRight" :size="16" />
          <span>一次设备</span>
        </button>
        <div v-if="expandedSections['一次设备']" class="grid grid-cols-4 gap-2">
          <button
            v-for="icon in primaryEquipmentIcons"
            :key="icon.name"
            draggable
            class="h-11 border border-gray-300 rounded-md bg-white hover:border-blue-500 hover:shadow-sm flex flex-col items-center justify-center text-gray-600 transition px-1.5 py-2"
            :title="icon.name"
            @dragstart="handleIconDrag($event, icon.name)"
            @click="onAddIcon(getIconUrl(icon), icon.name)"
          >
            <img :src="getIconUrl(icon)" :alt="icon.name" class="w-8 h-8 object-contain mb-0.5" />
            <span class="text-[9px] text-center leading-tight">{{ icon.name }}</span>
          </button>
        </div>
      </div>

      <div class="space-y-3 text-gray-700 text-sm">
        <div v-for="cat in placeholderSections" :key="cat" class="space-y-1">
          <button class="flex w-full items-center gap-2 text-left hover:text-gray-900" @click="toggleSection(cat)">
            <component
              :is="expandedSections[cat] ? ChevronDown : ChevronRight"
              :size="16"
              class="text-gray-500"
            />
            <span>{{ cat }}</span>
          </button>
          <div v-if="expandedSections[cat]" class="ml-6 text-xs text-gray-400">
            暂无该分类图形
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 pb-4">
      <button class="w-full bg-[#d8e9ff] text-[#2563eb] font-semibold rounded-md py-3 text-sm hover:bg-[#cbe1fb]">
        + 更多图形
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Search, ChevronDown, ChevronRight } from 'lucide-vue-next';
import { SHAPE_ICONS, GENERAL_SHAPE_LIBRARY } from '@drawio/core';
import { sidebarIcons, getIconUrl, primaryEquipmentIcons } from '@drawio/core';
import type { ToolType } from '@drawio/core';

const props = defineProps<{
  onToolSelect: (tool: ToolType) => void;
  onAddShapeAt: (type: string) => void;
  onAddIcon: (url: string, name: string) => void;
}>();

const placeholderSections = ['杂项', '高级', '基本', '箭头', '流程图', '实体关系', 'UML', '机箱'];

const expandedSections = reactive<Record<string, boolean>>({
  general: true,
  网络: true,
  一次设备: true,
});

const generalItems = [
  { key: 'rectangle', label: '矩形' },
  { key: 'roundedRect', label: '圆角矩形' },
  { key: 'circle', label: '圆形' },
  { key: 'triangle', label: '三角形' },
  { key: 'line', label: '直线' },
  { key: 'polyline', label: '折线' },
  { key: 'text', label: '文本' },
  { key: 'connect', label: '连接' },
] as const;

const toggleSection = (key: string) => {
  expandedSections[key] = !expandedSections[key];
};

const handleShapeDrag = (event: DragEvent, type: string) => {
  if (!event.dataTransfer) return;
  event.dataTransfer.setData('application/x-draw-shape', type);
  event.dataTransfer.effectAllowed = 'copy';
};

const handleIconDrag = (event: DragEvent, name: string) => {
  if (!event.dataTransfer) return;
  const icon = sidebarIcons.concat(primaryEquipmentIcons).find(item => item.name === name);
  if (!icon) return;
  event.dataTransfer.setData('application/x-draw-icon', getIconUrl(icon));
  event.dataTransfer.setData('application/x-draw-icon-name', icon.name);
  event.dataTransfer.effectAllowed = 'copy';
};

const onToolSelect = (tool: ToolType) => props.onToolSelect(tool);
const onAddShapeAt = (type: string) => props.onAddShapeAt(type);
const onAddIcon = (url: string, name: string) => props.onAddIcon(url, name);
</script>
