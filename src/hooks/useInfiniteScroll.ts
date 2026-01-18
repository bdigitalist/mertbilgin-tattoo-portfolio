import { useEffect, useRef } from 'react';
import { useGridStore } from '@/store/useGridStore';

const FRICTION = 0.95;
const MIN_VELOCITY = 0.1;

export const useInfiniteScroll = () => {
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  
  useEffect(() => {
    const animate = () => {
      const { velocityX, velocityY, isDragging, addScroll, setVelocity, setIsScrolling } = useGridStore.getState();
      
      if (!isDragging && (Math.abs(velocityX) > MIN_VELOCITY || Math.abs(velocityY) > MIN_VELOCITY)) {
        // Apply velocity
        addScroll(velocityX, velocityY);
        
        // Apply friction
        setVelocity(velocityX * FRICTION, velocityY * FRICTION);
        setIsScrolling(true);
        
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (!isDragging) {
          setVelocity(0, 0);
          setIsScrolling(false);
        }
        isRunningRef.current = false;
      }
    };
    
    // Check if we need to start animation
    const checkAndStart = () => {
      const { velocityX, velocityY, isDragging } = useGridStore.getState();
      
      if (!isDragging && !isRunningRef.current && 
          (Math.abs(velocityX) > MIN_VELOCITY || Math.abs(velocityY) > MIN_VELOCITY)) {
        isRunningRef.current = true;
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Subscribe to store changes
    const unsubscribe = useGridStore.subscribe((state, prevState) => {
      if (prevState.isDragging && !state.isDragging) {
        // Drag just ended, start inertia
        checkAndStart();
      }
    });
    
    return () => {
      unsubscribe();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return null;
};
