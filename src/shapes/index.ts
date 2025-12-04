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
