import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

type VirtualPanController = {
  canPanX: boolean;
  canPanY: boolean;
  getOffset: () => { x: number; y: number };
  setOffset: (next: { x: number; y: number }) => void;
};

type UseSpacePanOptions = {
  virtualPan?: Ref<VirtualPanController>;
};

export const useSpacePan = (
  scrollContainerRef: Ref<HTMLDivElement | null>,
  options?: UseSpacePanOptions
) => {
  const isSpacePressed = ref(false);
  const isPanning = ref(false);
  const isSpacePressedRef = ref(false);
  const isPanningRef = ref(false);
  const panStartRef = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const spaceScrollLockRef = ref<{ bodyOverflow: string; docOverflow: string } | null>(null);
  const virtualPanRef = ref<VirtualPanController | undefined>(options?.virtualPan?.value);
  const virtualStartRef = ref({ x: 0, y: 0 });

  watch(
    () => options?.virtualPan?.value,
    (value) => {
      virtualPanRef.value = value;
    }
  );

  const isSpaceKey = (e: KeyboardEvent) => e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
  const shouldIgnore = (e: KeyboardEvent) =>
    (e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable="true"]');

  const lockScroll = () => {
    if (spaceScrollLockRef.value) return;
    spaceScrollLockRef.value = {
      bodyOverflow: document.body.style.overflow,
      docOverflow: document.documentElement.style.overflow,
    };
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    if (!spaceScrollLockRef.value) return;
    document.body.style.overflow = spaceScrollLockRef.value.bodyOverflow;
    document.documentElement.style.overflow = spaceScrollLockRef.value.docOverflow;
    spaceScrollLockRef.value = null;
  };

  const swallow = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e as KeyboardEvent & { returnValue?: boolean }).returnValue = false;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isSpaceKey(e) || shouldIgnore(e)) return;
    swallow(e);
    lockScroll();
    scrollContainerRef.value?.focus();
    if (isSpacePressedRef.value) return;
    isSpacePressedRef.value = true;
    isSpacePressed.value = true;
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isSpaceKey(e) || shouldIgnore(e)) return;
    swallow(e);
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!isSpaceKey(e) || shouldIgnore(e)) return;
    swallow(e);
    isSpacePressedRef.value = false;
    isSpacePressed.value = false;
    isPanningRef.value = false;
    isPanning.value = false;
    unlockScroll();
  };

  const handleWindowBlur = () => {
    isSpacePressedRef.value = false;
    isSpacePressed.value = false;
    isPanningRef.value = false;
    isPanning.value = false;
    unlockScroll();
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!isSpacePressedRef.value) return;
    const scroller = scrollContainerRef.value;
    if (!scroller) return;
    e.preventDefault();
    isPanningRef.value = true;
    isPanning.value = true;
    const virtualPan = virtualPanRef.value;
    if (virtualPan?.canPanX || virtualPan?.canPanY) {
      virtualStartRef.value = virtualPan.getOffset();
    }
    panStartRef.value = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanningRef.value) return;
    const scroller = scrollContainerRef.value;
    if (!scroller) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.value.x;
    const dy = e.clientY - panStartRef.value.y;
    const virtualPan = virtualPanRef.value;
    if (virtualPan?.canPanX || virtualPan?.canPanY) {
      const current = virtualPan.getOffset();
      const nextX = virtualPan.canPanX ? virtualStartRef.value.x - dx : current.x;
      const nextY = virtualPan.canPanY ? virtualStartRef.value.y - dy : current.y;
      virtualPan.setOffset({ x: nextX, y: nextY });
    }
    if (!virtualPan?.canPanX) {
      scroller.scrollLeft = panStartRef.value.scrollLeft - dx;
    }
    if (!virtualPan?.canPanY) {
      scroller.scrollTop = panStartRef.value.scrollTop - dy;
    }
  };

  const handleMouseUp = () => {
    isPanningRef.value = false;
    isPanning.value = false;
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keypress', handleKeyPress, { capture: true });
    document.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleWindowBlur);

    const scroller = scrollContainerRef.value;
    if (scroller) {
      scroller.addEventListener('mousedown', handleMouseDown);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('keypress', handleKeyPress, { capture: true });
    document.removeEventListener('keyup', handleKeyUp, { capture: true });
    window.removeEventListener('blur', handleWindowBlur);

    const scroller = scrollContainerRef.value;
    if (scroller) {
      scroller.removeEventListener('mousedown', handleMouseDown);
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  return { isSpacePressed, isPanning };
};
