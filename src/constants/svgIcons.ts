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
