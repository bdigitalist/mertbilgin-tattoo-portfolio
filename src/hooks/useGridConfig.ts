import { useEffect, useCallback } from 'react';
import { useGridStore } from '@/store/useGridStore';

// Grid layout configuration
const GRID_CONFIG = {
  gap: 16,
  aspectRatio: 1.25,         // 4:5 portrait (height = width * 1.25)
  mobileBreakpoint: 900,
  columns: {
    desktop: 3,              // 3 columns on desktop
    mobile: 2,               // 2 columns on mobile (larger cells)
  },
};

export const useGridConfig = () => {
  const setGridConfig = useGridStore((state) => state.setGridConfig);

  const calculateGridConfig = useCallback(() => {
    const width = window.innerWidth;
    const { gap, aspectRatio, mobileBreakpoint, columns } = GRID_CONFIG;

    // Responsive: 3 columns desktop, 2 columns mobile
    const cols = width >= mobileBreakpoint ? columns.desktop : columns.mobile;

    // Calculate cell dimensions to fill viewport width
    const totalGaps = (cols + 1) * gap;
    const cellWidth = (width - totalGaps) / cols;
    const cellHeight = cellWidth * aspectRatio;

    setGridConfig(cols, cellWidth, cellHeight, gap);

    return { columns: cols, cellWidth, cellHeight, gap };
  }, [setGridConfig]);

  useEffect(() => {
    calculateGridConfig();

    const handleResize = () => {
      calculateGridConfig();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateGridConfig]);

  return calculateGridConfig;
};
