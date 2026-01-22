<template>
  <div class="w-full h-full p-4 bg-white border-l border-gray-200 shadow-lg flex flex-col">
    <h3 class="mb-4 text-sm font-medium text-gray-700">属性面板</h3>

    <div v-if="!selectedShape" class="text-sm text-gray-400">
      请选择一个形状以编辑属性
    </div>

    <div v-else class="flex-1 overflow-y-auto min-h-0">
      <!-- 标签页切换 -->
      <div class="flex p-1 mb-4 space-x-1 bg-gray-100 rounded">
        <button
          v-for="currentTab in ['style', 'text', 'shape']"
          :key="currentTab"
          @click="handleTabChange(currentTab)"
          :class="[
            'flex-1 py-1 px-2 text-xs font-medium rounded transition-colors',
            tab === currentTab ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tabLabels[currentTab] }}
        </button>
      </div>

      <!-- 样式标签页 -->
      <div v-if="tab === 'style'" class="space-y-3">
        <!-- 填充颜色 -->
        <div>
          <label class="block mb-1 text-xs font-medium text-gray-700">
            <div class="flex items-center justify-between">
              <span>填充颜色</span>
              <input
                type="checkbox"
                v-model="fillEnabled"
                @change="handleFillChange(fillEnabled ? currentFillColor : 'transparent')"
                class="w-3 h-3"
              />
            </div>
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              v-model="currentFillColor"
              @input="handleFillChange(handleInputValue($event))"
              :disabled="!fillEnabled"
              class="w-8 h-8 border-0 rounded cursor-pointer"
            />
            <input
              type="text"
              v-model="currentFillColor"
              @input="handleFillChange(handleInputValue($event))"
              :disabled="!fillEnabled"
              class="flex-1 h-8 px-2 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>

        <!-- 描边颜色 -->
        <div>
          <label class="block mb-1 text-xs font-medium text-gray-700">
            <div class="flex items-center justify-between">
              <span>描边颜色</span>
              <input
                type="checkbox"
                v-model="strokeEnabled"
                @change="handleStrokeWidthChange(strokeEnabled ? currentStrokeWidth : 0)"
                class="w-3 h-3"
              />
            </div>
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              v-model="currentStrokeColor"
              @input="handleStrokeChange(handleInputValue($event))"
              :disabled="!strokeEnabled"
              class="w-8 h-8 border-0 rounded cursor-pointer"
            />
            <input
              type="text"
              v-model="currentStrokeColor"
              @input="handleStrokeChange(handleInputValue($event))"
              :disabled="!strokeEnabled"
              class="flex-1 h-8 px-2 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>

        <!-- 描边宽度 -->
        <div>
          <label class="block mb-1 text-xs font-medium text-gray-700">
            描边宽度
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="20"
              v-model.number="currentStrokeWidth"
              @input="handleStrokeWidthChange(handleInputNumber($event))"
              :disabled="!strokeEnabled"
              class="flex-1"
            />
            <span class="w-8 text-xs text-right text-gray-600">{{ currentStrokeWidth }}</span>
          </div>
        </div>

        <!-- 旋转 -->
        <div>
          <label class="block mb-1 text-xs font-medium text-gray-700">
            旋转角度
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="360"
              v-model.number="currentRotation"
              @input="handleRotationChange(handleInputNumber($event))"
              class="flex-1"
            />
            <span class="w-8 text-xs text-right text-gray-600">{{ currentRotation }}°</span>
          </div>
        </div>

        <!-- 缩放 -->
        <div>
          <label class="block mb-1 text-xs font-medium text-gray-700">
            缩放比例
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              v-model.number="currentScale"
              @input="handleScaleChange(handleInputNumber($event))"
              class="flex-1"
            />
            <span class="w-12 text-xs text-right text-gray-600">{{ currentScale.toFixed(1) }}x</span>
          </div>
        </div>

        <!-- 透明度 -->
        <div>
          <label class="block mb-1 text-xs font-medium text-gray-700">
            透明度
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model.number="currentOpacity"
              @input="handleOpacityChange(handleInputNumber($event))"
              class="flex-1"
            />
            <span class="w-12 text-xs text-right text-gray-600">{{ Math.round(currentOpacity * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- 文本标签页 -->
      <div v-if="tab === 'text'" class="space-y-3">
        <p class="text-xs text-gray-500">文本编辑功能</p>
        <p class="text-xs text-gray-400">此功能将在后续版本中实现</p>
      </div>

      <!-- 形状标签页 -->
      <div v-if="tab === 'shape'" class="space-y-3">
        <p class="text-xs text-gray-500">形状高级属性</p>
        <p class="text-xs text-gray-400">此功能将在后续版本中实现</p>
      </div>

      <!-- 操作按钮 -->
      <div class="pt-4 mt-6 border-t border-gray-200">
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="handleDuplicateClick"
            class="px-3 py-2 text-xs transition-colors border border-gray-300 rounded hover:bg-gray-50"
          >
            复制
          </button>
          <button
            @click="handleDeleteClick"
            class="px-3 py-2 text-xs text-red-600 transition-colors border border-red-300 rounded hover:bg-red-50"
          >
            删除
          </button>
          <button
            @click="handleBringToFrontClick"
            class="px-3 py-2 text-xs transition-colors border border-gray-300 rounded hover:bg-gray-50"
          >
            置于顶层
          </button>
          <button
            @click="handleSendToBackClick"
            class="px-3 py-2 text-xs transition-colors border border-gray-300 rounded hover:bg-gray-50"
          >
            置于底层
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  selectedShape: any;
  manager?: any;
  onFillChange?: (color: string) => void;
  onStrokeChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onRotationChange?: (rotation: number) => void;
  onScaleChange?: (scale: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onArrowChange?: (mode: 'none' | 'start' | 'end' | 'both') => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

const props = defineProps<Props>();

const tab = ref<'style' | 'text' | 'shape'>('style');
const tabLabels: Record<string, string> = {
  style: '样式',
  text: '文本',
  shape: '形状'
};

// 响应式状态
const currentFillColor = ref('#3b82f6');
const currentStrokeColor = ref('#1e40af');
const currentStrokeWidth = ref(2);
const currentRotation = ref(0);
const currentScale = ref(1);
const currentOpacity = ref(1);
const fillEnabled = ref(true);
const strokeEnabled = ref(true);

// 从SVGElement中获取属性值
const getShapeAttribute = (attr: string, defaultValue: any) => {
  if (!props.selectedShape) return defaultValue;
  const value = props.selectedShape.getAttribute?.(attr);
  if (value === null || value === undefined) return defaultValue;

  // 类型转换
  if (attr === 'fill' || attr === 'stroke') return value;
  if (attr === 'stroke-width' || attr === 'rotation' || attr === 'opacity') {
    return parseFloat(value);
  }
  return value;
};

// 监听选中形状变化，更新属性值
watch(() => props.selectedShape, (newShape) => {
  if (!newShape) return;

  // 从SVG元素直接读取当前属性值
  currentFillColor.value = getShapeAttribute('fill', '#3b82f6');
  currentStrokeColor.value = getShapeAttribute('stroke', '#1e40af');
  currentStrokeWidth.value = getShapeAttribute('stroke-width', 2);
  currentRotation.value = getShapeAttribute('rotation', 0);
  currentScale.value = getShapeAttribute('scale', 1);
  currentOpacity.value = getShapeAttribute('opacity', 1);

  const fill = getShapeAttribute('fill', '#3b82f6');
  fillEnabled.value = fill !== 'transparent' && fill !== 'none';
  strokeEnabled.value = getShapeAttribute('stroke-width', 0) > 0;
}, { immediate: true });

// 事件处理函数
const handleTabChange = (newTab: string) => {
  tab.value = newTab as 'style' | 'text' | 'shape';
};

const handleInputValue = (event: Event) => {
  return (event.target as HTMLInputElement).value;
};

const handleInputNumber = (event: Event) => {
  return parseFloat((event.target as HTMLInputElement).value);
};

const handleFillChange = (color: string) => {
  currentFillColor.value = color;
  if (props.onFillChange) {
    props.onFillChange(color);
  }
};

const handleStrokeChange = (color: string) => {
  currentStrokeColor.value = color;
  if (props.onStrokeChange) {
    props.onStrokeChange(color);
  }
};

const handleStrokeWidthChange = (width: number) => {
  currentStrokeWidth.value = width;
  if (props.onStrokeWidthChange) {
    props.onStrokeWidthChange(width);
  }
};

const handleRotationChange = (rotation: number) => {
  currentRotation.value = rotation;
  if (props.onRotationChange) {
    props.onRotationChange(rotation);
  }
};

const handleScaleChange = (scale: number) => {
  currentScale.value = scale;
  if (props.onScaleChange) {
    props.onScaleChange(scale);
  }
};

const handleOpacityChange = (opacity: number) => {
  currentOpacity.value = opacity;
  if (props.onOpacityChange) {
    props.onOpacityChange(opacity);
  }
};

const handleDeleteClick = () => {
  if (props.onDelete) {
    props.onDelete();
  }
};

const handleDuplicateClick = () => {
  if (props.onDuplicate) {
    props.onDuplicate();
  }
};

const handleBringToFrontClick = () => {
  if (props.onBringToFront) {
    props.onBringToFront();
  }
};

const handleSendToBackClick = () => {
  if (props.onSendToBack) {
    props.onSendToBack();
  }
};
</script>