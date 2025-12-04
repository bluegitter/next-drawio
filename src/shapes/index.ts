import { ShapeRegistry } from './types';
import { rectShape } from './rect';
import { circleShape } from './circle';
import { triangleShape } from './triangle';
import { textShape } from './text';
import { lineShape } from './line';
import { polylineShape } from './polyline';
import { connectorShape } from './connector';

export const shapeRegistry: ShapeRegistry = {
  rect: rectShape,
  circle: circleShape,
  triangle: triangleShape,
  text: textShape,
  line: lineShape,
  polyline: polylineShape,
  connector: connectorShape,
};
