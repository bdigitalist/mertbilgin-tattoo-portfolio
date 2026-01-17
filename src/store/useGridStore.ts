import { create } from 'zustand';
import { GridItem } from '@/data/portfolioData';

interface GridState {
  // Scroll position
  scrollX: number;
  scrollY: number;
  
  // Velocity for inertia
  velocityX: number;
  velocityY: number;
  
  // Grid configuration
  columns: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  
  // UI state
  isScrolling: boolean;
  isDragging: boolean;
  isPreloaderComplete: boolean;
  infoPanelOpen: boolean;
  
  // Selected item for lightbox
  selectedItem: GridItem | null;
  
  // Loaded images tracking
  loadedImages: Set<string>;
  
  // Actions
  setScroll: (x: number, y: number) => void;
  addScroll: (deltaX: number, deltaY: number) => void;
  setVelocity: (vx: number, vy: number) => void;
  setGridConfig: (columns: number, cellWidth: number, cellHeight: number, gap: number) => void;
  setIsScrolling: (isScrolling: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  setPreloaderComplete: (complete: boolean) => void;
  setInfoPanelOpen: (open: boolean) => void;
  setSelectedItem: (item: GridItem | null) => void;
  addLoadedImage: (src: string) => void;
}

export const useGridStore = create<GridState>((set) => ({
  // Initial state
  scrollX: 0,
  scrollY: 0,
  velocityX: 0,
  velocityY: 0,
  columns: 4,
  cellWidth: 300,
  cellHeight: 225,
  gap: 4,
  isScrolling: false,
  isDragging: false,
  isPreloaderComplete: false,
  infoPanelOpen: true,
  selectedItem: null,
  loadedImages: new Set(),
  
  // Actions
  setScroll: (x, y) => set({ scrollX: x, scrollY: y }),
  
  addScroll: (deltaX, deltaY) => set((state) => ({
    scrollX: state.scrollX + deltaX,
    scrollY: state.scrollY + deltaY
  })),
  
  setVelocity: (vx, vy) => set({ velocityX: vx, velocityY: vy }),
  
  setGridConfig: (columns, cellWidth, cellHeight, gap) => set({
    columns,
    cellWidth,
    cellHeight,
    gap
  }),
  
  setIsScrolling: (isScrolling) => set({ isScrolling }),
  
  setIsDragging: (isDragging) => set({ isDragging }),
  
  setPreloaderComplete: (complete) => set({ isPreloaderComplete: complete }),
  
  setInfoPanelOpen: (open) => set({ infoPanelOpen: open }),
  
  setSelectedItem: (item) => set({ selectedItem: item }),
  
  addLoadedImage: (src) => set((state) => {
    const newSet = new Set(state.loadedImages);
    newSet.add(src);
    return { loadedImages: newSet };
  })
}));
