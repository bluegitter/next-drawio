import type { CanvasComponentProps, SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';
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
import { getConnectorPoints, projectPointToSegment } from '../utils/points';
import { decodeDataUri, tintDataUri, tintSvgText, toDataUri } from '../utils/svgDataUri';

export type UseCanvasControllerActionsArgs = {
  props: CanvasComponentProps;
  updateCylinderPath: (shape: SVGShape) => void;
  updateCloudPath: (shape: SVGShape) => void;
  state: {
    svgRef: RefLike<SVGSVGElement>;
    shapes: MaybeRef<SVGShape[]>;
    shapesRef: RefLike<SVGShape[]>;
    selectedIds: MaybeRef<Set<string>>;
    setSelectedIds: (next: Set<string>) => void;
    selectedIdsRef: RefLike<Set<string>>;
    selectedShape: MaybeRef<string | null>;
    setSelectedShape: (id: string | null) => void;
    setHistory: (next: any[]) => void;
    setHistoryIndex: (next: number) => void;
    setIsConnecting: (next: boolean) => void;
    setConnectionStart: (next: string | null) => void;
    setConnectionStartPort: (next: string | null) => void;
    tempLine: MaybeRef<SVGElement | null>;
    setTempLine: (next: SVGElement | null) => void;
    editingText: MaybeRef<{ id: string } | null>;
    setEditingText: (next: any) => void;
    editingInputRef: RefLike<HTMLInputElement>;
    activePortHighlight: MaybeRef<{ shapeId: string; portId: string } | null>;
    setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
    setHoveredShapeId: (next: string | null) => void;
    resizeHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
    cornerHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
    textSelectionRef: RefLike<Map<string, SVGRectElement>>;
    handleConnectionRef: RefLike<boolean>;
    copyBufferRef: RefLike<{ ids: string[]; shapes: SVGShape[] } | null>;
    setDraggingHandle: (next: { connectorId: string; end: 'start' | 'end'; original: any } | null) => void;
    setIsResizing: (next: boolean) => void;
    setResizeHandle: (next: string | null) => void;
    setDragStart: (next: { x: number; y: number }) => void;
    setDraggingCornerHandle: (next: { shapeId: string; handleType: string; startCornerRadius: number } | null) => void;
    getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
    portElementsRef: RefLike<Map<string, SVGCircleElement[]>>;
    connectorHandleRef: RefLike<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
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
};

export const useCanvasControllerActions = ({
  props,
  updateCylinderPath,
  updateCloudPath,
  state,
  base,
}: UseCanvasControllerActionsArgs) => {
  const { onShapeSelect, onClipboardChange } = props;

  const selectionUi = useSelection({
    svgRef: state.svgRef,
    createSVGElement: base.geometry.createSVGElement,
    getBounds: base.geometry.getBounds,
    getDef: base.geometry.getDef,
    getPointerPosition: state.getPointerPosition,
    onShapeSelect,
    setSelectedShape: state.setSelectedShape,
    setIsResizing: state.setIsResizing,
    setResizeHandle: state.setResizeHandle,
    setDragStart: state.setDragStart,
    setDraggingCornerHandle: state.setDraggingCornerHandle,
    resizeHandlesRef: state.resizeHandlesRef,
    cornerHandlesRef: state.cornerHandlesRef,
    textSelectionRef: state.textSelectionRef,
    editingInputRef: state.editingInputRef,
    setEditingText: state.setEditingText,
  });

  const shapeCreation = useShapeCreation({
    svgRef: state.svgRef,
    shapes: state.shapes,
    createSVGElement: base.geometry.createSVGElement,
    generateId: base.geometry.generateId,
    getDef: base.geometry.getDef,
    getShapeBounds: base.geometry.getShapeBounds,
    getShapeCenter: base.geometry.getShapeCenter,
    getPortPositionById: base.geometry.getPortPositionById,
    setShapesState: base.setShapesState,
    setSelectedShape: state.setSelectedShape,
    saveToHistory: base.historyActions.saveToHistory,
    onShapeSelect,
    selectedIds: state.selectedIds,
    tempLine: state.tempLine,
    setTempLine: state.setTempLine,
    setIsConnecting: state.setIsConnecting,
    setConnectionStart: state.setConnectionStart,
    setConnectionStartPort: state.setConnectionStartPort,
  });

  const importExport = useImportExport({
    svgRef: state.svgRef,
    shapes: state.shapes,
    width: props.width,
    height: props.height,
    backgroundColor: props.backgroundColor || '#ffffff',
    createSVGElement: base.geometry.createSVGElement,
    setShapesState: base.setShapesState,
    setSelectedIds: state.setSelectedIds,
    selectedIdsRef: state.selectedIdsRef,
    setHistory: state.setHistory,
    setHistoryIndex: state.setHistoryIndex,
    onShapeSelect,
    onClipboardChange,
    saveToHistory: base.historyActions.saveToHistory,
  });

  const connectionActions = useConnectionActions({
    svgRef: state.svgRef,
    shapes: state.shapes,
    createSVGElement: base.geometry.createSVGElement,
    getPortPositionById: base.geometry.getPortPositionById,
    getShapeCenter: base.geometry.getShapeCenter,
    setIsConnecting: state.setIsConnecting,
    setConnectionStart: state.setConnectionStart,
    setConnectionStartPort: state.setConnectionStartPort,
    setTempLine: state.setTempLine,
    setDraggingHandle: state.setDraggingHandle,
    handleConnectionRef: state.handleConnectionRef,
  });

  const connections = useConnections({
    svgRef: state.svgRef,
    portElementsRef: state.portElementsRef,
    connectorHandleRef: state.connectorHandleRef,
    activePortHighlight: state.activePortHighlight,
    setActivePortHighlight: state.setActivePortHighlight,
    createSVGElement: base.geometry.createSVGElement,
    startConnection: connectionActions.startConnection,
    getConnectorHandleMouseDown: connectionActions.getConnectorHandleMouseDown,
    getBounds: base.geometry.getBounds,
  });

  const editing = getRefValue(state.editingText);
  const shapeOps = useShapes({
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    shapesRef: state.shapesRef,
    getDef: base.geometry.getDef,
    getShapeCenter: base.geometry.getShapeCenter,
    refreshPortsPosition: connections.refreshPortsPosition,
    updateConnectionLine: base.geometry.updateConnectionLine,
    saveToHistory: base.historyActions.saveToHistory,
    showTextSelection: selectionUi.showTextSelection,
    refreshResizeHandles: selectionUi.refreshResizeHandles,
    refreshCornerHandles: selectionUi.refreshCornerHandles,
    setEditingText: state.setEditingText,
    editingText: editing ? { id: (editing as any).id, value: (editing as any).value || '' } : null,
  });

  const selectionActions = useSelectionActions({
    svgRef: state.svgRef,
    shapes: state.shapes,
    shapesRef: state.shapesRef,
    selectedIds: state.selectedIds,
    selectedIdsRef: state.selectedIdsRef,
    setShapesState: base.setShapesState,
    setSelectedIds: state.setSelectedIds,
    setSelectedShape: state.setSelectedShape,
    setHoveredShapeId: state.setHoveredShapeId,
    onShapeSelect,
    saveToHistory: base.historyActions.saveToHistory,
    hidePorts: connections.hidePorts,
    hideConnectorHandles: connections.hideConnectorHandles,
    hideResizeHandles: selectionUi.hideResizeHandles,
    hideCornerHandles: selectionUi.hideCornerHandles,
    hideTextSelection: selectionUi.hideTextSelection,
  });

  const clipboard = useClipboard({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    copyBufferRef: state.copyBufferRef,
    createSVGElement: base.geometry.createSVGElement,
    generateId: base.geometry.generateId,
    getDef: base.geometry.getDef,
    getShapeCenter: base.geometry.getShapeCenter,
    getPortPositionById: base.geometry.getPortPositionById,
    applyTransform: shapeOps.applyTransform,
    saveToHistory: base.historyActions.saveToHistory,
    setShapesState: base.setShapesState,
    setSelectedIds: state.setSelectedIds,
    onClipboardChange,
    onShapeSelect,
  });

  const layering = useLayering({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    selectedShape: state.selectedShape,
    setShapesState: base.setShapesState,
    saveToHistory: base.historyActions.saveToHistory,
  });

  const styleActions = useShapeStyles({
    applyTransform: shapeOps.applyTransform,
    updateSelectedShape: selectionActions.updateSelectedShape,
    selectedIds: state.selectedIds,
    selectedIdsRef: state.selectedIdsRef,
    shapes: state.shapes,
    shapesRef: state.shapesRef,
    setShapesState: base.setShapesState,
    saveToHistory: base.historyActions.saveToHistory,
    updateCloudPath,
    updateCylinderPath,
    decodeDataUri,
    tintSvgText,
    toDataUri,
    tintDataUri,
    updateConnectionLine: base.geometry.updateConnectionLine,
    refreshCornerHandles: selectionUi.refreshCornerHandles,
  });

  const connectorNodes = useConnectorNodes({
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    getPointerPosition: state.getPointerPosition,
    getConnectorPoints,
    projectPointToSegment,
    updateConnectorPoints: base.geometry.updateConnectorPoints,
    setShapesState: base.setShapesState,
    setSelectedShape: state.setSelectedShape,
    onShapeSelect,
    saveToHistory: base.historyActions.saveToHistory,
  });

  return {
    selectionUi,
    shapeCreation,
    importExport,
    clipboard,
    layering,
    styleActions,
    connectionActions,
    connections,
    selectionActions,
    shapeOps,
    connectorNodes,
    derived: base.derived,
  };
};
