import type React from 'react';
import type { CanvasComponentProps, SVGShape } from '../types';
import { useCanvasControllerActions as useCanvasControllerActionsCore } from '@drawio/core';

interface UseCanvasControllerActionsArgs {
  props: CanvasComponentProps;
  updateCylinderPath: (shape: SVGShape) => void;
  updateCloudPath: (shape: SVGShape) => void;
  state: {
    svgRef: React.RefObject<SVGSVGElement>;
    shapes: SVGShape[];
    shapesRef: React.MutableRefObject<SVGShape[]>;
    selectedIds: Set<string>;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedIdsRef: React.MutableRefObject<Set<string>>;
    selectedShape: string | null;
    setSelectedShape: (id: string | null) => void;
    setHistory: React.Dispatch<React.SetStateAction<any[]>>;
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
    setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
    setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
    setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
    tempLine: SVGElement | null;
    setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
    editingText: { id: string } | null;
    setEditingText: React.Dispatch<React.SetStateAction<any>>;
    editingInputRef: React.RefObject<HTMLInputElement>;
    activePortHighlight: { shapeId: string; portId: string } | null;
    setActivePortHighlight: React.Dispatch<React.SetStateAction<{ shapeId: string; portId: string } | null>>;
    setHoveredShapeId: React.Dispatch<React.SetStateAction<string | null>>;
    resizeHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
    cornerHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
    textSelectionRef: React.MutableRefObject<Map<string, SVGRectElement>>;
    handleConnectionRef: React.MutableRefObject<boolean>;
    copyBufferRef: React.MutableRefObject<{ ids: string[]; shapes: SVGShape[] } | null>;
    setDraggingHandle: React.Dispatch<React.SetStateAction<{ connectorId: string; end: 'start' | 'end'; original: any } | null>>;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
    setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
    getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
    portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
    connectorHandleRef: React.MutableRefObject<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
  };
  base: {
    setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
    historyActions: {
      saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
    };
    geometry: {
      createSVGElement: (tagName: string) => SVGElement | null;
      generateId: () => string;
      getDef: (shapeOrType: SVGShape | string) => any;
      getShapeCenter: (shape: SVGShape) => { x: number; y: number };
      getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
      getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
      getBounds: (shape: SVGShape) => { x: number; y: number; w: number; h: number };
      updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
      updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
    };
  };
}

export const useCanvasControllerActions = ({ props, updateCylinderPath, updateCloudPath, state, base }: UseCanvasControllerActionsArgs) => {
  return useCanvasControllerActionsCore({
    props,
    updateCylinderPath,
    updateCloudPath,
    state: {
      ...state,
      setSelectedIds: (next) => state.setSelectedIds(next),
      setHistory: state.setHistory,
      setHistoryIndex: state.setHistoryIndex,
      setIsConnecting: state.setIsConnecting,
      setConnectionStart: state.setConnectionStart,
      setConnectionStartPort: state.setConnectionStartPort,
      setTempLine: state.setTempLine,
      setEditingText: state.setEditingText,
      setActivePortHighlight: state.setActivePortHighlight,
      setHoveredShapeId: state.setHoveredShapeId,
      setDraggingHandle: state.setDraggingHandle,
      setIsResizing: state.setIsResizing,
      setResizeHandle: state.setResizeHandle,
      setDragStart: state.setDragStart,
      setDraggingCornerHandle: state.setDraggingCornerHandle,
    },
    base,
  });
};
