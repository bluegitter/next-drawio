import { computed } from 'vue';
import { useCanvasDerived as useCanvasDerivedCore } from '@drawio/core';

export type UseCanvasDerivedArgs = Parameters<typeof useCanvasDerivedCore>[0];

export const useCanvasDerived = (args: UseCanvasDerivedArgs) => {
  const derived = computed(() => useCanvasDerivedCore(args));

  return {
    groupSelectionBounds: computed(() => derived.value.groupSelectionBounds),
    polylineHandles: computed(() => derived.value.polylineHandles),
  };
};
