import type { CanvasComponentProps, SVGShape } from '../canvas-types';
import type { CanvasState } from './useCanvasState';
import { useCanvasControllerActions as useCanvasControllerActionsCore } from '@drawio/core';

interface UseCanvasControllerActionsArgs {
  props: CanvasComponentProps;
  updateCylinderPath: (shape: SVGShape) => void;
  updateCloudPath: (shape: SVGShape) => void;
  state: CanvasState;
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
      viewBoxMinX: { value: state.viewBoxMinX },
      viewBoxMinY: { value: state.viewBoxMinY },
    },
    base: {
      ...base,
      derived: (base as any).derived || {
        groupSelectionBounds: null,
        polylineHandles: [],
      },
    },
  });
};