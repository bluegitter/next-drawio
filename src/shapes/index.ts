import { ShapeRegistry } from './types';
import { rectShape } from './rect';
import { roundedRectShape } from './roundedRect';
import { circleShape } from './circle';
import { triangleShape } from './triangle';
import { textShape } from './text';
import { lineShape } from './line';
import { polylineShape } from './polyline';
import { connectorShape } from './connector';
import { imageShape } from './image';
import { ShapeDefinition } from './types';

export const shapeRegistry: ShapeRegistry = {
  rect: rectShape,
  roundedRect: roundedRectShape,
  circle: circleShape,
  triangle: triangleShape,
  text: textShape,
  line: lineShape,
  polyline: polylineShape,
  connector: connectorShape,
  image: imageShape,
};

// 获取图元的 port 定义，保持逻辑在图元对象中
export const getPortsForShape = (shape: any): ReturnType<NonNullable<ShapeDefinition['getPorts']>> => {
  const def = shapeRegistry[shape?.type as keyof typeof shapeRegistry];
  if (def?.getPorts) return def.getPorts(shape);
  return [];
};
