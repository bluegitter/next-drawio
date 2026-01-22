import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseLayeringArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  selectedShape: Ref<string | null>;
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
    if (!selectedShape.value || !svgRef.value) return;
    const target = shapes.value.find((shape) => shape.id === selectedShape.value);
    if (!target) return;

    svgRef.value.appendChild(target.element);
    const reordered = [...shapes.value.filter((shape) => shape.id !== selectedShape.value), target];
    setShapesState(() => reordered);
    saveToHistory(reordered, selectedIds.value);
  };

  const sendToBack = () => {
    if (!selectedShape.value || !svgRef.value) return;
    const target = shapes.value.find((shape) => shape.id === selectedShape.value);
    if (!target) return;

    svgRef.value.insertBefore(target.element, svgRef.value.firstChild);
    const reordered = [target, ...shapes.value.filter((shape) => shape.id !== selectedShape.value)];
    setShapesState(() => reordered);
    saveToHistory(reordered, selectedIds.value);
  };

  const moveForward = () => {
    if (selectedIds.value.size === 0 || !svgRef.value) return;
    const ids = Array.from(selectedIds.value);
    const next = [...shapes.value];
    let changed = false;
    ids.forEach((id) => {
      const idx = next.findIndex((s) => s.id === id);
      if (idx >= 0 && idx < next.length - 1) {
        const [item] = next.splice(idx, 1);
        next.splice(idx + 1, 0, item);
        const afterSibling = item.element.nextSibling ? item.element.nextSibling.nextSibling : null;
        svgRef.value!.insertBefore(item.element, afterSibling);
        changed = true;
      }
    });
    if (changed) {
      setShapesState(() => next);
      saveToHistory(next, selectedIds.value);
    }
  };

  const moveBackward = () => {
    if (selectedIds.value.size === 0 || !svgRef.value) return;
    const ids = Array.from(selectedIds.value);
    const next = [...shapes.value];
    let changed = false;
    ids.forEach((id) => {
      const idx = next.findIndex((s) => s.id === id);
      if (idx > 0) {
        const [item] = next.splice(idx, 1);
        next.splice(idx - 1, 0, item);
        const prevSibling = item.element.previousSibling;
        if (prevSibling) {
          svgRef.value!.insertBefore(item.element, prevSibling);
        }
        changed = true;
      }
    });
    if (changed) {
      setShapesState(() => next);
      saveToHistory(next, selectedIds.value);
    }
  };

  return {
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
  };
};
