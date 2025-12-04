// 默认配置常量
export const DEFAULTS = {
  // 应用默认值
  APP: {
    NAME: 'Next-DrawIO Pro',
    VERSION: '1.0.0',
    DESCRIPTION: '专业的矢量绘图工具',
    AUTHOR: 'Next-DrawIO Team',
    HOMEPAGE: 'https://Next-DrawIO.com',
  },

  // 用户偏好
  USER_PREFERENCES: {
    theme: 'light' as const,
    language: 'zh-CN',
    autoSave: true,
    autoSaveInterval: 30000, // 30秒
    showGrid: true,
    showRulers: true,
    snapToGrid: true,
    gridSize: 10,
    recentFilesCount: 10,
    maxHistoryItems: 100,
  },

  // 画布默认值
  CANVAS: {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    backgroundImage: '',
    gridEnabled: true,
    gridSize: 10,
    gridSubdivisions: 4,
    gridColor: '#e0e0e0',
    gridMajorColor: '#a3a3a3',
    rulersEnabled: true,
    rulerSize: 20,
    rulerColor: '#737373',
    rulerFontFamily: 'Arial, sans-serif',
    rulerFontSize: 10,
    snapToGrid: true,
    snapToObjects: true,
    snapThreshold: 5,
    guidesEnabled: true,
    guideColor: '#ff0000',
    guideWidth: 1,
  },

  // 视口默认值
  VIEWPORT: {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    zoom: 1,
    minZoom: 0.01,
    maxZoom: 100,
    centerX: 400,
    centerY: 300,
    mode: 'custom' as const,
  },

  // 选择默认值
  SELECTION: {
    mode: 'replace' as const,
    allowMultiSelect: true,
    selectBehind: false,
    showBoundingBox: true,
    showTransformHandles: true,
    boundingBoxColor: '#007acc',
    handleSize: 8,
    handleColor: '#3b82f6',
    handleActiveColor: '#1d4ed8',
    tolerance: 5,
  },

  // 图层默认值
  LAYER: {
    name: '图层 1',
    type: 'normal' as const,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal' as const,
    zIndex: 0,
    color: '#3b82f6',
  },

  // 对象默认值
  OBJECT: {
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal' as const,
    name: '',
    transform: {
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      skew: { x: 0, y: 0 },
    },
    style: {
      fill: 'transparent',
      stroke: {
        color: '#000000',
        width: 1,
        cap: 'butt' as CanvasLineCap,
        join: 'miter' as CanvasLineJoin,
        miterLimit: 10,
      },
      shadow: {
        color: '#000000',
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
      },
    },
    metadata: {
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: 1,
      tags: [],
      locked: false,
    },
  },

  // 矩形默认值
  RECTANGLE: {
    width: 100,
    height: 60,
    cornerRadius: 0,
    fromCenter: false,
  },

  // 圆形默认值
  CIRCLE: {
    radius: 50,
    fromCenter: true,
    constrainToCircle: false,
  },

  // 椭圆默认值
  ELLIPSE: {
    radiusX: 60,
    radiusY: 40,
    fromCenter: true,
  },

  // 文字默认值
  TEXT: {
    text: '',
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    letterSpacing: 0,
    lineHeight: 1.2,
    maxWidth: undefined,
    wordWrap: false,
    autoSize: true,
  },

  // 导入导出默认值
  IMPORT: {
    format: 'svg' as const,
    scale: 1,
    position: 'center' as const,
    mergeWithCurrent: false,
    preserveLayers: true,
    convertToEditable: true,
  },

  EXPORT: {
    format: 'png' as const,
    quality: 0.8,
    scale: 1,
    bounds: 'all' as const,
    backgroundColor: '#ffffff',
    transparent: false,
    embedImages: true,
    optimize: true,
  },

  // 工具默认值
  TOOLS: {
    rectangle: {
      cornerRadius: 0,
      fromCenter: false,
      squareMode: false,
    },
    circle: {
      fromCenter: true,
      constrainToCircle: false,
    },
    ellipse: {
      fromCenter: true,
    },
    pen: {
      smoothness: 0.5,
      autoClose: false,
      showPathPoints: true,
    },
    pencil: {
      smoothing: 0.3,
      simplifyTolerance: 0.5,
      pressure: false,
    },
    text: {
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      autoSize: true,
      wordWrap: false,
    },
    hand: {
      panSensitivity: 1.0,
    },
    zoom: {
      zoomIn: true,
      zoomFactor: 1.2,
      minZoom: 0.01,
      maxZoom: 100,
    },
    eyedropper: {
      sampleSize: 1,
      sampleAllLayers: true,
    },
  },

  // UI 默认值
  UI: {
    theme: 'light' as const,
    language: 'zh-CN',
    fontSize: 'medium' as const,
    iconSize: 'medium' as const,
    density: 'comfortable' as const,
    animations: true,
    tooltips: true,
    shortcuts: true,
    autoSave: true,
    autoSaveInterval: 30000,
    showGrid: true,
    showRulers: true,
    showStatusbar: true,
    showToolbar: true,
    showProperties: true,
    showLayers: true,
    window: {
      width: 1200,
      height: 800,
      maximized: false,
      rememberPosition: true,
      rememberSize: true,
    },
    panels: {
      toolbar: {
        position: 'left' as const,
        collapsed: false,
        width: 60,
      },
      properties: {
        position: 'right' as const,
        collapsed: false,
        width: 280,
      },
      layers: {
        position: 'right' as const,
        collapsed: false,
        width: 250,
      },
      history: {
        position: 'right' as const,
        collapsed: true,
        width: 200,
      },
    },
  },

  // 性能默认值
  PERFORMANCE: {
    maxObjects: 10000,
    renderFPS: 60,
    renderTimeout: 16,
    debounceDelay: 16,
    historyLimit: 100,
    batchSize: 50,
    virtualizationEnabled: true,
    lazyLoadingEnabled: true,
    cacheEnabled: true,
    compressionEnabled: true,
  },

  // 文件默认值
  FILE: {
    format: 'vdpx' as const,
    version: '1.0',
    encoding: 'utf-8',
    compression: true,
    backupEnabled: true,
    backupInterval: 600000, // 10分钟
    maxBackups: 5,
    recentFiles: [],
    defaultExtension: '.vdpx',
    templatesPath: './templates',
    pluginsPath: './plugins',
    assetsPath: './assets',
  },

  // 插件默认值
  PLUGIN: {
    enabled: true,
    autoLoad: true,
    autoUpdate: false,
    allowRemote: false,
    trustedSources: ['official'],
    maxMemoryUsage: 512, // MB
    timeout: 10000, // ms
  },

  // 网络默认值
  NETWORK: {
    timeout: 30000, // ms
    retries: 3,
    retryDelay: 1000, // ms
    cacheEnabled: true,
    cacheTimeout: 300000, // 5分钟
    uploadChunkSize: 1024 * 1024, // 1MB
    downloadChunkSize: 1024 * 1024, // 1MB
  },

  // 调试默认值
  DEBUG: {
    enabled: false,
    level: 'info' as const,
    console: true,
    file: false,
    network: false,
    performance: false,
    memory: false,
    render: false,
    events: false,
    tools: false,
    plugins: false,
  },
} as const;

// 布局预设
export const LAYOUT_PRESETS = {
  DEFAULT: {
    name: '默认布局',
    description: '标准的四栏布局',
    panels: {
      toolbar: { position: 'left', width: 60 },
      properties: { position: 'right', width: 280 },
      layers: { position: 'right', width: 250 },
      history: { position: 'right', width: 200 },
    },
  },
  COMPACT: {
    name: '紧凑布局',
    description: '最小化面板尺寸',
    panels: {
      toolbar: { position: 'left', width: 50 },
      properties: { position: 'right', width: 240 },
      layers: { position: 'right', width: 200 },
      history: { position: 'right', width: 180 },
    },
  },
  WIDE: {
    name: '宽屏布局',
    description: '适合宽屏显示器',
    panels: {
      toolbar: { position: 'left', width: 80 },
      properties: { position: 'right', width: 320 },
      layers: { position: 'right', width: 280 },
      history: { position: 'right', width: 240 },
    },
  },
  MINIMAL: {
    name: '极简布局',
    description: '只显示必要的面板',
    panels: {
      toolbar: { position: 'left', width: 50 },
      properties: { position: 'right', width: 0, collapsed: true },
      layers: { position: 'right', width: 200 },
      history: { position: 'right', width: 0, collapsed: true },
    },
  },
} as const;

// 模板预设
export const TEMPLATE_PRESETS = {
  WEB_DESIGN: {
    name: '网页设计',
    width: 1920,
    height: 1080,
    dpi: 72,
    unit: 'px' as const,
    backgroundColor: '#ffffff',
    grid: { size: 8, enabled: true },
    rulers: { enabled: true },
  },
  PRINT_DESIGN: {
    name: '印刷设计',
    width: 595, // A4 width in points
    height: 842, // A4 height in points
    dpi: 300,
    unit: 'pt' as const,
    backgroundColor: '#ffffff',
    grid: { size: 12, enabled: true },
    rulers: { enabled: true },
  },
  MOBILE_APP: {
    name: '移动应用',
    width: 375,
    height: 667,
    dpi: 72,
    unit: 'px' as const,
    backgroundColor: '#f5f5f5',
    grid: { size: 4, enabled: true },
    rulers: { enabled: false },
  },
  SOCIAL_MEDIA: {
    name: '社交媒体',
    width: 1080,
    height: 1080,
    dpi: 72,
    unit: 'px' as const,
    backgroundColor: '#ffffff',
    grid: { size: 20, enabled: false },
    rulers: { enabled: true },
  },
} as const;