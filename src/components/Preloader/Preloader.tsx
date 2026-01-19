import { useState, useEffect, useRef } from 'react';
import { useGridStore } from '@/store/useGridStore';
import { portfolioItems } from '@/data/portfolioData';
import { preloadAllTextures } from '@/utils/textureLoader';
import gsap from 'gsap';

const INTRO_TEXT = "WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE";

export const Preloader = () => {
  const { isPreloaderComplete, setPreloaderComplete } = useGridStore();
  const [count, setCount] = useState(0);
  const [showText, setShowText] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [texturesReady, setTexturesReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Actually preload all textures
  useEffect(() => {
    preloadAllTextures((progress) => {
      setCount(progress);
    }).then(() => {
      setTexturesReady(true);
    });
  }, []);
  
  // Animation timeline when textures are loaded
  useEffect(() => {
    if (!texturesReady) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsExiting(true);
        setTimeout(() => {
          setPreloaderComplete(true);
        }, 600);
      }
    });
    
    // Reveal thumbnail
    tl.to(thumbnailRef.current, {
      clipPath: 'inset(0 0 0 0)',
      duration: 0.6,
      ease: 'power3.out'
    }, 0.2);
    
    // Show intro text
    tl.call(() => setShowText(true), [], 0.8);
    
    // Wait then exit
    tl.to({}, { duration: 1 });

  }, [texturesReady, setPreloaderComplete]);
  
  // Exit animation
  useEffect(() => {
    if (!isExiting || !containerRef.current) return;
    
    gsap.to(containerRef.current, {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.5,
      ease: 'power3.inOut'
    });
  }, [isExiting]);
  
  if (isPreloaderComplete) return null;
  
  return (
    <div ref={containerRef} className="preloader">
      {/* Thumbnail */}
      <div 
        ref={thumbnailRef}
        className="preloader-thumbnail"
        style={{ clipPath: 'inset(100% 0 0 0)' }}
      >
        <img
          src={portfolioItems[0]?.src}
          alt="Preview"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>
      
      {/* Counter */}
      <div className="preloader-counter text-foreground">
        {count.toString().padStart(3, '0')}%
      </div>
      
      {/* Progress bar */}
      <div className="preloader-progress">
        <div 
          className="preloader-progress-bar"
          style={{ 
            transform: `scaleX(${count / 100})`,
            transition: 'transform 0.15s ease-out'
          }}
        />
      </div>
      
      {/* Intro text */}
      <p className={`preloader-text ${showText ? 'visible' : ''}`}>
        {INTRO_TEXT}
      </p>
    </div>
  );
};
