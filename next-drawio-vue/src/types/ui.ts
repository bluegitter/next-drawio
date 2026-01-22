// UI 主题
export type UITheme = 'light' | 'dark' | 'auto';

// 组件尺寸
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 组件变体
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

// 按钮类型
export interface ButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  iconPosition?: 'left' | 'right';
  className?: string;
}

// 输入框类型
export interface InputProps {
  modelValue: string | number;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'color';
  disabled?: boolean;
  error?: string;
  label?: string;
  size?: ComponentSize;
  className?: string;
}

// 颜色选择器
export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  alpha?: boolean;
  preset?: string[];
  size?: ComponentSize;
  disabled?: boolean;
}

// 数值输入
export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
  disabled?: boolean;
  label?: string;
  size?: ComponentSize;
}

// 滑块
export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  marks?: { value: number; label?: string }[];
  disabled?: boolean;
  label?: string;
}

// 下拉菜单
export interface DropdownProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  label?: string;
  size?: ComponentSize;
}

// 模态框
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: ComponentSize;
  closable?: boolean;
  mask?: boolean;
}

// 面板
export interface PanelProps {
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

// 工具提示
export interface TooltipProps {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

// 标签页
export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: { value: string; label: string; disabled?: boolean }[];
  size?: ComponentSize;
}
