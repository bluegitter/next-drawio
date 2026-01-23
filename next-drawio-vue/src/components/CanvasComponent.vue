<template>
  <CanvasComponentView
    ref="viewRef"
    :width="width"
    :height="height"
    :zoom="state.zoom.value ?? 1"
    :background-color="backgroundColor"
    :view-box-min-x="state.viewBoxMinX.value"
    :view-box-min-y="state.viewBoxMinY.value"
    :handle-canvas-mouse-down="handleCanvasMouseDown"
    :handle-mouse-move="handleMouseMove"
    :handle-mouse-up="handleMouseUp"
    :handle-canvas-click="handleCanvasClick"
    :page-width="pageWidth"
    :page-height="pageHeight"
    :page-count-x="pageCountX"
    :page-count-y="pageCountY"
    :page-offset-x-pages="pageOffsetXPages"
    :page-offset-y-pages="pageOffsetYPages"
    :editing-text="state.editingText.value ?? null"
    :set-editing-text="state.setEditingText"
    :commit-editing-text="shapesHelpers.commitEditingText"
    :selection-rect="state.selectionRect.value ?? null"
    :group-selection-bounds="controllerBase.derived.groupSelectionBounds"
    :polyline-handles="controllerBase.derived.polylineHandles"
    :set-dragging-polyline-point="state.setDraggingPolylinePoint"
    :set-drag-start="state.setDragStart"
    :is-connecting="state.isConnecting.value ?? false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch, watchEffect } from 'vue';
import CanvasComponentView from "./canvas/CanvasComponentView.vue";
import type { CanvasComponentProps, CanvasComponentRef } from './canvas/canvas-types';
import { useCanvasState } from './canvas/hooks/useCanvasState';
import { useCanvasControllerBase } from './canvas/hooks/useCanvasControllerBase';
import { useShapeCreation, useShapes, useSelection, useSelectionActions, useCanvasMouse, useConnectionActions, useConnections, useConnectorNodes, useImportExport, useClipboard, useLayering, useShapeStyles, useCanvasGeometry, useHistory, usePointerMove, useShapeMouseDown } from '@drawio/core';
import { usePointerUp } from './canvas/hooks/usePointerUp';
import { useShapeEventBindings } from './canvas/hooks/useShapeEventBindings';
import { useKeyboardShortcuts } from './canvas/hooks/useKeyboardShortcuts';
import { useBoundsChange } from './canvas/hooks/useBoundsChange';
import { useAutoResize } from './canvas/hooks/useAutoResize';
import { getConnectorPoints, parsePoints, pointToPolylineDistance, projectPointToSegment } from '@drawio/core';
import { decodeDataUri, tintDataUri, tintSvgText, toDataUri } from '@drawio/core';
import { updateCloudPath, updateCylinderPath } from '@drawio/core';

const props = defineProps<CanvasComponentProps>();

const svgRef = ref<SVGSVGElement | null>(null);
const viewRef = ref<InstanceType<typeof CanvasComponentView> | null>(null);
let didLogViewRef = false;
let didLogSvgRef = false;
const state = useCanvasState(props);
const controllerBase = useCanvasControllerBase({ props, state });
const shapeCreation = useShapeCreation({
  svgRef: state.svgRef as any,
  shapes: state.shapes as any,
  createSVGElement: controllerBase.geometry.createSVGElement,
  generateId: controllerBase.geometry.generateId,
  getDef: controllerBase.geometry.getDef,
  getShapeBounds: controllerBase.geometry.getShapeBounds,
  getShapeCenter: controllerBase.geometry.getShapeCenter,
  getPortPositionById: controllerBase.geometry.getPortPositionById,
  setShapesState: controllerBase.setShapesState,
  setSelectedShape: state.setSelectedShape,
  saveToHistory: controllerBase.historyActions.saveToHistory,
  onShapeSelect: props.onShapeSelect,
  selectedIds: state.selectedIds as any,
  tempLine: state.tempLine as any,
  setTempLine: state.setTempLine,
  setIsConnecting: state.setIsConnecting,
  setConnectionStart: state.setConnectionStart,
  setConnectionStartPort: state.setConnectionStartPort,
});
const selectionUi = useSelection({
  svgRef: state.svgRef as any,
  createSVGElement: controllerBase.geometry.createSVGElement,
  getBounds: controllerBase.geometry.getBounds,
  getDef: controllerBase.geometry.getDef,
  getPointerPosition: state.getPointerPosition,
  onShapeSelect: props.onShapeSelect,
  setSelectedShape: state.setSelectedShape,
  setIsResizing: state.setIsResizing,
  setResizeHandle: state.setResizeHandle,
  setDragStart: state.setDragStart,
  setDraggingCornerHandle: state.setDraggingCornerHandle,
  resizeHandlesRef: state.resizeHandlesRef,
  cornerHandlesRef: state.cornerHandlesRef,
  textSelectionRef: state.textSelectionRef,
  editingInputRef: state.editingInputRef as any,
  setEditingText: state.setEditingText,
  viewBoxMinX: state.viewBoxMinX,
  viewBoxMinY: state.viewBoxMinY,
});
const connectionActions = useConnectionActions({
  svgRef: state.svgRef,
  shapes: state.shapes,
  createSVGElement: controllerBase.geometry.createSVGElement,
  getPortPositionById: controllerBase.geometry.getPortPositionById,
  getShapeCenter: controllerBase.geometry.getShapeCenter,
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
  createSVGElement: controllerBase.geometry.createSVGElement,
  startConnection: connectionActions.startConnection,
  getConnectorHandleMouseDown: connectionActions.getConnectorHandleMouseDown,
  getBounds: controllerBase.geometry.getBounds,
});
const connectorNodes = useConnectorNodes({
  shapes: state.shapes,
  selectedIds: state.selectedIds,
  getPointerPosition: state.getPointerPosition,
  getConnectorPoints,
  projectPointToSegment,
  updateConnectorPoints: controllerBase.geometry.updateConnectorPoints,
  setShapesState: controllerBase.setShapesState,
  setSelectedShape: state.setSelectedShape,
  onShapeSelect: props.onShapeSelect,
  saveToHistory: controllerBase.historyActions.saveToHistory,
});
const selectionActions = useSelectionActions({
  svgRef: state.svgRef as any,
  shapes: state.shapes as any,
  shapesRef: state.shapesRef,
  selectedIds: state.selectedIds as any,
  selectedIdsRef: state.selectedIdsRef,
  setShapesState: controllerBase.setShapesState,
  setSelectedIds: state.setSelectedIds,
  setSelectedShape: state.setSelectedShape,
  setHoveredShapeId: state.setHoveredShapeId,
  onShapeSelect: props.onShapeSelect,
  saveToHistory: controllerBase.historyActions.saveToHistory,
  hidePorts: connections.hidePorts,
  hideConnectorHandles: connections.hideConnectorHandles,
  hideResizeHandles: selectionUi.hideResizeHandles,
  hideCornerHandles: selectionUi.hideCornerHandles,
  hideTextSelection: selectionUi.hideTextSelection,
});
const shapeMouseDown = useShapeMouseDown({
  shapes: state.shapes,
  selectedIds: state.selectedIds,
  isConnecting: state.isConnecting,
  connectionStart: state.connectionStart,
  connectionStartPort: state.connectionStartPort,
  disableShapeSelection: props.disableShapeSelection,
  getPointerPosition: state.getPointerPosition,
  isLineConnected: controllerBase.geometry.isLineConnected,
  startConnection: connectionActions.startConnection,
  connectShapes: shapeCreation.connectShapes,
  setSelectedIds: state.setSelectedIds,
  setIsDragging: state.setIsDragging,
  setDragStart: state.setDragStart,
  onShapeSelect: props.onShapeSelect,
  viewBoxMinX: state.viewBoxMinX,
  viewBoxMinY: state.viewBoxMinY,
});
useShapeEventBindings({
  shapes: state.shapes,
  selectedIds: state.selectedIds,
  isConnecting: state.isConnecting,
  draggingHandle: state.draggingHandle,
  disableShapeHover: props.disableShapeHover,
  beginEditText: selectionUi.beginEditText,
  addConnectorNodeAt: connectorNodes.addConnectorNodeAt,
  handleShapeMouseDown: shapeMouseDown,
  showConnectorHandles: connections.showConnectorHandles,
  hideConnectorHandles: connections.hideConnectorHandles,
  showPorts: connections.showPorts,
  hidePorts: connections.hidePorts,
  showResizeHandles: selectionUi.showResizeHandles,
  hideResizeHandles: selectionUi.hideResizeHandles,
  showCornerHandles: selectionUi.showCornerHandles,
  hideCornerHandles: selectionUi.hideCornerHandles,
  showTextSelection: selectionUi.showTextSelection,
  hideTextSelection: selectionUi.hideTextSelection,
});
const shapesHelpers = useShapes({
  shapes: state.shapes as any,
  selectedIds: state.selectedIds as any,
  shapesRef: state.shapesRef,
  getDef: controllerBase.geometry.getDef,
  getShapeCenter: controllerBase.geometry.getShapeCenter,
  refreshPortsPosition: connections.refreshPortsPosition,
  updateConnectionLine: controllerBase.geometry.updateConnectionLine,
  saveToHistory: controllerBase.historyActions.saveToHistory,
  showTextSelection: selectionUi.showTextSelection,
  refreshResizeHandles: selectionUi.refreshResizeHandles,
  refreshCornerHandles: selectionUi.refreshCornerHandles,
  setEditingText: state.setEditingText,
  editingText: state.editingText as any,
}) as any;
const importExport = useImportExport({
  svgRef: state.svgRef,
  shapes: state.shapes,
  width: props.width,
  height: props.height,
  backgroundColor: props.backgroundColor || '#ffffff',
  createSVGElement: controllerBase.geometry.createSVGElement,
  setShapesState: controllerBase.setShapesState,
  setSelectedIds: state.setSelectedIds,
  selectedIdsRef: state.selectedIdsRef,
  setHistory: state.setHistory,
  setHistoryIndex: state.setHistoryIndex,
  onShapeSelect: props.onShapeSelect,
  onClipboardChange: props.onClipboardChange,
  saveToHistory: controllerBase.historyActions.saveToHistory,
});
const clipboard = useClipboard({
  svgRef: state.svgRef,
  shapes: state.shapes,
  selectedIds: state.selectedIds,
  copyBufferRef: state.copyBufferRef,
  createSVGElement: controllerBase.geometry.createSVGElement,
  generateId: controllerBase.geometry.generateId,
  getDef: controllerBase.geometry.getDef,
  getShapeCenter: controllerBase.geometry.getShapeCenter,
  getPortPositionById: controllerBase.geometry.getPortPositionById,
  applyTransform: shapesHelpers.applyTransform,
  saveToHistory: controllerBase.historyActions.saveToHistory,
  setShapesState: controllerBase.setShapesState,
  setSelectedIds: state.setSelectedIds,
  onClipboardChange: props.onClipboardChange,
  onShapeSelect: props.onShapeSelect,
});
const layering = useLayering({
  svgRef: state.svgRef,
  shapes: state.shapes,
  selectedIds: state.selectedIds,
  selectedShape: state.selectedShape,
  setShapesState: controllerBase.setShapesState,
  saveToHistory: controllerBase.historyActions.saveToHistory,
});
const styleActions = useShapeStyles({
  applyTransform: shapesHelpers.applyTransform,
  updateSelectedShape: selectionActions.updateSelectedShape,
  selectedIds: state.selectedIds,
  selectedIdsRef: state.selectedIdsRef,
  shapes: state.shapes,
  shapesRef: state.shapesRef,
  setShapesState: controllerBase.setShapesState,
  saveToHistory: controllerBase.historyActions.saveToHistory,
  updateCylinderPath,
  updateCloudPath,
  decodeDataUri,
  tintSvgText,
  toDataUri,
  tintDataUri,
  updateConnectionLine: controllerBase.geometry.updateConnectionLine,
  refreshCornerHandles: selectionUi.refreshCornerHandles,
});
useKeyboardShortcuts({
  deleteSelected: selectionActions.deleteSelected,
  duplicateSelected: clipboard.duplicateSelected,
  copySelection: clipboard.copySelection,
  pasteClipboard: clipboard.pasteClipboard,
  undo: controllerBase.historyActions.undo,
  redo: controllerBase.historyActions.redo,
  clearSelection: selectionActions.clearSelection,
  selectAllShapes: selectionActions.selectAllShapes,
  combineSelected: selectionActions.combineSelected,
  ungroupSelected: selectionActions.ungroupSelected,
  isConnecting: state.isConnecting,
  tempLine: state.tempLine,
  svgRef: state.svgRef,
  setTempLine: state.setTempLine,
  setIsConnecting: state.setIsConnecting,
  setConnectionStart: state.setConnectionStart,
  setConnectionStartPort: state.setConnectionStartPort,
});
useBoundsChange({
  shapes: state.shapes,
  getShapeBounds: controllerBase.geometry.getShapeBounds,
  lastBoundsRef: state.lastBoundsRef,
  onBoundsChange: props.onBoundsChange,
});
useAutoResize({
  autoResize: props.autoResize ?? false,
  width: props.width,
  height: props.height,
  shapes: state.shapes,
  getShapeBounds: controllerBase.geometry.getShapeBounds,
});
const pointerMove = usePointerMove({
  svgRef: state.svgRef as any,
  shapes: state.shapes as any,
  selectedIds: state.selectedIds as any,
  draggingHandle: state.draggingHandle as any,
  draggingPolylinePoint: state.draggingPolylinePoint as any,
  isConnecting: state.isConnecting as any,
  tempLine: state.tempLine as any,
  connectionStart: state.connectionStart as any,
  isDragging: state.isDragging as any,
  isResizing: state.isResizing as any,
  isSelectingBox: state.isSelectingBox as any,
  selectionOriginRef: state.selectionOriginRef,
  hoveredShapeId: state.hoveredShapeId as any,
  activePortHighlight: state.activePortHighlight as any,
  resizeHandle: state.resizeHandle as any,
  selectedShape: state.selectedShape,
  draggingCornerHandle: state.draggingCornerHandle as any,
  dragStart: state.dragStart as any,
  cornerHandlesRef: state.cornerHandlesRef,
  connectorHandleRef: state.connectorHandleRef,
  portElementsRef: state.portElementsRef,
  setDragStart: state.setDragStart,
  setShapesState: controllerBase.setShapesState,
  setSelectionRect: state.setSelectionRect,
  setHoveredShapeId: state.setHoveredShapeId,
  setActivePortHighlight: state.setActivePortHighlight,
  setDraggingCornerHandle: state.setDraggingCornerHandle,
  updateShapePosition: shapesHelpers.updateShapePosition as any,
  updateShapeSize: shapesHelpers.updateShapeSize as any,
  updateConnectionLine: controllerBase.geometry.updateConnectionLine,
  updateConnectorPoints: controllerBase.geometry.updateConnectorPoints,
  updatePolylinePoints: controllerBase.geometry.updatePolylinePoints,
  refreshResizeHandles: selectionUi.refreshResizeHandles,
  refreshCornerHandles: selectionUi.refreshCornerHandles,
  getPointerPosition: state.getPointerPosition,
  getShapeBounds: controllerBase.geometry.getShapeBounds,
  getConnectorPoints,
  parsePoints,
  isLineConnected: controllerBase.geometry.isLineConnected,
  findNearestPortElement: connections.findNearestPortElement,
  highlightPortStyle: connections.highlightPortStyle,
  resetPortStyle: connections.resetPortStyle,
  showPorts: connections.showPorts,
  hidePorts: connections.hidePorts,
  showCornerHandles: selectionUi.showCornerHandles,
  lastPointerRef: state.lastPointerRef,
  enableConnectorNodeSnap: props.enableConnectorNodeSnap,
  connectorNodeSnapDistance: props.connectorNodeSnapDistance,
  connectorNodeAlignDistance: props.connectorNodeAlignDistance,
  disableShapeHover: props.disableShapeHover,
  viewBoxMinX: state.viewBoxMinX,
  viewBoxMinY: state.viewBoxMinY,
});
const pointerUp = usePointerUp({
  svgRef: state.svgRef as any,
  shapes: state.shapes as any,
  selectedIds: state.selectedIds as any,
  selectedShape: state.selectedShape,
  draggingHandle: state.draggingHandle as any,
  draggingPolylinePoint: state.draggingPolylinePoint as any,
  isConnecting: state.isConnecting as any,
  connectionStart: state.connectionStart as any,
  connectionStartPort: state.connectionStartPort as any,
  isDragging: state.isDragging as any,
  isResizing: state.isResizing as any,
  isSelectingBox: state.isSelectingBox as any,
  selectionRect: state.selectionRect as any,
  selectionOriginRef: state.selectionOriginRef,
  tempLine: state.tempLine as any,
  activePortHighlight: state.activePortHighlight as any,
  hoveredShapeId: state.hoveredShapeId as any,
  handleConnectionRef: state.handleConnectionRef,
  skipNextCanvasClickClear: state.skipNextCanvasClickClear,
  portElementsRef: state.portElementsRef,
  lastPointerRef: state.lastPointerRef,
  setDraggingHandle: state.setDraggingHandle,
  setDraggingPolylinePoint: state.setDraggingPolylinePoint,
  setIsConnecting: state.setIsConnecting,
  setConnectionStart: state.setConnectionStart,
  setConnectionStartPort: state.setConnectionStartPort,
  setIsDragging: state.setIsDragging,
  setIsResizing: state.setIsResizing,
  setResizeHandle: state.setResizeHandle,
  setDraggingCornerHandle: state.setDraggingCornerHandle,
  setDragStart: state.setDragStart,
  setIsSelectingBox: state.setIsSelectingBox,
  setSelectionRect: state.setSelectionRect,
  setTempLine: state.setTempLine,
  setShapesState: controllerBase.setShapesState,
  setSelectedShape: state.setSelectedShape,
  setSelectedShapes: state.setSelectedShapes,
  setActivePortHighlight: state.setActivePortHighlight,
  setHoveredShapeId: state.setHoveredShapeId,
  connectShapes: shapeCreation.connectShapes,
  findNearestPortElement: connections.findNearestPortElement,
  getConnectorPoints,
  getPortPositionById: controllerBase.geometry.getPortPositionById,
  getShapeBounds: controllerBase.geometry.getShapeBounds,
  getShapeCenter: controllerBase.geometry.getShapeCenter,
  updateConnectorPoints: controllerBase.geometry.updateConnectorPoints,
  showConnectorHandles: connections.showConnectorHandles,
  hidePorts: connections.hidePorts,
  resetPortStyle: connections.resetPortStyle,
  onShapeSelect: props.onShapeSelect,
  saveToHistory: controllerBase.historyActions.saveToHistory,
});
const canvasMouse = useCanvasMouse({
  svgRef: state.svgRef as any,
  shapes: state.shapes as any,
  selectedShape: state.selectedShape,
  isConnecting: state.isConnecting as any,
  tempLine: state.tempLine as any,
  skipNextCanvasClickClear: state.skipNextCanvasClickClear,
  disableSelectionBox: props.disableSelectionBox,
  getPointerPosition: state.getPointerPosition,
  getConnectorPoints,
  pointToPolylineDistance,
  setIsSelectingBox: state.setIsSelectingBox,
  setSelectionRect: state.setSelectionRect,
  setSelectedShape: state.setSelectedShape,
  setIsConnecting: state.setIsConnecting,
  setConnectionStart: state.setConnectionStart,
  setConnectionStartPort: state.setConnectionStartPort,
  setTempLine: state.setTempLine,
  selectionOriginRef: state.selectionOriginRef,
  onShapeSelect: props.onShapeSelect,
});

const methods: CanvasComponentRef = {
  addRectangle: shapeCreation.addRectangle,
  addRoundedRect: shapeCreation.addRoundedRect,
  addCircle: shapeCreation.addCircle,
  addTriangle: shapeCreation.addTriangle,
  addLine: shapeCreation.addLine,
  addPolyline: shapeCreation.addPolyline,
  addText: shapeCreation.addText,
  addSvgIcon: shapeCreation.addSvgIcon,
  addShapeAt: shapeCreation.addShapeAt,
  setZoom: (value) => {
    state.setZoom(value);
    return state.zoom.value ?? 1;
  },
  zoomIn: (factor = 1.2) => {
    const currentZoom = state.zoom.value ?? 1;
    state.setZoom(currentZoom * factor);
    return state.zoom.value ?? 1;
  },
  zoomOut: (factor = 1.2) => {
    const currentZoom = state.zoom.value ?? 1;
    state.setZoom(currentZoom / factor);
    return state.zoom.value ?? 1;
  },
  getZoom: () => state.zoom.value ?? 1,
  copySelection: clipboard.copySelection,
  pasteClipboard: clipboard.pasteClipboard,
  hasClipboard: clipboard.hasClipboard,
  combineSelected: selectionActions.combineSelected,
  ungroupSelected: selectionActions.ungroupSelected,
  selectAll: selectionActions.selectAllShapes,
  clearSelection: selectionActions.clearSelection,
  deleteSelected: selectionActions.deleteSelected,
  clearCanvas: selectionActions.clearCanvas,
  exportCanvas: importExport.exportCanvas,
  getCanvas: () => svgRef.value,
  getSelectedShape: (selectedShapeId?: string | null) => selectionActions.getSelectedShape(selectedShapeId ?? null),
  getSelectionCount: selectionActions.getSelectionCount,
  exportJson: importExport.exportJson,
  importJson: importExport.importJson,
  duplicateSelected: clipboard.duplicateSelected,
  bringToFront: layering.bringToFront,
  sendToBack: layering.sendToBack,
  moveForward: layering.moveForward,
  moveBackward: layering.moveBackward,
  rotateSelected: styleActions.rotateSelected,
  rotateSelectedBy: styleActions.rotateSelectedBy,
  flipSelectedHorizontal: styleActions.flipSelectedHorizontal,
  flipSelectedVertical: styleActions.flipSelectedVertical,
  scaleSelected: styleActions.scaleSelected,
  changeSelectedFill: styleActions.changeSelectedFill,
  changeSelectedStroke: styleActions.changeSelectedStroke,
  changeSelectedStrokeWidth: styleActions.changeSelectedStrokeWidth,
  changeSelectedArrow: styleActions.changeSelectedArrow,
  changeSelectedOpacity: styleActions.changeSelectedOpacity,
  undo: controllerBase.historyActions.undo,
  redo: controllerBase.historyActions.redo,
  startConnection: connectionActions.startConnection,
  connectShapes: shapeCreation.connectShapes,
  canUndo: controllerBase.historyActions.canUndo,
  canRedo: controllerBase.historyActions.canRedo,
};

const { width, height, pageWidth, pageHeight, pageCountX, pageCountY, pageOffsetXPages, pageOffsetYPages } = toRefs(props);

// 监控 pageOffset 变化以调试画布边界
const backgroundColor = computed(() => props.backgroundColor ?? '#ffffff');

const handleCanvasMouseDown = canvasMouse.handleCanvasMouseDown;
const handleMouseMove = pointerMove;
const handleMouseUp = pointerUp.handleMouseUp;
const handleCanvasClick = canvasMouse.handleCanvasClick;

watchEffect(() => {
  const editing = state.editingText.value;
  if (!editing) return;
  const exists = state.shapes.value.some((shape) => shape.id === editing.id);
  if (!exists) {
    state.setEditingText(null);
  }
});

watchEffect(() => {
  const viewSvgRef = viewRef.value?.svgRef;
  if (!didLogViewRef && viewRef.value) {
    didLogViewRef = true;
  }
  const resolvedSvg =
    viewSvgRef && typeof viewSvgRef === 'object' && 'value' in (viewSvgRef as any)
      ? (viewSvgRef as any).value ?? null
      : (viewSvgRef as SVGSVGElement | null) ?? null;
  svgRef.value = resolvedSvg;
  state.svgRef.value = svgRef.value;
  if (!didLogSvgRef && svgRef.value) {
    didLogSvgRef = true;
  }

  const viewEditingInputRef = viewRef.value?.editingInputRef;
  const resolvedEditingInput =
    viewEditingInputRef && typeof viewEditingInputRef === 'object' && 'value' in (viewEditingInputRef as any)
      ? (viewEditingInputRef as any).value ?? null
      : (viewEditingInputRef as HTMLInputElement | null) ?? null;
  state.editingInputRef.value = resolvedEditingInput;

  state.historyIndex.value;
  methods.canUndo = controllerBase.historyActions.canUndo;
  methods.canRedo = controllerBase.historyActions.canRedo;

  if (props.onReady && svgRef.value && !state.hasCalledReady.value) {
    props.onReady(svgRef.value, methods);
    state.hasCalledReady.value = true;
  }
});

onMounted(() => {
  if (props.onReady && svgRef.value && !state.hasCalledReady.value) {
    props.onReady(svgRef.value, methods);
    state.hasCalledReady.value = true;
  }
});
</script>
