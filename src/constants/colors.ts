// 颜色常量
export const COLORS: {
  WHITE: string;
  BLACK: string;
  TRANSPARENT: string;
  GRAY_50: string; GRAY_100: string; GRAY_200: string; GRAY_300: string; GRAY_400: string;
  GRAY_500: string; GRAY_600: string; GRAY_700: string; GRAY_800: string; GRAY_900: string; GRAY_950: string;
  PRIMARY: Record<number, string>;
  SECONDARY: Record<number, string>;
  SUCCESS: Record<number, string>;
  WARNING: Record<number, string>;
  ERROR: Record<number, string>;
  INFO: Record<number, string>;
  TEXT: { PRIMARY: string; SECONDARY: string; DISABLED: string; INVERSE: string };
  BACKGROUND: { PRIMARY: string; SECONDARY: string; INVERSE: string; MUTED: string };
  CANVAS: Record<string, string>;
  TOOLBAR: Record<string, string>;
  PANEL: Record<string, string>;
  STATUS_BAR: Record<string, string>;
  DARK: Record<string, any>;
} = {
  // 基础颜色
  WHITE: '#ffffff',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  
  // 灰度
  GRAY_50: '#fafafa',
  GRAY_100: '#f5f5f5',
  GRAY_200: '#e5e5e5',
  GRAY_300: '#d4d4d4',
  GRAY_400: '#a3a3a3',
  GRAY_500: '#737373',
  GRAY_600: '#525252',
  GRAY_700: '#404040',
  GRAY_800: '#262626',
  GRAY_900: '#171717',
  GRAY_950: '#0a0a0a',
  
  // 主色调
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // 辅助色
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // 成功色
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // 警告色
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // 错误色
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // 信息色
  INFO: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // 文本与背景
  TEXT: {
    PRIMARY: '#111827',
    SECONDARY: '#4b5563',
    DISABLED: '#9ca3af',
    INVERSE: '#f9fafb',
  },
  BACKGROUND: {
    PRIMARY: '#ffffff',
    SECONDARY: '#f8fafc',
    INVERSE: '#111827',
    MUTED: '#f3f4f6',
  },
  
  // 画布特定颜色
  CANVAS: {
    BACKGROUND: '#ffffff',
    GRID: '#e5e5e5',
    GRID_MAJOR: '#a3a3a3',
    RULER: '#404040',
    RULER_TEXT: '#525252',
    SELECTION: '#007acc',
    SELECTION_HANDLE: '#3b82f6',
    SELECTION_HANDLE_ACTIVE: '#1d4ed8',
    BOUNDING_BOX: '#737373',
    GUIDE: '#ef4444',
    GUIDE_LOCKED: '#f59e0b',
    SNAP_LINE: '#22c55e',
    ROTATION_HANDLE: '#475569',
    ORIGIN: '#ef4444',
    AXIS_X: '#ef4444',
    AXIS_Y: '#22c55e',
  },
  
  // 工具栏颜色
  TOOLBAR: {
    BACKGROUND: '#fafafa',
    BORDER: '#e5e5e5',
    TOOL_ACTIVE: '#3b82f6',
    TOOL_HOVER: '#e5e5e5',
    TOOL_SELECTED: '#dbeafe',
    ICON: '#404040',
    ICON_DISABLED: '#a3a3a3',
  },
  
  // 面板颜色
  PANEL: {
    BACKGROUND: '#ffffff',
    HEADER: '#f5f5f5',
    BORDER: '#e5e5e5',
    TEXT_PRIMARY: '#111827',
    TEXT_SECONDARY: '#4b5563',
    LABEL: '#374151',
    INPUT: '#ffffff',
    INPUT_BORDER: '#d1d5db',
    INPUT_FOCUS: '#3b82f6',
    BUTTON_PRIMARY: '#3b82f6',
    BUTTON_SECONDARY: '#475569',
  },
  
  // 状态栏颜色
  STATUS_BAR: {
    BACKGROUND: '#1f2937',
    TEXT: '#d1d5db',
    BORDER: '#111827',
    INFO: '#60a5fa',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    SUCCESS: '#22c55e',
  },
  
  // 暗色主题
  DARK: {
    CANVAS: {
      BACKGROUND: '#1a1a1a',
      GRID: '#333333',
      GRID_MAJOR: '#555555',
      RULER: '#cccccc',
      RULER_TEXT: '#999999',
      SELECTION: '#4da6ff',
      SELECTION_HANDLE: '#66b3ff',
      SELECTION_HANDLE_ACTIVE: '#99ccff',
      BOUNDING_BOX: '#808080',
      GUIDE: '#ff6666',
      GUIDE_LOCKED: '#ffaa00',
      SNAP_LINE: '#66ff66',
      ROTATION_HANDLE: '#cccccc',
      ORIGIN: '#ff6666',
      AXIS_X: '#ff6666',
      AXIS_Y: '#66ff66',
    },
    
    TOOLBAR: {
      BACKGROUND: '#2a2a2a',
      BORDER: '#404040',
      TOOL_ACTIVE: '#4da6ff',
      TOOL_HOVER: '#404040',
      TOOL_SELECTED: '#334d66',
      ICON: '#cccccc',
      ICON_DISABLED: '#666666',
    },
    
    PANEL: {
      BACKGROUND: '#2a2a2a',
      HEADER: '#333333',
      BORDER: '#404040',
      TEXT_PRIMARY: '#ffffff',
      TEXT_SECONDARY: '#cccccc',
      LABEL: '#e0e0e0',
      INPUT: '#404040',
      INPUT_BORDER: '#555555',
      INPUT_FOCUS: '#4da6ff',
      BUTTON_PRIMARY: '#4da6ff',
      BUTTON_SECONDARY: '#808080',
    },
    
    STATUS_BAR: {
      BACKGROUND: '#1a1a1a',
      TEXT: '#cccccc',
      BORDER: '#333333',
      INFO: '#66b3ff',
      WARNING: '#ffaa00',
      ERROR: '#ff6666',
      SUCCESS: '#66ff66',
    },
  },
} as const;

// 预设颜色
export const PRESET_COLORS = [
  // 纯色
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#ff6600', '#ffcc00', '#ffff00', '#99ff00', '#00ff00',
  '#00ff99', '#00ffff', '#0099ff', '#0066ff', '#0000ff', '#6600ff',
  '#9900ff', '#cc00ff', '#ff00ff', '#ff00cc', '#ff0066', '#ff3300',
  
  // 柔和色
  '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d',
  '#495057', '#343a40', '#212529', '#f8d7da', '#f5c6cb', '#f1b0b7',
  '#e8a3a9', '#df8a95', '#d6717b', '#c7495e', '#b72d4f', '#a01e3a',
  
  // 材质设计色
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  '#607d8b',
] as const;

// 渐变预设
export const GRADIENT_PRESETS = [
  {
    name: '线性渐变',
    type: 'linear' as const,
    stops: [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' },
    ],
  },
  {
    name: '径向渐变',
    type: 'radial' as const,
    stops: [
      { offset: 0, color: '#ffd89b' },
      { offset: 1, color: '#19547b' },
    ],
  },
  {
    name: '彩虹渐变',
    type: 'linear' as const,
    stops: [
      { offset: 0, color: '#ff0000' },
      { offset: 0.17, color: '#ff8800' },
      { offset: 0.33, color: '#ffff00' },
      { offset: 0.5, color: '#00ff00' },
      { offset: 0.67, color: '#0088ff' },
      { offset: 0.83, color: '#0000ff' },
      { offset: 1, color: '#8800ff' },
    ],
  },
] as const;
