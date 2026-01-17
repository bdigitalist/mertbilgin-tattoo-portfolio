import { useMemo } from 'react';
import { ImagePlane } from './ImagePlane';
import { portfolioItems, GridItem } from '@/data/portfolioData';
import { useGridStore } from '@/store/useGridStore';

interface GridManagerProps {
  onItemClick: (item: GridItem) => void;
}

export const GridManager = ({ onItemClick }: GridManagerProps) => {
  const { scrollX, scrollY, columns, cellWidth, cellHeight, gap } = useGridStore();
  
  // Calculate visible grid items with infinite wrap
  const visibleItems = useMemo(() => {
    const items: Array<{
      item: GridItem;
      position: [number, number, number];
      key: string;
    }> = [];
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Grid dimensions in pixels
    const gridCellWidth = cellWidth + gap;
    const gridCellHeight = cellHeight + gap;
    
    // How many items we have
    const totalItems = portfolioItems.length;
    const rows = Math.ceil(totalItems / columns);
    
    // Total grid size
    const totalGridWidth = columns * gridCellWidth;
    const totalGridHeight = rows * gridCellHeight;
    
    // Calculate which cells are visible (with buffer for smooth scrolling)
    const buffer = 2; // Extra cells outside viewport
    
    // Normalized scroll position
    const normalizedScrollX = ((scrollX % totalGridWidth) + totalGridWidth) % totalGridWidth;
    const normalizedScrollY = ((scrollY % totalGridHeight) + totalGridHeight) % totalGridHeight;
    
    // Calculate visible range
    const startCol = Math.floor((normalizedScrollX - viewportWidth / 2) / gridCellWidth) - buffer;
    const endCol = Math.ceil((normalizedScrollX + viewportWidth / 2) / gridCellWidth) + buffer;
    const startRow = Math.floor((normalizedScrollY - viewportHeight / 2) / gridCellHeight) - buffer;
    const endRow = Math.ceil((normalizedScrollY + viewportHeight / 2) / gridCellHeight) + buffer;
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        // Wrap column and row indices
        const wrappedCol = ((col % columns) + columns) % columns;
        const wrappedRow = ((row % rows) + rows) % rows;
        const itemIndex = wrappedRow * columns + wrappedCol;
        
        if (itemIndex < totalItems) {
          const item = portfolioItems[itemIndex];
          
          // Calculate position in world space
          const worldX = col * gridCellWidth - scrollX + viewportWidth / 2;
          const worldY = -(row * gridCellHeight - scrollY + viewportHeight / 2);
          
          items.push({
            item,
            position: [worldX, worldY, 0] as [number, number, number],
            key: `${item.id}-${col}-${row}`
          });
        }
      }
    }
    
    return items;
  }, [scrollX, scrollY, columns, cellWidth, cellHeight, gap]);
  
  return (
    <group>
      {visibleItems.map(({ item, position, key }) => (
        <ImagePlane
          key={key}
          item={item}
          position={position}
          width={cellWidth}
          height={cellHeight}
          onClick={() => onItemClick(item)}
        />
      ))}
    </group>
  );
};
