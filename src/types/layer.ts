import { CanvasObject } from './canvas';

// 图层类型
export type LayerType = 'normal' | 'guide' | 'template' | 'background';

// 图层混合模式
export type LayerBlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

// 图层对象
export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: LayerBlendMode;
  zIndex: number;
  
  // 图层内容
  objects: string[]; // CanvasObject ID 列表
  
  // 图层属性
  thumbnail?: string;
  color?: string; // 图层标识颜色
  notes?: string;
  
  // 元数据
  createdAt: Date;
  modifiedAt: Date;
  createdBy?: string;
  modifiedBy?: string;
  
  // 父子关系
  parentId?: string;
  children: string[]; // 子图层ID列表
  
  // 图层组
  isGroup?: boolean;
  expanded?: boolean;
}

// 图层树
export interface LayerTree {
  layers: Record<string, Layer>;
  rootLayers: string[];
  maxZIndex: number;
}

// 图层选择
export interface LayerSelection {
  layerIds: string[];
  activeLayerId?: string;
}

// 图层事件
export interface LayerEventMap {
  'layer:created': { layer: Layer };
  'layer:deleted': { layerId: string };
  'layer:updated': { layer: Layer; changes: Partial<Layer> };
  'layer:moved': { layerId: string; oldIndex: number; newIndex: number };
  'layer:visibility-changed': { layerId: string; visible: boolean };
  'layer:lock-changed': { layerId: string; locked: boolean };
  'layer:opacity-changed': { layerId: string; opacity: number };
  'layer:blend-mode-changed': { layerId: string; blendMode: LayerBlendMode };
  'layer:parent-changed': { layerId: string; oldParentId?: string; newParentId?: string };
  'layer:objects-changed': { layerId: string; added: string[]; removed: string[] };
  'layer:selected': { layerIds: string[] };
  'layer:deselected': { layerIds: string[] };
}