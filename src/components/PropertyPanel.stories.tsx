import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PropertyPanel from './PropertyPanel';

// 创建一个模拟的SVG元素用于演示
const createMockSVGElement = (type: string): SVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', type);
  svg.setAttribute('fill', '#3b82f6');
  svg.setAttribute('stroke', '#1e40af');
  svg.setAttribute('stroke-width', '2');
  return svg;
};

const meta: Meta<typeof PropertyPanel> = {
  title: 'Panels/PropertyPanel',
  component: PropertyPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '属性面板组件，用于编辑选中图形的各种属性，如颜色、边框、旋转、缩放等。',
      },
    },
  },
  tags: ['autodocs'],
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedShape: null,
  },
};

export const WithRectangleSelected: Story = {
  args: {
    selectedShape: createMockSVGElement('rect'),
  },
};

export const WithCircleSelected: Story = {
  args: {
    selectedShape: createMockSVGElement('circle'),
  },
};

export const WithTextSelected: Story = {
  args: {
    selectedShape: createMockSVGElement('text'),
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [selectedShape, setSelectedShape] = useState<SVGElement | null>(null);
    const [fillColor, setFillColor] = useState('#3b82f6');
    const [strokeColor, setStrokeColor] = useState('#1e40af');
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);

    const handleFillChange = (color: string) => {
      setFillColor(color);
      console.log('Fill color changed:', color);
    };

    const handleStrokeChange = (color: string) => {
      setStrokeColor(color);
      console.log('Stroke color changed:', color);
    };

    const handleRotationChange = (angle: number) => {
      setRotation(angle);
      console.log('Rotation changed:', angle);
    };

    const handleScaleChange = (scaleValue: number) => {
      setScale(scaleValue);
      console.log('Scale changed:', scaleValue);
    };

    const mockShapes = [
      { type: 'rect', element: createMockSVGElement('rect'), name: '矩形' },
      { type: 'circle', element: createMockSVGElement('circle'), name: '圆形' },
      { type: 'polygon', element: createMockSVGElement('polygon'), name: '三角形' },
      { type: 'text', element: createMockSVGElement('text'), name: '文字' },
    ];

    return (
      <div className="flex gap-4">
        <div className="w-48">
          <h3 className="font-semibold mb-2">选择图形:</h3>
          <div className="space-y-2">
            {mockShapes.map((shape, index) => (
              <button
                key={index}
                className={`w-full px-3 py-2 text-left rounded ${
                  selectedShape === shape.element
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedShape(shape.element)}
              >
                {shape.name}
              </button>
            ))}
          </div>
          
          <button
            className="w-full mt-2 px-3 py-2 bg-red-500 text-white rounded"
            onClick={() => setSelectedShape(null)}
          >
            取消选择
          </button>
        </div>

        <PropertyPanel
          selectedShape={selectedShape}
          onFillChange={handleFillChange}
          onStrokeChange={handleStrokeChange}
          onRotationChange={handleRotationChange}
          onScaleChange={handleScaleChange}
          onDelete={() => console.log('Delete clicked')}
          onDuplicate={() => console.log('Duplicate clicked')}
          onBringToFront={() => console.log('Bring to front clicked')}
          onSendToBack={() => console.log('Send to back clicked')}
        />

        <div className="w-64 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">当前属性值:</h4>
          <div className="text-sm space-y-1">
            <div><strong>填充颜色:</strong> {fillColor}</div>
            <div><strong>边框颜色:</strong> {strokeColor}</div>
            <div><strong>旋转角度:</strong> {rotation}°</div>
            <div><strong>缩放比例:</strong> {scale.toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  },
};

export const WithAllProperties: Story = {
  args: {
    selectedShape: (() => {
      const rect = createMockSVGElement('rect');
      rect.setAttribute('opacity', '0.8');
      rect.setAttribute('transform', 'rotate(45) scale(1.5)');
      return rect;
    })(),
  },
};

export const StorybookControls: Story = {
  args: {
    selectedShape: createMockSVGElement('rect'),
  },
  parameters: {
    docs: {
      description: {
        story: '使用Storybook控制面板来测试不同的属性配置。',
      },
    },
  },
};