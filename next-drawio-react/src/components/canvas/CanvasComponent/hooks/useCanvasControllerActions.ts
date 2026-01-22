import type React from 'react';
import type { CanvasComponentProps, SVGShape } from '../types';
import { useSelection } from './useSelection';
import { useShapes } from './useShapes';
import { useShapeCreation } from './useShapeCreation';
import { useImportExport } from './useImportExport';
import { useClipboard } from './useClipboard';
import { useLayering } from './useLayering';
import { useSelectionActions } from './useSelectionActions';
import { useConnectionActions } from './useConnectionActions';
import { useConnections } from './useConnections';
import { useShapeStyles } from './useShapeStyles';
import { useConnectorNodes } from './useConnectorNodes';
import { getConnectorPoints, projectPointToSegment } from '@drawio/core';
import { decodeDataUri, tintDataUri, tintSvgText, toDataUri } from '@drawio/core';

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
  const { onShapeSelect, onClipboardChange } = props;
  const {
    svgRef,
    shapes,
    shapesRef,
    selectedIds,
    setSelectedIds,
    selectedIdsRef,
    selectedShape,
    setSelectedShape,
    setIsConnecting,
    setConnectionStart,
    setConnectionStartPort,
    tempLine,
    setTempLine,
    editingText,
    setEditingText,
    editingInputRef,
    activePortHighlight,
    setActivePortHighlight,
    setHoveredShapeId,
    resizeHandlesRef,
    cornerHandlesRef,
    textSelectionRef,
    handleConnectionRef,
    copyBufferRef,
    setDraggingHandle,
    setIsResizing,
    setResizeHandle,
    setDragStart,
    setDraggingCornerHandle,
    getPointerPosition,
    portElementsRef,
    connectorHandleRef,
  } = state;

  const selectionUi = useSelection({
    svgRef,
    createSVGElement: base.geometry.createSVGElement,
    getBounds: base.geometry.getBounds,
    getDef: base.geometry.getDef,
    getPointerPosition,
    onShapeSelect,
    setSelectedShape,
    setIsResizing,
    setResizeHandle,
    setDragStart,
    setDraggingCornerHandle,
    resizeHandlesRef,
    cornerHandlesRef,
    textSelectionRef,
    editingInputRef,
    setEditingText,
  });

  const shapeCreation = useShapeCreation({
    svgRef,
    shapes,
    createSVGElement: base.geometry.createSVGElement,
    generateId: base.geometry.generateId,
    getDef: base.geometry.getDef,
    getShapeBounds: base.geometry.getShapeBounds,
    getShapeCenter: base.geometry.getShapeCenter,
    getPortPositionById: base.geometry.getPortPositionById,
    setShapesState: base.setShapesState,
    setSelectedShape,
    saveToHistory: base.historyActions.saveToHistory,
    onShapeSelect,
    selectedIds,
    tempLine,
    setTempLine,
    setIsConnecting,
    setConnectionStart,
    setConnectionStartPort,
  });

  const importExport = useImportExport({
    svgRef,
    shapes,
    width: props.width,
    height: props.height,
    backgroundColor: props.backgroundColor || '#ffffff',
    createSVGElement: base.geometry.createSVGElement,
    setShapesState: base.setShapesState,
    setSelectedIds,
    selectedIdsRef,
    setHistory: state.setHistory,
    setHistoryIndex: state.setHistoryIndex,
    onShapeSelect,
    onClipboardChange,
    saveToHistory: base.historyActions.saveToHistory,
  });

  const connectionActions = useConnectionActions({
    svgRef,
    shapes,
    createSVGElement: base.geometry.createSVGElement,
    getPortPositionById: base.geometry.getPortPositionById,
    getShapeCenter: base.geometry.getShapeCenter,
    setIsConnecting,
    setConnectionStart,
    setConnectionStartPort,
    setTempLine,
    setDraggingHandle,
    handleConnectionRef,
  });

  const connections = useConnections({
    svgRef,
    portElementsRef,
    connectorHandleRef,
    activePortHighlight,
    setActivePortHighlight,
    createSVGElement: base.geometry.createSVGElement,
    startConnection: connectionActions.startConnection,
    getConnectorHandleMouseDown: connectionActions.getConnectorHandleMouseDown,
    getBounds: base.geometry.getBounds,
  });

  const shapeOps = useShapes({
    shapes,
    selectedIds,
    shapesRef,
    getDef: base.geometry.getDef,
    getShapeCenter: base.geometry.getShapeCenter,
    refreshPortsPosition: connections.refreshPortsPosition,
    updateConnectionLine: base.geometry.updateConnectionLine,
    saveToHistory: base.historyActions.saveToHistory,
    showTextSelection: selectionUi.showTextSelection,
    refreshResizeHandles: selectionUi.refreshResizeHandles,
    refreshCornerHandles: selectionUi.refreshCornerHandles,
    setEditingText,
    editingText: editingText ? { id: editingText.id, value: (editingText as any).value || '' } : null,
  });

  const selectionActions = useSelectionActions({
    svgRef,
    shapes,
    shapesRef,
    selectedIds,
    selectedIdsRef,
    setShapesState: base.setShapesState,
    setSelectedIds,
    setSelectedShape,
    setHoveredShapeId,
    onShapeSelect,
    saveToHistory: base.historyActions.saveToHistory,
    hidePorts: connections.hidePorts,
    hideConnectorHandles: connections.hideConnectorHandles,
    hideResizeHandles: selectionUi.hideResizeHandles,
    hideCornerHandles: selectionUi.hideCornerHandles,
    hideTextSelection: selectionUi.hideTextSelection,
  });

  const clipboard = useClipboard({
    svgRef,
    shapes,
    selectedIds,
    copyBufferRef,
    createSVGElement: base.geometry.createSVGElement,
    generateId: base.geometry.generateId,
    getDef: base.geometry.getDef,
    getShapeCenter: base.geometry.getShapeCenter,
    getPortPositionById: base.geometry.getPortPositionById,
    applyTransform: shapeOps.applyTransform,
    saveToHistory: base.historyActions.saveToHistory,
    setShapesState: base.setShapesState,
    setSelectedIds,
    onClipboardChange,
    onShapeSelect,
  });

  const layering = useLayering({
    svgRef,
    shapes,
    selectedIds,
    selectedShape,
    setShapesState: base.setShapesState,
    saveToHistory: base.historyActions.saveToHistory,
  });

  const styleActions = useShapeStyles({
    applyTransform: shapeOps.applyTransform,
    updateSelectedShape: selectionActions.updateSelectedShape,
    selectedIds,
    selectedIdsRef,
    shapes,
    shapesRef,
    setShapesState: base.setShapesState,
    saveToHistory: base.historyActions.saveToHistory,
    updateCylinderPath,
    updateCloudPath,
    decodeDataUri,
    tintSvgText,
    toDataUri,
    tintDataUri,
    updateConnectionLine: base.geometry.updateConnectionLine,
  });

  const connectorNodes = useConnectorNodes({
    shapes,
    selectedIds,
    getPointerPosition,
    getConnectorPoints,
    projectPointToSegment,
    updateConnectorPoints: base.geometry.updateConnectorPoints,
    setShapesState: base.setShapesState,
    setSelectedShape,
    onShapeSelect,
    saveToHistory: base.historyActions.saveToHistory,
  });

  return {
    selectionUi,
    shapeOps,
    shapeCreation,
    importExport,
    clipboard,
    layering,
    selectionActions,
    connectionActions,
    connections,
    styleActions,
    connectorNodes,
  };
};
