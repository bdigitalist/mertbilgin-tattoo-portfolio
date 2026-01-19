import { create } from 'zustand';
import { GridItem } from '@/data/portfolioData';

interface GridState {
  // Scroll position (both axes for bidirectional scroll)
  scrollX: number;
  scrollY: number;

  // Target scroll position for lerp smoothing
  targetScrollX: number;
  targetScrollY: number;

  // Velocity for inertia
  velocityX: number;
  velocityY: number;

  // Grid configuration
  columns: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;

  // UI state
  isDragging: boolean;
  isScrolling: boolean;
  isPreloaderComplete: boolean;
  infoPanelOpen: boolean;

  // Selected item for lightbox
  selectedItem: GridItem | null;

  // Actions
  setScroll: (x: number, y: number) => void;
  addScroll: (deltaX: number, deltaY: number) => void;
  setTargetScroll: (x: number, y: number) => void;
  addTargetScroll: (deltaX: number, deltaY: number) => void;
  setVelocity: (vx: number, vy: number) => void;
  setIsScrolling: (isScrolling: boolean) => void;
  setGridConfig: (columns: number, cellWidth: number, cellHeight: number, gap: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setPreloaderComplete: (complete: boolean) => void;
  setInfoPanelOpen: (open: boolean) => void;
  setSelectedItem: (item: GridItem | null) => void;
}

export const useGridStore = create<GridState>((set) => ({
  // Initial state
  scrollX: 0,
  scrollY: 0,
  targetScrollX: 0,
  targetScrollY: 0,
  velocityX: 0,
  velocityY: 0,
  columns: 4,
  cellWidth: 300,
  cellHeight: 225,
  gap: 16,
  isDragging: false,
  isScrolling: false,
  isPreloaderComplete: false,
  infoPanelOpen: true,
  selectedItem: null,

  // Actions
  setScroll: (x, y) => set({ scrollX: x, scrollY: y }),

  addScroll: (deltaX, deltaY) => set((state) => ({
    scrollX: state.scrollX + deltaX,
    scrollY: state.scrollY + deltaY
  })),

  setTargetScroll: (x, y) => set({ targetScrollX: x, targetScrollY: y }),

  addTargetScroll: (deltaX, deltaY) => set((state) => ({
    targetScrollX: state.targetScrollX + deltaX,
    targetScrollY: state.targetScrollY + deltaY
  })),

  setVelocity: (vx, vy) => set({ velocityX: vx, velocityY: vy }),

  setIsScrolling: (isScrolling) => set({ isScrolling }),

  setGridConfig: (columns, cellWidth, cellHeight, gap) => set({
    columns,
    cellWidth,
    cellHeight,
    gap
  }),

  setIsDragging: (isDragging) => set({ isDragging }),

  setPreloaderComplete: (complete) => set({ isPreloaderComplete: complete }),

  setInfoPanelOpen: (open) => set({ infoPanelOpen: open }),

  setSelectedItem: (item) => set({ selectedItem: item })
}));
