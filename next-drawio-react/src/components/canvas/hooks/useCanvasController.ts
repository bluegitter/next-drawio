import type { CanvasComponentProps, SVGShape } from '../canvas-types';
import type { CanvasState } from './useCanvasState';
import { useCanvasControllerBase } from './useCanvasControllerBase';
import { useCanvasControllerActions } from './useCanvasControllerActions';

interface UseCanvasControllerArgs {
  props: CanvasComponentProps;
  updateCylinderPath: (shape: SVGShape) => void;
  updateCloudPath: (shape: SVGShape) => void;
  state: CanvasState;
}

export const useCanvasController = ({ props, updateCylinderPath, updateCloudPath, state }: UseCanvasControllerArgs) => {
  const base = useCanvasControllerBase({ props, state }) as {
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
    derived: {
      groupSelectionBounds: { x: number; y: number; w: number; h: number } | null;
      polylineHandles: Array<{ shapeId: string; index: number; x: number; y: number }>;
    };
  };

  const actions = useCanvasControllerActions({
    props,
    updateCylinderPath,
    updateCloudPath,
    state,
    base,
  });

  return {
    ...base,
    ...actions,
  };
};
