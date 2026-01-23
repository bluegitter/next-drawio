import { onBeforeUnmount, onMounted } from 'vue';
import { usePointerUp as usePointerUpCore } from '@drawio/core';

export type UsePointerUpArgs = Parameters<typeof usePointerUpCore>[0];

export const usePointerUp = (args: UsePointerUpArgs) => {
  const { handleMouseUp, onWindowMouseUp } = usePointerUpCore(args);

  onMounted(() => {
    window.addEventListener('mouseup', onWindowMouseUp);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', onWindowMouseUp);
  });

  return {
    handleMouseUp,
  };
};
