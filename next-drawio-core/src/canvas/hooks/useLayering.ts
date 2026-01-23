import type { SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

type UseLayeringArgs = {
  svgRef: RefLike<SVGSVGElement>;
  shapes: MaybeRef<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  selectedShape: MaybeRef<string | null>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
};

export const useLayering = ({
  svgRef,
  shapes,
  selectedIds,
  selectedShape,
  setShapesState,
  saveToHistory,
}: UseLayeringArgs) => {
  const bringToFront = () => {
    const svg = getRefValue(svgRef);
    const activeId = getRefValue(selectedShape);
    const shapeList = getRefValue(shapes) ?? [];
    if (!activeId || !svg) return;
    const target = shapeList.find((shape) => shape.id === activeId);
    if (!target) return;

    svg.appendChild(target.element);
    const reordered = [...shapeList.filter((shape) => shape.id !== activeId), target];
    setShapesState(() => reordered);
    saveToHistory(reordered, getRefValue(selectedIds) ?? new Set<string>());
  };

  const sendToBack = () => {
    const svg = getRefValue(svgRef);
    const activeId = getRefValue(selectedShape);
    const shapeList = getRefValue(shapes) ?? [];
    if (!activeId || !svg) return;
    const target = shapeList.find((shape) => shape.id === activeId);
    if (!target) return;

    svg.insertBefore(target.element, svg.firstChild);
    const reordered = [target, ...shapeList.filter((shape) => shape.id !== activeId)];
    setShapesState(() => reordered);
    saveToHistory(reordered, getRefValue(selectedIds) ?? new Set<string>());
  };

  const moveForward = () => {
    const svg = getRefValue(svgRef);
    const selected = getRefValue(selectedIds) ?? new Set<string>();
    const shapeList = getRefValue(shapes) ?? [];
    if (selected.size === 0 || !svg) return;
    const ids = Array.from(selected);
    const next = [...shapeList];
    let changed = false;
    ids.forEach((id) => {
      const idx = next.findIndex((s) => s.id === id);
      if (idx >= 0 && idx < next.length - 1) {
        const [item] = next.splice(idx, 1);
        next.splice(idx + 1, 0, item);
        const afterSibling = item.element.nextSibling ? item.element.nextSibling.nextSibling : null;
        svg.insertBefore(item.element, afterSibling);
        changed = true;
      }
    });
    if (changed) {
      setShapesState(() => next);
      saveToHistory(next, selected);
    }
  };

  const moveBackward = () => {
    const svg = getRefValue(svgRef);
    const selected = getRefValue(selectedIds) ?? new Set<string>();
    const shapeList = getRefValue(shapes) ?? [];
    if (selected.size === 0 || !svg) return;
    const ids = Array.from(selected);
    const next = [...shapeList];
    let changed = false;
    ids.forEach((id) => {
      const idx = next.findIndex((s) => s.id === id);
      if (idx > 0) {
        const [item] = next.splice(idx, 1);
        next.splice(idx - 1, 0, item);
        const prevSibling = item.element.previousSibling;
        if (prevSibling) {
          svg.insertBefore(item.element, prevSibling);
        }
        changed = true;
      }
    });
    if (changed) {
      setShapesState(() => next);
      saveToHistory(next, selected);
    }
  };

  return {
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
  };
};
