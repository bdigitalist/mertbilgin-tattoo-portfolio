import { useEffect, useState, useRef } from 'react';
import { useGridStore } from '@/store/useGridStore';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

export const CustomCursor = () => {
  const isTouchDevice = useIsTouchDevice();
  const { isScrolling, isDragging } = useGridStore();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const hideTimeoutRef = useRef<number>();
  
  useEffect(() => {
    if (isTouchDevice) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = window.setTimeout(() => {
        if (!isDragging) {
          setIsVisible(false);
        }
      }, 3000);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    const animate = () => {
      const easing = 0.15;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * easing;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * easing;
      
      setPosition({
        x: currentRef.current.x,
        y: currentRef.current.y
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isDragging, isTouchDevice]);
  
  // Don't render on touch devices
  if (isTouchDevice) return null;
  
  const shouldShow = isVisible && !isScrolling;
  
  return (
    <div
      className="custom-cursor"
      style={{
        left: position.x,
        top: position.y,
        opacity: shouldShow ? 1 : 0
      }}
    >
      <div className="custom-cursor-inner">
        {isDragging ? 'DRAGGING' : 'SCROLL OR CLICK'}
      </div>
    </div>
  );
};
