import { useEffect } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseShapeEventBindingsArgs {
  shapes: SVGShape[];
  selectedIds: Set<string>;
  isConnecting: boolean;
  draggingHandle: { connectorId: string; end: 'start' | 'end'; original: any } | null;
  disableShapeHover?: boolean;
  beginEditText: (shape: SVGShape) => void;
  addConnectorNodeAt: (shape: SVGShape, clientX: number, clientY: number) => void;
  handleShapeMouseDown: (e: React.MouseEvent, shape: SVGShape) => void;
  showConnectorHandles: (shape: SVGShape) => void;
  hideConnectorHandles: (shapeId: string) => void;
  showPorts: (shape: SVGShape) => void;
  hidePorts: (shapeId: string) => void;
  showResizeHandles: (shape: SVGShape) => void;
  hideResizeHandles: (shapeId: string) => void;
  showCornerHandles: (shape: SVGShape) => void;
  hideCornerHandles: (shapeId: string) => void;
  showTextSelection: (shape: SVGShape) => void;
  hideTextSelection: (id: string) => void;
}

export const useShapeEventBindings = ({
  shapes,
  selectedIds,
  isConnecting,
  draggingHandle,
  disableShapeHover = false,
  beginEditText,
  addConnectorNodeAt,
  handleShapeMouseDown,
  showConnectorHandles,
  hideConnectorHandles,
  showPorts,
  hidePorts,
  showResizeHandles,
  hideResizeHandles,
  showCornerHandles,
  hideCornerHandles,
  showTextSelection,
  hideTextSelection,
}: UseShapeEventBindingsArgs) => {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const selectedShapes = shapes.filter(s => selectedIds.has(s.id));
    const selectedGroupId = selectedShapes.length > 0 ? selectedShapes[0].data.groupId : null;
    const isGroupSelection = selectedShapes.length > 1 && selectedGroupId && selectedShapes.every(s => s.data.groupId === selectedGroupId);

    if (disableShapeHover) {
      shapes.forEach(shape => {
        hidePorts(shape.id);
        if (shape.type === 'connector' || shape.type === 'line') {
          hideConnectorHandles(shape.id);
        }
      });
    }

    shapes.forEach(shape => {
      const isSelected = selectedIds.has(shape.id);
      const showSelection = isSelected && !(isGroupSelection && shape.data.groupId === selectedGroupId);

      if (isSelected) {
        if (shape.type !== 'text') {
          shape.element.setAttribute('stroke', shape.data.stroke);
          shape.element.setAttribute('stroke-width', String(shape.data.strokeWidth));
          shape.element.removeAttribute('stroke-dasharray');
        } else {
          showTextSelection(shape);
          shape.element.setAttribute('stroke', shape.data.stroke);
          shape.element.setAttribute('stroke-width', String(shape.data.strokeWidth));
          shape.element.removeAttribute('stroke-dasharray');
        }
      } else {
        shape.element.setAttribute('stroke', shape.data.stroke);
        shape.element.setAttribute('stroke-width', String(shape.data.strokeWidth));
        shape.element.removeAttribute('stroke-dasharray');
        if (shape.type === 'text') {
          hideTextSelection(shape.id);
        }
      }

      const handleMouseDown = (e: MouseEvent) =>
        handleShapeMouseDown(e as unknown as React.MouseEvent<SVGElement>, shape);
      const handleDblClick = (e: MouseEvent) => {
        if (shape.type === 'text') {
          e.stopPropagation();
          beginEditText(shape);
          return;
        }
        if (shape.type === 'connector') {
          e.stopPropagation();
          addConnectorNodeAt(shape, e.clientX, e.clientY);
        }
      };
      const handleMouseEnter = () => {
        if (disableShapeHover) return;
        if (!isSelected) {
          shape.element.style.filter = 'brightness(1.2)';
        }
        if (shape.type === 'connector' || shape.type === 'line') {
          showConnectorHandles(shape);
          hideResizeHandles(shape.id);
        } else {
          showPorts(shape);
          if (showSelection) {
            showResizeHandles(shape);
            if (shape.type === 'roundedRect') {
              showCornerHandles(shape);
            }
          } else {
            hideResizeHandles(shape.id);
            hideCornerHandles(shape.id);
          }
        }
      };
      const handleMouseLeave = (ev: MouseEvent) => {
        if (disableShapeHover) return;
        if (!isSelected) {
          shape.element.style.filter = '';
        }
        if (shape.type === 'connector' || shape.type === 'line') {
          if (!isSelected && !draggingHandle) {
            hideConnectorHandles(shape.id);
          }
        } else {
          const related = ev.relatedTarget as HTMLElement | null;
          const movingToPort = related?.getAttribute?.('data-port-id');
          if (!isConnecting && !movingToPort) {
            hidePorts(shape.id);
          }
          if (!isSelected) {
            hideCornerHandles(shape.id);
          }
        }
      };

      shape.element.addEventListener('mousedown', handleMouseDown);
      shape.element.addEventListener('dblclick', handleDblClick);
      shape.element.addEventListener('mouseenter', handleMouseEnter);
      shape.element.addEventListener('mouseleave', handleMouseLeave);

      cleanups.push(() => {
        shape.element.removeEventListener('mousedown', handleMouseDown);
        shape.element.removeEventListener('dblclick', handleDblClick);
        shape.element.removeEventListener('mouseenter', handleMouseEnter);
        shape.element.removeEventListener('mouseleave', handleMouseLeave);
      });

      if ((shape.type === 'connector' || shape.type === 'line') && isSelected) {
        showConnectorHandles(shape);
      } else if ((shape.type === 'connector' || shape.type === 'line') && !isSelected && !draggingHandle) {
        hideConnectorHandles(shape.id);
      }

      if (shape.type !== 'line' && shape.type !== 'connector') {
        if (showSelection) {
          showResizeHandles(shape);
          if (shape.type === 'roundedRect') {
            showCornerHandles(shape);
          }
        } else {
          hideResizeHandles(shape.id);
          hideCornerHandles(shape.id);
        }
      }
    });

    return () => {
      cleanups.forEach(clean => clean());
    };
  }, [addConnectorNodeAt, beginEditText, disableShapeHover, draggingHandle, handleShapeMouseDown, hideConnectorHandles, hidePorts, hideResizeHandles, hideCornerHandles, isConnecting, selectedIds, shapes, showConnectorHandles, showPorts, showResizeHandles, showCornerHandles, showTextSelection, hideTextSelection]);
};
