"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

// 绘图引擎核心类
class DrawingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shapes = [];
    this.selectedShape = null;
    this.history = [];
    this.historyStep = -1;
    this.gridSize = 20;
    this.snapThreshold = 8;
  }

  // 添加形状
  addShape(type, options = {}) {
    const shape = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...options,
      visible: true,
      locked: false,
      opacity: 1,
    };

    this.shapes.push(shape);
    return shape;
  }

  // 选择形状
  selectShape(shapeId) {
    this.selectedShape = this.shapes.find(s => s.id === shapeId);
    return this.selectedShape;
  }

  // 删除形状
  deleteShape(shapeId) {
    this.shapes = this.shapes.filter(s => s.id !== shapeId);
    if (this.selectedShape?.id === shapeId) {
      this.selectedShape = null;
    }
    this.saveToHistory();
  }

  // 保存历史记录
  saveToHistory() {
    const state = {
      shapes: JSON.parse(JSON.stringify(this.shapes)),
      selectedShapeId: this.selectedShape?.id,
    };
    
    this.history = this.history.slice(0, this.historyStep + 1);
    this.history.push(state);
    
    if (this.history.length > 50) {
      this.history.shift();
    } else {
      this.historyStep++;
    }
  }

  // 撤销操作
  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      const state = this.history[this.historyStep];
      this.shapes = JSON.parse(JSON.stringify(state.shapes));
      this.selectedShape = this.shapes.find(s => s.id === state.selectedShapeId);
      return true;
    }
    return false;
  }

  // 重做操作
  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      const state = this.history[this.historyStep];
      this.shapes = JSON.parse(JSON.stringify(state.shapes));
      this.selectedShape = this.shapes.find(s => s.id === state.selectedShapeId);
      return true;
    }
    return false;
  }

  // 清空画布
  clear() {
    this.shapes = [];
    this.selectedShape = null;
    this.saveToHistory();
  }

  // 导出为SVG
  exportToSVG() {
    const svgElements = this.shapes.map(shape => this.shapeToSVG(shape)).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">${svgElements}</svg>`;
  }

  // 导出为PNG
  exportToPNG(callback) {
    this.canvas.toBlob(callback, { type: 'image/png' });
  }
}

// 形状基类
class Shape {
  constructor(id, type, x, y, options = {}) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.options = { fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, ...options };
    this.selected = false;
    this.hovering = false;
  }

  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    ctx.globalAlpha = this.options.opacity ?? 1;
    
    ctx.fillStyle = this.options.fill;
    ctx.strokeStyle = this.options.stroke;
    ctx.lineWidth = this.options.strokeWidth;

    switch (this.type) {
      case 'rect':
        if (this.options.borderRadius) {
          this.drawRoundedRect(ctx);
        } else {
          ctx.fillRect(this.x, this.y, this.width, this.height);
          if (this.options.strokeWidth > 0) {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
          }
        }
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        if (this.options.strokeWidth > 0) {
          ctx.stroke();
        }
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
        if (this.options.strokeWidth > 0) {
          ctx.stroke();
        }
        break;
    }

    drawRoundedRect(ctx) {
      const r = this.options.borderRadius;
      ctx.beginPath();
      ctx.moveTo(this.x + r, this.y);
      ctx.lineTo(this.x + this.width - r, this.y);
      ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + r);
      ctx.lineTo(this.x + this.width, this.y + this.height - r);
      ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + r, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height - r);
      ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - r, this.y + this.height);
      ctx.lineTo(this.x + r, this.y + this.height);
      ctx.quadraticCurveTo(this.x, this.y + this.height - r, this.x, this.y + this.height);
      ctx.lineTo(this.x, this.y + r);
      ctx.closePath();
    }

  // 检查点是否在形状内
  contains(x, y) {
    switch (this.type) {
      case 'rect':
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
      case 'circle':
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
      case 'triangle':
        // 简化三角形检测
        return this.pointInTriangle(x, y);
      default:
        return false;
    }
  }

  pointInTriangle(x, y) {
    const { vertices } = this.getTriangleVertices();
    return this.pointInPolygon(x, y, vertices);
  }

  getTriangleVertices() {
    return [
      [this.x, this.y - this.height / 2],
      [this.x - this.width / 2, this.y + this.height / 2],
      [this.x + this.width / 2, this.y + this.height / 2],
    ];
  }

  pointInPolygon(x, y, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1, k = vertices.length - 1; i < vertices.length; i++) {
      if (((vertices[i].y <= y && y < vertices[j].y) || 
           ((vertices[i].y >= y && y > vertices[j].y))) {
        if (x <= vertices[i].x === x <= vertices[j].x ||
            x >= vertices[i].x === x >= vertices[j].x) ||
            (vertices[j].x - vertices[i].x) * (y - vertices[i].y) - 
             (vertices[j].x - vertices[i].x) * (y - vertices[i].y) > 0) {
          inside = !inside;
        }
      }
    }
    return inside;
  }
}

// 矩形类
export class Rectangle extends Shape {
  constructor(id, x, y, width, height, options = {}) {
    super(id, 'rect', x, y, options);
    this.width = width;
    this.height = height;
  }

  draw(ctx) {
    this.options = { ...this.options, ...this.getRectangleOptions() };
    super.draw(ctx);
  }

  getRectangleOptions() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      ...this.options,
    };
  }
}

// 圆形类
export class Circle extends Shape {
  constructor(id, x, y, radius, options = {}) {
    super(id, 'circle', x, y, options);
    this.radius = radius;
    this.width = radius * 2;
    this.height = radius * 2;
  }

  draw(ctx) {
    this.options = { ...this.options, ...this.getCircleOptions() };
    super.draw(ctx);
  }

  getCircleOptions() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      radius: this.radius,
      ...this.options,
    };
  }
}

// 三角形类
export class Triangle extends Shape {
  constructor(id, x, y, width, height, options = {}) {
    super(id, 'triangle', x, y, options);
    this.width = width;
    this.height = height;
  }

  draw(ctx) {
    this.options = { ...this.options, ...this.getTriangleOptions() };
    super.draw(ctx);
  }

  getTriangleOptions() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      ...this.options,
    };
  }
}

// 线条类
export class Line extends Shape {
  constructor(id, x1, y1, x2, y2, options = {}) {
    super(id, 'line', x1, y1, options);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = Math.abs(x2 - x1);
    this.height = Math.abs(y2 - y1);
  }

  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    ctx.globalAlpha = this.options.opacity ?? 1;
    ctx.strokeStyle = this.options.stroke;
    ctx.lineWidth = this.options.strokeWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    
    ctx.restore();
  }

  contains(x, y) {
    const minX = Math.min(this.x1, this.x2);
    const maxX = Math.max(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxX = Math.max(this.y1, this.y2);
    
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
}

// 文字类
export class Text extends Shape {
  constructor(id, x, y, text, options = {}) {
    super(id, 'text', x, y, options);
    this.text = text;
    this.width = 100;
    this.height = 20;
  }

  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    ctx.globalAlpha = this.options.opacity ?? 1;
    ctx.font = this.options.font || '16px Arial';
    ctx.fillStyle = this.options.fill || '#000000';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y - 10 && y <= this.y + 10;
  }
}

// 连接线类
export class ConnectionLine extends Shape {
  constructor(id, startShape, endShape, options = {}) {
    super(id, 'connection', 0, 0, options);
    this.startShape = startShape;
    this.endShape = endShape;
    this.options = { stroke: '#6b7280', strokeWidth: 2, strokeDasharray: '5,5', ...options };
    this.width = 0;
    this.height = 0;
  }

  draw(ctx) {
    if (!this.startShape || !this.endShape || !this.options.visible) return;

    const sx = this.startShape.x + this.startShape.width / 2;
    const sy = this.startShape.y + this.startShape.height / 2;
    const ex = this.endShape.x + this.endShape.width / 2;
    const ey = this.endShape.y + this.endShape.height / 2;

    ctx.save();
    ctx.globalAlpha = this.options.opacity ?? 1;
    ctx.strokeStyle = this.options.stroke;
    ctx.lineWidth = this.options.strokeWidth;
    ctx.setLineDash(this.options.strokeDasharray ? [5, 5] : []);

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    
    ctx.restore();
  }

  contains(x, y) {
    return false; // 连接线不参与选择
  }
}

// 高级画布组件
export function AdvancedCanvasComponent({ width = 800, height = 600, onReady, onError, ...props }) {
  const canvasRef = useRef(null);
  const [engine, setEngine] = useState(null);
  const [currentTool, setCurrentTool] = useState('select');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [showGrid, setShowGrid] = useState(true);
  const [showSnapIndicators, setShowSnapIndicators] = useState(false);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);

  // 初始化引擎
  useEffect(() => {
    if (canvasRef.current && !engine) {
      const drawingEngine = new DrawingEngine(canvasRef.current);
      setEngine(drawingEngine);
      onReady?.(drawingEngine);
    }
  }, [canvasRef.current, engine, onReady]);

  // 形状列表
  const shapes = engine?.shapes || [];

  // 绘制功能
  const startDrawing = useCallback((type, e) => {
    if (!engine) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = engine.snapToGrid(x, y);

    let shape;
    const options = { fillColor, strokeColor, strokeWidth };

    switch (currentTool) {
      case 'rectangle':
        const startX = engine.snapToGrid(x, y);
        shape = engine.addShape('rect', { ...options, x: startX, y: snapped.y, width: 0, height: 0 });
        break;
      case 'circle':
        const radius = 50;
        shape = engine.addShape('circle', { ...options, x: snapped.x, y: snapped.y, radius });
        break;
      case 'triangle':
        const width = 100;
        const height = 80;
        shape = engine.addShape('triangle', { ...options, x: snapped.x - width/2, y: snapped.y - height/2, width, height });
        break;
      case 'line':
        shape = engine.addShape('line', { ...options, x1: snapped.x, y1: snapped.y, x2: snapped.x, y2: snapped.y });
        break;
      case 'text':
        const text = prompt('请输入文字:', '示例文字');
        if (text) {
          shape = engine.addShape('text', { ...options, x: snapped.x, y: snapped.y, text, fontSize, fontFamily });
        }
        break;
      case 'connection':
        if (!connectionStart) {
          const startShape = engine.getShapeAt(x, y);
          if (startShape) {
            setConnectionStart(startShape);
            setConnectionMode(true);
          }
        } else {
          const endShape = engine.getShapeAt(x, y);
          if (endShape && endShape !== connectionStart) {
          engine.addConnection(connectionStart, endShape);
          setConnectionMode(false);
          setConnectionStart(null);
        }
        }
        break;
    }

    if (shape) {
      engine.isDrawing = true;
      engine.currentShape = shape;
    }
  }, [engine, currentTool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, connectionStart, connectionMode]);

  // 更新绘图
  const updateDrawing = useCallback((e) => {
    if (!engine?.isDrawing || !engine.currentShape) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = engine.snapToGrid(x, y);

    switch (engine.currentShape.type) {
      case 'rect':
        const startX = engine.currentShape.x;
        const startY = engine.currentShape.y;
        engine.currentShape.width = snapped.x - startX;
        engine.currentShape.height = snapped.y - startY;
        break;
      case 'circle':
        const dx = snapped.x - engine.currentShape.x;
        const dy = snapped.y - engine.currentShape.y;
        engine.currentShape.radius = Math.sqrt(dx * dx + dy * dy);
        engine.currentShape.width = engine.currentShape.height = engine.currentShape.radius * 2;
        break;
      case 'triangle':
        const dx = snapped.x - engine.currentShape.x + engine.currentShape.width / 2;
        const dy = snapped.y - engine.currentShape.y + engine.currentShape.height / 2;
        engine.currentShape.width = dx * 2;
        engine.currentShape.height = dy * 2;
        break;
      case 'line':
        engine.currentShape.x2 = snapped.x;
        engine.currentShape.y2 = snapped.y;
        engine.currentShape.width = Math.abs(engine.currentShape.x2 - engine.currentShape.x1);
        engine.currentShape.height = Math.abs(engine.currentShape.y2 - engine.currentShape.y1);
        break;
    }
  }, [engine]);

  // 结束绘图
  const endDrawing = useCallback(() => {
    if (!engine?.isDrawing) return;
    
    if (engine.currentShape) {
      // 规范化形状尺寸和位置
      engine.currentShape.options = {
        ...engine.currentShape.options,
        ...engine.currentShape.getNormalizedOptions(),
        opacity: 1,
      };
      
      engine.currentShape.visible = true;
    }
    
    engine.isDrawing = false;
    engine.currentShape = null;
  }, [engine]);

  // 渲染循环
  const render = useCallback(() => {
    if (!engine || !canvasRef.current) return;
    
    const ctx = engine.ctx;
    
    // 清空画布
    ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
    
    // 绘制网格
    if (showGrid) {
      engine.drawGrid(ctx);
    }
    
    // 绘制连接线
    if (engine.connectionLines) {
      engine.connectionLines.forEach(line => {
        const startCenter = engine.getShapeCenter(line.startShape);
        const endCenter = engine.getShapeCenter(line.endShape);
        
        if (startCenter && endCenter) {
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = line.options.stroke || '#6b7280';
          ctx.lineWidth = line.options.strokeWidth || 2;
          ctx.setLineDash(line.options.strokeDasharray || [5, 5]);
          
          ctx.beginPath();
          ctx.moveTo(startCenter.x, startCenter.y);
          ctx.lineTo(endCenter.x, endCenter.y);
          ctx.stroke();
          
          ctx.restore();
        }
      });
    }
    
    // 绘制形状
    shapes.forEach(shape => {
      const shapeObj = engine.createShapeObject(shape);
      if (shapeObj) {
        shapeObj.draw(ctx);
        
        // 绘制选择框
        if (shape.id === engine.selectedShape?.id) {
          engine.drawSelection(ctx, shapeObj);
        }
        
        // 绘制悬停效果
        if (shape.id === engine.hoveringShape?.id) {
          engine.drawHoverEffect(ctx, shapeObj);
        }
      }
    });
  }, [engine, shapes, showGrid]);

  // 鼠标事件处理
  const handleMouseMove = useCallback((e) => {
    if (!engine) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 吸附检测
    const shape = engine.getShapeAt(x, y);
    if (shape !== engine.hoveringShape) {
      if (engine.hoveringShape) {
        engine.hoveringShape.hovering = false;
      }
      if (shape) {
        shape.hovering = true;
        engine.hoveringShape = shape;
      }
      canvasRef.current.style.cursor = shape ? 'pointer' : 'default';
    }
    
    updateDrawing(e);
    render();
  }, [engine, updateDrawing, render]);

  const handleMouseDown = useCallback((e) => {
    startDrawing(e.type, e);
  }, [startDrawing]);

  const handleMouseUp = useCallback(() => {
    endDrawing();
    }, [endDrawing]);

  const handleDoubleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!engine) return;
    
    const shape = engine.getShapeAt(x, y);
    if (shape && shape.type === 'text') {
      const newText = prompt('编辑文字:', shape.text || '');
      if (newText !== null) {
        shape.text = newText;
        engine.saveToHistory();
        render();
      }
    }
  }, [engine, render]);

  // 工具切换
  const handleToolChange = useCallback((tool) => {
    setCurrentTool(tool);
    engine.currentShape = null;
    engine.isDrawing = false;
    setConnectionMode(false);
    setConnectionStart(null);
  }, [engine]);

  // 颜色控制
  const handleColorChange = useCallback((color, type) => {
    if (type === 'fill') {
      setFillColor(color);
    } else {
      setStrokeColor(color);
    }
  }, []);

  // 画布设置
  const handleCanvasSettings = useCallback((key, value) => {
    switch (key) {
      case 'fillColor':
        setFillColor(value);
        break;
      case 'strokeColor':
        setStrokeColor(value);
        break;
      case 'strokeWidth':
        setStrokeWidth(value);
        break;
      case 'fontSize':
        setFontSize(value);
        break;
      case 'fontFamily':
        setFontFamily(value);
        break;
      case 'showGrid':
        setShowGrid(value);
        break;
      case 'showSnapIndicators':
        setShowSnapIndicators(value);
        break;
    }
  }, []);

  // 历史操作
  const handleUndo = useCallback(() => {
    if (engine?.undo()) {
      render();
    }
  }, [engine, render]);

  const handleRedo = useCallback(() => {
    if (engine?.redo()) {
      render();
    }
  }, [engine, render]);

  const handleClear = useCallback(() => {
    if (engine && window.confirm('确定要清空画布吗？')) {
      engine.clear();
      render();
    }
  }, [engine]);

  // 导出功能
  const handleExport = useCallback((format) => {
    if (!engine) return;

    switch (format) {
      case 'svg':
        const svgContent = engine.exportToSVG();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drawing.svg`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      case 'png':
        engine.exportToPNG((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `drawing.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
        break;
    }
  }, [engine]);

  // 删除选中形状
  const deleteSelected = useCallback(() => {
    if (engine && engine.selectedShape) {
      engine.deleteShape(engine.selectedShape.id);
      render();
    }
  }, [engine, render]);

  // 工具栏
  const tools = [
    { id: 'select', name: '选择', icon: '↖', shortcut: 'V' },
    { id: 'rectangle', name: '矩形', icon: '▢', shortcut: 'R' },
    { id: 'circle', name: '圆形', icon: '○', shortcut: 'C' },
    { id: 'triangle', name: '三角形', icon: '△', shortcut: 'T' },
    { id: 'line', name: '直线', icon: '╱', shortcut: 'L' },
    { id: 'text', name: '文字', icon: 'T', shortcut: 'X' },
    { id: 'connection', name: '连接', icon: '🔗', shortcut: 'K' },
  ];

  return (
    <div className="flex flex-col gap-4 bg-white rounded-lg shadow-lg p-6">
      {/* 工具栏 */}
      <div className="flex gap-2 pb-4 border-b border-gray-200">
        <div className="flex gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`px-4 py-2 rounded-md border ${
                currentTool === tool.id ? 'border-blue-500 bg-blue-50 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="text-xs ml-1">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* 颜色设置 */}
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">填充颜色</label>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => handleColorChange(e.target.value, 'fill')}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">边框颜色</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => handleColorChange(e.target.value, 'stroke')}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">边框宽度</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => handleCanvasSettings('strokeWidth', Number(e.target.value))}
              className="w-20 h-2"
            />
            <span className="text-sm text-gray-600 ml-1">{strokeWidth}px</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">字体大小</label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => handleCanvasSettings('fontSize', Number(e.target.value))}
              className="w-20 h-2"
            />
            <span className="text-sm text-gray-600 ml-1">{fontSize}px</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">字体</label>
            <select
              value={fontFamily}
              onChange={(e) => handleCanvasSettings('fontFamily', e.target.value)}
              className="w-24 h-8 border border-gray-300 rounded cursor-pointer"
            >
              <option value="Arial">Arial</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
        </div>

        {/* 画布设置 */}
        <div className="flex gap-2">
          <button
            onClick={() => handleCanvasSettings('showGrid', !showGrid)}
            className={`px-3 py-1 rounded-md border ${
              showGrid ? 'border-blue-500 bg-blue-50 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
            }`}
            title={showGrid ? '隐藏网格' : '显示网格'}
          >
            网格
          </button>
          <button
            onClick={() => handleCanvasSettings('showSnapIndicators', !showSnapIndicators)}
            className={`px-3 py-1 rounded-md border ${
              showSnapIndicators ? 'border-blue-500 bg-blue-50 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
            }`}
            title={showSnapIndicators ? '隐藏吸附指示器' : '显示吸附指示器'}
          >
            吸附
          </button>
          <button
            onClick={() => handleUndo()}
            disabled={!engine || !engine.canUndo()}
            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            title="撤销 (Ctrl+Z)"
          >
            撤销
          </button>
          <button
            onClick={() => handleRedo()}
            disabled={!engine || !engine.canRedo()}
            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            title="重做 (Ctrl+Y)"
          >
            重做
          </button>
          <button
            onClick={() => handleClear()}
            className="px-3 py-1 rounded-md border border-red-300 bg-white text-red-700 hover:bg-red-600"
            title="清空画布"
          >
            清空
          </button>
        </div>
      </div>

      {/* 画布状态栏 */}
      <div className="flex items-center justify-between text-xs text-gray-600 px-2">
        <div>
          形状: {shapes.length} | 
          {shapes.length > 0 && (
            <span>选中: {engine.selectedShape ? engine.selectedShape.id.substring(0, 8)}...</span>
          )}
          {engine.isDrawing && '正在绘制...'}
          {connectionMode && '连接模式: ' + connectionStart?.id?.substring(0, 8) + '...'}
        </div>
        <div>
          画布: {width} × {height}px
          {engine?.historyStep >= 0 && `历史: ${engine.historyStep + 1}/${engine.history.length}`}
        </div>
      </div>

      {/* 画布 */}
      <div className="relative bg-gray-50 rounded" style={{ width: width + 'px', height: height + 'px' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-300 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

      {/* 导出按钮 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleExport('svg')}
          className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
        >
          <span>📄</span>
          导出SVG
        </button>
        <button
          onClick={() => handleExport('png')}
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
        >
          <span>🖼</span>
          导出PNG
        </button>
        {engine?.selectedShape && (
          <button
            onClick={deleteSelected}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
          >
            <span>🗑</span>
            删除
          </button>
        )}
        </div>
    </div>
  );
}

export default AdvancedCanvasComponent;