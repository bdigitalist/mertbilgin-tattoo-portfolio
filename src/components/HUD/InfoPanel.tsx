import { useGridStore } from '@/store/useGridStore';
import { portfolioItems } from '@/data/portfolioData';
import { X } from 'lucide-react';
import { ScrambleText } from './ScrambleText';

export const InfoPanel = () => {
  const { infoPanelOpen, setInfoPanelOpen, scrollX, scrollY, cellWidth, cellHeight, gap, columns } = useGridStore();
  
  if (!infoPanelOpen) return null;
  
  // Calculate current position in grid for minimap
  const gridCellWidth = cellWidth + gap;
  const gridCellHeight = cellHeight + gap;
  const rows = Math.ceil(portfolioItems.length / columns);
  const totalGridWidth = columns * gridCellWidth;
  const totalGridHeight = rows * gridCellHeight;
  
  const currentCol = Math.floor(((scrollX % totalGridWidth) + totalGridWidth) % totalGridWidth / gridCellWidth);
  const currentRow = Math.floor(((scrollY % totalGridHeight) + totalGridHeight) % totalGridHeight / gridCellHeight);
  
  // Get nearby items for minimap
  const getMinimapItems = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const col = ((currentCol + i) % columns + columns) % columns;
      const row = currentRow % rows;
      const index = row * columns + col;
      if (index < portfolioItems.length) {
        items.push({
          item: portfolioItems[index],
          isCenter: i === 0
        });
      }
    }
    return items;
  };
  
  return (
    <div className="info-panel">
      {/* Minimap */}
      <div className="minimap-strip">
        {getMinimapItems().map(({ item, isCenter }, i) => (
          <img
            key={`${item.id}-${i}`}
            src={item.src}
            alt={item.alt}
            className={`minimap-thumb ${isCenter ? 'active' : ''}`}
          />
        ))}
      </div>
      
      {/* Instructions */}
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-1">
          <ScrambleText text="NAVIGATION" className="hud-label text-[9px]" />
          <ScrambleText text="SCROLL OR DRAG TO EXPLORE" className="text-[10px] text-muted-foreground" />
          <ScrambleText text="CLICK IMAGE TO VIEW DETAILS" className="text-[10px] text-muted-foreground" />
        </div>

        <button
          onClick={() => setInfoPanelOpen(false)}
          className="w-full flex items-center justify-center gap-2 py-2 border border-border text-[10px] tracking-wider hover:bg-foreground hover:text-background transition-colors group"
        >
          <X size={10} />
          <ScrambleText text="CLOSE" className="" />
        </button>
      </div>
    </div>
  );
};
