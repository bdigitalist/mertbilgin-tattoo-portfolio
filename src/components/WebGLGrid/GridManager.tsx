import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolioItems, GridItem } from '@/data/portfolioData';
import { useGridStore } from '@/store/useGridStore';
import { getTexture } from '@/utils/textureLoader';

// Differential velocity multipliers per column
// Creates a staggering effect where columns scroll at different speeds
const COLUMN_VELOCITY = {
  multipliers: {
    1: [1.0],
    2: [0.85, 1.15],
    3: [0.7, 1.0, 1.3],
    5: [0.6, 0.8, 1.0, 1.2, 1.4],
  } as Record<number, number[]>,
};

// Prime offset for item distribution - reduces visible repetition
// Use a prime that doesn't share factors with common item counts
const PRIME_OFFSET = 17;

function getColumnVelocity(colIndex: number, totalColumns: number): number {
  const multipliers = COLUMN_VELOCITY.multipliers[totalColumns];
  if (multipliers?.[colIndex] !== undefined) {
    return multipliers[colIndex];
  }
  // Fallback: linear interpolation 0.7 to 1.3
  if (totalColumns <= 1) return 1.0;
  return 0.7 + (colIndex / (totalColumns - 1)) * 0.6;
}

interface GridManagerProps {
  onItemClick: (item: GridItem) => void;
}

export const GridManager = ({ onItemClick }: GridManagerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Get grid config from store
  const columns = useGridStore((state) => state.columns);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const gap = useGridStore((state) => state.gap);

  // Calculate grid layout
  const gridConfig = useMemo(() => {
    const cellW = cellWidth + gap;
    const cellH = cellHeight + gap;
    const rows = Math.ceil(portfolioItems.length / columns);

    // Total size of one "tile" of the grid (before it repeats)
    const tileWidth = columns * cellW;
    const tileHeight = rows * cellH;

    // How many cells needed to fill viewport + buffer (2 extra on each side)
    const colsVisible = Math.ceil(viewport.width / cellW) + 4;
    const rowsVisible = Math.ceil(viewport.height / cellH) + 4;

    return {
      cellW,
      cellH,
      columns,
      rows,
      tileWidth,
      tileHeight,
      colsVisible,
      rowsVisible,
      totalCells: colsVisible * rowsVisible
    };
  }, [columns, cellWidth, cellHeight, gap, viewport.width, viewport.height]);

  // Create mesh pool - enough to fill the screen with initial textures assigned
  const meshData = useMemo(() => {
    const { colsVisible, rowsVisible, columns, rows } = gridConfig;
    const data: Array<{
      localCol: number;
      localRow: number;
      initialItemIndex: number;
    }> = [];

    const totalItems = portfolioItems.length;
    const halfColsVisible = Math.floor(colsVisible / 2);
    const halfRowsVisible = Math.floor(rowsVisible / 2);

    for (let row = 0; row < rowsVisible; row++) {
      for (let col = 0; col < colsVisible; col++) {
        // Calculate initial item index using the same logic as useFrame
        // This prevents the "jump" on the first frame where items would otherwise 
        // swap to different textures because of the half-screen offset shift.
        const gridCol = col - halfColsVisible;
        const gridRow = row - halfRowsVisible;
        const initialItemIndex = ((gridRow * PRIME_OFFSET + gridCol) % totalItems + totalItems) % totalItems;

        data.push({ localCol: col, localRow: row, initialItemIndex });
      }
    }

    return data;
  }, [gridConfig]);

  // Shared geometry
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  // Pre-create materials with textures
  const materials = useMemo(() => {
    return meshData.map(({ initialItemIndex }) => {
      const item = portfolioItems[initialItemIndex];
      const tex = getTexture(item.src);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color: tex ? 0xffffff : 0x2a2a2a
      });
      return mat;
    });
  }, [meshData]);

  // Update positions and textures every frame
  useFrame(() => {
    if (!groupRef.current) return;

    const state = useGridStore.getState();
    const { scrollX, scrollY, targetScrollX, targetScrollY, setScroll, setIsScrolling } = state;

    // Smoothed scroll calculation (Lerp)
    // Moved here from useInfiniteScroll for perfect frame sync
    // Dynamic lerp: tight follow when dragging (0.3), smooth inertia when released (0.05)
    // Increased base precision for mobile feel
    const LERP_FACTOR = state.isDragging ? 0.3 : 0.05;
    const STOP_THRESHOLD = 0.1;

    const dx = targetScrollX - scrollX;
    const dy = targetScrollY - scrollY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let currentX = scrollX;
    let currentY = scrollY;

    if (distance > STOP_THRESHOLD) {
      currentX = scrollX + dx * LERP_FACTOR;
      currentY = scrollY + dy * LERP_FACTOR;
      setScroll(currentX, currentY);
      setIsScrolling(true);
    } else if (distance > 0) {
      currentX = targetScrollX;
      currentY = targetScrollY;
      setScroll(currentX, currentY);
      setIsScrolling(false);
    } else if (state.isScrolling) {
      setIsScrolling(false);
    }

    const { cellW, cellH, columns, rows, colsVisible, rowsVisible } = gridConfig;

    // X-axis: Calculate which grid cell is at the center of the viewport
    const centerCellX = Math.floor(currentX / cellW);
    const offsetX = currentX % cellW;

    // Half of visible area
    const halfColsVisible = Math.floor(colsVisible / 2);
    const halfRowsVisible = Math.floor(rowsVisible / 2);

    const totalItems = portfolioItems.length;

    groupRef.current.children.forEach((child, index) => {
      if (!(child instanceof THREE.Mesh)) return;

      const { localCol, localRow } = meshData[index];

      // X-axis
      const gridCol = centerCellX + (localCol - halfColsVisible);
      const wrappedCol = ((gridCol % columns) + columns) % columns;
      const screenX = (localCol - halfColsVisible) * cellW - offsetX;

      // Y-axis: apply per-column velocity multiplier
      const velocityMult = getColumnVelocity(wrappedCol, columns);
      const effectiveScrollY = currentY * velocityMult;

      const colCenterCellY = Math.floor(effectiveScrollY / cellH);
      const colOffsetY = effectiveScrollY % cellH;

      const gridRow = colCenterCellY + (localRow - halfRowsVisible);
      const wrappedRow = ((gridRow % rows) + rows) % rows;
      const screenY = -((localRow - halfRowsVisible) * cellH - colOffsetY);

      // Use absolute grid indices (colOffset/rowOffset included) to distribute items
      // This ensures that horizontal repetition is virtually impossible 
      // because we're drawing from the full portfolio list using absolute coordinates
      const absGridCol = gridCol;
      const absGridRow = gridRow;
      const itemIndex = ((absGridRow * PRIME_OFFSET + absGridCol) % totalItems + totalItems) % totalItems;

      // Only update if position changed
      if (child.position.x !== screenX || child.position.y !== screenY) {
        child.position.set(screenX, screenY, 0);
      }

      // Scale is relatively static unless hovered, keep simple
      child.scale.set(cellWidth, cellHeight, 1);

      // Update texture if needed - only if item changed
      const item = portfolioItems[itemIndex];
      const material = materials[index];

      // Optimization: only update if item mapping changed
      if (child.userData.currentItemIndex !== itemIndex) {
        const tex = getTexture(item.src);
        if (tex) {
          material.map = tex;
          material.color.setHex(0xffffff);
          // child.userData.currentItemIndex must be updated here
        }
        child.userData.currentItemIndex = itemIndex;
      }

      // Store item data for click handling
      child.userData.item = item;
      child.userData.itemIndex = itemIndex;
    });
  });

  return (
    <group ref={groupRef}>
      {meshData.map((_, index) => (
        <mesh
          key={index}
          geometry={geometry}
          material={materials[index]}
          onClick={(e) => {
            e.stopPropagation();
            // Don't open lightbox if this was a drag
            if (useGridStore.getState().isDragging) return;
            const mesh = e.object as THREE.Mesh;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            // Reset hover state before opening lightbox
            mat.color.setRGB(1, 1, 1);
            if (mesh.userData.baseScale) {
              mesh.scale.x = mesh.userData.baseScale.x;
              mesh.scale.y = mesh.userData.baseScale.y;
            }
            mesh.position.z = 0;
            document.body.style.cursor = 'none';
            const item = e.object.userData.item;
            if (item) onItemClick(item);
          }}
          onPointerOver={(e) => {
            const mesh = e.object as THREE.Mesh;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            // Subtle brightness increase
            mat.color.setRGB(1.15, 1.15, 1.15);
            // Scale up slightly for "anchor" effect
            mesh.userData.baseScale = { x: mesh.scale.x, y: mesh.scale.y };
            mesh.scale.x *= 1.02;
            mesh.scale.y *= 1.02;
            // Bring forward
            mesh.position.z = 1;
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            const mesh = e.object as THREE.Mesh;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            // Reset brightness
            mat.color.setRGB(1, 1, 1);
            // Reset scale
            if (mesh.userData.baseScale) {
              mesh.scale.x = mesh.userData.baseScale.x;
              mesh.scale.y = mesh.userData.baseScale.y;
            }
            // Reset depth
            mesh.position.z = 0;
            document.body.style.cursor = 'none';
          }}
        />
      ))}
    </group>
  );
};
