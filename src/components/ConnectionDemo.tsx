import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CanvasComponent, CanvasComponentRef } from '@/components/CanvasComponent';
import { ConnectionManager, ConnectionPathCalculator, DefaultConnectionPointGenerator } from '@/lib/connection';
import { ConnectionData, ConnectionLineStyle, ConnectionEndStyle } from '@/types/connection';

interface ConnectionDemoProps {
  width: number;
  height: number;
}

export const ConnectionDemo: React.FC<ConnectionDemoProps> = ({ width, height }) => {
  const canvasRef = useRef<CanvasComponentRef | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [connectionManager] = useState(() => new ConnectionManager());
  const [mode, setMode] = useState<'select' | 'connect'>('select');
  const [connectionStyle, setConnectionStyle] = useState<ConnectionLineStyle>('straight');
  const [connectionStroke, setConnectionStroke] = useState('#6b7280');
  const [connectionWidth, setConnectionWidth] = useState(2);
  const [endStyle, setEndStyle] = useState<ConnectionEndStyle>('arrow');
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [stats, setStats] = useState({ shapes: 0, connections: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // 初始化连接管理器事件监听
  useEffect(() => {
    const handleConnectionCreated = ({ connection }: { connection: ConnectionData }) => {
      setStats(prev => ({ ...prev, connections: prev.connections + 1 }));
      console.log('连接已创建:', connection);
    };

    const handleConnectionDeleted = ({ connectionId }: { connectionId: string }) => {
      setStats(prev => ({ ...prev, connections: Math.max(0, prev.connections - 1) }));
      if (selectedConnection === connectionId) {
        setSelectedConnection(null);
      }
      console.log('连接已删除:', connectionId);
    };

    const handleConnectionSelected = ({ connectionId }: { connectionId: string }) => {
      setSelectedConnection(connectionId);
      console.log('连接已选中:', connectionId);
    };

    connectionManager.on('connection:created', handleConnectionCreated);
    connectionManager.on('connection:deleted', handleConnectionDeleted);
    connectionManager.on('connection:selected', handleConnectionSelected);

    return () => {
      connectionManager.off('connection:created', handleConnectionCreated);
      connectionManager.off('connection:deleted', handleConnectionDeleted);
      connectionManager.off('connection:selected', handleConnectionSelected);
    };
  }, [connectionManager, selectedConnection]);

  // 处理画布就绪
  const handleCanvasReady = useCallback((canvas: SVGSVGElement, methods: CanvasComponentRef) => {
    canvasRef.current = methods;
    svgRef.current = canvas;
    
    // 设置连接管理器
    connectionManager.updateConfig({
      defaultStyle: connectionStyle,
      defaultStroke: connectionStroke,
      defaultStrokeWidth: connectionWidth,
      defaultEndStyle: endStyle
    });

    // 自动添加一些图形用于演示
    setTimeout(() => {
      methods.addRectangle();
      setTimeout(() => {
        methods.addCircle();
        setTimeout(() => {
          methods.addTriangle();
          setStats(prev => ({ ...prev, shapes: 3 }));
        }, 200);
      }, 200);
    }, 100);
  }, [connectionManager, connectionStyle, connectionStroke, connectionWidth, endStyle]);

  // 处理图形选择
  const handleShapeSelect = useCallback((shape: SVGElement | null) => {
    if (mode === 'connect' && shape) {
      const shapeId = shape.getAttribute('id');
      
      if (!connectingFrom) {
        // 开始连接
        if (shapeId) {
          setConnectingFrom(shapeId);
          setIsConnecting(true);
          canvasRef.current?.startConnection(shapeId);
        }
      } else if (shapeId !== connectingFrom) {
        // 完成连接
        try {
          if (connectingFrom && shapeId) {
            const pointGenerator = new DefaultConnectionPointGenerator();
            const fromCenter = pointGenerator.getPointPosition('rect', { x: 100, y: 100 }, 'center');
            const toCenter = pointGenerator.getPointPosition('circle', { x: 200, y: 150 }, 'center');
            
            const fromPoint = {
              id: `point-${connectingFrom}-center`,
              type: 'center' as const,
              position: fromCenter,
              offset: { x: 0, y: 0 },
              visible: true,
              highlighted: false
            };
            
            const toPoint = {
              id: `point-${shapeId}-center`,
              type: 'center' as const,
              position: toCenter,
              offset: { x: 0, y: 0 },
              visible: true,
              highlighted: false
            };
            
            connectionManager.createConnection(connectingFrom, shapeId, fromPoint, toPoint);
          }
        } catch (error) {
          console.error('创建连接失败:', error);
        }
        
        // 重置连接状态
        setConnectingFrom(null);
        setIsConnecting(false);
      }
    }
  }, [mode, connectingFrom, connectionManager]);

  // 创建网络拓扑
  const createNetwork = useCallback(() => {
    if (!canvasRef.current) return;

    // 清空画布
    canvasRef.current.clearCanvas();
    connectionManager.clear();

    // 创建网络结构
    const shapes = [];
    for (let i = 0; i < 6; i++) {
      canvasRef.current.addRectangle();
      shapes.push(`shape-${i + 1}`);
    }
    
    setStats({ shapes: 6, connections: 0 });
  }, [connectionManager]);

  // 添加连接线
  const addConnection = useCallback(() => {
    if (mode === 'connect') {
      setMode('select');
      setIsConnecting(false);
      setConnectingFrom(null);
    } else {
      setMode('connect');
    }
  }, [mode]);

  // 删除选中的连接
  const deleteSelectedConnection = useCallback(() => {
    if (selectedConnection) {
      connectionManager.deleteConnection(selectedConnection);
      setSelectedConnection(null);
    }
  }, [selectedConnection, connectionManager]);

  // 清空画布
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.clearCanvas();
    connectionManager.clear();
    setStats({ shapes: 0, connections: 0 });
    setSelectedConnection(null);
    setConnectingFrom(null);
    setIsConnecting(false);
  }, [connectionManager]);

  // 切换模式
  const toggleMode = useCallback(() => {
    const newMode = mode === 'select' ? 'connect' : 'select';
    setMode(newMode);
    if (newMode === 'select') {
      setIsConnecting(false);
      setConnectingFrom(null);
    }
  }, [mode]);

  // 渲染连接线
  const renderConnections = useCallback(() => {
    if (!svgRef.current) return;

    const connections = connectionManager.getAllConnections();
    const connectionsGroup = svgRef.current.getElementById('connections-group');
    
    if (connectionsGroup) {
      connectionsGroup.innerHTML = '';
      
      connections.forEach(connection => {
        const connectionHtml = connectionManager.renderConnection(connection);
        connectionsGroup.insertAdjacentHTML('beforeend', connectionHtml);
      });
    }
  }, [connectionManager]);

  // 监听连接变化并重新渲染
  useEffect(() => {
    renderConnections();
  }, [renderConnections]);

  return (
    <div className="connection-demo">
      {/* 控制面板 */}
      <div className="demo-controls bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">
          🔗 图元连接功能演示
        </h3>
        
        {/* 模式切换 */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-indigo-800">当前模式:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            mode === 'select' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {mode === 'select' ? '选择模式' : '连接模式'}
          </span>
          <button
            onClick={toggleMode}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              mode === 'select'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            切换到{mode === 'select' ? '连接' : '选择'}模式
          </button>
        </div>
        
        {/* 连接样式控制 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">
              连接样式
            </label>
            <select
              value={connectionStyle}
              onChange={(e) => setConnectionStyle(e.target.value as ConnectionLineStyle)}
              className="w-full px-2 py-1 border border-indigo-300 rounded text-sm"
            >
              <option value="straight">直线</option>
              <option value="orthogonal">直角</option>
              <option value="curved">曲线</option>
              <option value="bezier">贝塞尔</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">
              线条颜色
            </label>
            <input
              type="color"
              value={connectionStroke}
              onChange={(e) => setConnectionStroke(e.target.value)}
              className="w-full h-8 border border-indigo-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">
              线条宽度
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={connectionWidth}
              onChange={(e) => setConnectionWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">
              端点样式
            </label>
            <select
              value={endStyle}
              onChange={(e) => setEndStyle(e.target.value as ConnectionEndStyle)}
              className="w-full px-2 py-1 border border-indigo-300 rounded text-sm"
            >
              <option value="none">无</option>
              <option value="arrow">箭头</option>
              <option value="filled-arrow">实心箭头</option>
              <option value="circle">圆形</option>
              <option value="diamond">菱形</option>
            </select>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <button
            onClick={createNetwork}
            className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            创建网络拓扑
          </button>
          
          <button
            onClick={() => canvasRef.current?.addRectangle()}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            添加矩形
          </button>
          
          <button
            onClick={() => canvasRef.current?.addCircle()}
            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            添加圆形
          </button>
          
          <button
            onClick={clearCanvas}
            className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            清空画布
          </button>
        </div>
        
        {/* 状态显示 */}
        <div className="bg-indigo-100 rounded p-3 flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span className="text-indigo-800">
              <strong>图形:</strong> {stats.shapes}
            </span>
            <span className="text-indigo-800">
              <strong>连接:</strong> {stats.connections}
            </span>
            <span className="text-indigo-800">
              <strong>模式:</strong> {mode === 'select' ? '选择/移动' : '连接创建'}
            </span>
            {isConnecting && (
              <span className="text-green-600 font-medium">
                🔄 连接中... (从: {connectingFrom})
              </span>
            )}
          </div>
          
          {selectedConnection && (
            <button
              onClick={deleteSelectedConnection}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              删除连接
            </button>
          )}
        </div>
      </div>

      {/* 画布区域 */}
      <div className="relative border-2 border-indigo-200 rounded-lg overflow-hidden">
        <svg
          id="connections-overlay"
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={height}
          style={{ zIndex: 10 }}
        >
          <g id="connections-group" />
        </svg>
        
        <CanvasComponent
          ref={canvasRef}
          width={width}
          height={height}
          backgroundColor="#ffffff"
          autoResize={false}
          onReady={handleCanvasReady}
          onShapeSelect={handleShapeSelect}
          onCanvasChange={renderConnections}
        />
        
        {isConnecting && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded text-sm">
            连接模式激活 - 请点击目标图形
          </div>
        )}
      </div>

      {/* 功能说明 */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">连接功能使用说明</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🎯 基本操作</h5>
            <ul className="space-y-1">
              <li>• 选择模式：点击和拖拽图形进行选择</li>
              <li>• 连接模式：点击源图形，再点击目标图形创建连接</li>
              <li>• 连接线会自动计算最优路径</li>
              <li>• 支持多种连接样式：直线、直角、曲线、贝塞尔</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">⚙️ 高级功能</h5>
            <ul className="space-y-1">
              <li>• 自定义连接线颜色、宽度、端点样式</li>
              <li>• 选择连接线可以删除</li>
              <li>• 移动图形时连接线自动跟随</li>
              <li>• 支持网络拓扑一键创建</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
