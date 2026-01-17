import { useEffect, useRef } from 'react';
import { useGridStore } from '@/store/useGridStore';
import { X } from 'lucide-react';
import gsap from 'gsap';

export const Lightbox = () => {
  const { selectedItem, setSelectedItem } = useGridStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Animate in
  useEffect(() => {
    if (!selectedItem || !overlayRef.current || !contentRef.current) return;
    
    gsap.fromTo(overlayRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out', delay: 0.1 }
    );
  }, [selectedItem]);
  
  const handleClose = () => {
    if (!overlayRef.current || !contentRef.current) {
      setSelectedItem(null);
      return;
    }
    
    const tl = gsap.timeline({
      onComplete: () => setSelectedItem(null)
    });
    
    tl.to(contentRef.current, {
      opacity: 0,
      y: -20,
      scale: 0.95,
      duration: 0.2,
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
      className="lightbox-overlay"
      onClick={handleClose}
    >
      <button
        onClick={handleClose}
        className="lightbox-close"
      >
        <X size={12} className="inline mr-2" />
        CLOSE
      </button>
      
      <div 
        ref={contentRef}
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={selectedItem.src}
          alt={selectedItem.alt}
          className="lightbox-image"
        />
        
        <div className="lightbox-info">
          <h2 className="text-xl font-medium tracking-wide mb-2">
            {selectedItem.title}
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground tracking-wider mb-4">
            <span>{selectedItem.category}</span>
            <span>•</span>
            <span>{selectedItem.year}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {selectedItem.description}
          </p>
        </div>
      </div>
    </div>
  );
};
