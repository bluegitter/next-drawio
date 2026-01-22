import { useCallback } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseLayeringArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  selectedShape: string | null;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
}

export const useLayering = ({
  svgRef,
  shapes,
  selectedIds,
  selectedShape,
  setShapesState,
  saveToHistory,
}: UseLayeringArgs) => {
  const bringToFront = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;
    const target = shapes.find(shape => shape.id === selectedShape);
    if (!target) return;

    svgRef.current.appendChild(target.element);
    const reordered = [...shapes.filter(shape => shape.id !== selectedShape), target];
    setShapesState(() => reordered);
    saveToHistory(reordered, selectedIds);
  }, [saveToHistory, selectedIds, selectedShape, setShapesState, shapes, svgRef]);

  const sendToBack = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;
    const target = shapes.find(shape => shape.id === selectedShape);
    if (!target) return;

    svgRef.current.insertBefore(target.element, svgRef.current.firstChild);
    const reordered = [target, ...shapes.filter(shape => shape.id !== selectedShape)];
    setShapesState(() => reordered);
    saveToHistory(reordered, selectedIds);
  }, [saveToHistory, selectedIds, selectedShape, setShapesState, shapes, svgRef]);

  const moveForward = useCallback(() => {
    if (selectedIds.size === 0 || !svgRef.current) return;
    const ids = Array.from(selectedIds);
    const next = [...shapes];
    let changed = false;
    ids.forEach(id => {
      const idx = next.findIndex(s => s.id === id);
      if (idx >= 0 && idx < next.length - 1) {
        const [item] = next.splice(idx, 1);
        next.splice(idx + 1, 0, item);
        const afterSibling = item.element.nextSibling ? item.element.nextSibling.nextSibling : null;
        svgRef.current!.insertBefore(item.element, afterSibling);
        changed = true;
      }
    });
    if (changed) {
      setShapesState(() => next);
      saveToHistory(next, selectedIds);
    }
  }, [saveToHistory, selectedIds, setShapesState, shapes, svgRef]);

  const moveBackward = useCallback(() => {
    if (selectedIds.size === 0 || !svgRef.current) return;
    const ids = Array.from(selectedIds);
    const next = [...shapes];
    let changed = false;
    ids.forEach(id => {
      const idx = next.findIndex(s => s.id === id);
      if (idx > 0) {
        const [item] = next.splice(idx, 1);
        next.splice(idx - 1, 0, item);
        const prevSibling = item.element.previousSibling;
        if (prevSibling) {
          svgRef.current!.insertBefore(item.element, prevSibling);
        }
        changed = true;
      }
    });
    if (changed) {
      setShapesState(() => next);
      saveToHistory(next, selectedIds);
    }
  }, [saveToHistory, selectedIds, setShapesState, shapes, svgRef]);

  return {
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
  };
};
