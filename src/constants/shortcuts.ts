// 快捷键常量
export const SHORTCUTS = {
  // 文件操作
  NEW: 'Ctrl+N',
  OPEN: 'Ctrl+O',
  SAVE: 'Ctrl+S',
  SAVE_AS: 'Ctrl+Shift+S',
  EXPORT: 'Ctrl+E',
  IMPORT: 'Ctrl+I',
  PRINT: 'Ctrl+P',
  CLOSE: 'Ctrl+W',
  QUIT: 'Ctrl+Q',
  
  // 编辑操作
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  REDO_ALT: 'Ctrl+Shift+Z',
  CUT: 'Ctrl+X',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  PASTE_IN_PLACE: 'Ctrl+Shift+V',
  DUPLICATE: 'Ctrl+D',
  DELETE: 'Delete',
  DELETE_BACKSPACE: 'Backspace',
  SELECT_ALL: 'Ctrl+A',
  DESELECT_ALL: 'Ctrl+Shift+A',
  INVERT_SELECTION: 'Ctrl+I',
  
  // 工具切换
  SELECT_TOOL: 'V',
  DIRECT_SELECT_TOOL: 'A',
  RECTANGLE_TOOL: 'M',
  CIRCLE_TOOL: 'L',
  ELLIPSE_TOOL: 'L',
  LINE_TOOL: '\\',
  PEN_TOOL: 'P',
  PENCIL_TOOL: 'B',
  TEXT_TOOL: 'T',
  HAND_TOOL: 'H',
  ZOOM_TOOL: 'Z',
  EYEDROPPER_TOOL: 'I',
  GRADIENT_TOOL: 'G',
  ERASER_TOOL: 'E',
  
  // 对象操作
  GROUP: 'Ctrl+G',
  UNGROUP: 'Ctrl+Shift+G',
  LOCK: 'Ctrl+L',
  UNLOCK: 'Ctrl+Shift+L',
  HIDE: 'Ctrl+3',
  SHOW_ALL: 'Ctrl+Alt+3',
  
  // 变换操作
  MOVE_UP: 'ArrowUp',
  MOVE_DOWN: 'ArrowDown',
  MOVE_LEFT: 'ArrowLeft',
  MOVE_RIGHT: 'ArrowRight',
  
  MOVE_UP_FAST: 'Shift+ArrowUp',
  MOVE_DOWN_FAST: 'Shift+ArrowDown',
  MOVE_LEFT_FAST: 'Shift+ArrowLeft',
  MOVE_RIGHT_FAST: 'Shift+ArrowRight',
  
  ROTATE_CW: 'Shift+]',
  ROTATE_CCW: 'Shift+[',
  FLIP_HORIZONTAL: 'Shift+H',
  FLIP_VERTICAL: 'Shift+V',
  
  // 对齐操作
  ALIGN_LEFT: 'Shift+Ctrl+L',
  ALIGN_CENTER: 'Shift+Ctrl+C',
  ALIGN_RIGHT: 'Shift+Ctrl+R',
  ALIGN_TOP: 'Shift+Ctrl+T',
  ALIGN_MIDDLE: 'Shift+Ctrl+M',
  ALIGN_BOTTOM: 'Shift+Ctrl+B',
  
  DISTRIBUTE_H: 'Shift+Ctrl+H',
  DISTRIBUTE_V: 'Shift+Ctrl+Alt+H',
  
  // 层级操作
  BRING_TO_FRONT: 'Ctrl+Shift+]',
  SEND_TO_BACK: 'Ctrl+Shift+[',
  BRING_FORWARD: 'Ctrl+]',
  SEND_BACKWARD: 'Ctrl+[',
  
  // 视图操作
  ZOOM_IN: 'Ctrl++',
  ZOOM_OUT: 'Ctrl+-',
  ZOOM_IN_ALT: 'Ctrl+=',
  ZOOM_FIT_ALL: 'Ctrl+0',
  ZOOM_FIT_SELECTION: 'Ctrl+1',
  ZOOM_ACTUAL_SIZE: 'Ctrl+2',
  
  PAN_UP: 'PageUp',
  PAN_DOWN: 'PageDown',
  PAN_LEFT: 'Home',
  PAN_RIGHT: 'End',
  
  TOGGLE_GRID: 'Ctrl+G',
  TOGGLE_RULERS: 'Ctrl+R',
  TOGGLE_GUIDES: 'Ctrl+;',
  TOGGLE_SNAP: 'Ctrl+Shift+G',
  
  // 其他
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  TAB: 'Tab',
  SPACE: 'Space',
  SHIFT: 'Shift',
  CTRL: 'Ctrl',
  ALT: 'Alt',
  
  // 面板切换
  TOGGLE_PROPERTIES: 'Ctrl+F3',
  TOGGLE_LAYERS: 'Ctrl+F2',
  TOGGLE_HISTORY: 'Ctrl+F10',
  TOGGLE_SYMBOLS: 'Ctrl+F11',
  TOGGLE_SWATCHES: 'Ctrl+F6',
  
  // 特殊功能
  REPEAT_LAST_TRANSFORM: 'Ctrl+D',
  CREATE_GUIDES: 'Ctrl+R',
  LOCK_GUIDES: 'Ctrl+Alt+;',
  CLEAR_GUIDES: 'Ctrl+Alt+G',
  
  // 预览模式
  PREVIEW_MODE: 'Ctrl+Y',
  PIXEL_PREVIEW: 'Ctrl+Alt+Y',
  OVERPRINT_PREVIEW: 'Ctrl+Alt+Shift+Y',
} as const;

// 修饰键
export const MODIFIER_KEYS = {
  CTRL: 'Control',
  SHIFT: 'Shift',
  ALT: 'Alt',
  META: 'Meta',
  CMD: 'Meta', // Mac Command 键
  
  CTRL_OR_CMD: process.platform === 'darwin' ? 'Meta' : 'Control',
} as const;

// 键码映射
export const KEY_CODES = {
  // 字母键
  A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72,
  I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80,
  Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88,
  Y: 89, Z: 90,
  
  // 数字键
  DIGIT_0: 48, DIGIT_1: 49, DIGIT_2: 50, DIGIT_3: 51, DIGIT_4: 52,
  DIGIT_5: 53, DIGIT_6: 54, DIGIT_7: 55, DIGIT_8: 56, DIGIT_9: 57,
  
  // 功能键
  F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117,
  F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
  
  // 特殊键
  SPACE: 32,
  ENTER: 13,
  ESCAPE: 27,
  TAB: 9,
  BACKSPACE: 8,
  DELETE: 46,
  
  // 方向键
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  
  // 其他键
  HOME: 36,
  END: 35,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  
  // 修饰键
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  META: 91, // Windows/Cmd
  CMD: 224, // Mac Command
} as const;

// 快捷键类别
export const SHORTCUT_CATEGORIES = {
  FILE: 'file',
  EDIT: 'edit',
  TOOLS: 'tools',
  OBJECT: 'object',
  ALIGN: 'align',
  LAYER: 'layer',
  VIEW: 'view',
  PANEL: 'panel',
  SPECIAL: 'special',
} as const;