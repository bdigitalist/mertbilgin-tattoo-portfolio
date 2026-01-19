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

    for (let row = 0; row < rowsVisible; row++) {
      for (let col = 0; col < colsVisible; col++) {
        // Calculate initial item index for this cell using prime offset
        const wrappedCol = col % columns;
        const wrappedRow = row % rows;
        const initialItemIndex = (wrappedRow * PRIME_OFFSET + wrappedCol) % totalItems;

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

    const { scrollX, scrollY } = useGridStore.getState();
    const { cellW, cellH, columns, rows, colsVisible, rowsVisible } = gridConfig;

    // X-axis: Calculate which grid cell is at the center of the viewport
    const centerCellX = Math.floor(scrollX / cellW);
    const offsetX = scrollX % cellW;

    // Half of visible area
    const halfColsVisible = Math.floor(colsVisible / 2);
    const halfRowsVisible = Math.floor(rowsVisible / 2);

    const totalItems = portfolioItems.length;

    groupRef.current.children.forEach((child, index) => {
      if (!(child instanceof THREE.Mesh)) return;

      const { localCol, localRow } = meshData[index];

      // X-axis: unchanged
      const gridCol = centerCellX + (localCol - halfColsVisible);
      const wrappedCol = ((gridCol % columns) + columns) % columns;
      const screenX = (localCol - halfColsVisible) * cellW - offsetX;

      // Y-axis: apply per-column velocity multiplier
      const velocityMult = getColumnVelocity(wrappedCol, columns);
      const effectiveScrollY = scrollY * velocityMult;

      const colCenterCellY = Math.floor(effectiveScrollY / cellH);
      const colOffsetY = effectiveScrollY % cellH;

      const gridRow = colCenterCellY + (localRow - halfRowsVisible);
      const wrappedRow = ((gridRow % rows) + rows) % rows;
      const screenY = -((localRow - halfRowsVisible) * cellH - colOffsetY);

      // Use prime offset to distribute items non-sequentially
      // This makes repetition less obvious even with few columns
      const itemIndex = (wrappedRow * PRIME_OFFSET + wrappedCol) % totalItems;

      child.position.set(screenX, screenY, 0);
      child.scale.set(cellWidth, cellHeight, 1);

      // Update texture if needed
      const item = portfolioItems[itemIndex];
      const material = materials[index];
      const tex = getTexture(item.src);

      if (tex && material.map !== tex) {
        material.map = tex;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
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
