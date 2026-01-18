import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ImagePlane } from './ImagePlane';
import { portfolioItems, GridItem } from '@/data/portfolioData';
import { useGridStore } from '@/store/useGridStore';

interface GridManagerProps {
  onItemClick: (item: GridItem) => void;
}

export const GridManager = ({ onItemClick }: GridManagerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  // Get grid config from store (non-reactive for perf)
  const columns = useGridStore((state) => state.columns);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const gap = useGridStore((state) => state.gap);
  
  // Pre-calculate grid structure
  const gridLayout = useMemo(() => {
    const gridCellWidth = cellWidth + gap;
    const gridCellHeight = cellHeight + gap;
    const totalItems = portfolioItems.length;
    const rows = Math.ceil(totalItems / columns);
    
    // Total grid dimensions
    const totalGridWidth = columns * gridCellWidth;
    const totalGridHeight = rows * gridCellHeight;
    
    // How many cells to render (enough to fill viewport + buffer)
    const colsToRender = Math.ceil(viewport.width / gridCellWidth) + 6;
    const rowsToRender = Math.ceil(viewport.height / gridCellHeight) + 6;
    
    return {
      gridCellWidth,
      gridCellHeight,
      totalItems,
      rows,
      columns,
      totalGridWidth,
      totalGridHeight,
      colsToRender,
      rowsToRender
    };
  }, [columns, cellWidth, cellHeight, gap, viewport.width, viewport.height]);
  
  // Create static set of mesh placeholders
  const gridCells = useMemo(() => {
    const { colsToRender, rowsToRender } = gridLayout;
    const cells: Array<{ key: string; localIndex: number }> = [];
    
    for (let row = 0; row < rowsToRender; row++) {
      for (let col = 0; col < colsToRender; col++) {
        cells.push({
          key: `cell-${col}-${row}`,
          localIndex: row * colsToRender + col
        });
      }
    }
    
    return cells;
  }, [gridLayout]);
  
  // Update positions every frame
  useFrame(() => {
    if (!groupRef.current) return;
    
    const { scrollX, scrollY } = useGridStore.getState();
    const { 
      gridCellWidth, 
      gridCellHeight, 
      colsToRender, 
      rowsToRender,
      totalItems,
      rows,
      columns
    } = gridLayout;
    
    // Center offsets
    const halfCols = Math.floor(colsToRender / 2);
    const halfRows = Math.floor(rowsToRender / 2);
    
    // Which cell is at center based on scroll
    const centerCellCol = Math.floor(scrollX / gridCellWidth);
    const centerCellRow = Math.floor(scrollY / gridCellHeight);
    
    // Sub-pixel offset
    const offsetX = scrollX % gridCellWidth;
    const offsetY = scrollY % gridCellHeight;
    
    let meshIndex = 0;
    groupRef.current.children.forEach((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      
      const localCol = meshIndex % colsToRender;
      const localRow = Math.floor(meshIndex / colsToRender);
      
      // Grid position relative to center
      const gridCol = centerCellCol + (localCol - halfCols);
      const gridRow = centerCellRow + (localRow - halfRows);
      
      // Wrap to get actual item
      const wrappedCol = ((gridCol % columns) + columns) % columns;
      const wrappedRow = ((gridRow % rows) + rows) % rows;
      const itemIndex = (wrappedRow * columns + wrappedCol) % totalItems;
      
      // Screen position (centered at origin)
      const screenX = (localCol - halfCols) * gridCellWidth - offsetX;
      const screenY = -((localRow - halfRows) * gridCellHeight - offsetY);
      
      child.position.set(screenX, screenY, 0);
      child.userData.itemIndex = itemIndex;
      child.userData.item = portfolioItems[itemIndex];
      
      meshIndex++;
    });
  });
  
  return (
    <group ref={groupRef}>
      {gridCells.map(({ key, localIndex }) => {
        // Initial item index (will be updated in useFrame)
        const localCol = localIndex % gridLayout.colsToRender;
        const localRow = Math.floor(localIndex / gridLayout.colsToRender);
        const itemIndex = (localRow * gridLayout.columns + localCol) % portfolioItems.length;
        
        return (
          <ImagePlane
            key={key}
            item={portfolioItems[itemIndex]}
            position={[0, 0, 0]}
            width={cellWidth}
            height={cellHeight}
            onClick={() => {
              const mesh = groupRef.current?.children[localIndex];
              if (mesh?.userData?.item) {
                onItemClick(mesh.userData.item);
              }
            }}
          />
        );
      })}
    </group>
  );
};
