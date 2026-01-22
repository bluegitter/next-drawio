<template>
  <div class="min-h-screen bg-blue-100 p-8">
    <h1 class="text-2xl font-bold mb-4">调试页面</h1>
    <div class="bg-white p-4 rounded shadow">
      <p>Vue 应用正在运行</p>
      <button @click="count++" class="px-4 py-2 bg-green-500 text-white rounded">
        点击次数: {{ count }}
      </button>
      <p class="mt-4">当前计数: {{ count }}</p>
    </div>
    
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-2">组件状态</h2>
      <ul class="list-disc pl-5">
        <li>TopMenuBar: {{ !!TopMenuBar }}</li>
        <li>Toolbar: {{ !!Toolbar }}</li>
        <li>LeftSidebar: {{ !!LeftSidebar }}</li>
        <li>CanvasArea: {{ !!CanvasArea }}</li>
        <li>PropertyPanel: {{ !!PropertyPanel }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// 尝试导入组件
import TopMenuBar from '@/components/editor/TopMenuBar.vue';
import Toolbar from '@/components/editor/Toolbar.vue';
import LeftSidebar from '@/components/editor/LeftSidebar.vue';
import CanvasArea from '@/components/editor/CanvasArea.vue';
import PropertyPanel from '@/components/PropertyPanel.vue';

const count = ref(0);
</script>