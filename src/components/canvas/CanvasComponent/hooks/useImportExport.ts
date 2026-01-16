import { useCallback } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseImportExportArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  width: number;
  height: number;
  backgroundColor: string;
  createSVGElement: (tagName: string) => SVGElement | null;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedIdsRef: React.MutableRefObject<Set<string>>;
  setHistory: React.Dispatch<React.SetStateAction<{ shapes: SVGShape[]; selectedIds: string[] }[]>>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  onShapeSelect?: (shape: SVGElement | null) => void;
  onClipboardChange?: (hasClipboard: boolean) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
}

export const useImportExport = ({
  svgRef,
  shapes,
  width,
  height,
  backgroundColor,
  createSVGElement,
  setShapesState,
  setSelectedIds,
  selectedIdsRef,
  setHistory,
  setHistoryIndex,
  onShapeSelect,
  onClipboardChange,
  saveToHistory,
}: UseImportExportArgs) => {
  const exportJson = useCallback(() => {
    const payload = {
      shapes: shapes.map(s => ({
        id: s.id,
        type: s.type,
        data: s.data,
        connections: s.connections,
        element: (s.element as SVGElement).outerHTML,
      })),
    };
    return JSON.stringify(payload);
  }, [shapes]);

  const importJson = useCallback((payload: string) => {
    try {
      const parsed = JSON.parse(payload);
      if (!parsed?.shapes || !Array.isArray(parsed.shapes)) return;
      if (!svgRef.current) return;

      shapes.forEach(s => {
        if (svgRef.current?.contains(s.element)) {
          svgRef.current.removeChild(s.element);
        }
      });

      const parser = new DOMParser();
      const xlinkNS = 'http://www.w3.org/1999/xlink';
      const restored: SVGShape[] = parsed.shapes.map((item: any) => {
        const data = item.data || {};

        let element: SVGElement;
        if (item.type === 'image') {
          const img = createSVGElement('image');
          if (!img) return null as any;
          img.setAttribute('id', item.id);
          if (data.x != null) img.setAttribute('x', String(data.x));
          if (data.y != null) img.setAttribute('y', String(data.y));
          if (data.width != null) img.setAttribute('width', String(data.width));
          if (data.height != null) img.setAttribute('height', String(data.height));
          const hrefVal = data.href || data.originalHref || '';
          img.setAttribute('href', hrefVal);
          img.setAttributeNS(xlinkNS, 'xlink:href', hrefVal);
          img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          if (data.stroke) img.setAttribute('stroke', data.stroke);
          if (data.strokeWidth != null) img.setAttribute('stroke-width', String(data.strokeWidth));
          element = img;
        } else {
          const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${item.element || ''}</svg>`, 'image/svg+xml');
          const el = doc.documentElement.firstElementChild as SVGElement | null;
          element = el || createSVGElement('g')!;
          element.setAttribute('id', item.id);
        }

        svgRef.current!.appendChild(element);
        return {
          id: item.id,
          type: item.type,
          element,
          data,
          connections: item.connections,
        } as SVGShape;
      });

      setShapesState(() => restored);
      const initSelected = new Set<string>();
      setSelectedIds(initSelected);
      selectedIdsRef.current = initSelected;
      setHistory([{ shapes: restored, selectedIds: [] }]);
      setHistoryIndex(0);
      onShapeSelect?.(null);
      onClipboardChange?.(false);
      saveToHistory(restored, []);
    } catch (err) {
      console.error('Failed to import json', err);
    }
  }, [createSVGElement, onClipboardChange, onShapeSelect, saveToHistory, setHistory, setHistoryIndex, setSelectedIds, setShapesState, selectedIdsRef, shapes, svgRef]);

  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (!svgRef.current) return;

    switch (format) {
      case 'svg': {
        const svgData = new XMLSerializer().serializeToString(svgRef.current!);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const svgLink = document.createElement('a');
        svgLink.download = 'canvas.svg';
        svgLink.href = svgUrl;
        svgLink.click();
        URL.revokeObjectURL(svgUrl);
        break;
      }
      case 'png':
      case 'jpg': {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const svgString = new XMLSerializer().serializeToString(svgRef.current);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.download = `canvas.${format}`;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, `image/${format}`, format === 'jpg' ? 0.8 : 1);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        break;
      }
    }
  }, [backgroundColor, height, width, svgRef]);

  return {
    exportJson,
    importJson,
    exportCanvas,
  };
};
