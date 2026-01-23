export type RefLike<T> = { current?: T | null; value?: T | null };
export type MaybeRef<T> = T | RefLike<T>;

export const getRefValue = <T>(source: MaybeRef<T> | null | undefined): T | null => {
  if (!source) return null;
  if (typeof source === 'object' && ('current' in source || 'value' in source)) {
    const ref = source as RefLike<T>;
    return (ref.current ?? ref.value ?? null) as T | null;
  }
  return source as T;
};

export const setRefValue = <T>(ref: RefLike<T> | null | undefined, value: T | null): void => {
  if (!ref) return;
  if ('current' in ref) {
    ref.current = value;
    return;
  }
  if ('value' in ref) {
    ref.value = value;
  }
};
