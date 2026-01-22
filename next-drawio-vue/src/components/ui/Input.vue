<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ label }}
    </label>

    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        v-bind="$attrs"
        @input="onInput"
      />

      <button
        v-if="isPassword"
        type="button"
        :disabled="disabled"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        :aria-label="showPassword ? '隐藏密码' : '显示密码'"
        tabindex="-1"
        @click="togglePassword"
      >
        <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
      </button>
    </div>

    <div v-if="error" :id="`${inputId}-error`" class="flex items-center gap-1 text-sm text-destructive">
      <component :is="AlertCircle" class="h-4 w-4" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next';

let inputCounter = 0;
const buildId = () => {
  inputCounter += 1;
  return `input-${inputCounter}`;
};

const props = defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'color';
  disabled?: boolean;
  error?: string;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const inputId = buildId();
const inputRef = ref<HTMLInputElement | null>(null);
const showPassword = ref(false);

const isPassword = computed(() => (props.type ?? 'text') === 'password');
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type ?? 'text'));

const inputClasses = computed(() => {
  const baseClasses = [
    'flex w-full rounded-md border border-input bg-background',
    'px-3 py-2 text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ];

  const sizeClasses: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
    xl: 'h-11 px-4 text-lg',
  };

  const errorClasses = props.error ? ['border-destructive focus-visible:ring-destructive'] : [];

  const classes = [
    ...baseClasses,
    sizeClasses[props.size ?? 'md'],
    ...errorClasses,
    isPassword.value ? 'pr-10' : '',
  ];

  return classes.join(' ');
});

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>
