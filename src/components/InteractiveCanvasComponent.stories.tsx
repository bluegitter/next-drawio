import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef } from 'react';
import InteractiveCanvasComponent, { CanvasComponentRef } from './InteractiveCanvasComponent';

const meta: Meta<typeof InteractiveCanvasComponent> = {
  title: 'Canvas/InteractiveCanvas',
  component: InteractiveCanvasComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '交互式画布组件，支持拖拽、调整大小、连接图元等高级功能。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 1800,
    height: 900,
    backgroundColor: '#ffffff',
  },
  render: (args) => {
    const canvasRef = useRef<CanvasComponentRef | null>(null);
    const [log, setLog] = useState<string[]>([]);

    const handleCanvasReady = (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
      canvasRef.current = methods;
      setLog(prev => [...prev, '画布初始化完成']);
      
      // 添加一些示例图形
      setTimeout(() => {
        methods.addRectangle();
        methods.addCircle();
        methods.addTriangle();
        setLog(prev => [...prev, '已添加示例图形']);
      }, 100);
    };

    const handleShapeSelect = (shape: SVGElement | null) => {
      const shapeType = shape?.tagName.toLowerCase() || '无';
      setLog(prev => [...prev, `选中图形: ${shapeType}`]);
    };

    const handleCanvasChange = () => {
      setLog(prev => [...prev, '画布内容已更改']);
    };

    return (
      <div className="flex flex-col gap-4">
        <InteractiveCanvasComponent
          {...args}
          width={args.width ?? 1800}
          height={args.height ?? 900}
          onReady={handleCanvasReady}
          onShapeSelect={handleShapeSelect}
          onCanvasChange={handleCanvasChange}
        />
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">操作日志</h3>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {log.map((entry, index) => (
              <div key={index} className="text-gray-600">
                {index + 1}. {entry}
              </div>
            ))}
          </div>
          <button
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            onClick={() => {
              if (canvasRef.current) {
                canvasRef.current.addRectangle();
                setLog(prev => [...prev, '添加矩形']);
              }
            }}
          >
            添加矩形
          </button>
          <button
            className="mt-2 ml-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
            onClick={() => {
              if (canvasRef.current) {
                canvasRef.current.addCircle();
                setLog(prev => [...prev, '添加圆形']);
              }
            }}
          >
            添加圆形
          </button>
        </div>
      </div>
    );
  },
};

export const WithCustomBackground: Story = {
  args: {
    width: 600,
    height: 400,
    backgroundColor: '#f3f4f6',
    autoResize: false,
    onReady: (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
      console.log('Canvas ready:', canvas);
      setTimeout(() => {
        methods.addRectangle();
        methods.addCircle();
      }, 100);
    },
  },
};

export const SmallCanvas: Story = {
  args: {
    width: 400,
    height: 300,
    backgroundColor: '#ffffff',
  },
};

export const LargeCanvas: Story = {
  args: {
    width: 1400,
    height: 900,
    backgroundColor: '#ffffff',
  },
};

export const DarkBackground: Story = {
  args: {
    width: 1800,
    height: 900,
    backgroundColor: '#1f2937',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    width: 1800,
    height: 900,
    backgroundColor: '#ffffff',
    autoResize: false,
    onReady: (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
      console.log('Canvas ready:', canvas);
      // 添加一些示例图形
      setTimeout(() => {
        methods.addRectangle();
        methods.addCircle();
        methods.addTriangle();
        console.log('已添加示例图形');
      }, 100);
    },
    onShapeSelect: (shape: SVGElement | null) => {
      const shapeType = shape?.tagName.toLowerCase() || '无';
      console.log(`选中图形: ${shapeType}`);
    },
    onCanvasChange: () => {
      console.log('画布内容已更改');
    },
  },
  render: (args) => {
    const canvasRef = useRef<CanvasComponentRef | null>(null);
    const [selectedInfo, setSelectedInfo] = useState<string>('无选中图形');
    const [isConnected, setIsConnected] = useState(false);

    const handleCanvasReady = (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
      canvasRef.current = methods;
      
      // 添加示例图形
      setTimeout(() => {
        methods.addRectangle();
        methods.addCircle();
        methods.addTriangle();
        methods.addLine();
      }, 100);
    };

    const handleShapeSelect = (shape: SVGElement | null) => {
      if (shape) {
        const type = shape.tagName.toLowerCase();
        setSelectedInfo(`选中: ${type} 图形`);
      } else {
        setSelectedInfo('无选中图形');
      }
    };

    const handleConnect = () => {
      if (canvasRef.current) {
        canvasRef.current.startConnection('shape-1'); // 假设连接第一个图形
        setIsConnected(true);
        setTimeout(() => setIsConnected(false), 2000);
      }
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => canvasRef.current?.addRectangle()}
          >
            添加矩形
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => canvasRef.current?.addCircle()}
          >
            添加圆形
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => canvasRef.current?.addTriangle()}
          >
            添加三角形
          </button>
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded"
            onClick={handleConnect}
            disabled={isConnected}
          >
            {isConnected ? '连接中...' : '创建连接'}
          </button>
        </div>
        
        <div className="p-3 bg-blue-50 rounded text-sm">
          <strong>状态:</strong> {selectedInfo}
        </div>
        
        <InteractiveCanvasComponent
          {...args}
          width={args.width ?? 1800}
          height={args.height ?? 900}
          onReady={handleCanvasReady}
          onShapeSelect={handleShapeSelect}
        />
        
        <div className="mt-4 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">交互功能说明:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>点击工具栏按钮添加不同类型的图形</li>
            <li>点击图形进行选择，选中的图形会显示红色虚线边框</li>
            <li>拖拽图形可以改变位置</li>
            <li>使用Shift+点击可以创建连接线</li>
            <li>按Delete键删除选中的图形</li>
            <li>支持导出为PNG、JPG、SVG格式</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const ConnectionDemo: Story = {
  args: {
    width: 800,
    height: 600,
    backgroundColor: '#f0f9ff',
  },
  render: (args) => {
    const canvasRef = useRef<CanvasComponentRef | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('等待操作');
    const [shapesCount, setShapesCount] = useState(0);

    const handleCanvasReady = (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
      canvasRef.current = methods;
      setConnectionStatus('画布已就绪，请添加图形');
      
      // 自动添加一些图形用于连接演示
      setTimeout(() => {
        methods.addRectangle();
        setTimeout(() => {
          methods.addCircle();
          setTimeout(() => {
            methods.addTriangle();
            setConnectionStatus('图形已添加，可以尝试连接操作');
            setShapesCount(3);
          }, 200);
        }, 200);
      }, 100);
    };

    const handleShapeSelect = (shape: SVGElement | null) => {
      if (shape) {
        const type = shape.tagName.toLowerCase();
        const id = shape.getAttribute('id') || 'unknown';
        setConnectionStatus(`选中图形: ${type} (${id})`);
      } else {
        setConnectionStatus('取消选择');
      }
    };

    const startConnectionMode = () => {
      if (canvasRef.current && canvasRef.current.getSelectedShape()) {
        canvasRef.current.startConnection('selected-shape');
        setConnectionStatus('连接模式已激活，请点击目标图形');
      } else {
        setConnectionStatus('请先选择一个源图形');
      }
    };

    const addShapesForConnection = () => {
      if (canvasRef.current) {
        canvasRef.current.addRectangle();
        canvasRef.current.addCircle();
        setShapesCount(prev => prev + 2);
        setConnectionStatus('已添加新图形，可以创建连接');
      }
    };

    const clearCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
        setShapesCount(0);
        setConnectionStatus('画布已清空');
      }
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-900 mb-2">
            🔗 连接功能演示
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-cyan-800 mb-1">连接操作</h4>
              <div className="space-y-2">
                <button
                  className="px-3 py-1 bg-cyan-600 text-white rounded text-sm w-full"
                  onClick={startConnectionMode}
                >
                  开始连接模式
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm w-full"
                  onClick={addShapesForConnection}
                >
                  添加图形用于连接
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm w-full"
                  onClick={clearCanvas}
                >
                  清空画布
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-cyan-800 mb-1">连接说明</h4>
              <ul className="text-sm text-cyan-700 space-y-1">
                <li>• 点击图形选中它</li>
                <li>• 按住Shift键点击另一个图形创建连接</li>
                <li>• 连接线会自动连接两个图形的中心点</li>
                <li>• 移动图形时连接线会跟随更新</li>
                <li>• 选中连接线可以删除它</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-cyan-100 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-cyan-800">状态: {connectionStatus}</span>
              <span className="text-sm text-cyan-600">图形数量: {shapesCount}</span>
            </div>
          </div>
        </div>

        <InteractiveCanvasComponent
          {...args}
          width={args.width ?? 800}
          height={args.height ?? 600}
          onReady={handleCanvasReady}
          onShapeSelect={handleShapeSelect}
        />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">连接功能特性</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h5 className="font-medium">🎯 智能连接</h5>
              <ul className="mt-1 space-y-1">
                <li>自动计算图形中心点</li>
                <li>实时更新连接路径</li>
                <li>防止自连接</li>
                <li>避免重复连接</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium">🛠️ 连接管理</h5>
              <ul className="mt-1 space-y-1">
                <li>支持多对多连接</li>
                <li>连接线样式可定制</li>
                <li>选中状态视觉反馈</li>
                <li>批量操作支持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '专门演示图元连接功能，展示如何创建、管理和使用连接线来关联不同的图形元素。',
      },
    },
  },
};

export const AdvancedConnectionDemo: Story = {
  args: {
    width: 900,
    height: 700,
    backgroundColor: '#ffffff',
  },
  render: (args) => {
    const canvasRef = useRef<CanvasComponentRef | null>(null);
    const [mode, setMode] = useState<'select' | 'connect'>('select');
    const [stats, setStats] = useState({ shapes: 0, connections: 0 });

    const handleCanvasReady = (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
      canvasRef.current = methods;
      
      // 创建一个复杂的连接场景
      setTimeout(() => {
        // 添加中心节点
        methods.addRectangle();
        setTimeout(() => {
          // 添加周围的节点
          methods.addCircle();
          methods.addCircle();
          methods.addTriangle();
          methods.addTriangle();
          setStats({ shapes: 5, connections: 0 });
        }, 100);
      }, 100);
    };

    const handleShapeSelect = (shape: SVGElement | null) => {
      // 处理选择逻辑
    };

    const createNetwork = () => {
      if (canvasRef.current) {
        // 清空画布
        canvasRef.current.clearCanvas();
        
        // 创建网络拓扑
        const shapes = [];
        for (let i = 0; i < 6; i++) {
          canvasRef.current.addRectangle();
          shapes.push(`shape-${i + 1}`);
        }
        
        setStats({ shapes: 6, connections: 0 });
      }
    };

    const toggleMode = () => {
      setMode(prev => prev === 'select' ? 'connect' : 'select');
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            🌐 高级连接演示
          </h3>
          
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-800">当前模式:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                mode === 'select' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {mode === 'select' ? '选择模式' : '连接模式'}
              </span>
            </div>
            
            <button
              onClick={toggleMode}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                mode === 'select'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              切换到{mode === 'select' ? '连接' : '选择'}模式
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={createNetwork}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
            >
              创建网络拓扑
            </button>
            
            <button
              onClick={() => canvasRef.current?.addRectangle()}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
            >
              添加矩形
            </button>
            
            <button
              onClick={() => canvasRef.current?.addCircle()}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm"
            >
              添加圆形
            </button>
          </div>
          
          <div className="mt-3 bg-indigo-100 rounded p-2 flex justify-between">
            <span className="text-sm text-indigo-800">图形: {stats.shapes}</span>
            <span className="text-sm text-indigo-800">连接: {stats.connections}</span>
            <span className="text-sm text-indigo-600">模式: {mode === 'select' ? '选择/移动' : '连接创建'}</span>
          </div>
        </div>

        <InteractiveCanvasComponent
          {...args}
          width={args.width ?? 900}
          height={args.height ?? 700}
          onReady={handleCanvasReady}
          onShapeSelect={handleShapeSelect}
        />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">高级功能说明</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>模式切换:</strong> 在选择模式和连接模式之间切换，不同的模式提供不同的交互体验。</p>
            <p><strong>网络拓扑:</strong> 一键创建复杂的图形网络，展示多节点连接场景。</p>
            <p><strong>实时统计:</strong> 显示当前画布上的图形数量和连接数量。</p>
            <p><strong>智能连接:</strong> 系统自动计算最优连接路径，避免线条重叠。</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '高级连接演示，展示复杂的图形网络创建、模式切换、以及高级的连接管理功能。',
      },
    },
  },
};
