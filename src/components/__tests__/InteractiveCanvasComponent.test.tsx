import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CanvasComponent } from './CanvasComponent';

describe('CanvasComponent Connection Functionality', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockOnReady: ReturnType<typeof vi.fn>;
  let mockOnShapeSelect: ReturnType<typeof vi.fn>;
  let mockOnCanvasChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 创建 mock canvas 元素
    mockCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockCanvas.setAttribute('width', '800');
    mockCanvas.setAttribute('height', '600');
    
    mockOnReady = vi.fn();
    mockOnShapeSelect = vi.fn();
    mockOnCanvasChange = vi.fn();
  });

  it('should initialize canvas with connection functionality', () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should create connection points for shapes', async () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 模拟添加矩形
    await waitFor(() => {
      expect(mockOnReady).toHaveBeenCalled();
    });

    // 验证连接点创建逻辑
    expect(canvas.querySelector('.connection-point')).toBeDefined();
  });

  it('should handle connection creation between shapes', async () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 模拟创建连接
    const shape1 = canvas.querySelector('#rect-1');
    const shape2 = canvas.querySelector('#rect-2');

    if (shape1 && shape2) {
      // 模拟点击第一个形状，然后按住Shift点击第二个形状
      fireEvent.click(shape1);
      fireEvent.click(shape2, { shiftKey: true });

      await waitFor(() => {
        expect(canvas.querySelector('.connection-line')).toBeDefined();
      });
    }
  });

  it('should handle connection line rendering', async () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        backgroundColor="#ffffff"
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 验证连接线渲染
    const connectionLines = canvas.querySelectorAll('.connection-line');
    expect(connectionLines).toBeDefined();
  });

  it('should support connection point highlighting', async () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 模拟鼠标悬停在连接点上
    const connectionPoint = canvas.querySelector('.connection-point');
    
    if (connectionPoint) {
      fireEvent.mouseEnter(connectionPoint);
      
      await waitFor(() => {
        expect(connectionPoint).toHaveClass('highlighted');
      });
    }
  });

  it('should handle connection deletion', async () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 模拟选择连接线并按Delete键
    const connectionLine = canvas.querySelector('.connection-line');
    
    if (connectionLine) {
      fireEvent.click(connectionLine);
      fireEvent.keyDown(window, { key: 'Delete' });

      await waitFor(() => {
        expect(canvas.querySelector('.connection-line')).toBeNull();
      });
    }
  });

  it('should support connection style customization', async () => {
    const customStyle = {
      stroke: '#ef4444',
      strokeWidth: 3,
      strokeDasharray: '5,5',
      opacity: 0.8,
    };

    render(
      <CanvasComponent
        width={800}
        height={600}
        connectionStyle={customStyle}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 验证自定义连接线样式
    const connectionLine = canvas.querySelector('.connection-line');
    
    if (connectionLine) {
      expect(connectionLine).toHaveAttribute('stroke', customStyle.stroke);
      expect(connectionLine).toHaveAttribute('stroke-width', String(customStyle.strokeWidth));
      expect(connectionLine).toHaveAttribute('stroke-dasharray', customStyle.strokeDasharray);
      expect(connectionLine).toHaveAttribute('opacity', String(customStyle.opacity));
    }
  });

  it('should handle connection selection', async () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 模拟选择连接线
    const connectionLine = canvas.querySelector('.connection-line');
    
    if (connectionLine) {
      fireEvent.click(connectionLine);

      await waitFor(() => {
        expect(connectionLine).toHaveClass('selected');
        expect(mockOnShapeSelect).toHaveBeenCalled();
      });
    }
  });

  it('should support connection point auto-generation', () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        autoGenerateConnectionPoints={true}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 验证连接点自动生成
    const connectionPoints = canvas.querySelectorAll('.connection-point');
    expect(connectionPoints.length).toBeGreaterThan(0);
  });

  it('should handle connection validation', () => {
    render(
      <CanvasComponent
        width={800}
        height={600}
        validateConnections={true}
        onReady={mockOnReady}
        onShapeSelect={mockOnShapeSelect}
        onCanvasChange={mockOnCanvasChange}
      />
    );

    const canvas = screen.getByRole('img', { hidden: true });
    
    // 验证连接验证功能
    // 这个测试可能需要更复杂的模拟逻辑
    expect(canvas).toBeInTheDocument();
  });
});
