import { useEffect, useCallback, useLayoutEffect } from 'react';
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

// Calculate grid config synchronously - used for initial store values
export const calculateGridConfigSync = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const { gap, aspectRatio, mobileBreakpoint, columns } = GRID_CONFIG;

  const cols = width >= mobileBreakpoint ? columns.desktop : columns.mobile;
  const totalGaps = (cols + 1) * gap;
  const cellWidth = (width - totalGaps) / cols;
  const cellHeight = cellWidth * aspectRatio;

  return { columns: cols, cellWidth, cellHeight, gap };
};

export const useGridConfig = () => {
  const setGridConfig = useGridStore((state) => state.setGridConfig);

  const calculateGridConfig = useCallback(() => {
    const { columns: cols, cellWidth, cellHeight, gap } = calculateGridConfigSync();
    setGridConfig(cols, cellWidth, cellHeight, gap);
    return { columns: cols, cellWidth, cellHeight, gap };
  }, [setGridConfig]);

  // Use useLayoutEffect to calculate before first paint
  useLayoutEffect(() => {
    calculateGridConfig();
  }, [calculateGridConfig]);

  useEffect(() => {
    const handleResize = () => {
      calculateGridConfig();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateGridConfig]);

  return calculateGridConfig;
};
