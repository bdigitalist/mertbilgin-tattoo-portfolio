import { useEffect, useRef, useCallback } from 'react';
import { useGridStore } from '@/store/useGridStore';

const FRICTION = 0.92;
const MIN_VELOCITY = 0.5;

export const useInfiniteScroll = () => {
  const { 
    velocityX, 
    velocityY, 
    setVelocity, 
    addScroll,
    setIsScrolling,
    isDragging
  } = useGridStore();
  
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Inertia animation loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    
    const { velocityX, velocityY, isDragging } = useGridStore.getState();
    
    if (!isDragging && (Math.abs(velocityX) > MIN_VELOCITY || Math.abs(velocityY) > MIN_VELOCITY)) {
      // Apply velocity
      addScroll(velocityX, velocityY);
      
      // Apply friction
      const newVx = velocityX * FRICTION;
      const newVy = velocityY * FRICTION;
      setVelocity(newVx, newVy);
      
      setIsScrolling(true);
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (!isDragging) {
      setVelocity(0, 0);
      setIsScrolling(false);
    }
    
    lastTimeRef.current = time;
  }, [addScroll, setVelocity, setIsScrolling]);
  
  // Start inertia when not dragging and has velocity
  useEffect(() => {
    if (!isDragging && (Math.abs(velocityX) > MIN_VELOCITY || Math.abs(velocityY) > MIN_VELOCITY)) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, animate]);
  
  return null;
};
