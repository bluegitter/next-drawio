import { watch } from 'vue';
import { useBoundsChange as useBoundsChangeCore } from '@drawio/core';

export type UseBoundsChangeArgs = Parameters<typeof useBoundsChangeCore>[0];

export const useBoundsChange = (args: UseBoundsChangeArgs) => {
  const checkBounds = useBoundsChangeCore(args);
  watch(
    () => (args.shapes as { value?: unknown }).value,
    () => {
      checkBounds();
    }
  );
};
