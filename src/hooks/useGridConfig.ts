import { useEffect, useCallback, useLayoutEffect } from 'react';
import { useGridStore } from '@/store/useGridStore';

// Grid layout configuration
const GRID_CONFIG = {
  gap: 16,
  aspectRatio: 1.25,         // 4:5 portrait (height = width * 1.25)
  breakpoints: {
    desktop: 1024,
    tablet: 640,
  },
  columns: {
    desktop: 3,              // 3 columns on wide screens
    tablet: 2,               // 2 columns on tablets
    mobile: 2,               // 2 columns on phones
  },
};

// Calculate grid config synchronously - used for initial store values
export const calculateGridConfigSync = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const { gap, aspectRatio, breakpoints, columns } = GRID_CONFIG;

  let cols = columns.desktop;
  let divisor = columns.desktop; // How many items visible per row visually

  if (width < breakpoints.tablet) {
    cols = columns.mobile;
    divisor = 1.5; // Show 1.5 items per row on mobile
  } else if (width < breakpoints.desktop) {
    cols = columns.tablet;
    divisor = columns.tablet;
  }

  const totalGaps = (divisor + 1) * gap; // Gaps based on visual divisor
  const cellWidth = (width - totalGaps) / divisor; // Width based on visual divisor
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
