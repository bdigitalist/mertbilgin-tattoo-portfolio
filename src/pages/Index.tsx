import { useCallback } from 'react';
import { WebGLCanvas } from '@/components/WebGLGrid/WebGLCanvas';
import { HUDHeader } from '@/components/HUD/HUDHeader';
import { FooterTitle } from '@/components/HUD/FooterTitle';
import { InfoPanel } from '@/components/HUD/InfoPanel';
import { ProgressiveBlur } from '@/components/Effects/ProgressiveBlur';
import { CustomCursor } from '@/components/Effects/CustomCursor';
import { Preloader } from '@/components/Preloader/Preloader';
import { Lightbox } from '@/components/Lightbox/Lightbox';
import { useGridStore } from '@/store/useGridStore';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { useIsMobile } from '@/hooks/use-mobile';
import { GridItem } from '@/data/portfolioData';

const Index = () => {
  const isTouchDevice = useIsTouchDevice();
  const isMobile = useIsMobile();
  const { setSelectedItem, isPreloaderComplete } = useGridStore();

  const handleItemClick = useCallback((item: GridItem) => {
    setSelectedItem(item);
  }, [setSelectedItem]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Preloader */}
      <Preloader />

      {/* WebGL Grid - only render after preloader completes */}
      {isPreloaderComplete && <WebGLCanvas onItemClick={handleItemClick} />}

      {/* Progressive blur edges */}
      <ProgressiveBlur position="top" />
      <ProgressiveBlur position="bottom" />

      {/* HUD */}
      <HUDHeader isMobile={isMobile} />
      <FooterTitle />

      {/* Info panel (desktop only) */}
      {!isMobile && <InfoPanel />}


      {/* Custom cursor (desktop only) */}
      {!isTouchDevice && <CustomCursor />}

      {/* Lightbox modal */}
      <Lightbox />
    </div>
  );
};

export default Index;
