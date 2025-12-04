import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '默认按钮',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '主要按钮',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '次要按钮',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: '轮廓按钮',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: '幽灵按钮',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '危险按钮',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: '小按钮',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: '中按钮',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: '大按钮',
  },
};

export const WithIcon: Story = {
  args: {
    children: '带图标的按钮',
    icon: '🎨',
  },
};

export const WithLoading: Story = {
  args: {
    children: '加载中的按钮',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: '禁用按钮',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">默认</Button>
      <Button variant="primary">主要</Button>
      <Button variant="secondary">次要</Button>
      <Button variant="outline">轮廓</Button>
      <Button variant="ghost">幽灵</Button>
      <Button variant="destructive">危险</Button>
    </div>
  ),
};