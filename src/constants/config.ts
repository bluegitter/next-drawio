// 应用配置常量
export const CONFIG = {
  // 应用信息
  APP: {
    NAME: 'Next-DrawIO Pro',
    VERSION: '1.0.0',
    DESCRIPTION: '专业的矢量绘图工具',
    AUTHOR: 'Next-DrawIO Team',
    LICENSE: 'MIT',
    HOMEPAGE: 'https://Next-DrawIO.com',
    REPOSITORY: 'https://github.com/Next-DrawIO/pro',
    DOCUMENTATION: 'https://docs.Next-DrawIO.com',
    
    // 构建信息
    BUILD_DATE: new Date().toISOString(),
    BUILD_NUMBER: process.env.BUILD_NUMBER || 'dev',
    GIT_COMMIT: process.env.GIT_COMMIT || 'unknown',
    NODE_ENV: process.env.NODE_ENV || 'development',
  },

  // 支持的平台
  PLATFORMS: {
    WEB: 'web',
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
  },

  // 支持的浏览器
  BROWSERS: {
    CHROME: { minVersion: 90, recommended: true },
    FIREFOX: { minVersion: 88, recommended: true },
    SAFARI: { minVersion: 14, recommended: true },
    EDGE: { minVersion: 90, recommended: true },
  },

  // 文件系统
  FILESYSTEM: {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_IMPORT_FORMATS: [
      'svg', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp',
      'pdf', 'ai', 'eps', 'psd', 'sketch', 'figma', 'xd',
      'json', 'xml', 'vdpx'
    ],
    SUPPORTED_EXPORT_FORMATS: [
      'svg', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp',
      'pdf', 'eps', 'json', 'vdpx'
    ],
    
    // 文件类型映射
    MIME_TYPES: {
      svg: 'image/svg+xml',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      pdf: 'application/pdf',
      ai: 'application/illustrator',
      eps: 'application/postscript',
      psd: 'image/vnd.adobe.photoshop',
      sketch: 'application/x-sketch',
      figma: 'application/x-figma',
      xd: 'application/x-adobe-xd',
      json: 'application/json',
      xml: 'application/xml',
      vdpx: 'application/vnd.Next-DrawIO.project',
    },
  },

  // 网络配置
  NETWORK: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || '',
    CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
    
    // 超时配置
    TIMEOUT: {
      API: 30000, // 30秒
      UPLOAD: 300000, // 5分钟
      DOWNLOAD: 60000, // 1分钟
      WEBSOCKET: 10000, // 10秒
    },
    
    // 重试配置
    RETRY: {
      MAX_ATTEMPTS: 3,
      DELAY: 1000, // 1秒
      BACKOFF_FACTOR: 2,
    },
    
    // 缓存配置
    CACHE: {
      ENABLED: true,
      TTL: 300000, // 5分钟
      MAX_SIZE: 100 * 1024 * 1024, // 100MB
      MAX_ITEMS: 1000,
    },
  },

  // 存储配置
  STORAGE: {
    // 本地存储
    LOCAL_STORAGE: {
      PREFIX: 'Next-DrawIO_',
      KEYS: {
        USER_PREFERENCES: 'user_preferences',
        RECENT_FILES: 'recent_files',
        WORKSPACE: 'workspace',
        CACHE: 'cache',
        AUTH: 'auth',
      },
    },
    
    // IndexedDB 配置
    INDEXED_DB: {
      NAME: 'Next-DrawIODB',
      VERSION: 1,
      STORES: {
        projects: { keyPath: 'id' },
        assets: { keyPath: 'id' },
        cache: { keyPath: 'key' },
        history: { keyPath: 'timestamp' },
      },
    },
    
    // 云存储
    CLOUD_STORAGE: {
      PROVIDER: 'default', // 'aws', 'google', 'azure'
      REGION: 'us-west-2',
      BUCKET: 'Next-DrawIO-storage',
      MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
      ALLOWED_TYPES: ['image/*', 'application/pdf', 'application/json'],
    },
  },

  // 性能配置
  PERFORMANCE: {
    // 渲染配置
    RENDER: {
      FPS: 60,
      FRAME_TIME: 16.67, // ms
      BATCH_SIZE: 100,
      VIRTUALIZATION_THRESHOLD: 1000,
      LAZY_LOADING_THRESHOLD: 500,
      MAX_CONCURRENT_RENDERS: 4,
    },
    
    // 内存配置
    MEMORY: {
      MAX_OBJECTS: 10000,
      MAX_LAYERS: 1000,
      MAX_HISTORY_SIZE: 100,
      GARBAGE_COLLECTION_INTERVAL: 60000, // 1分钟
      MEMORY_WARNING_THRESHOLD: 0.8, // 80%
      MEMORY_LIMIT: 512 * 1024 * 1024, // 512MB
    },
    
    // 缓存配置
    CACHE: {
      ENABLED: true,
      MAX_SIZE: 200 * 1024 * 1024, // 200MB
      TTL: 600000, // 10分钟
      STRATEGY: 'lru', // 'lru', 'fifo', 'lfu'
    },
  },

  // 安全配置
  SECURITY: {
    // CORS 配置
    CORS: {
      ALLOWED_ORIGINS: ['http://localhost:3000', 'https://Next-DrawIO.com'],
      ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
      CREDENTIALS: true,
    },
    
    // 认证配置
    AUTH: {
      TOKEN_EXPIRY: 3600000, // 1小时
      REFRESH_TOKEN_EXPIRY: 604800000, // 7天
      MAX_LOGIN_ATTEMPTS: 5,
      LOCKOUT_DURATION: 900000, // 15分钟
    },
    
    // 文件安全
    FILE_SECURITY: {
      MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
      ALLOWED_MIME_TYPES: [
        'image/*',
        'application/pdf',
        'application/json',
        'text/plain',
        'text/xml',
      ],
      SCAN_FILES: true,
      BLOCKED_EXTENSIONS: ['.exe', '.bat', '.sh', '.py', '.php'],
    },
  },

  // 日志配置
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    CONSOLE: process.env.NODE_ENV !== 'production',
    FILE: process.env.NODE_ENV === 'production',
    REMOTE: process.env.NODE_ENV === 'production',
    
    // 日志级别
    LEVELS: {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    },
    
    // 日志文件配置
    FILE_CONFIG: {
      MAX_SIZE: 10 * 1024 * 1024, // 10MB
      MAX_FILES: 5,
      COMPRESSION: true,
    },
  },

  // 插件配置
  PLUGINS: {
    ENABLED: true,
    AUTO_LOAD: true,
    SAFE_MODE: process.env.NODE_ENV === 'production',
    MAX_MEMORY_USAGE: 256 * 1024 * 1024, // 256MB
    TIMEOUT: 30000, // 30秒
    
    // 插件目录
    DIRECTORIES: {
      SYSTEM: './plugins/system',
      USER: './plugins/user',
      TEMP: './plugins/temp',
    },
    
    // 安全配置
    SECURITY: {
      ALLOWED_ORIGINS: ['official', 'trusted'],
      SANDBOX: true,
      PERMISSIONS: [
        'canvas',
        'file',
        'network',
        'storage',
        'ui',
      ],
    },
  },

  // 国际化配置
  I18N: {
    DEFAULT_LOCALE: 'zh-CN',
    SUPPORTED_LOCALES: [
      'zh-CN', 'zh-TW', 'en-US', 'ja-JP',
      'ko-KR', 'es-ES', 'fr-FR', 'de-DE',
      'it-IT', 'pt-BR', 'ru-RU', 'ar-SA'
    ],
    FALLBACK_LOCALE: 'en-US',
    DETECTION_STRATEGY: ['localStorage', 'navigator', 'htmlTag'],
    
    // 资源配置
    RESOURCES: {
      BASE_PATH: '/locales',
      EXTENSION: '.json',
      NAMESPACE: 'common',
    },
  },

  // 主题配置
  THEMES: {
    DEFAULT: 'light',
    SUPPORTED: ['light', 'dark', 'auto'],
    CUSTOM_THEME_STORAGE: 'custom_themes',
    
    // 主题切换配置
    SWITCH: {
      FOLLOW_SYSTEM: true,
      TRANSITION_DURATION: 300,
      PERSIST_CHOICE: true,
    },
  },

  // 开发配置
  DEVELOPMENT: {
    HOT_RELOAD: process.env.NODE_ENV === 'development',
    SOURCE_MAPS: process.env.NODE_ENV === 'development',
    DEBUG_TOOLS: process.env.NODE_ENV === 'development',
    
    // 开发服务器配置
    DEV_SERVER: {
      PORT: process.env.PORT || 3000,
      HOST: process.env.HOST || 'localhost',
      HTTPS: false,
    },
    
    // 测试配置
    TESTING: {
      COVERAGE_THRESHOLD: 70,
      TEST_TIMEOUT: 5000,
      MOCK_APIS: true,
      HEADLESS_BROWSER: true,
    },
  },

  // 生产配置
  PRODUCTION: {
    MINIFY: true,
    COMPRESS: true,
    CACHE_HEADERS: true,
    CDN_ENABLED: true,
    
    // 性能监控
    PERFORMANCE_MONITORING: {
      ENABLED: true,
      SAMPLING_RATE: 0.1, // 10%
      METRICS_ENDPOINT: '/api/metrics',
    },
    
    // 错误报告
    ERROR_REPORTING: {
      ENABLED: true,
      SERVICE: 'sentry', // 'sentry', 'bugsnag', 'rollbar'
      DSN: process.env.SENTRY_DSN || '',
      ENVIRONMENT: process.env.NODE_ENV,
    },
  },

  // 特性开关
  FEATURES: {
    EXPERIMENTAL: {
      WEBGL_RENDERER: process.env.FEATURE_WEBGL === 'true',
      AI_TOOLS: process.env.FEATURE_AI === 'true',
      COLLABORATION: process.env.FEATURE_COLLAB === 'true',
      REAL_TIME_SYNC: process.env.FEATURE_SYNC === 'true',
    },
    
    BETA: {
      PLUGIN_SYSTEM: true,
      ADVANCED_EXPORT: true,
      COLOR_MANAGEMENT: true,
      VECTOR_EFFECTS: true,
    },
    
    STABLE: {
      ALL_TOOLS: true,
      LAYER_SYSTEM: true,
      HISTORY_MANAGEMENT: true,
      FILE_OPERATIONS: true,
      SHORTCUTS: true,
    },
  },
} as const;