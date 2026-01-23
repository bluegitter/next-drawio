import { watchEffect } from 'vue';
import { useCanvasInteractions as useCanvasInteractionsCore } from '@drawio/core';

export type UseCanvasInteractionsArgs = Parameters<typeof useCanvasInteractionsCore>[0];

export const useCanvasInteractions = (args: UseCanvasInteractionsArgs) => {
  const interactions = useCanvasInteractionsCore(args);

  watchEffect((onCleanup) => {
    onCleanup(interactions.bindShapeEvents());
  });

  return interactions;
};
