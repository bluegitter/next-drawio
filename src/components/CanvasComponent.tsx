"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

// 定义fabric类型
type FabricCanvas = any;
type FabricObject = any;

export interface CanvasComponentRef {
  addRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addText: () => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  getCanvas: () => FabricCanvas | null;
}

export interface CanvasComponentProps {
  width: number;
  height: number;
  backgroundColor?: string;
  onReady?: (canvas: FabricCanvas, methods: CanvasComponentRef) => void;
  onError?: (error: Error) => void;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  width,
  height,
  backgroundColor = '#ffffff',
  onReady,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState<string>('select');
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const fabricRef = useRef<any>(null);

  // 加载fabric.js
  useEffect(() => {
    const loadFabric = async () => {
      try {
        if (typeof window !== 'undefined') {
          const fabricModule = await import('fabric');
          fabricRef.current = fabricModule.fabric;
          setFabricLoaded(true);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    };

    loadFabric();
  }, [onError]);

  // 添加矩形
  const addRectangle = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;

    const rect = new fabricRef.current.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 60,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  }, []);

  // 添加圆形
  const addCircle = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;

    const circle = new fabricRef.current.Circle({
      left: 150,
      top: 150,
      radius: 40,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });

    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  }, []);

  // 添加三角形
  const addTriangle = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;

    const triangle = new fabricRef.current.Triangle({
      left: 200,
      top: 200,
      width: 80,
      height: 80,
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
    });

    fabricCanvasRef.current.add(triangle);
    fabricCanvasRef.current.setActiveObject(triangle);
    fabricCanvasRef.current.renderAll();
  }, []);

  // 添加线条
  const addLine = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;

    const line = new fabricRef.current.Line([50, 100, 200, 100], {
      stroke: '#ef4444',
      strokeWidth: 3,
      strokeLineCap: 'round',
    });

    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
    fabricCanvasRef.current.renderAll();
  }, []);

  // 添加文字
  const addText = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;

    const text = new fabricRef.current.Text('点击编辑文字', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#1f2937',
      fontFamily: 'Arial, sans-serif',
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  }, []);

  // 删除选中对象
  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj: fabric.Object) => {
        fabricCanvasRef.current?.remove(obj);
      });
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  // 清空画布
  const clearCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = backgroundColor;
    fabricCanvasRef.current.renderAll();
  }, [backgroundColor]);

  // 导出功能
  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (!fabricCanvasRef.current) return;

    switch (format) {
      case 'png':
        fabricCanvasRef.current.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        }, (dataUrl: string) => {
          const link = document.createElement('a');
          link.download = 'canvas.png';
          link.href = dataUrl;
          link.click();
        });
        break;
      case 'jpg':
        fabricCanvasRef.current.toDataURL({
          format: 'jpeg',
          quality: 0.8,
          multiplier: 2,
        }, (dataUrl: string) => {
          const link = document.createElement('a');
          link.download = 'canvas.jpg';
          link.href = dataUrl;
          link.click();
        });
        break;
      case 'svg':
        const svgData = fabricCanvasRef.current.toSVG();
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'canvas.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        break;
    }
  }, []);

  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current || !fabricLoaded || !fabricRef.current) return;

    try {
      const canvas = new fabricRef.current.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
      });

      fabricCanvasRef.current = canvas;

      // 设置画布默认属性
      canvas.selection = true;
      canvas.preserveObjectStacking = true;

      // 创建方法对象
      const methods: CanvasComponentRef = {
        addRectangle: () => addRectangle(),
        addCircle: () => addCircle(),
        addTriangle: () => addTriangle(),
        addLine: () => addLine(),
        addText: () => addText(),
        deleteSelected: () => deleteSelected(),
        clearCanvas: () => clearCanvas(),
        exportCanvas: (format: 'png' | 'jpg' | 'svg') => exportCanvas(format),
        getCanvas: () => fabricCanvasRef.current,
      };

      onReady?.(canvas, methods);
    } catch (error) {
      onError?.(error as Error);
    }

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, [width, height, backgroundColor, onReady, onError, fabricLoaded, addRectangle, addCircle, addTriangle, addLine, addText, deleteSelected, clearCanvas, exportCanvas]);

  // 更新背景颜色
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = backgroundColor;
      fabricCanvasRef.current.renderAll();
    }
  }, [backgroundColor]);

  return (
    <div className="relative border border-gray-300 rounded">
      {!fabricLoaded ? (
        <div 
          className="flex items-center justify-center bg-gray-100"
          style={{ width, height }}
        >
          <div className="text-gray-500">加载画布组件中...</div>
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
};

export default CanvasComponent;
