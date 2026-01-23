import { onBeforeUnmount, onMounted } from 'vue';
import { useKeyboardShortcuts as useKeyboardShortcutsCore } from '@drawio/core';

export type UseKeyboardShortcutsArgs = Parameters<typeof useKeyboardShortcutsCore>[0];

export const useKeyboardShortcuts = (args: UseKeyboardShortcutsArgs) => {
  const { bind } = useKeyboardShortcutsCore(args);

  let cleanup: (() => void) | null = null;
  onMounted(() => {
    cleanup = bind();
  });

  onBeforeUnmount(() => {
    cleanup?.();
  });
};
