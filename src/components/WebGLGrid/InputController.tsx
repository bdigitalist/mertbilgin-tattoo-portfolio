import { useEffect, useRef, useCallback } from 'react';
import { useGridStore } from '@/store/useGridStore';

const SCROLL_SPEED = 1.5;
const DRAG_SPEED = 1;

export const InputController = () => {
  const { 
    addScroll, 
    setVelocity, 
    setIsDragging,
    setIsScrolling
  } = useGridStore();
  
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const isDraggingRef = useRef(false);
  
  // Handle wheel scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    // Convert wheel delta to scroll movement
    const deltaX = e.deltaX * SCROLL_SPEED;
    const deltaY = e.deltaY * SCROLL_SPEED;
    
    addScroll(deltaX, deltaY);
    setIsScrolling(true);
    
    // Set velocity for smooth stop
    setVelocity(deltaX * 0.5, deltaY * 0.5);
  }, [addScroll, setVelocity, setIsScrolling]);
  
  // Handle mouse/touch drag
  const handlePointerDown = useCallback((e: PointerEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    velocityHistoryRef.current = [];
    
    (e.target as Element)?.setPointerCapture(e.pointerId);
  }, [setIsDragging]);
  
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = (lastMouseRef.current.x - e.clientX) * DRAG_SPEED;
    const deltaY = (lastMouseRef.current.y - e.clientY) * DRAG_SPEED;
    
    addScroll(deltaX, deltaY);
    
    // Track velocity history for inertia
    const now = performance.now();
    velocityHistoryRef.current.push({ x: deltaX, y: deltaY, time: now });
    
    // Keep only last 5 samples
    if (velocityHistoryRef.current.length > 5) {
      velocityHistoryRef.current.shift();
    }
    
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [addScroll]);
  
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    setIsDragging(false);
    
    (e.target as Element)?.releasePointerCapture(e.pointerId);
    
    // Calculate average velocity from history
    const history = velocityHistoryRef.current;
    if (history.length >= 2) {
      const recentHistory = history.slice(-3);
      const avgVx = recentHistory.reduce((sum, h) => sum + h.x, 0) / recentHistory.length;
      const avgVy = recentHistory.reduce((sum, h) => sum + h.y, 0) / recentHistory.length;
      
      setVelocity(avgVx * 2, avgVy * 2);
    }
    
    velocityHistoryRef.current = [];
  }, [setIsDragging, setVelocity]);
  
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // Wheel events
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Pointer events
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handleWheel, handlePointerDown, handlePointerMove, handlePointerUp]);
  
  return null;
};
