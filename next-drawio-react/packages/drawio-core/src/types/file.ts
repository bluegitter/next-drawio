// 文件格式
export type FileFormat = 'svg' | 'png' | 'jpg' | 'jpeg' | 'pdf' | 'json' | 'ai' | 'eps';

// 导出选项
export interface ExportOptions {
  format: FileFormat;
  quality?: number; // 0-1, for JPEG
  scale?: number; // 导出缩放比例
  bounds?: 'all' | 'selection' | 'custom';
  customBounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  backgroundColor?: string;
  transparent?: boolean;
  embedImages?: boolean;
  optimize?: boolean;
}

// 导入选项
export interface ImportOptions {
  format: FileFormat;
  scale?: number;
  position?: 'center' | 'origin' | 'custom';
  customPosition?: { x: number; y: number };
  mergeWithCurrent?: boolean;
  preserveLayers?: boolean;
  convertToEditable?: boolean;
}

// 文件信息
export interface FileInfo {
  name: string;
  format: FileFormat;
  size: number;
  lastModified: Date;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  objectCount?: number;
  layerCount?: number;
}

// 项目文件
export interface ProjectFile {
  id: string;
  name: string;
  version: string;
  format: 'vdpx'; // Next-DrawIO Pro Exchange
  metadata: {
    createdAt: Date;
    modifiedAt: Date;
    createdBy?: string;
    modifiedBy?: string;
    description?: string;
    tags?: string[];
  };
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  layers: any[]; // Layer 序列化数据
  objects: any[]; // CanvasObject 序列化数据
  viewport: {
    zoom: number;
    x: number;
    y: number;
  };
  settings: {
    grid: any;
    rulers: any;
    snap: any;
  };
}

// 文件操作结果
export interface FileOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
}

// 批量导出选项
export interface BatchExportOptions {
  format: FileFormat;
  naming: 'sequential' | 'object-name' | 'layer-name';
  prefix?: string;
  suffix?: string;
  quality?: number;
  scale?: number;
  transparent?: boolean;
}