import { useEffect, useCallback } from 'react';
import { useGridStore } from '@/store/useGridStore';

export const useGridConfig = () => {
  const setGridConfig = useGridStore((state) => state.setGridConfig);
  
  const calculateGridConfig = useCallback(() => {
    const width = window.innerWidth;
    const gap = 4;
    
    let columns: number;
    if (width > 1400) {
      columns = 4;
    } else if (width > 1200) {
      columns = 4;
    } else if (width > 900) {
      columns = 3;
    } else {
      columns = 2;
    }
    
    // Calculate cell dimensions
    const totalGaps = (columns + 1) * gap;
    const cellWidth = (width - totalGaps) / columns;
    const cellHeight = cellWidth * 0.75; // 4:3 aspect ratio
    
    setGridConfig(columns, cellWidth, cellHeight, gap);
    
    return { columns, cellWidth, cellHeight, gap };
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
