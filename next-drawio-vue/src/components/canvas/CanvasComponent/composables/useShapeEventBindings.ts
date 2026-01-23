import { watchEffect } from 'vue';
import { useShapeEventBindings as useShapeEventBindingsCore } from '@drawio/core';

export type UseShapeEventBindingsArgs = Parameters<typeof useShapeEventBindingsCore>[0];

export const useShapeEventBindings = (args: UseShapeEventBindingsArgs) => {
  const bind = useShapeEventBindingsCore(args);

  watchEffect((onCleanup) => {
    onCleanup(bind());
  });
};
