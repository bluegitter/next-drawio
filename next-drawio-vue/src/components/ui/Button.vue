<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    :title="title"
    v-bind="$attrs"
  >
    <span v-if="loading" class="animate-spin" aria-hidden="true">
      <slot name="loader">⏳</slot>
    </span>
    <span v-else-if="icon && iconPosition === 'left'" class="flex-shrink-0" aria-hidden="true">
      <component :is="icon" />
    </span>
    <span :class="loading ? 'opacity-0' : ''">
      <slot />
    </span>
    <span v-if="icon && iconPosition === 'right' && !loading" class="flex-shrink-0" aria-hidden="true">
      <component :is="icon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ComponentVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

type ButtonIconPosition = 'left' | 'right';

const props = defineProps<{
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: any;
  iconPosition?: ButtonIconPosition;
  title?: string;
}>();

const variant = computed(() => props.variant ?? 'default');
const size = computed(() => props.size ?? 'md');
const disabled = computed(() => props.disabled ?? false);
const loading = computed(() => props.loading ?? false);
const iconPosition = computed<ButtonIconPosition>(() => props.iconPosition ?? 'left');

const buttonClasses = computed(() => {
  const base = [
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden',
  ];

  const variantClasses: Record<ComponentVariant, string[]> = {
    default: ['bg-primary text-primary-foreground hover:bg-primary/90', 'focus-visible:ring-primary'],
    primary: ['bg-blue-600 text-white hover:bg-blue-700', 'focus-visible:ring-blue-600'],
    secondary: ['bg-secondary text-secondary-foreground hover:bg-secondary/80', 'focus-visible:ring-secondary'],
    outline: ['border border-input bg-background hover:bg-accent hover:text-accent-foreground', 'focus-visible:ring-accent'],
    ghost: ['hover:bg-accent hover:text-accent-foreground', 'focus-visible:ring-accent'],
    destructive: ['bg-destructive text-destructive-foreground hover:bg-destructive/90', 'focus-visible:ring-destructive'],
  };

  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['h-7 px-2 text-xs', 'gap-1'],
    sm: ['h-8 px-3 text-sm', 'gap-1.5'],
    md: ['h-9 px-4 text-sm', 'gap-2'],
    lg: ['h-10 px-5 text-base', 'gap-2.5'],
    xl: ['h-11 px-6 text-lg', 'gap-3'],
  };

  const classes = [
    ...base,
    ...variantClasses[variant.value],
    sizeClasses[size.value][0],
    sizeClasses[size.value][1],
  ];

  if (props.icon && iconPosition.value === 'left') {
    classes.push('pl-3');
  }
  if (props.icon && iconPosition.value === 'right') {
    classes.push('pr-3');
  }

  return classes.join(' ');
});
</script>
