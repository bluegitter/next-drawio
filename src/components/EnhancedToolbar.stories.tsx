import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EnhancedToolbar, ToolType } from './EnhancedToolbar';

const meta: Meta<typeof EnhancedToolbar> = {
  title: 'Toolbar/EnhancedToolbar',
  component: EnhancedToolbar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '增强工具栏组件，包含完整的绘图工具、连接工具、撤销重做功能和导出选项。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentTool: 'select',
    onToolChange: (tool: ToolType) => console.log('Tool changed:', tool),
    onExport: (format: 'png' | 'jpg' | 'svg') => console.log('Export:', format),
    onUndo: () => console.log('Undo'),
    onRedo: () => console.log('Redo'),
    canUndo: true,
    canRedo: false,
    disabled: false,
    isConnecting: false,
  },
};

export const RectangleSelected: Story = {
  args: {
    currentTool: 'rectangle',
    onToolChange: (tool: ToolType) => console.log('Tool changed:', tool),
    onExport: (format: 'png' | 'jpg' | 'svg') => console.log('Export:', format),
    onUndo: () => console.log('Undo'),
    onRedo: () => console.log('Redo'),
    canUndo: true,
    canRedo: true,
    disabled: false,
    isConnecting: false,
  },
};

export const ConnectingMode: Story = {
  args: {
    currentTool: 'connect',
    onToolChange: (tool: ToolType) => console.log('Tool changed:', tool),
    onExport: (format: 'png' | 'jpg' | 'svg') => console.log('Export:', format),
    onUndo: () => console.log('Undo'),
    onRedo: () => console.log('Redo'),
    canUndo: true,
    canRedo: false,
    disabled: false,
    isConnecting: true,
  },
};

export const DisabledState: Story = {
  args: {
    currentTool: 'select',
    onToolChange: (tool: ToolType) => console.log('Tool changed:', tool),
    onExport: (format: 'png' | 'jpg' | 'svg') => console.log('Export:', format),
    onUndo: () => console.log('Undo'),
    onRedo: () => console.log('Redo'),
    canUndo: false,
    canRedo: false,
    disabled: true,
    isConnecting: false,
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [currentTool, setCurrentTool] = useState<ToolType>('select');
    const [isConnecting, setIsConnecting] = useState(false);
    const [canUndo, setCanUndo] = useState(true);
    const [canRedo, setCanRedo] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const handleToolChange = (tool: ToolType) => {
      setCurrentTool(tool);
      setIsConnecting(tool === 'connect');
      setHistory(prev => [...prev, `切换到工具: ${tool}`]);
    };

    const handleExport = (format: 'png' | 'jpg' | 'svg') => {
      setHistory(prev => [...prev, `导出为 ${format.toUpperCase()} 格式`]);
    };

    const handleUndo = () => {
      if (canUndo) {
        setHistory(prev => [...prev, '执行撤销操作']);
        setCanUndo(false);
        setCanRedo(true);
      }
    };

    const handleRedo = () => {
      if (canRedo) {
        setHistory(prev => [...prev, '执行重做操作']);
        setCanUndo(true);
        setCanRedo(false);
      }
    };

    const tools: { id: ToolType; label: string; icon: string; color: string }[] = [
      { id: 'select', label: '选择', icon: '↖', color: 'gray' },
      { id: 'rectangle', label: '矩形', icon: '▢', color: 'blue' },
      { id: 'circle', label: '圆形', icon: '○', color: 'green' },
      { id: 'triangle', label: '三角形', icon: '△', color: 'yellow' },
      { id: 'line', label: '直线', icon: '╱', color: 'red' },
      { id: 'polyline', label: '折线', icon: '⎍', color: 'purple' },
      { id: 'text', label: '文字', icon: 'T', color: 'gray' },
      { id: 'connect', label: '连接', icon: '🔗', color: 'orange' },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                currentTool === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              onClick={() => handleToolChange(tool.id)}
            >
              <span className="mr-2">{tool.icon}</span>
              {tool.label}
            </button>
          ))}
        </div>

        <EnhancedToolbar
          currentTool={currentTool}
          onToolChange={handleToolChange}
          onExport={handleExport}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          disabled={false}
          isConnecting={isConnecting}
        />

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">操作历史</h3>
          <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-gray-500">暂无操作记录</div>
            ) : (
              history.map((entry, index) => (
                <div key={index} className="text-gray-600">
                  {index + 1}. {entry}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <h4 className="font-semibold mb-2">工具栏功能说明:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>绘图工具:</strong> 矩形、圆形、三角形、直线、折线、文字</li>
            <li><strong>选择工具:</strong> 选择和移动图形</li>
            <li><strong>连接工具:</strong> 在图形之间创建连接线</li>
            <li><strong>撤销/重做:</strong> 支持操作历史管理</li>
            <li><strong>导出功能:</strong> PNG、JPG、SVG格式导出</li>
            <li><strong>快捷键支持:</strong> 每个工具都有对应的快捷键</li>
            <li><strong>状态指示:</strong> 连接模式有专门的视觉提示</li>
          </ul>
        </div>
      </div>
    );
  },
};