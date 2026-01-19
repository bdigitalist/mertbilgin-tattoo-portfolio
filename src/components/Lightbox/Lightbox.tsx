import { useEffect, useRef } from 'react';
import { useGridStore } from '@/store/useGridStore';
import gsap from 'gsap';

export const Lightbox = () => {
  const { selectedItem, setSelectedItem } = useGridStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Animate in
  useEffect(() => {
    if (!selectedItem || !overlayRef.current || !contentRef.current) return;

    const tl = gsap.timeline();

    // Fade in overlay
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

    // Scale up content from center
    tl.fromTo(contentRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.2'
    );

    // Slide in image
    if (imageRef.current) {
      tl.fromTo(imageRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      );
    }

    // Fade in info
    if (infoRef.current) {
      tl.fromTo(infoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.2'
      );
    }
  }, [selectedItem]);

  const handleClose = () => {
    // Reset cursor to prevent stuck state
    document.body.style.cursor = 'none';

    if (!overlayRef.current || !contentRef.current) {
      setSelectedItem(null);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setSelectedItem(null)
    });

    tl.to(contentRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in'
    });

    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    }, '-=0.1');
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  if (!selectedItem) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-8 md:p-12 lg:p-16"
      onClick={handleClose}
    >
      {/* Close button - top right */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 px-4 py-2 border border-border hover:bg-foreground hover:text-background transition-colors text-[10px] tracking-widest uppercase z-10"
      >
        [CLOSE]
      </button>

      {/* Main content - large, central */}
      <div
        ref={contentRef}
        className="w-full max-w-6xl h-full max-h-[85vh] flex flex-col lg:flex-row gap-8 lg:gap-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image - takes most space */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <img
            ref={imageRef}
            src={selectedItem.src}
            alt={selectedItem.alt}
            className="max-w-full max-h-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Info panel - right side on desktop, bottom on mobile */}
        <div
          ref={infoRef}
          className="lg:w-72 flex flex-col justify-center gap-6 shrink-0"
        >
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase">
            {selectedItem.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground tracking-widest uppercase">
              <span>{selectedItem.category}</span>
              <span className="text-border">—</span>
              <span>{selectedItem.year}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedItem.description}
          </p>

          {/* Action */}
          {selectedItem.href && (
            <a
              href={selectedItem.href}
              className="inline-block mt-4 px-6 py-3 border border-border hover:bg-foreground hover:text-background transition-colors text-[10px] tracking-widest uppercase text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              [VIEW PROJECT]
            </a>
          )}
        </div>
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground tracking-widest uppercase">
        ESC TO CLOSE
      </div>
    </div>
  );
};
