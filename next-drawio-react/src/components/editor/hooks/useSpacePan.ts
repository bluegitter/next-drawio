import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

type VirtualPanController = {
  canPanX: boolean;
  canPanY: boolean;
  getOffset: () => { x: number; y: number };
  setOffset: (next: { x: number; y: number }) => void;
};

type UseSpacePanOptions = {
  virtualPan?: VirtualPanController;
};

export const useSpacePan = (
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  options?: UseSpacePanOptions
) => {
  const isSpacePressedRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const spaceScrollLockRef = useRef<{ bodyOverflow: string; docOverflow: string } | null>(null);
  const virtualPanRef = useRef<VirtualPanController | undefined>(options?.virtualPan);
  const virtualStartRef = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    virtualPanRef.current = options?.virtualPan;
  }, [options?.virtualPan]);

  useEffect(() => {
    const isSpaceKey = (e: KeyboardEvent) =>
      e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
    const shouldIgnore = (e: KeyboardEvent) =>
      (e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable="true"]');
    const lockScroll = () => {
      if (spaceScrollLockRef.current) return;
      spaceScrollLockRef.current = {
        bodyOverflow: document.body.style.overflow,
        docOverflow: document.documentElement.style.overflow,
      };
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
    const unlockScroll = () => {
      if (!spaceScrollLockRef.current) return;
      document.body.style.overflow = spaceScrollLockRef.current.bodyOverflow;
      document.documentElement.style.overflow = spaceScrollLockRef.current.docOverflow;
      spaceScrollLockRef.current = null;
    };
    const swallow = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      (e as KeyboardEvent & { returnValue?: boolean }).returnValue = false;
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSpaceKey(e) || shouldIgnore(e)) return;
      swallow(e);
      lockScroll();
      scrollContainerRef.current?.focus();
      if (isSpacePressedRef.current) return;
      isSpacePressedRef.current = true;
      setIsSpacePressed(true);
    };
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isSpaceKey(e) || shouldIgnore(e)) return;
      swallow(e);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isSpaceKey(e) || shouldIgnore(e)) return;
      swallow(e);
      isSpacePressedRef.current = false;
      setIsSpacePressed(false);
      isPanningRef.current = false;
      setIsPanning(false);
      unlockScroll();
    };
    const handleWindowBlur = () => {
      isSpacePressedRef.current = false;
      setIsSpacePressed(false);
      isPanningRef.current = false;
      setIsPanning(false);
      unlockScroll();
    };
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keypress', handleKeyPress, { capture: true });
    document.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keypress', handleKeyPress, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [scrollContainerRef]);

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!isSpacePressedRef.current) return;
      e.preventDefault();
      isPanningRef.current = true;
      setIsPanning(true);
      const virtualPan = virtualPanRef.current;
      if (virtualPan?.canPanX || virtualPan?.canPanY) {
        virtualStartRef.current = virtualPan.getOffset();
      }
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: scroller.scrollLeft,
        scrollTop: scroller.scrollTop,
      };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      e.preventDefault();
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      const virtualPan = virtualPanRef.current;
      if (virtualPan?.canPanX || virtualPan?.canPanY) {
        const current = virtualPan.getOffset();
        const nextX = virtualPan.canPanX ? virtualStartRef.current.x - dx : current.x;
        const nextY = virtualPan.canPanY ? virtualStartRef.current.y - dy : current.y;
        virtualPan.setOffset({ x: nextX, y: nextY });
      }
      if (!virtualPan?.canPanX) {
        scroller.scrollLeft = panStartRef.current.scrollLeft - dx;
      }
      if (!virtualPan?.canPanY) {
        scroller.scrollTop = panStartRef.current.scrollTop - dy;
      }
    };
    const handleMouseUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };
    scroller.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      scroller.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scrollContainerRef]);

  return { isSpacePressed, isPanning };
};
