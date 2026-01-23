import type React from 'react';
import type { HistoryState, SVGShape } from '../canvas-types';
import { useHistory as useHistoryCore } from '@drawio/core';

interface UseHistoryArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  history: HistoryState[];
  historyIndex: number;
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
  setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
  portElementsRef: React.MutableRefObject<Map<string, SVGElement[]>>;
  onShapeSelect?: (shape: SVGElement | null) => void;
  onCanvasChange?: () => void;
}

export const useHistory = (args: UseHistoryArgs) => {
  return useHistoryCore(args);
};
