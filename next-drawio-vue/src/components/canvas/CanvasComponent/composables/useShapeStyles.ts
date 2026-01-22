import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseShapeStylesArgs = {
  applyTransform: (shape: SVGShape) => void;
  updateSelectedShape: (updater: (shape: SVGShape) => void) => void;
  selectedIds: Ref<Set<string>>;
  selectedIdsRef: { value: Set<string> };
  shapes: Ref<SVGShape[]>;
  shapesRef: { value: SVGShape[] };
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  updateCylinderPath: (shape: SVGShape) => void;
  updateCloudPath: (shape: SVGShape) => void;
  decodeDataUri: (data: string) => string;
  tintSvgText: (svgText: string, color: string) => string;
  toDataUri: (svgText: string) => string;
  tintDataUri: (dataUri: string, color: string) => string;
};

export const useShapeStyles = ({
  applyTransform,
  updateSelectedShape,
  selectedIds,
  selectedIdsRef,
  shapes,
  shapesRef,
  setShapesState,
  saveToHistory,
  updateCylinderPath,
  updateCloudPath,
  decodeDataUri,
  tintSvgText,
  toDataUri,
  tintDataUri,
}: UseShapeStylesArgs) => {
  const rotateSelected = (angle: number) => {
    updateSelectedShape((shape) => {
      shape.data.rotation = angle;
      applyTransform(shape);
    });
  };

  const rotateSelectedBy = (delta: number) => {
    updateSelectedShape((shape) => {
      const current = shape.data.rotation || 0;
      shape.data.rotation = current + delta;
      applyTransform(shape);
    });
  };

  const flipSelectedHorizontal = () => {
    updateSelectedShape((shape) => {
      shape.data.flipX = !shape.data.flipX;
      applyTransform(shape);
    });
  };

  const flipSelectedVertical = () => {
    updateSelectedShape((shape) => {
      shape.data.flipY = !shape.data.flipY;
      applyTransform(shape);
    });
  };

  const scaleSelected = (scale: number) => {
    const safeScale = Math.max(0.1, scale);
    updateSelectedShape((shape) => {
      shape.data.scale = safeScale;
      applyTransform(shape);
    });
  };

  const updateLineMarkers = (shape: SVGShape) => {
    if (shape.type !== 'line') return;
    const mode = shape.data.arrowMode || 'none';
    const el = shape.element as SVGLineElement;
    const start = mode === 'start' || mode === 'both' ? 'url(#arrow-start-marker)' : '';
    const end = mode === 'end' || mode === 'both' ? 'url(#arrow-end-marker)' : '';
    if (start) el.setAttribute('marker-start', start);
    else el.removeAttribute('marker-start');
    if (end) el.setAttribute('marker-end', end);
    else el.removeAttribute('marker-end');
    shape.data.arrowMode = mode;
  };

  const changeSelectedFill = (color: string) => {
    const targetIds = selectedIdsRef.value.size ? selectedIdsRef.value : selectedIds.value;
    if (targetIds.size === 0) return;
    const currentShapes = shapesRef.value;
    const updatedShapes = currentShapes.map((shape) => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data } };
      nextShape.data.fill = color;
      if (nextShape.type === 'line' || nextShape.type === 'polyline' || nextShape.type === 'connector') {
        nextShape.element.setAttribute('fill', 'none');
      } else if (nextShape.type === 'image') {
        const originalSvg = nextShape.data.originalSvgText || decodeDataUri(nextShape.data.originalHref || nextShape.data.href || '');
        if (originalSvg) {
          const tintedText = tintSvgText(originalSvg, color);
          const tintedUri = toDataUri(tintedText);
          if (tintedUri) {
            nextShape.data.href = tintedUri;
            (nextShape.element as SVGImageElement).setAttribute('href', tintedUri);
            (nextShape.element as SVGImageElement).setAttributeNS('http://www.w3.org/1999/xlink', 'href', tintedUri);
          }
        } else {
          const href = nextShape.data.originalHref || nextShape.data.href || '';
          const tinted = tintDataUri(href, color);
          nextShape.data.href = tinted;
          (nextShape.element as SVGImageElement).setAttribute('href', tinted);
          (nextShape.element as SVGImageElement).setAttributeNS('http://www.w3.org/1999/xlink', 'href', tinted);
        }
      } else if (nextShape.type === 'cylinder') {
        nextShape.data.fill = color;
        updateCylinderPath(nextShape);
      } else if (nextShape.type === 'cloud') {
        nextShape.data.fill = color;
        updateCloudPath(nextShape);
      } else {
        nextShape.element.setAttribute('fill', color);
      }
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  };

  const changeSelectedStroke = (color: string) => {
    const targetIds = selectedIdsRef.value.size ? selectedIdsRef.value : selectedIds.value;
    if (targetIds.size === 0) return;
    const updatedShapes = shapes.value.map((shape) => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data, stroke: color } };
      if (nextShape.type === 'cylinder') {
        updateCylinderPath(nextShape);
      } else if (nextShape.type === 'cloud') {
        updateCloudPath(nextShape);
      } else {
        nextShape.element.setAttribute('stroke', color);
      }
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  };

  const changeSelectedStrokeWidth = (width: number) => {
    const targetIds = selectedIdsRef.value.size ? selectedIdsRef.value : selectedIds.value;
    if (targetIds.size === 0) return;
    const updatedShapes = shapes.value.map((shape) => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data, strokeWidth: width } };
      if (nextShape.type === 'cylinder') {
        updateCylinderPath(nextShape);
      } else if (nextShape.type === 'cloud') {
        updateCloudPath(nextShape);
      } else {
        nextShape.element.setAttribute('stroke-width', String(width));
      }
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  };

  const changeSelectedArrow = (mode: 'none' | 'start' | 'end' | 'both') => {
    const targetIds = selectedIdsRef.value.size ? selectedIdsRef.value : selectedIds.value;
    if (targetIds.size === 0) return;
    const updatedShapes = shapes.value.map((shape) => {
      if (!targetIds.has(shape.id)) return shape;
      if (shape.type !== 'line') return shape;
      const nextShape = { ...shape, data: { ...shape.data, arrowMode: mode } };
      updateLineMarkers(nextShape);
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  };

  const changeSelectedOpacity = (opacity: number) => {
    const targetIds = selectedIdsRef.value.size ? selectedIdsRef.value : selectedIds.value;
    if (targetIds.size === 0) return;
    const safeOpacity = Math.min(1, Math.max(0, opacity));
    const updatedShapes = shapes.value.map((shape) => {
      if (!targetIds.has(shape.id)) return shape;
      const nextShape = { ...shape, data: { ...shape.data, opacity: safeOpacity } };
      if (nextShape.type === 'cylinder') {
        updateCylinderPath(nextShape);
      } else if (nextShape.type === 'cloud') {
        updateCloudPath(nextShape);
      } else {
        nextShape.element.setAttribute('opacity', String(safeOpacity));
      }
      return nextShape;
    });
    setShapesState(() => updatedShapes);
    saveToHistory(updatedShapes, targetIds);
  };

  return {
    rotateSelected,
    rotateSelectedBy,
    flipSelectedHorizontal,
    flipSelectedVertical,
    scaleSelected,
    changeSelectedFill,
    changeSelectedStroke,
    changeSelectedStrokeWidth,
    changeSelectedArrow,
    changeSelectedOpacity,
  };
};
