<template>
  <div v-if="!selectedShape" class="w-72 bg-white border-l border-gray-200 p-4">
    <h3 class="text-lg font-semibold mb-4">属性面板</h3>
    <div class="text-gray-500 text-sm">选择一个图形来编辑其属性</div>
  </div>

  <div v-else class="w-80 bg-white border-l border-gray-200 p-0 flex flex-col min-h-0">
    <div class="grid grid-cols-3 text-sm border-b border-gray-200 flex-shrink-0">
      <button
        v-for="key in tabs"
        :key="key"
        class="py-2"
        :class="tab === key ? 'bg-gray-100 font-semibold text-gray-800' : 'hover:bg-gray-50 text-gray-600'"
        @click="tab = key"
      >
        {{ key === 'style' ? '样式' : key === 'text' ? '文本' : '调整图形' }}
      </button>
    </div>

    <div class="pl-4 pr-3 py-4 overflow-y-auto space-y-4 flex-1 min-h-0">
      <div v-if="tab === 'style'" class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in presetColors.slice(0, 16)"
            :key="color"
            class="w-8 h-8 rounded border border-gray-200 shadow-sm"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="handleFillChange(color)"
          />
        </div>
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="fillEnabled"
            @change="toggleFill"
          />
          <span class="text-sm text-gray-700">填充</span>
          <Input
            v-model="fillColor"
            type="color"
            :disabled="!fillEnabled"
            class="w-10 h-8 ml-auto"
            @update:modelValue="handleFillChange"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="strokeEnabled"
            @change="toggleStroke"
          />
          <span class="text-sm text-gray-700">线条</span>
          <Input
            v-model="strokeColor"
            type="color"
            :disabled="!strokeEnabled"
            class="w-10 h-8 ml-auto"
            @update:modelValue="handleStrokeChange"
          />
        </div>

        <div v-if="shapeType !== 'text'" class="flex items-center gap-2">
          <span class="text-sm text-gray-700">线宽</span>
          <Input
            v-model="strokeWidthInput"
            type="number"
            :disabled="!strokeEnabled"
            class="w-20"
            min="0"
            max="20"
            step="0.5"
            @update:modelValue="handleStrokeWidth"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm text-gray-700">
            <span>不透明度</span>
            <span>{{ Math.round(opacity * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="opacity"
            class="w-full"
            @input="handleOpacityInput"
          />
        </div>
      </div>

      <div v-if="tab === 'text'" class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-700">字体</span>
          <select class="flex-1 border border-gray-200 rounded px-2 py-1 text-sm bg-white" :disabled="!isText">
            <option>Helvetica</option>
            <option>Arial</option>
            <option>Roboto</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <Button size="sm" variant="outline" :disabled="!isText">B</Button>
          <Button size="sm" variant="outline" :disabled="!isText"><em>I</em></Button>
          <Button size="sm" variant="outline" :disabled="!isText"><u>U</u></Button>
          <Input type="number" model-value="14" class="w-16" :disabled="!isText" />
        </div>
        <div class="text-xs text-gray-400">
          文本样式暂仅支持颜色/大小基础控件，更多文字编辑请双击文本直接编辑。
        </div>
      </div>

      <div v-if="tab === 'shape'" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" @click="onBringToFront">移至最前</Button>
          <Button size="sm" variant="outline" @click="onSendToBack">移至最后</Button>
        </div>
        <div v-if="isLine" class="flex items-center gap-2">
          <span class="text-sm text-gray-700">箭头</span>
          <select
            class="border border-gray-300 rounded px-2 py-1 text-sm"
            :value="arrowMode"
            @change="handleArrowSelect"
          >
            <option value="none">无</option>
            <option value="end">单向</option>
            <option value="both">双向</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-700">旋转</span>
          <Input
            v-model="rotationInput"
            type="number"
            class="w-20"
            min="-180"
            max="180"
            @update:modelValue="handleRotation"
          />
          <span class="text-sm text-gray-500">°</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-700">缩放</span>
          <Input
            v-model="scaleInput"
            type="number"
            class="w-20"
            min="0.1"
            max="5"
            step="0.1"
            @update:modelValue="handleScale"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" @click="onDuplicate">创建副本</Button>
          <Button size="sm" variant="outline" @click="onDelete">删除</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';

const props = defineProps<{
  selectedShape: SVGElement | null;
  onFillChange?: (color: string) => void;
  onStrokeChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onRotationChange?: (rotation: number) => void;
  onScaleChange?: (scale: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onArrowChange?: (mode: 'none' | 'start' | 'end' | 'both') => void;
}>();

const fillColor = ref('#3b82f6');
const strokeColor = ref('#1e40af');
const strokeWidth = ref(2);
const rotation = ref(0);
const scale = ref(1);
const opacity = ref(1);
const arrowMode = ref<'none' | 'start' | 'end' | 'both'>('none');
const tab = ref<'style' | 'text' | 'shape'>('style');
const fillEnabled = ref(true);
const strokeEnabled = ref(true);

const tabs = ['style', 'text', 'shape'] as const;

const presetColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#000000', '#6b7280', '#ffffff',
];

const shapeType = computed(() => props.selectedShape?.tagName.toLowerCase() ?? '');
const isText = computed(() => shapeType.value === 'foreignobject');
const isLine = computed(() => shapeType.value === 'line');

const strokeWidthInput = computed({
  get: () => String(strokeWidth.value),
  set: (value: string) => {
    strokeWidth.value = parseFloat(value || '0');
  },
});

const rotationInput = computed({
  get: () => String(rotation.value),
  set: (value: string) => {
    rotation.value = parseFloat(value || '0');
  },
});

const scaleInput = computed({
  get: () => String(scale.value),
  set: (value: string) => {
    scale.value = parseFloat(value || '1');
  },
});

watch(
  () => props.selectedShape,
  (shape) => {
    if (!shape) return;
    const fill = shape.getAttribute('fill') || '#000000';
    const stroke = shape.getAttribute('stroke') || '#000000';
    const strokeWidthAttr = shape.getAttribute('stroke-width') || '2';
    const opacityAttr = shape.getAttribute('opacity') || '1';

    const fillIsNone = fill === 'none';
    const strokeIsNone = stroke === 'none';

    fillEnabled.value = !fillIsNone;
    strokeEnabled.value = !strokeIsNone;
    fillColor.value = fillIsNone ? '#000000' : fill;
    strokeColor.value = strokeIsNone ? '#000000' : stroke;
    strokeWidth.value = parseFloat(strokeWidthAttr);
    opacity.value = parseFloat(opacityAttr);

    const transform = shape.getAttribute('transform') || '';
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);

    if (rotateMatch) {
      const angle = parseFloat(rotateMatch[1].split(' ')[0]);
      rotation.value = angle;
    } else {
      rotation.value = 0;
    }

    if (scaleMatch) {
      const scaleFactor = parseFloat(scaleMatch[1]);
      scale.value = scaleFactor;
    } else {
      scale.value = 1;
    }

    if (shape.tagName.toLowerCase() === 'line') {
      const start = shape.getAttribute('marker-start');
      const end = shape.getAttribute('marker-end');
      let mode: 'none' | 'start' | 'end' | 'both' = 'none';
      if (start && end) mode = 'both';
      else if (end) mode = 'end';
      else if (start) mode = 'start';
      arrowMode.value = mode;
      if (tab.value !== 'shape') tab.value = 'shape';
    } else {
      arrowMode.value = 'none';
    }
  },
  { immediate: true }
);

const handleFillChange = (color: string) => {
  fillColor.value = color;
  props.onFillChange?.(color);
};

const handleStrokeChange = (color: string) => {
  strokeColor.value = color;
  props.onStrokeChange?.(color);
};

const handleStrokeWidth = (value: string) => {
  const parsed = parseFloat(value || '0');
  strokeWidth.value = parsed;
  props.onStrokeWidthChange?.(parsed);
};

const handleRotation = (value: string) => {
  const parsed = parseFloat(value || '0');
  rotation.value = parsed;
  props.onRotationChange?.(parsed);
};

const handleScale = (value: string) => {
  const parsed = parseFloat(value || '1');
  scale.value = parsed;
  props.onScaleChange?.(parsed);
};

const handleOpacityInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const parsed = parseFloat(target.value);
  opacity.value = parsed;
  props.onOpacityChange?.(parsed);
};

const toggleFill = (event: Event) => {
  const target = event.target as HTMLInputElement;
  fillEnabled.value = target.checked;
  if (target.checked) handleFillChange(fillColor.value);
  else handleFillChange('none');
};

const toggleStroke = (event: Event) => {
  const target = event.target as HTMLInputElement;
  strokeEnabled.value = target.checked;
  if (target.checked) handleStrokeChange(strokeColor.value);
  else handleStrokeChange('none');
};

const handleArrowSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const mode = target.value as 'none' | 'start' | 'end' | 'both';
  arrowMode.value = mode;
  props.onArrowChange?.(mode);
};

const onDelete = () => props.onDelete?.();
const onDuplicate = () => props.onDuplicate?.();
const onBringToFront = () => props.onBringToFront?.();
const onSendToBack = () => props.onSendToBack?.();
</script>
