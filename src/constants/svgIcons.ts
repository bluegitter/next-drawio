// 通用内联 SVG 图标（base64）
export const CHECK_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjJweCIgaGVpZ2h0PSIxOHB4IiB2ZXJzaW9uPSIxLjEiPjxwYXRoIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQgMCkiIGQ9Ik03LjE4MSwxNS4wMDdhMSwxLDAsMCwxLS43OTMtMC4zOTFMMy4yMjIsMTAuNUExLDEsMCwxLDEsNC44MDgsOS4yNzRMNy4xMzIsMTIuM2w2LjA0NC04Ljg2QTEsMSwwLDEsMSwxNC44Myw0LjU2OWwtNi44MjMsMTBhMSwxLDAsMCwxLS44LjQzN0g3LjE4MVoiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=';

const svg = (content: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${content}</svg>`;

export const SHAPE_ICONS: Record<string, string> = {
  rectangle: svg("<rect x='4' y='6' width='16' height='12' rx='1'/>"),
  roundedRect: svg("<rect x='4' y='6' width='16' height='12' rx='3'/>"),
  circle: svg("<circle cx='12' cy='12' r='7'/>"),
  triangle: svg("<polygon points='12 5 19 17 5 17'/>"),
  line: svg("<line x1='4' y1='18' x2='20' y2='6'/>"),
  polyline: svg("<polyline points='4 18 10 12 16 16 20 8'/>"),
  text: svg("<path d='M8 6h8M12 6v12'/>"),
  connect: svg("<line x1='5' y1='12' x2='19' y2='12'/><circle cx='5' cy='12' r='1.5' fill='%236b7280'/><circle cx='19' cy='12' r='1.5' fill='%236b7280'/>"),
};

export const GENERAL_SHAPE_LIBRARY: { key: string; label: string; icon: string }[] = [
  { key: 'ellipse', label: '椭圆', icon: svg("<ellipse cx='12' cy='12' rx='8' ry='6'/>") },
  { key: 'diamond', label: '菱形', icon: svg("<polygon points='12 4 20 12 12 20 4 12'/>") },
  { key: 'trapezoid', label: '梯形', icon: svg("<polygon points='6 18 18 18 16 6 8 6'/>") },
  { key: 'hexagon', label: '六边形', icon: svg("<polygon points='8 4 16 4 20 12 16 20 8 20 4 12'/>") },
  { key: 'pentagon', label: '五边形', icon: svg("<polygon points='12 4 18 9 15.5 18 8.5 18 6 9'/>") },
  { key: 'cylinder', label: '圆柱体', icon: svg("<ellipse cx='12' cy='7' rx='7' ry='3.5'/><path d='M5 7v8.5c0 1.5 3 2.5 7 2.5s7-1 7-2.5V7' fill='none'/>") },
  { key: 'speech', label: '对话框', icon: svg("<rect x='5' y='6' width='14' height='10' rx='1.5'/><path d='M9 16 7 19 12 16'/>") },
  { key: 'cloud', label: '云', icon: svg("<path d='M6 5 C1.2 5 0 8 3.2 9 C0 10.5 3.8 13 6.4 11.6 C8 13.8 14 13.8 15.6 11.6 C19.2 11.6 19.2 9.2 16.6 8 C19.2 6 16 3.6 13 4.6 C10.8 3.0 6.4 3.0 6 5 Z'/>") },
  { key: 'wave', label: '波形', icon: svg("<path d='M4 15c2.5-4 5.5-4 8 0s5.5 4 8 0'/>") },
];
