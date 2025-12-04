// 颜色常量
export const COLORS = {
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
  
  // 画布特定颜色
  CANVAS: {
    BACKGROUND: COLORS.WHITE,
    GRID: COLORS.GRAY_200,
    GRID_MAJOR: COLORS.GRAY_400,
    RULER: COLORS.GRAY_700,
    RULER_TEXT: COLORS.GRAY_600,
    SELECTION: '#007acc',
    SELECTION_HANDLE: COLORS.PRIMARY[500],
    SELECTION_HANDLE_ACTIVE: COLORS.PRIMARY[700],
    BOUNDING_BOX: COLORS.GRAY_500,
    GUIDE: COLORS.ERROR[500],
    GUIDE_LOCKED: COLORS.WARNING[500],
    SNAP_LINE: COLORS.SUCCESS[500],
    ROTATION_HANDLE: COLORS.SECONDARY[500],
    ORIGIN: COLORS.ERROR[500],
    AXIS_X: COLORS.ERROR[500],
    AXIS_Y: COLORS.SUCCESS[500],
  },
  
  // 工具栏颜色
  TOOLBAR: {
    BACKGROUND: COLORS.GRAY_50,
    BORDER: COLORS.GRAY_200,
    TOOL_ACTIVE: COLORS.PRIMARY[500],
    TOOL_HOVER: COLORS.GRAY_200,
    TOOL_SELECTED: COLORS.PRIMARY[100],
    ICON: COLORS.GRAY_700,
    ICON_DISABLED: COLORS.GRAY_400,
  },
  
  // 面板颜色
  PANEL: {
    BACKGROUND: COLORS.WHITE,
    HEADER: COLORS.GRAY_50,
    BORDER: COLORS.GRAY_200,
    TEXT_PRIMARY: COLORS.GRAY_900,
    TEXT_SECONDARY: COLORS.GRAY_600,
    LABEL: COLORS.GRAY_700,
    INPUT: COLORS.WHITE,
    INPUT_BORDER: COLORS.GRAY_300,
    INPUT_FOCUS: COLORS.PRIMARY[500],
    BUTTON_PRIMARY: COLORS.PRIMARY[500],
    BUTTON_SECONDARY: COLORS.SECONDARY[500],
  },
  
  // 状态栏颜色
  STATUS_BAR: {
    BACKGROUND: COLORS.GRAY_800,
    TEXT: COLORS.GRAY_300,
    BORDER: COLORS.GRAY_700,
    INFO: COLORS.INFO[400],
    WARNING: COLORS.WARNING[400],
    ERROR: COLORS.ERROR[400],
    SUCCESS: COLORS.SUCCESS[400],
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