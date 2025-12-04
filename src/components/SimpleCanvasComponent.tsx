"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface CanvasComponentRef {
  addRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addText: () => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  getCanvas: () => SVGSVGElement | null;
}

export interface CanvasComponentProps {
  width: number;
  height: number;
  backgroundColor?: string;
  onReady?: (canvas: SVGSVGElement, methods: CanvasComponentRef) => void;
  onError?: (error: Error) => void;
}

interface SVGShape {
  id: string;
  type: 'rect' | 'circle' | 'triangle' | 'line' | 'text';
  element: SVGElement;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  width,
  height,
  backgroundColor = '#ffffff',
  onReady,
  onError,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [shapes, setShapes] = useState<SVGShape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const shapeIdCounter = useRef(0);

  // 生成唯一ID
  const generateId = useCallback(() => {
    return `shape-${++shapeIdCounter.current}`;
  }, []);

  // 创建命名空间
  const createSVGElement = useCallback((tagName: string) => {
    if (!svgRef.current) return null;
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }, []);

  // 添加矩形
  const addRectangle = useCallback(() => {
    if (!svgRef.current) return;

    const rect = createSVGElement('rect');
    if (!rect) return;

    const id = generateId();
    rect.setAttribute('id', id);
    rect.setAttribute('x', '100');
    rect.setAttribute('y', '100');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '60');
    rect.setAttribute('fill', '#3b82f6');
    rect.setAttribute('stroke', '#1e40af');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '5');
    rect.setAttribute('ry', '5');
    rect.setAttribute('cursor', 'move');
    rect.style.transition = 'fill 0.2s';

    // 添加事件监听
    rect.addEventListener('click', () => setSelectedShape(id));
    rect.addEventListener('mouseenter', () => {
      if (selectedShape !== id) {
        rect.setAttribute('fill', '#60a5fa');
      }
    });
    rect.addEventListener('mouseleave', () => {
      if (selectedShape !== id) {
        rect.setAttribute('fill', '#3b82f6');
      }
    });

    svgRef.current.appendChild(rect);
    setShapes(prev => [...prev, { id, type: 'rect', element: rect }]);
    setSelectedShape(id);
  }, [createSVGElement, generateId, selectedShape]);

  // 添加圆形
  const addCircle = useCallback(() => {
    if (!svgRef.current) return;

    const circle = createSVGElement('circle');
    if (!circle) return;

    const id = generateId();
    circle.setAttribute('id', id);
    circle.setAttribute('cx', '200');
    circle.setAttribute('cy', '150');
    circle.setAttribute('r', '40');
    circle.setAttribute('fill', '#10b981');
    circle.setAttribute('stroke', '#059669');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('cursor', 'move');
    circle.style.transition = 'fill 0.2s';

    circle.addEventListener('click', () => setSelectedShape(id));
    circle.addEventListener('mouseenter', () => {
      if (selectedShape !== id) {
        circle.setAttribute('fill', '#34d399');
      }
    });
    circle.addEventListener('mouseleave', () => {
      if (selectedShape !== id) {
        circle.setAttribute('fill', '#10b981');
      }
    });

    svgRef.current.appendChild(circle);
    setShapes(prev => [...prev, { id, type: 'circle', element: circle }]);
    setSelectedShape(id);
  }, [createSVGElement, generateId, selectedShape]);

  // 添加三角形
  const addTriangle = useCallback(() => {
    if (!svgRef.current) return;

    const polygon = createSVGElement('polygon');
    if (!polygon) return;

    const id = generateId();
    const points = '200,100 250,180 150,180';
    
    polygon.setAttribute('id', id);
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', '#f59e0b');
    polygon.setAttribute('stroke', '#d97706');
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('cursor', 'move');
    polygon.style.transition = 'fill 0.2s';

    polygon.addEventListener('click', () => setSelectedShape(id));
    polygon.addEventListener('mouseenter', () => {
      if (selectedShape !== id) {
        polygon.setAttribute('fill', '#fbbf24');
      }
    });
    polygon.addEventListener('mouseleave', () => {
      if (selectedShape !== id) {
        polygon.setAttribute('fill', '#f59e0b');
      }
    });

    svgRef.current.appendChild(polygon);
    setShapes(prev => [...prev, { id, type: 'triangle', element: polygon }]);
    setSelectedShape(id);
  }, [createSVGElement, generateId, selectedShape]);

  // 添加线条
  const addLine = useCallback(() => {
    if (!svgRef.current) return;

    const line = createSVGElement('line');
    if (!line) return;

    const id = generateId();
    line.setAttribute('id', id);
    line.setAttribute('x1', '50');
    line.setAttribute('y1', '200');
    line.setAttribute('x2', '250');
    line.setAttribute('y2', '200');
    line.setAttribute('stroke', '#ef4444');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('cursor', 'move');
    line.style.transition = 'stroke 0.2s';

    line.addEventListener('click', () => setSelectedShape(id));
    line.addEventListener('mouseenter', () => {
      if (selectedShape !== id) {
        line.setAttribute('stroke', '#f87171');
      }
    });
    line.addEventListener('mouseleave', () => {
      if (selectedShape !== id) {
        line.setAttribute('stroke', '#ef4444');
      }
    });

    svgRef.current.appendChild(line);
    setShapes(prev => [...prev, { id, type: 'line', element: line }]);
    setSelectedShape(id);
  }, [createSVGElement, generateId, selectedShape]);

  // 添加文字
  const addText = useCallback(() => {
    if (!svgRef.current) return;

    const text = createSVGElement('text');
    if (!text) return;

    const id = generateId();
    text.setAttribute('id', id);
    text.setAttribute('x', '100');
    text.setAttribute('y', '250');
    text.setAttribute('font-size', '20');
    text.setAttribute('fill', '#1f2937');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('cursor', 'move');
    text.style.transition = 'fill 0.2s';
    text.style.userSelect = 'none';

    text.textContent = '点击编辑文字';

    text.addEventListener('click', () => {
      const newText = prompt('编辑文字内容:', text.textContent || '');
      if (newText !== null) {
        text.textContent = newText;
      }
      setSelectedShape(id);
    });
    text.addEventListener('mouseenter', () => {
      if (selectedShape !== id) {
        text.setAttribute('fill', '#4b5563');
      }
    });
    text.addEventListener('mouseleave', () => {
      if (selectedShape !== id) {
        text.setAttribute('fill', '#1f2937');
      }
    });

    svgRef.current.appendChild(text);
    setShapes(prev => [...prev, { id, type: 'text', element: text }]);
    setSelectedShape(id);
  }, [createSVGElement, generateId, selectedShape]);

  // 删除选中的图形
  const deleteSelected = useCallback(() => {
    if (!selectedShape || !svgRef.current) return;

    const shapeElement = document.getElementById(selectedShape);
    if (shapeElement) {
      svgRef.current.removeChild(shapeElement);
      setShapes(prev => prev.filter(shape => shape.id !== selectedShape));
      setSelectedShape(null);
    }
  }, [selectedShape]);

  // 清空画布
  const clearCanvas = useCallback(() => {
    if (!svgRef.current) return;

    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    setShapes([]);
    setSelectedShape(null);
  }, []);

  // 导出功能
  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (!svgRef.current) return;

    switch (format) {
      case 'svg':
        const svgData = new XMLSerializer().serializeToString(svgRef.current!);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const svgLink = document.createElement('a');
        svgLink.download = 'canvas.svg';
        svgLink.href = svgUrl;
        svgLink.click();
        URL.revokeObjectURL(svgUrl);
        break;
      case 'png':
      case 'jpg':
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const svgString = new XMLSerializer().serializeToString(svgRef.current);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.download = `canvas.${format}`;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, `image/${format}`, format === 'jpg' ? 0.8 : 1);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        break;
    }
  }, [width, height, backgroundColor]);

  // 更新选中状态样式
  useEffect(() => {
    shapes.forEach(shape => {
      if (shape.id === selectedShape) {
        shape.element.setAttribute('stroke', '#dc2626');
        shape.element.setAttribute('stroke-width', '3');
        if (shape.type !== 'line') {
          shape.element.setAttribute('stroke-dasharray', '5,5');
        }
      } else {
        // 恢复原始样式
        switch (shape.type) {
          case 'rect':
            shape.element.setAttribute('stroke', '#1e40af');
            shape.element.setAttribute('stroke-width', '2');
            shape.element.removeAttribute('stroke-dasharray');
            break;
          case 'circle':
            shape.element.setAttribute('stroke', '#059669');
            shape.element.setAttribute('stroke-width', '2');
            shape.element.removeAttribute('stroke-dasharray');
            break;
          case 'triangle':
            shape.element.setAttribute('stroke', '#d97706');
            shape.element.setAttribute('stroke-width', '2');
            shape.element.removeAttribute('stroke-dasharray');
            break;
          case 'line':
            shape.element.setAttribute('stroke', '#ef4444');
            shape.element.setAttribute('stroke-width', '3');
            shape.element.removeAttribute('stroke-dasharray');
            break;
          case 'text':
            shape.element.removeAttribute('stroke');
            shape.element.removeAttribute('stroke-width');
            shape.element.removeAttribute('stroke-dasharray');
            break;
        }
      }
    });
  }, [shapes, selectedShape]);

  // 创建方法对象
  const methods: CanvasComponentRef = {
    addRectangle,
    addCircle,
    addTriangle,
    addLine,
    addText,
    deleteSelected,
    clearCanvas,
    exportCanvas,
    getCanvas: () => svgRef.current,
  };

  // 初始化
  useEffect(() => {
    if (svgRef.current) {
      onReady?.(svgRef.current, methods);
    }
  }, [onReady, methods]);

  return (
    <div className="relative border border-gray-300 rounded">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ backgroundColor }}
        className="block"
        onClick={(e) => {
          if (e.target === svgRef.current) {
            setSelectedShape(null);
          }
        }}
      />
    </div>
  );
};

export default CanvasComponent;