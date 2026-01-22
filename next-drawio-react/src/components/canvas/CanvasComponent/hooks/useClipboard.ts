import { useCallback } from 'react';
import type React from 'react';
import type { ShapeDefinition } from '@drawio/core';
import { getPortsForShape } from '@drawio/core';
import type { SVGShape } from '../types';
import { formatPoints, parsePoints } from '@drawio/core';

interface UseClipboardArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  copyBufferRef: React.MutableRefObject<{ ids: string[]; shapes: SVGShape[] } | null>;
  createSVGElement: (tagName: string) => SVGElement | null;
  generateId: () => string;
  getDef: (shapeOrType: SVGShape | string) => ShapeDefinition | undefined;
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
  applyTransform: (shape: SVGShape) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onClipboardChange?: (hasClipboard: boolean) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
}

export const useClipboard = ({
  svgRef,
  shapes,
  selectedIds,
  copyBufferRef,
  createSVGElement,
  generateId,
  getDef,
  getShapeCenter,
  getPortPositionById,
  applyTransform,
  saveToHistory,
  setShapesState,
  setSelectedIds,
  onClipboardChange,
  onShapeSelect,
}: UseClipboardArgs) => {
  const cloneShapeWithDef = useCallback((shape: SVGShape, offset: number) => {
    const def = getDef(shape);
    if (!def?.clone) {
      const cloned = {
        ...shape,
        data: { ...shape.data },
        connections: shape.connections ? [...shape.connections] : [],
      } as SVGShape;
      if (def?.move) {
        def.move(cloned, offset, offset);
      } else {
        if ('x' in cloned.data && 'y' in cloned.data) {
          cloned.data.x = (cloned.data.x || 0) + offset;
          cloned.data.y = (cloned.data.y || 0) + offset;
          cloned.element.setAttribute('x', String(cloned.data.x));
          cloned.element.setAttribute('y', String(cloned.data.y));
        }
      }
      return cloned;
    }
    return def.clone(shape, { createSVGElement, generateId }, offset) as SVGShape;
  }, [createSVGElement, generateId, getDef]);

  const cloneShapeForClipboard = useCallback((shape: SVGShape) => {
    return {
      ...shape,
      element: shape.element.cloneNode(true) as SVGElement,
      data: { ...shape.data },
      connections: shape.connections ? [...shape.connections] : [],
    };
  }, []);

  const buildClipboardSnapshot = useCallback((selection: Set<string>, source: SVGShape[]) => {
    const copyIds = new Set(selection);
    source.forEach(shape => {
      if ((shape.type === 'line' || shape.type === 'connector') && shape.connections?.length === 2) {
        const [from, to] = shape.connections as Array<string | null | undefined>;
        if (from && to && selection.has(from) && selection.has(to)) {
          copyIds.add(shape.id);
        }
      }
    });
    const snapshotShapes = source.filter(s => copyIds.has(s.id)).map(cloneShapeForClipboard);
    return { ids: Array.from(copyIds), shapes: snapshotShapes };
  }, [cloneShapeForClipboard]);

  const duplicateSelected = useCallback((ids?: Set<string> | string[], sourceShapesOverride?: SVGShape[]) => {
    const targetIds = ids ? (ids instanceof Set ? ids : new Set(ids)) : selectedIds;
    if (targetIds.size === 0 || !svgRef.current) return;

    const sourceShapes = sourceShapesOverride ?? shapes;
    const offset = 20;
    const idMap = new Map<string, string>();
    const newShapes: SVGShape[] = [];
    const ctxShapes = [...sourceShapes];
    const attachConnectionToNewShape = (shapeId: string, connId: string) => {
      const idx = newShapes.findIndex(s => s.id === shapeId);
      if (idx >= 0) {
        const target = newShapes[idx];
        const conns = target.connections ? [...target.connections] : [];
        if (!conns.includes(connId)) {
          newShapes[idx] = { ...target, connections: [...conns, connId] };
        }
      }
    };

    sourceShapes.forEach(sourceShape => {
      if (!targetIds.has(sourceShape.id)) return;
      const isConnectionLine = (sourceShape.type === 'line' || sourceShape.type === 'connector') && (sourceShape.connections?.some(Boolean));
      if (sourceShape.type === 'connector' || isConnectionLine) return;

      const duplicatedShape = cloneShapeWithDef(sourceShape, offset);
      idMap.set(sourceShape.id, duplicatedShape.id);
      applyTransform(duplicatedShape);
      svgRef.current!.appendChild(duplicatedShape.element);
      newShapes.push(duplicatedShape);
    });

    sourceShapes.forEach(sourceShape => {
      if (!targetIds.has(sourceShape.id)) return;
      if (sourceShape.type !== 'line' && sourceShape.type !== 'connector') return;

      const [from, to] = (sourceShape.connections || []) as Array<string | null | undefined>;
      if (!from || !to) {
        const duplicatedShape = cloneShapeWithDef(sourceShape, offset);
        idMap.set(sourceShape.id, duplicatedShape.id);
        applyTransform(duplicatedShape);
        svgRef.current!.appendChild(duplicatedShape.element);
        newShapes.push(duplicatedShape);
        return;
      }

      const newFrom = idMap.get(from);
      const newTo = idMap.get(to);
      if (!newFrom || !newTo) return;

      const fromShape = [...newShapes, ...ctxShapes].find(s => s.id === newFrom);
      const toShape = [...newShapes, ...ctxShapes].find(s => s.id === newTo);
      if (!fromShape || !toShape) return;

      const connector = createSVGElement('polyline');
      if (!connector || !svgRef.current) return;
      const newId = generateId();
      connector.setAttribute('id', newId);
      connector.setAttribute('stroke', sourceShape.data.stroke);
      connector.setAttribute('stroke-width', String(sourceShape.data.strokeWidth || 2));
      connector.setAttribute('fill', 'none');
      connector.setAttribute('cursor', 'pointer');

      const resolvePort = (shape: SVGShape, originalPortId?: string | null) => {
        const ports = getPortsForShape(shape);
        if (originalPortId) {
          const byExact = ports.find(p => p.id === originalPortId);
          if (byExact) return byExact;
          const suffix = originalPortId.split('-port-')[1];
          if (suffix) {
            const bySuffix = ports.find(p => p.id.endsWith(suffix) || (p as any).position === suffix);
            if (bySuffix) return bySuffix;
          }
          const byPosition = ports.find(p => (p as any).position && originalPortId.endsWith((p as any).position));
          if (byPosition) return byPosition;
        }
        return ports[0] || getShapeCenter(shape);
      };

      const startPortPos = resolvePort(fromShape, sourceShape.data.startPortId);
      const endPortPos = resolvePort(toShape, sourceShape.data.endPortId);
      const resolvedStartPortId = (startPortPos as any)?.id || sourceShape.data.startPortId || null;
      const resolvedEndPortId = (endPortPos as any)?.id || sourceShape.data.endPortId || null;
      const sourcePoints = sourceShape.data.points ? parsePoints(sourceShape.data.points) : [];
      const hasMidpoints = sourcePoints.length > 2;
      const dx = (startPortPos.x - (sourceShape.data.x1 || 0));
      const dy = (startPortPos.y - (sourceShape.data.y1 || 0));
      const midpoints = hasMidpoints
        ? sourcePoints.slice(1, -1).map(([px, py]) => [px + dx, py + dy] as [number, number])
        : [];
      const pointsString = formatPoints([
        [startPortPos.x, startPortPos.y],
        ...midpoints,
        [endPortPos.x, endPortPos.y],
      ]);
      connector.setAttribute('points', pointsString);

      const duplicatedShape: SVGShape = {
        ...sourceShape,
        id: newId,
        element: connector,
        data: {
          ...sourceShape.data,
          x1: startPortPos.x,
          y1: startPortPos.y,
          x2: endPortPos.x,
          y2: endPortPos.y,
          points: pointsString,
          startPortId: resolvedStartPortId,
          endPortId: resolvedEndPortId,
        },
        connections: [newFrom, newTo],
      };
      svgRef.current.appendChild(connector);
      newShapes.push(duplicatedShape);
      attachConnectionToNewShape(newFrom, newId);
      attachConnectionToNewShape(newTo, newId);
    });

    if (newShapes.length === 0) return;

    const mergedShapes = sourceShapesOverride ? [...shapes, ...newShapes] : [...sourceShapes, ...newShapes];
    setShapesState(() => mergedShapes);
    const newIds = newShapes.map(s => s.id);
    setSelectedIds(new Set(newIds));
    copyBufferRef.current = { ids: newIds, shapes: newShapes.map(cloneShapeForClipboard) };
    onClipboardChange?.((copyBufferRef.current?.ids.length || 0) > 0);
    onShapeSelect?.(mergedShapes.find(s => s.id === newIds[0])?.element || null);
    saveToHistory(mergedShapes, newIds);
    return { ids: newIds, mergedShapes };
  }, [applyTransform, cloneShapeForClipboard, cloneShapeWithDef, createSVGElement, generateId, getShapeCenter, onClipboardChange, onShapeSelect, parsePoints, saveToHistory, selectedIds, setSelectedIds, setShapesState, shapes, svgRef]);

  const copySelection = useCallback(() => {
    if (selectedIds.size === 0) return 0;
    const snapshot = buildClipboardSnapshot(selectedIds, shapes);
    copyBufferRef.current = snapshot;
    onClipboardChange?.(snapshot.ids.length > 0);
    return snapshot.ids.length;
  }, [buildClipboardSnapshot, onClipboardChange, selectedIds, shapes]);

  const pasteClipboard = useCallback(() => {
    if (!copyBufferRef.current || copyBufferRef.current.ids.length === 0) return 0;
    const buffer = copyBufferRef.current;
    const result = duplicateSelected(new Set(buffer.ids), buffer.shapes);
    if (result && result.ids.length) {
      const newSelection = new Set(result.ids);
      const snapshot = buildClipboardSnapshot(newSelection, result.mergedShapes);
      copyBufferRef.current = snapshot.ids.length ? snapshot : { ids: result.ids, shapes: buffer.shapes };
      onClipboardChange?.((copyBufferRef.current?.ids.length || 0) > 0);
      return result.ids.length;
    }
    return 0;
  }, [buildClipboardSnapshot, duplicateSelected, onClipboardChange]);

  const hasClipboard = useCallback(() => {
    return Boolean(copyBufferRef.current && copyBufferRef.current.ids.length > 0);
  }, [copyBufferRef]);

  return {
    duplicateSelected,
    copySelection,
    pasteClipboard,
    hasClipboard,
  };
};
