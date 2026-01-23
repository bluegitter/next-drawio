import type React from 'react';
import type { CanvasComponentProps, SVGShape } from '../types';
import { useCanvasControllerBase } from './useCanvasControllerBase';
import { useCanvasControllerActions } from './useCanvasControllerActions';

interface UseCanvasControllerArgs {
  props: CanvasComponentProps;
  updateCylinderPath: (shape: SVGShape) => void;
  updateCloudPath: (shape: SVGShape) => void;
  state: {
    svgRef: React.RefObject<SVGSVGElement>;
    shapes: SVGShape[];
    shapesRef: React.MutableRefObject<SVGShape[]>;
    setShapes: React.Dispatch<React.SetStateAction<SVGShape[]>>;
    selectedIds: Set<string>;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedIdsRef: React.MutableRefObject<Set<string>>;
    selectedShape: string | null;
    setSelectedShape: (id: string | null) => void;
    setSelectedShapes: (ids: string[] | Set<string>) => void;
    history: any[];
    setHistory: React.Dispatch<React.SetStateAction<any[]>>;
    historyIndex: number;
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
    setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
    setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
    setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
    setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
    tempLine: SVGElement | null;
    setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
    shapeIdCounter: React.MutableRefObject<number>;
    methodsRef: React.MutableRefObject<any>;
    portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
    connectorHandleRef: React.MutableRefObject<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
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
    getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  };
}

export const useCanvasController = ({ props, updateCylinderPath, updateCloudPath, state }: UseCanvasControllerArgs) => {
  const base = useCanvasControllerBase({ props, state });
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
