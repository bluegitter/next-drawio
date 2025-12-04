import React, { createContext, useContext, useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import { fabric } from 'fabric';
import { CanvasContextType } from '@/types';

interface CanvasProviderProps {
  children: ReactNode;
  width?: number;
  height?: number;
  backgroundColor?: string;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onCanvasError?: (error: Error) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const CanvasProvider: React.FC<CanvasProviderProps> = ({
  children,
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  onCanvasReady,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 初始化 Fabric.js Canvas
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    try {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        skipTargetFind: false,
        allowTouchScrolling: false,
        imageSmoothingEnabled: true,
        enableRetinaScaling: true,
      });

      // 设置默认属性
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'move';
      fabricCanvas.freeDrawingCursor = 'crosshair';

      // 配置选择
      fabricCanvas.selectionLineWidth = 2;
      fabricCanvas.selectionBorderColor = '#007acc';
      fabricCanvas.selectionCornerColor = '#3b82f6';
      fabricCanvas.selectionCornerSize = 8;
      fabricCanvas.selectionFullyContained = false;

      // 配置变换控制点
      fabricCanvas.cornerStyle = 'circle';
      fabricCanvas.cornerStrokeColor = '#ffffff';
      fabricCanvas.cornerFillColor = '#3b82f6';
      fabricCanvas.transparentCorners = false;
      fabricCanvas.borderColor = '#007acc';
      fabricCanvas.borderScaleFactor = 1;

      fabricCanvasRef.current = fabricCanvas;
      setIsLoading(false);
      
      onCanvasReady?.(fabricCanvas);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize canvas');
      setError(error);
      setIsLoading(false);
      onError?.(error);
    }
  }, [width, height, backgroundColor, onCanvasReady, onError]);

  // 清理 Canvas
  const disposeCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  }, []);

  // 组件挂载时初始化
  useEffect(() => {
    initializeCanvas();
    return disposeCanvas;
  }, [initializeCanvas, disposeCanvas]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvasRef.current) {
        const container = canvasRef.current?.parentElement;
        if (container) {
          const { clientWidth, clientHeight } = container;
          fabricCanvasRef.current.setDimensions({
            width: clientWidth,
            height: clientHeight,
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas 操作方法
  const addObject = useCallback((object: fabric.Object) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.add(object);
      fabricCanvasRef.current.setActiveObject(object);
    }
  }, []);

  const removeObject = useCallback((object: fabric.Object) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(object);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = backgroundColor;
    }
  }, [backgroundColor]);

  const getSelectedObjects = useCallback(() => {
    if (fabricCanvasRef.current) {
      return fabricCanvasRef.current.getActiveObjects();
    }
    return [];
  }, []);

  const setActiveTool = useCallback((tool: string) => {
    if (fabricCanvasRef.current) {
      switch (tool) {
        case 'select':
          fabricCanvasRef.current.isDrawingMode = false;
          fabricCanvasRef.current.selection = true;
          fabricCanvasRef.current.defaultCursor = 'default';
          break;
        case 'draw':
          fabricCanvasRef.current.isDrawingMode = true;
          fabricCanvasRef.current.selection = false;
          fabricCanvasRef.current.defaultCursor = 'crosshair';
          break;
        default:
          fabricCanvasRef.current.isDrawingMode = false;
          fabricCanvasRef.current.selection = true;
          fabricCanvasRef.current.defaultCursor = 'default';
      }
    }
  }, []);

  const setZoom = useCallback((zoom: number) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(zoom);
      fabricCanvasRef.current.requestRenderAll();
    }
  }, []);

  const centerCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
      fabricCanvasRef.current.requestRenderAll();
    }
  }, []);

  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (fabricCanvasRef.current) {
      switch (format) {
        case 'png':
          return fabricCanvasRef.current.toDataURL('png');
        case 'jpg':
          return fabricCanvasRef.current.toDataURL('jpeg', 0.8);
        case 'svg':
          return fabricCanvasRef.current.toSVG();
        default:
          return fabricCanvasRef.current.toDataURL('png');
      }
    }
    return '';
  }, []);

  const contextValue: CanvasContextType = {
    canvas: fabricCanvasRef.current,
    canvasRef,
    isLoading,
    error,
    addObject,
    removeObject,
    clearCanvas,
    getSelectedObjects,
    setActiveTool,
    setZoom,
    centerCanvas,
    exportCanvas,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      <div className="relative w-full h-full bg-gray-50">
        <canvas
          ref={canvasRef}
          className="border border-gray-300"
          style={{ width, height }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-sm text-gray-600">加载画布中...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-sm text-red-600">加载失败: {error.message}</div>
          </div>
        )}
        {children}
      </div>
    </CanvasContext.Provider>
  );
};

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};