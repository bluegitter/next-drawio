"use client";

import React, { useCallback, forwardRef } from 'react';
import { updateCylinderPath, updateCloudPath } from '@drawio/core';
import type { CanvasComponentProps, CanvasComponentRef } from "@/components/canvas/canvas-types";
import { useCanvasState } from "@/components/canvas/hooks/useCanvasState";
import { getConnectorPoints, parsePoints, pointToPolylineDistance } from '@drawio/core';
import { useCanvasController } from "@/components/canvas/hooks/useCanvasController";
import { useCanvasInteractions } from "@/components/canvas/hooks/useCanvasInteractions";
import { useCanvasLifecycle } from "@/components/canvas/hooks/useCanvasLifecycle";
import CanvasComponentView from "@/components/canvas/CanvasComponentView";

export type { CanvasComponentRef };
export const CanvasComponent = forwardRef<CanvasComponentRef, CanvasComponentProps>((props, ref) => {
  const {
    width,
    height,
    backgroundColor = '#ffffff',
    onShapeSelect,
    pageWidth,
    pageCountX,
    pageHeight,
    pageCountY,
    enableConnectorNodeSnap = true,
    connectorNodeSnapDistance = 14,
    connectorNodeAlignDistance = 6,
    disableSelectionBox = false,
    disableShapeSelection = false,
    disableShapeHover = false,
  } = props;
  const state = useCanvasState(props);
  const {
    svgRef,
    zoom,
    setZoom,
    selectionRect,
    isConnecting,
    editingText,
    setEditingText,
    editingInputRef,
    setDraggingPolylinePoint,
    setDragStart,
    viewBoxMinX,
    viewBoxMinY,
  } = state;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;
  const ZOOM_FACTOR = 1.2;
  const clampZoom = useCallback((value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)), []);
  const applyZoom = useCallback((next: number) => {
    let result = 1;
    setZoom(prev => {
      const clamped = clampZoom(next);
      result = clamped;
      return clamped;
    });
    return result;
  }, [clampZoom]);
  const zoomBy = useCallback((factor: number) => {
    let result = 1;
    setZoom(prev => {
      const clamped = clampZoom(prev * factor);
      result = clamped;
      return clamped;
    });
    return result;
  }, [clampZoom]);
  const controller = useCanvasController({
    props,
    updateCylinderPath,
    updateCloudPath,
    state,
  });

  const interactions = useCanvasInteractions({
    state: {
      ...state,
      setShapesState: controller.setShapesState,
      tempLine: state.tempLine,
    },
    controller,
    helpers: {
      getPointerPosition: state.getPointerPosition,
      getConnectorPoints,
      parsePoints,
      pointToPolylineDistance,
    },
    connectorNodeSnap: {
      enabled: enableConnectorNodeSnap,
      snapDistance: connectorNodeSnapDistance,
      alignDistance: connectorNodeAlignDistance,
    },
    disableSelectionBox,
    disableShapeSelection,
    disableShapeHover,
    onShapeSelect,
  });

  useCanvasLifecycle({
    ref,
    props,
    state,
    controller,
    zoom: {
      ZOOM_FACTOR,
      applyZoom,
      zoomBy,
      getZoom: () => zoom,
    },
  });

  return (
    <CanvasComponentView
      width={width}
      height={height}
      zoom={zoom}
      backgroundColor={backgroundColor}
      svgRef={svgRef}
      viewBoxMinX={viewBoxMinX}
      viewBoxMinY={viewBoxMinY}
      handleCanvasMouseDown={interactions.handleCanvasMouseDown}
      handleMouseMove={interactions.handleMouseMove}
      handleMouseUp={interactions.handleMouseUp}
      handleCanvasClick={interactions.handleCanvasClick}
      pageWidth={pageWidth}
      pageHeight={pageHeight}
      pageCountX={pageCountX}
      pageCountY={pageCountY}
      editingText={editingText}
      editingInputRef={editingInputRef}
      setEditingText={setEditingText}
      commitEditingText={controller.shapeOps.commitEditingText}
      selectionRect={selectionRect}
      groupSelectionBounds={controller.derived.groupSelectionBounds}
      polylineHandles={controller.derived.polylineHandles}
      setDraggingPolylinePoint={setDraggingPolylinePoint}
      setDragStart={setDragStart}
      isConnecting={isConnecting}
    />
  );
});

export default CanvasComponent;
