import type { Ref } from 'vue';
import type { ShapeDefinition } from '@drawio/core';
import type { SVGShape } from '../types';

type UseShapesArgs = {
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  shapesRef: { value: SVGShape[] };
  getDef: (shapeOrType: SVGShape | string) => ShapeDefinition | undefined;
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  refreshPortsPosition: (shape: SVGShape) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  showTextSelection: (shape: SVGShape) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
  setEditingText: (next: {
    id: string;
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    letterSpacing?: string;
    lineHeight?: string;
    color?: string;
  } | null) => void;
  editingText: Ref<{ id: string; value: string } | null>;
};

export const useShapes = ({
  shapes,
  selectedIds,
  shapesRef,
  getDef,
  getShapeCenter,
  refreshPortsPosition,
  updateConnectionLine,
  saveToHistory,
  showTextSelection,
  refreshResizeHandles,
  setEditingText,
  editingText,
}: UseShapesArgs) => {
  const applyTransform = (shape: SVGShape) => {
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const flipX = shape.data.flipX ? -1 : 1;
    const flipY = shape.data.flipY ? -1 : 1;

    if (rotation === 0 && scale === 1 && !shape.data.flipX && !shape.data.flipY) {
      shape.element.removeAttribute('transform');
      return;
    }

    const center = getShapeCenter(shape);
    const transforms = [
      `translate(${center.x} ${center.y})`,
      rotation !== 0 ? `rotate(${rotation})` : null,
      scale !== 1 || flipX !== 1 || flipY !== 1 ? `scale(${scale * flipX} ${scale * flipY})` : null,
      `translate(${-center.x} ${-center.y})`,
    ].filter((value): value is string => Boolean(value));

    if (transforms.length) {
      shape.element.setAttribute('transform', transforms.join(' '));
    }
  };

  const updateShapePosition = (shape: SVGShape, dx: number, dy: number) => {
    const def = getDef(shape);
    if (def?.move) def.move(shape, dx, dy);

    refreshPortsPosition(shape);
    applyTransform(shape);

    if (shape.connections) {
      shape.connections.forEach((connId) => {
        const connLine = shapes.value.find((s) => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
  };

  const updateShapeSize = (shape: SVGShape, handle: string, dx: number, dy: number) => {
    const def = getDef(shape);
    if (def?.resize) def.resize(shape, handle, dx, dy);
    refreshPortsPosition(shape);
    applyTransform(shape);
    if (shape.connections) {
      shape.connections.forEach((connId) => {
        const connLine = shapes.value.find((s) => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
  };

  const updateTextContent = (shape: SVGShape, content: string) => {
    if (shape.type !== 'text') return;
    const safeText = content || shape.data.text || '';
    if (shape.element instanceof SVGForeignObjectElement) {
      const div = shape.element.firstChild as HTMLElement | null;
      if (div) div.textContent = safeText;
    } else {
      shape.element.textContent = safeText;
    }
    shape.data.text = safeText;
    refreshResizeHandles(shape);
    showTextSelection(shape);
    if (shape.connections) {
      shape.connections.forEach((connId) => {
        const connLine = shapes.value.find((s) => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
    saveToHistory(shapes.value, selectedIds.value);
  };

  const commitEditingText = (apply: boolean) => {
    if (!editingText.value) return;
    const { id, value } = editingText.value;
    if (apply) {
      const shape = shapesRef.value.find((s) => s.id === id) || shapes.value.find((s) => s.id === id);
      if (shape) {
        updateTextContent(shape, value);
      }
    }
    const shape = shapesRef.value.find((s) => s.id === id) || shapes.value.find((s) => s.id === id);
    if (shape) {
      const prev = (shape.element as any).dataset?.prevOpacity;
      shape.element.style.opacity = prev ?? '';
      if ((shape.element as any).dataset) delete (shape.element as any).dataset.prevOpacity;
    }
    setEditingText(null);
  };

  return {
    applyTransform,
    updateShapePosition,
    updateShapeSize,
    updateTextContent,
    commitEditingText,
  };
};
