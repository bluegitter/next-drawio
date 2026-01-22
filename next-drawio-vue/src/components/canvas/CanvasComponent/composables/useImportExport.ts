import type { Ref } from 'vue';
import type { HistoryState, SVGShape } from '../types';

type UseImportExportArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  width: number;
  height: number;
  backgroundColor: string;
  createSVGElement: (tagName: string) => SVGElement | null;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: (next: Set<string>) => void;
  selectedIdsRef: { value: Set<string> };
  setHistory: (next: HistoryState[]) => void;
  setHistoryIndex: (next: number) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  onClipboardChange?: (hasClipboard: boolean) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
};

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
  const parsePointsString = (points: string) => {
    return points
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [x, y] = pair.split(',').map(Number);
        return { x, y };
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  };

  const getPointsArray = (points: any): Array<{ x: number; y: number }> => {
    if (!points) return [];
    if (typeof points === 'string') return parsePointsString(points);
    if (Array.isArray(points)) {
      return points
        .map((p: any) => ({ x: Number(p.x ?? p[0]), y: Number(p.y ?? p[1]) }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    }
    return [];
  };

  const applyCommonAttributes = (el: SVGElement, data: any) => {
    if (data.fill != null) el.setAttribute('fill', String(data.fill));
    if (data.stroke != null) el.setAttribute('stroke', String(data.stroke));
    if (data.strokeWidth != null) el.setAttribute('stroke-width', String(data.strokeWidth));
    if (data.opacity != null) el.setAttribute('opacity', String(data.opacity));
    el.setAttribute('cursor', 'move');
  };

  const applyTransformFromData = (el: SVGElement, type: string, data: any) => {
    const rotation = data.rotation || 0;
    const scale = data.scale || 1;
    const flipX = data.flipX ? -1 : 1;
    const flipY = data.flipY ? -1 : 1;
    if (rotation === 0 && scale === 1 && flipX === 1 && flipY === 1) return;

    let cx = 0;
    let cy = 0;
    if (type === 'rect' || type === 'roundedRect') {
      cx = (data.x || 0) + (data.width || 0) / 2;
      cy = (data.y || 0) + (data.height || 0) / 2;
    } else if (type === 'circle') {
      cx = data.x || 0;
      cy = data.y || 0;
    } else if (type === 'ellipse') {
      cx = data.cx || 0;
      cy = data.cy || 0;
    } else if (type === 'line') {
      cx = ((data.x1 || 0) + (data.x2 || 0)) / 2;
      cy = ((data.y1 || 0) + (data.y2 || 0)) / 2;
    } else if (type === 'text') {
      cx = (data.x || 0) + (data.width || 0) / 2;
      cy = (data.y || 0) + (data.height || 0) / 2;
    } else {
      const pts = getPointsArray(data.points);
      if (pts.length) {
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      }
    }

    const transforms = [
      `translate(${cx} ${cy})`,
      rotation !== 0 ? `rotate(${rotation})` : null,
      scale !== 1 || flipX !== 1 || flipY !== 1 ? `scale(${scale * flipX} ${scale * flipY})` : null,
      `translate(${-cx} ${-cy})`,
    ].filter((value): value is string => Boolean(value));

    if (transforms.length) {
      el.setAttribute('transform', transforms.join(' '));
    }
  };

  const buildElementFromData = (type: string, data: any) => {
    if (!data) return null;
    const create = (tag: string) => createSVGElement(tag);
    const setLineMarkers = (el: SVGElement) => {
      const mode = data.arrowMode || 'none';
      const start = mode === 'start' || mode === 'both' ? 'url(#arrow-start-marker)' : '';
      const end = mode === 'end' || mode === 'both' ? 'url(#arrow-end-marker)' : '';
      if (start) el.setAttribute('marker-start', start);
      else el.removeAttribute('marker-start');
      if (end) el.setAttribute('marker-end', end);
      else el.removeAttribute('marker-end');
    };

    switch (type) {
      case 'rect':
      case 'roundedRect': {
        const rect = create('rect');
        if (!rect) return null;
        rect.setAttribute('x', String(data.x || 0));
        rect.setAttribute('y', String(data.y || 0));
        rect.setAttribute('width', String(data.width || 0));
        rect.setAttribute('height', String(data.height || 0));
        if (type === 'roundedRect') {
          const r = data.cornerRadius || 0;
          rect.setAttribute('rx', String(r));
          rect.setAttribute('ry', String(r));
        }
        applyCommonAttributes(rect, data);
        applyTransformFromData(rect, type, data);
        return rect;
      }
      case 'circle': {
        const circle = create('circle');
        if (!circle) return null;
        circle.setAttribute('cx', String(data.x || 0));
        circle.setAttribute('cy', String(data.y || 0));
        circle.setAttribute('r', String(data.radius || 0));
        applyCommonAttributes(circle, data);
        applyTransformFromData(circle, type, data);
        return circle;
      }
      case 'ellipse': {
        const ellipse = create('ellipse');
        if (!ellipse) return null;
        ellipse.setAttribute('cx', String(data.cx || 0));
        ellipse.setAttribute('cy', String(data.cy || 0));
        ellipse.setAttribute('rx', String(data.rx || 0));
        ellipse.setAttribute('ry', String(data.ry || 0));
        applyCommonAttributes(ellipse, data);
        applyTransformFromData(ellipse, type, data);
        return ellipse;
      }
      case 'triangle': {
        const poly = create('polygon');
        if (!poly) return null;
        if (data.points) poly.setAttribute('points', String(data.points));
        applyCommonAttributes(poly, data);
        applyTransformFromData(poly, type, data);
        return poly;
      }
      case 'line': {
        const line = create('line');
        if (!line) return null;
        line.setAttribute('x1', String(data.x1 || 0));
        line.setAttribute('y1', String(data.y1 || 0));
        line.setAttribute('x2', String(data.x2 || 0));
        line.setAttribute('y2', String(data.y2 || 0));
        applyCommonAttributes(line, data);
        setLineMarkers(line);
        applyTransformFromData(line, type, data);
        return line;
      }
      case 'polyline':
      case 'connector': {
        const polyline = create('polyline');
        if (!polyline) return null;
        const points = data.points || `${data.x1 || 0},${data.y1 || 0} ${data.x2 || 0},${data.y2 || 0}`;
        polyline.setAttribute('points', String(points));
        polyline.setAttribute('fill', 'none');
        applyCommonAttributes(polyline, data);
        applyTransformFromData(polyline, type, data);
        return polyline;
      }
      case 'text': {
        const foreign = create('foreignObject') as SVGForeignObjectElement | null;
        if (!foreign) return null;
        foreign.setAttribute('x', String(data.x || 0));
        foreign.setAttribute('y', String(data.y || 0));
        foreign.setAttribute('width', String(data.width || 0));
        foreign.setAttribute('height', String(data.height || 0));
        foreign.setAttribute('cursor', 'move');
        const div = document.createElement('div');
        div.textContent = data.text || '';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        if (data.fontSize != null) div.style.fontSize = `${data.fontSize}px`;
        if (data.fontFamily) div.style.fontFamily = data.fontFamily;
        if (data.fontWeight) div.style.fontWeight = String(data.fontWeight);
        if (data.fontStyle) div.style.fontStyle = String(data.fontStyle);
        if (data.letterSpacing) div.style.letterSpacing = String(data.letterSpacing);
        if (data.lineHeight) div.style.lineHeight = String(data.lineHeight);
        if (data.color || data.fill) div.style.color = String(data.color || data.fill);
        foreign.appendChild(div);
        applyTransformFromData(foreign, type, data);
        return foreign;
      }
      default: {
        const points = getPointsArray(data.points);
        if (points.length) {
          const path = create('path');
          if (!path) return null;
          const d = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          path.setAttribute('d', d);
          applyCommonAttributes(path, data);
          applyTransformFromData(path, type, data);
          return path;
        }
      }
    }
    return null;
  };

  const exportJson = () => {
    const payload = {
      shapes: shapes.value.map((s) => ({
        id: s.id,
        type: s.type,
        data: s.data,
        connections: s.connections,
        element: (s.element as SVGElement).outerHTML,
      })),
    };
    return JSON.stringify(payload);
  };

  const importJson = (payload: string) => {
    try {
      const parsed = JSON.parse(payload);
      if (!parsed?.shapes || !Array.isArray(parsed.shapes)) return;
      if (!svgRef.value) return;

      shapes.value.forEach((s) => {
        if (svgRef.value?.contains(s.element)) {
          svgRef.value.removeChild(s.element);
        }
      });

      const parser = new DOMParser();
      const parseElement = (raw: string) => {
        if (!raw) return null;
        const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${raw}</svg>`, 'image/svg+xml');
        if (doc.getElementsByTagName('parsererror').length) return null;
        const el = doc.documentElement.firstElementChild as SVGElement | null;
        return el ? (document.importNode(el, true) as SVGElement) : null;
      };
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
          element = buildElementFromData(item.type, data) || parseElement(item.element || '') || createSVGElement('g')!;
          element.setAttribute('id', item.id);
        }

        svgRef.value!.appendChild(element);
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
      selectedIdsRef.value = initSelected;
      setHistory([{ shapes: restored, selectedIds: [] }]);
      setHistoryIndex(0);
      onShapeSelect?.(null);
      onClipboardChange?.(false);
      saveToHistory(restored, []);
    } catch (err) {
      console.error('Failed to import json', err);
    }
  };

  const exportCanvas = (format: 'png' | 'jpg' | 'svg') => {
    if (!svgRef.value) return;

    switch (format) {
      case 'svg': {
        const svgData = new XMLSerializer().serializeToString(svgRef.value);
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

        const svgString = new XMLSerializer().serializeToString(svgRef.value);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `canvas.${format}`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
              }
            },
            `image/${format}`,
            format === 'jpg' ? 0.8 : 1
          );
        };
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
        break;
      }
    }
  };

  return {
    exportJson,
    importJson,
    exportCanvas,
  };
};
