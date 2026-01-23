import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

export type UseKeyboardShortcutsArgs = {
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  undo: () => void;
  redo: () => void;
  clearSelection: () => void;
  selectAllShapes: () => void;
  combineSelected: () => void;
  ungroupSelected: () => void;
  isConnecting: MaybeRef<boolean>;
  tempLine: MaybeRef<SVGElement | null>;
  svgRef: RefLike<SVGSVGElement>;
  setTempLine: (next: SVGElement | null) => void;
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setConnectionStartPort: (next: string | null) => void;
};

export const useKeyboardShortcuts = ({
  deleteSelected,
  duplicateSelected,
  copySelection,
  pasteClipboard,
  undo,
  redo,
  clearSelection,
  selectAllShapes,
  combineSelected,
  ungroupSelected,
  isConnecting,
  tempLine,
  svgRef,
  setTempLine,
  setIsConnecting,
  setConnectionStart,
  setConnectionStartPort,
}: UseKeyboardShortcutsArgs) => {
  const isTextInput = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || target.isContentEditable || tag === 'select';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isTextInput(e.target)) return;

    const meta = e.metaKey || e.ctrlKey;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelected();
    } else if (meta && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copySelection();
    } else if (meta && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      duplicateSelected();
    } else if (meta && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      pasteClipboard();
    } else if (meta && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if (meta && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    } else if (meta && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      clearSelection();
    } else if (meta && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      selectAllShapes();
    } else if (meta && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      if (e.shiftKey) {
        ungroupSelected();
      } else {
        combineSelected();
      }
    } else if (e.key === 'Escape') {
      if (getRefValue(isConnecting)) {
        const tempLineValue = getRefValue(tempLine);
        const svg = getRefValue(svgRef);
        if (tempLineValue && svg?.contains(tempLineValue)) {
          svg.removeChild(tempLineValue);
        }
        setTempLine(null);
        setIsConnecting(false);
        setConnectionStart(null);
        setConnectionStartPort(null);
      }
    }
  };

  const bind = () => {
    const options = { capture: true } as AddEventListenerOptions;
    window.addEventListener('keydown', handleKeyDown, options);
    return () => window.removeEventListener('keydown', handleKeyDown, options);
  };

  return { bind };
};
