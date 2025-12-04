// 画布常量
export const CANVAS_CONSTANTS = {
  // 默认尺寸
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MIN_WIDTH: 100,
  MIN_HEIGHT: 100,
  MAX_WIDTH: 10000,
  MAX_HEIGHT: 10000,

  // 缩放
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.01,
  MAX_ZOOM: 100,
  ZOOM_STEP: 0.1,
  ZOOM_TO_FIT_PADDING: 20,

  // 网格
  DEFAULT_GRID_SIZE: 10,
  MIN_GRID_SIZE: 1,
  MAX_GRID_SIZE: 100,
  GRID_SUBDIVISIONS: 4,
  SNAP_THRESHOLD: 5,

  // 标尺
  RULER_SIZE: 20,
  RULER_MARGIN: 10,
  RULER_FONT_SIZE: 10,
  RULER_TICK_MAJOR: 100,
  RULER_TICK_MINOR: 10,

  // 性能
  MAX_OBJECTS: 10000,
  RENDER_FPS: 60,
  RENDER_TIMEOUT: 16, // ms
  DEBOUNCE_DELAY: 16,

  // 历史
  MAX_HISTORY: 100,
  HISTORY_BATCH_SIZE: 10,

  // 选择
  SELECTION_HANDLE_SIZE: 8,
  SELECTION_TOLERANCE: 5,
  MULTI_SELECT_TOLERANCE: 3,

  // 导出
  EXPORT_QUALITY_HIGH: 1,
  EXPORT_QUALITY_MEDIUM: 0.8,
  EXPORT_QUALITY_LOW: 0.6,
  DEFAULT_EXPORT_SCALE: 1,

  // 文件
  DEFAULT_FILE_FORMAT: 'vdpx',
  SUPPORTED_IMPORT_FORMATS: ['svg', 'png', 'jpg', 'jpeg', 'pdf', 'ai', 'eps', 'json'],
  SUPPORTED_EXPORT_FORMATS: ['svg', 'png', 'jpg', 'jpeg', 'pdf', 'json'],

  // 颜色
  DEFAULT_BACKGROUND_COLOR: '#ffffff',
  DEFAULT_STROKE_COLOR: '#000000',
  DEFAULT_FILL_COLOR: 'transparent',
  DEFAULT_SELECTION_COLOR: '#007acc',
  DEFAULT_GUIDE_COLOR: '#ff0000',
  DEFAULT_GRID_COLOR: '#e0e0e0',

  // 线条
  DEFAULT_STROKE_WIDTH: 1,
  MIN_STROKE_WIDTH: 0.1,
  MAX_STROKE_WIDTH: 100,
  DEFAULT_STROKE_CAP: 'butt' as CanvasLineCap,
  DEFAULT_STROKE_JOIN: 'miter' as CanvasLineJoin,
  DEFAULT_MITER_LIMIT: 10,

  // 文字
  DEFAULT_FONT_SIZE: 16,
  MIN_FONT_SIZE: 1,
  MAX_FONT_SIZE: 1000,
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  DEFAULT_TEXT_COLOR: '#000000',
  DEFAULT_TEXT_ALIGNMENT: 'left' as CanvasTextAlign,
  DEFAULT_TEXT_BASELINE: 'alphabetic' as CanvasTextBaseline,

  // 图层
  MAX_LAYERS: 1000,
  DEFAULT_LAYER_OPACITY: 1,
  DEFAULT_LAYER_BLEND_MODE: 'normal' as GlobalCompositeOperation,

  // 滤镜
  DEFAULT_FILTER_BLUR: 0,
  DEFAULT_FILTER_BRIGHTNESS: 100,
  DEFAULT_FILTER_CONTRAST: 100,
  DEFAULT_FILTER_GRAYSCALE: 0,
  DEFAULT_FILTER_HUE_ROTATE: 0,
  DEFAULT_FILTER_INVERT: 0,
  DEFAULT_FILTER_SATURATE: 100,
  DEFAULT_FILTER_SEPIA: 0,

  // 阴影
  DEFAULT_SHADOW_COLOR: '#000000',
  DEFAULT_SHADOW_BLUR: 0,
  DEFAULT_SHADOW_OFFSET_X: 0,
  DEFAULT_SHADOW_OFFSET_Y: 0,
  DEFAULT_SHADOW_OPACITY: 1,

  // 动画
  ANIMATION_DURATION_FAST: 150,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,
  ANIMATION_EASING: 'ease-in-out',
} as const;

// 画布模式
export const CANVAS_MODES = {
  DESIGN: 'design',
  PREVIEW: 'preview',
  PRESENTATION: 'presentation',
  DEBUG: 'debug',
} as const;

// 渲染模式
export const RENDER_MODES = {
  CANVAS_2D: 'canvas',
  SVG: 'svg',
  WEBGL: 'webgl',
  HYBRID: 'hybrid',
} as const;

// 质量模式
export const QUALITY_MODES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  ULTRA: 'ultra',
} as const;

// 单位类型
export const UNITS = {
  PX: 'px',
  MM: 'mm',
  CM: 'cm',
  IN: 'in',
  PT: 'pt',
  EM: 'em',
  REM: 'rem',
  PERCENT: '%',
} as const;

// 单位转换率
export const UNIT_CONVERSIONS = {
  PX: 1,
  MM: 3.7795275591,
  CM: 37.795275591,
  IN: 96,
  PT: 1.3333333333,
  EM: 16,
  REM: 16,
} as const;