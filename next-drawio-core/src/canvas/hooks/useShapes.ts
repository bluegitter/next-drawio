import type { ShapeDefinition } from '../../shapes';
import type { SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

export type UseShapesArgs = {
  shapes: MaybeRef<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  shapesRef: RefLike<SVGShape[]>;
  getDef: (shapeOrType: SVGShape | string) => ShapeDefinition | undefined;
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  refreshPortsPosition: (shape: SVGShape) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  showTextSelection: (shape: SVGShape) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
  refreshCornerHandles: (shape: SVGShape) => void;
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
  editingText: MaybeRef<{ id: string; value: string } | null>;
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
  refreshCornerHandles,
  setEditingText,
  editingText,
}: UseShapesArgs) => {
  const applyTransform = (shape: SVGShape, allShapes?: SVGShape[]) => {
    const rotation = shape.data.rotation || 0;
    const scale = shape.data.scale || 1;
    const flipX = shape.data.flipX ? -1 : 1;
    const flipY = shape.data.flipY ? -1 : 1;

    if (rotation === 0 && scale === 1 && !shape.data.flipX && !shape.data.flipY) {
      shape.element.removeAttribute('transform');
    } else {
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
    }

    refreshPortsPosition(shape);

    if (shape.connections) {
      const shapesToSearch = allShapes || getRefValue(shapesRef) || [];
      shape.connections.forEach((connId) => {
        const connLine = shapesToSearch.find((s) => s.id === connId);
        if (connLine) {
          updateConnectionLine(connLine, shape.id, shapesToSearch);
        }
      });
    }
  };

  const updateShapePosition = (shape: SVGShape, dx: number, dy: number) => {
    const def = getDef(shape);
    if (def?.move) def.move(shape, dx, dy);

    refreshPortsPosition(shape);
    applyTransform(shape);

    if (shape.connections) {
      const shapeList = getRefValue(shapes) ?? [];
      shape.connections.forEach((connId) => {
        const connLine = shapeList.find((s) => s.id === connId);
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
      const shapeList = getRefValue(shapes) ?? [];
      shape.connections.forEach((connId) => {
        const connLine = shapeList.find((s) => s.id === connId);
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
    refreshCornerHandles(shape);
    showTextSelection(shape);
    if (shape.connections) {
      const shapeList = getRefValue(shapes) ?? [];
      shape.connections.forEach((connId) => {
        const connLine = shapeList.find((s) => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id);
        }
      });
    }
    saveToHistory(getRefValue(shapes) ?? [], getRefValue(selectedIds) ?? new Set());
  };

  const commitEditingText = (apply: boolean) => {
    const editing = getRefValue(editingText);
    if (!editing) return;
    const { id, value } = editing;
    const shapeList = getRefValue(shapesRef) || getRefValue(shapes) || [];
    if (apply) {
      const shape = shapeList.find((s) => s.id === id);
      if (shape) {
        updateTextContent(shape, value);
      }
    }
    const shape = shapeList.find((s) => s.id === id);
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
