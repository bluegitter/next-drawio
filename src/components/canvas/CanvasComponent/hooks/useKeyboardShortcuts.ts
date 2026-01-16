import { useEffect } from 'react';
import type React from 'react';

interface UseKeyboardShortcutsArgs {
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
  isConnecting: boolean;
  tempLine: SVGElement | null;
  svgRef: React.RefObject<SVGSVGElement>;
  setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
}

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
  useEffect(() => {
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
      } else if (meta && (e.key.toLowerCase() === 'y')) {
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
        if (isConnecting) {
          if (tempLine && svgRef.current?.contains(tempLine)) {
            svgRef.current.removeChild(tempLine);
          }
          setTempLine(null);
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionStartPort(null);
        }
      }
    };

    const options = { capture: true };
    window.addEventListener('keydown', handleKeyDown, options);
    return () => window.removeEventListener('keydown', handleKeyDown, options);
  }, [clearSelection, combineSelected, copySelection, deleteSelected, duplicateSelected, isConnecting, pasteClipboard, redo, selectAllShapes, tempLine, undo, ungroupSelected, svgRef, setConnectionStart, setConnectionStartPort, setIsConnecting, setTempLine]);
};
