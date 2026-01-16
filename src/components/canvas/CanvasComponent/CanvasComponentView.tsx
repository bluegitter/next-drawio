import React from 'react';
interface CanvasComponentViewProps {
  width: number;
  height: number;
  zoom: number;
  backgroundColor: string;
  svgRef: React.RefObject<SVGSVGElement>;
  viewBoxMinX: number;
  viewBoxMinY: number;
  handleCanvasMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => void;
  handleMouseUp: (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => void;
  handleCanvasClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  pageWidth?: number;
  pageHeight?: number;
  pageCountX?: number;
  pageCountY?: number;
  editingText: { id: string; x: number; y: number; width: number; height: number; value: string; fontSize: number; fontFamily?: string; fontWeight?: string; fontStyle?: string; letterSpacing?: string; lineHeight?: string; color?: string } | null;
  editingInputRef: React.RefObject<HTMLInputElement>;
  setEditingText: React.Dispatch<React.SetStateAction<any>>;
  commitEditingText: (save: boolean) => void;
  selectionRect: { x: number; y: number; w: number; h: number } | null;
  groupSelectionBounds: { x: number; y: number; w: number; h: number } | null;
  polylineHandles: Array<{ shapeId: string; index: number; x: number; y: number }>;
  setDraggingPolylinePoint: React.Dispatch<React.SetStateAction<{ shapeId: string; index: number } | null>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isConnecting: boolean;
}

const CanvasComponentView = ({
  width,
  height,
  zoom,
  backgroundColor,
  svgRef,
  viewBoxMinX,
  viewBoxMinY,
  handleCanvasMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleCanvasClick,
  pageWidth,
  pageHeight,
  pageCountX,
  pageCountY,
  editingText,
  editingInputRef,
  setEditingText,
  commitEditingText,
  selectionRect,
  groupSelectionBounds,
  polylineHandles,
  setDraggingPolylinePoint,
  setDragStart,
  isConnecting,
}: CanvasComponentViewProps) => {
  const lineCountX = pageCountX ? Math.floor(pageCountX) : 0;
  const lineCountY = pageCountY ? Math.floor(pageCountY) : 0;

  return (
    <div
      className="relative border border-gray-300 rounded"
      style={{ width: width * zoom, height: height * zoom }}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`${viewBoxMinX} ${viewBoxMinY} ${width} ${height}`}
        style={{
          backgroundColor,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          minWidth: width * zoom,
          minHeight: height * zoom,
          position: 'absolute',
          zIndex: 1,
          backgroundImage: 'none',
        }}
        className="block"
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
      >
        <defs>
          <marker id="arrow-end-marker" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
          <marker id="arrow-start-marker" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 10 0 L 0 5 L 10 10 z" fill="context-stroke" />
          </marker>
        </defs>
        {pageWidth && lineCountX > 1 && (
          <>
            {Array.from({ length: lineCountX - 1 }).map((_, idx) => {
              const x = -viewBoxMinX + pageWidth * (idx + 1);
              return <line key={x} x1={x} y1={0} x2={x} y2={height} stroke="#d0d0d0" strokeDasharray="6,6" strokeWidth={1} />;
            })}
          </>
        )}
        {pageHeight && lineCountY > 1 && (
          <>
            {Array.from({ length: lineCountY - 1 }).map((_, idx) => {
              const y = -viewBoxMinY + pageHeight * (idx + 1);
              return <line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#d0d0d0" strokeDasharray="6,6" strokeWidth={1} />;
            })}
          </>
        )}
      </svg>
      {editingText && (
        <input
          ref={editingInputRef}
          className="absolute outline-none bg-transparent"
          style={{
            left: editingText.x,
            top: editingText.y,
            width: editingText.width,
            height: editingText.height,
            padding: 0,
            margin: 0,
            border: 'none',
            boxShadow: 'none',
            fontSize: editingText.fontSize,
            fontFamily: editingText.fontFamily,
            fontWeight: editingText.fontWeight,
            fontStyle: editingText.fontStyle,
            letterSpacing: editingText.letterSpacing,
            lineHeight: editingText.lineHeight || `${editingText.fontSize}px`,
            color: editingText.color,
          }}
          value={editingText.value}
          onChange={e => setEditingText((prev: any) => (prev ? { ...prev, value: e.target.value } : prev))}
          onBlur={() => commitEditingText(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitEditingText(true);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              commitEditingText(false);
            }
          }}
          onMouseDown={e => e.stopPropagation()}
        />
      )}
      {selectionRect && (
        <div
          className="absolute border-2 border-blue-400 border-dashed bg-blue-200/20 pointer-events-none"
          style={{
            left: (selectionRect.x - viewBoxMinX) * zoom,
            top: (selectionRect.y - viewBoxMinY) * zoom,
            width: selectionRect.w * zoom,
            height: selectionRect.h * zoom,
          }}
        />
      )}
      {groupSelectionBounds && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: (groupSelectionBounds.x - viewBoxMinX) * zoom,
            top: (groupSelectionBounds.y - viewBoxMinY) * zoom,
            width: groupSelectionBounds.w * zoom,
            height: groupSelectionBounds.h * zoom,
          }}
        >
          <div className="absolute inset-0 border-2 border-dashed border-[#36a7ff]" />
          {[
            { x: 0, y: 0 },
            { x: 0.5, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0.5 },
            { x: 1, y: 0.5 },
            { x: 0, y: 1 },
            { x: 0.5, y: 1 },
            { x: 1, y: 1 },
          ].map((p, idx) => (
            <div
              key={idx}
              className="absolute w-4 h-4 bg-[#36a7ff] rounded-full border-2 border-white"
              style={{
                left: `calc(${p.x * 100}% - 8px)`,
                top: `calc(${p.y * 100}% - 8px)`,
              }}
            />
          ))}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-[#36a7ff] rounded-full flex items-center justify-center text-xs text-[#36a7ff]"
            style={{
              right: -18,
              top: -18,
            }}
          >
            ⟳
          </div>
        </div>
      )}
      {polylineHandles.map(handle => (
        <div
          key={`${handle.shapeId}-${handle.index}`}
          className="absolute w-3 h-3 bg-[#36a7ff] rounded-full border-2 border-white cursor-move z-20"
          style={{
            left: handle.x * zoom - 6,
            top: handle.y * zoom - 6,
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setDraggingPolylinePoint({ shapeId: handle.shapeId, index: handle.index });
            setDragStart({ x: handle.x, y: handle.y });
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
        />
      ))}
      {isConnecting && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
          连接模式 - 点击目标图形完成连接
        </div>
      )}
    </div>
  );
};

export default CanvasComponentView;
