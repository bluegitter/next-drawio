// 工具常量
export const TOOLS = {
  // 选择工具
  SELECT: 'select',
  DIRECT_SELECT: 'direct-select',
  
  // 绘图工具
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  LINE: 'line',
  PEN: 'pen',
  PENCIL: 'pencil',
  POLYGON: 'polygon',
  STAR: 'star',
  
  // 文字工具
  TEXT: 'text',
  
  // 导航工具
  HAND: 'hand',
  ZOOM: 'zoom',
  
  // 颜色工具
  EYEDROPPER: 'eyedropper',
  GRADIENT: 'gradient',
  
  // 编辑工具
  ERASER: 'eraser',
  SCISSORS: 'scissors',
  
  // 形状工具
  SHAPE: 'shape',
} as const;

// 工具分类
export const TOOL_CATEGORIES = {
  SELECTION: 'selection',
  DRAWING: 'drawing',
  TEXT: 'text',
  NAVIGATION: 'navigation',
  COLOR: 'color',
  TRANSFORM: 'transform',
  CUSTOM: 'custom',
} as const;

// 工具状态
export const TOOL_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  DRAWING: 'drawing',
  EDITING: 'editing',
  TRANSFORMING: 'transforming',
  DISABLED: 'disabled',
} as const;

// 光标类型
export const CURSORS = {
  DEFAULT: 'default',
  POINTER: 'pointer',
  CROSSHAIR: 'crosshair',
  MOVE: 'move',
  TEXT: 'text',
  NOT_ALLOWED: 'not-allowed',
  GRAB: 'grab',
  GRABBING: 'grabbing',
  NWSE_RESIZE: 'nwse-resize',
  NESW_RESIZE: 'nesw-resize',
  EW_RESIZE: 'ew-resize',
  NS_RESIZE: 'ns-resize',
  COL_RESIZE: 'col-resize',
  ROW_RESIZE: 'row-resize',
} as const;

// 工具配置
export const TOOL_CONFIG = {
  [TOOLS.SELECT]: {
    name: '选择工具',
    icon: '↖',
    cursor: CURSORS.DEFAULT,
    category: TOOL_CATEGORIES.SELECTION,
    shortcuts: ['v', 'esc'],
  },
  
  [TOOLS.DIRECT_SELECT]: {
    name: '直接选择工具',
    icon: '↖',
    cursor: CURSORS.POINTER,
    category: TOOL_CATEGORIES.SELECTION,
    shortcuts: ['a'],
  },
  
  [TOOLS.RECTANGLE]: {
    name: '矩形工具',
    icon: '▢',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['m', 'r'],
  },
  
  [TOOLS.CIRCLE]: {
    name: '圆形工具',
    icon: '○',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['l', 'c'],
  },
  
  [TOOLS.ELLIPSE]: {
    name: '椭圆工具',
    icon: '⬭',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['l'],
  },
  
  [TOOLS.LINE]: {
    name: '直线工具',
    icon: '／',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['\\'],
  },
  
  [TOOLS.PEN]: {
    name: '钢笔工具',
    icon: '✏',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['p'],
  },
  
  [TOOLS.PENCIL]: {
    name: '铅笔工具',
    icon: '✏',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['b'],
  },
  
  [TOOLS.POLYGON]: {
    name: '多边形工具',
    icon: '⬟',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['g'],
  },
  
  [TOOLS.STAR]: {
    name: '星形工具',
    icon: '★',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.DRAWING,
    shortcuts: ['s'],
  },
  
  [TOOLS.TEXT]: {
    name: '文字工具',
    icon: 'T',
    cursor: CURSORS.TEXT,
    category: TOOL_CATEGORIES.TEXT,
    shortcuts: ['t'],
  },
  
  [TOOLS.HAND]: {
    name: '手形工具',
    icon: '✋',
    cursor: CURSORS.GRAB,
    category: TOOL_CATEGORIES.NAVIGATION,
    shortcuts: ['h', 'space'],
  },
  
  [TOOLS.ZOOM]: {
    name: '缩放工具',
    icon: '🔍',
    cursor: CURSORS.POINTER,
    category: TOOL_CATEGORIES.NAVIGATION,
    shortcuts: ['z'],
  },
  
  [TOOLS.EYEDROPPER]: {
    name: '吸管工具',
    icon: '💧',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.COLOR,
    shortcuts: ['i'],
  },
  
  [TOOLS.GRADIENT]: {
    name: '渐变工具',
    icon: '🎨',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.COLOR,
    shortcuts: ['g'],
  },
  
  [TOOLS.ERASER]: {
    name: '橡皮擦工具',
    icon: '⬜',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.TRANSFORM,
    shortcuts: ['e'],
  },
  
  [TOOLS.SCISSORS]: {
    name: '剪刀工具',
    icon: '✂',
    cursor: CURSORS.CROSSHAIR,
    category: TOOL_CATEGORIES.TRANSFORM,
    shortcuts: ['c'],
  },
} as const;

// 工具选项默认值
export const TOOL_DEFAULTS = {
  // 通用选项
  SNAP_TO_GRID: true,
  SNAP_TO_OBJECTS: true,
  CONSTRAIN_PROPORTIONS: false,
  
  // 选择工具
  SELECTION_MODE: 'replace' as const,
  ALLOW_MULTI_SELECT: true,
  SELECT_BEHIND: false,
  SHOW_BOUNDING_BOX: true,
  SHOW_TRANSFORM_HANDLES: true,
  
  // 矩形工具
  CORNER_RADIUS: 0,
  FROM_CENTER: false,
  SQUARE_MODE: false,
  
  // 圆形工具
  FROM_CENTER: true,
  CONSTRAIN_TO_CIRCLE: false,
  
  // 钢笔工具
  SMOOTHNESS: 0.5,
  AUTO_CLOSE: false,
  SHOW_PATH_POINTS: true,
  
  // 铅笔工具
  SMOOTHING: 0.3,
  SIMPLIFY_TOLERANCE: 0.5,
  PRESSURE: false,
  
  // 文字工具
  FONT_SIZE: 16,
  FONT_FAMILY: 'Arial, sans-serif',
  FONT_WEIGHT: 'normal',
  FONT_STYLE: 'normal',
  AUTO_SIZE: true,
  WORD_WRAP: false,
  TEXT_COLOR: '#000000',
  
  // 手形工具
  PAN_SENSITIVITY: 1.0,
  
  // 缩放工具
  ZOOM_IN: true,
  ZOOM_FACTOR: 1.2,
  MIN_ZOOM: 0.01,
  MAX_ZOOM: 100,
  
  // 吸管工具
  SAMPLE_SIZE: 1,
  SAMPLE_ALL_LAYERS: true,
} as const;

// 选择模式
export const SELECTION_MODES = {
  REPLACE: 'replace',
  ADD: 'add',
  SUBTRACT: 'subtract',
  INTERSECT: 'intersect',
} as const;

// 线帽样式
export const LINE_CAPS = {
  BUTT: 'butt',
  ROUND: 'round',
  SQUARE: 'square',
} as const;

// 线条连接样式
export const LINE_JOINS = {
  MITER: 'miter',
  ROUND: 'round',
  BEVEL: 'bevel',
} as const;