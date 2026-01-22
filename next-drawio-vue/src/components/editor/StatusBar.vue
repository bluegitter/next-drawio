<template>
  <div class="bg-white border-t border-gray-200 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-lg">＋</span>
      <span>第 1 页 ▼</span>
    </div>
    <div class="text-gray-500">画布: {{ canvasWidth }} × {{ canvasHeight }}px · 当前工具: {{ currentTool }}</div>
    <div class="text-gray-500">支持网格、对齐、自由绘制</div>
  </div>
</template>

<script setup lang="ts">
import type { ToolType } from '@drawio/core';

defineProps<{
  canvasWidth: number;
  canvasHeight: number;
  currentTool: ToolType;
}>();
</script>
