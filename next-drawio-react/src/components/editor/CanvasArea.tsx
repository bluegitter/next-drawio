import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import CanvasComponent from '@/components/CanvasComponent';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';
import { useSpacePan } from '@/components/editor/hooks/useSpacePan';

type CanvasAreaProps = {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<CanvasComponentRef | null>;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  showGrid: boolean;
  backgroundColor: string;
  gridBg: string;
  zoom: number;
  pageWidth: number;
  pageHeight: number;
  pageCountX: number;
  pageCountY: number;
  pageOffsetXPages: number;
  pageOffsetYPages: number;
  onBoundsChange: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
  onReady: (canvas: SVGSVGElement, methods: CanvasComponentRef) => void;
  onError: (error: Error) => void;
  onShapeSelect: (shape: SVGElement | null) => void;
  onCanvasChange: () => void;
  onClipboardChange: (hasClipboard: boolean) => void;
};

export default function CanvasArea({
  scrollContainerRef,
  canvasRef,
  onContextMenu,
  onDrop,
  onDragOver,
  showGrid,
  backgroundColor,
  gridBg,
  zoom,
  pageWidth,
  pageHeight,
  pageCountX,
  pageCountY,
  pageOffsetXPages,
  pageOffsetYPages,
  onBoundsChange,
  onReady,
  onError,
  onShapeSelect,
  onCanvasChange,
  onClipboardChange,
}: CanvasAreaProps) {
  const scaledWidth = pageWidth * pageCountX * zoom;
  const scaledHeight = pageHeight * pageCountY * zoom;
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef(panOffset);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useLayoutEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    const updateSize = () => {
      setViewportSize({ width: scroller.clientWidth, height: scroller.clientHeight });
    };
    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(scroller);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [scrollContainerRef]);

  const canScrollX = scaledWidth > viewportSize.width;
  const canScrollY = scaledHeight > viewportSize.height;
  const shouldCenterX = scaledWidth > 0 && scaledWidth < viewportSize.width;
  const shouldCenterY = scaledHeight > 0 && scaledHeight < viewportSize.height;
  const virtualPan = useMemo(() => ({
    canPanX: !canScrollX && !shouldCenterX,
    canPanY: !canScrollY && !shouldCenterY,
    getOffset: () => panOffsetRef.current,
    setOffset: (next: { x: number; y: number }) => setPanOffset(next),
  }), [canScrollX, canScrollY, shouldCenterX, shouldCenterY]);

  const { isSpacePressed, isPanning } = useSpacePan(scrollContainerRef, { virtualPan });

  useEffect(() => {
    if (!isSpacePressed || shouldCenterX || shouldCenterY) {
      setPanOffset({ x: 0, y: 0 });
      return;
    }
    setPanOffset(prev => ({
      x: canScrollX ? 0 : prev.x,
      y: canScrollY ? 0 : prev.y,
    }));
  }, [canScrollX, canScrollY, isSpacePressed, shouldCenterX, shouldCenterY]);
  const paddingLeft = shouldCenterX ? 0 : 24;
  const paddingRight = shouldCenterX ? 0 : 16;
  const paddingTop = shouldCenterY ? 0 : 16;
  const paddingBottom = shouldCenterY ? 0 : 16;

  return (
    <div
      className={`flex-1 bg-[#eaeaea] overflow-auto flex ${isPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : '')}`}
      style={{
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        justifyContent: shouldCenterX ? 'center' : 'flex-start',
        alignItems: shouldCenterY ? 'center' : 'flex-start',
      }}
      ref={scrollContainerRef}
      tabIndex={0}
      onContextMenu={onContextMenu}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div
        className="relative"
        style={{
          backgroundColor: '#ffffff',
          transform: panOffset.x || panOffset.y ? `translate(${panOffset.x}px, ${panOffset.y}px)` : undefined,
          width: scaledWidth,
          height: scaledHeight,
        }}
      >
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: '#ffffff',
              backgroundImage: `url(${gridBg})`,
              backgroundPosition: '-1px -1px',
              overflow: 'hidden',
              zIndex: 0,
              width: scaledWidth,
              height: scaledHeight,
            }}
          />
        )}
        <CanvasComponent
          ref={canvasRef}
          width={pageWidth * pageCountX}
          height={pageHeight * pageCountY}
          backgroundColor={showGrid ? 'transparent' : backgroundColor}
          disableSelectionBox={isSpacePressed}
          disableShapeSelection={isSpacePressed}
          disableShapeHover={isSpacePressed}
          pageWidth={pageWidth}
          pageCountX={pageCountX}
          pageOffsetXPages={pageOffsetXPages}
          pageHeight={pageHeight}
          pageCountY={pageCountY}
          pageOffsetYPages={pageOffsetYPages}
          onBoundsChange={onBoundsChange}
          onReady={onReady}
          onError={onError}
          onShapeSelect={onShapeSelect}
          onCanvasChange={onCanvasChange}
          onClipboardChange={onClipboardChange}
          autoResize={false}
        />
      </div>
    </div>
  );
}
