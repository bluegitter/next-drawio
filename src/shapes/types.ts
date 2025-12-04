export interface Point { x: number; y: number }
export interface Bounds { minX: number; maxX: number; minY: number; maxY: number }

export interface ShapeContext {
  createSVGElement: (tag: string) => SVGElement | null;
  generateId: () => string;
}

export interface CornerHandle {
  id: string;
  type: string;
  x: number;
  y: number;
  visible: boolean;
  cursor: string;
}

export interface ShapeDefinition<TData = any> {
  type: string;
  create: (ctx: ShapeContext, options?: any) => { id: string; element: SVGElement; data: TData };
  getBounds: (shape: any) => Bounds;
  getCenter: (shape: any) => Point;
  move: (shape: any, dx: number, dy: number) => void;
  resize?: (shape: any, handle: string, dx: number, dy: number) => void;
  clone: (shape: any, ctx: ShapeContext, offset: number) => any;
  getPorts?: (shape: any) => Array<Point & { id: string; position?: string }>;
  getCornerHandles?: (shape: any) => CornerHandle[];
}

export type ShapeRegistry = Record<string, ShapeDefinition>;
