import { useEffect } from 'react';
import { useKeyboardShortcuts as useKeyboardShortcutsCore } from '@drawio/core';

export type UseKeyboardShortcutsArgs = Parameters<typeof useKeyboardShortcutsCore>[0];

export const useKeyboardShortcuts = (args: UseKeyboardShortcutsArgs) => {
  const { bind } = useKeyboardShortcutsCore(args);

  useEffect(() => {
    return bind();
  }, [bind]);
};
