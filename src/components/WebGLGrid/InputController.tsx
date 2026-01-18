import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useGridStore } from '@/store/useGridStore';

const SCROLL_SPEED = 1.2;
const DRAG_SPEED = 1;

export const InputController = () => {
  const { gl } = useThree();
  
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const isDraggingRef = useRef(false);
  
  // Handle wheel scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const { addScroll, setVelocity, setIsScrolling } = useGridStore.getState();
    
    // Convert wheel delta to scroll movement
    const deltaX = e.deltaX * SCROLL_SPEED;
    const deltaY = e.deltaY * SCROLL_SPEED;
    
    addScroll(deltaX, deltaY);
    setIsScrolling(true);
    
    // Set velocity for smooth stop
    setVelocity(deltaX * 0.3, deltaY * 0.3);
  }, []);
  
  // Handle mouse/touch drag
  const handlePointerDown = useCallback((e: PointerEvent) => {
    isDraggingRef.current = true;
    useGridStore.getState().setIsDragging(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    velocityHistoryRef.current = [];
    
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  }, []);
  
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = (lastMouseRef.current.x - e.clientX) * DRAG_SPEED;
    const deltaY = (lastMouseRef.current.y - e.clientY) * DRAG_SPEED;
    
    useGridStore.getState().addScroll(deltaX, deltaY);
    
    // Track velocity history for inertia
    const now = performance.now();
    velocityHistoryRef.current.push({ x: deltaX, y: deltaY, time: now });
    
    // Keep only last 5 samples
    if (velocityHistoryRef.current.length > 5) {
      velocityHistoryRef.current.shift();
    }
    
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    
    (e.target as Element)?.releasePointerCapture?.(e.pointerId);
    
    // Calculate average velocity from history
    const history = velocityHistoryRef.current;
    let avgVx = 0;
    let avgVy = 0;
    
    if (history.length >= 2) {
      const recentHistory = history.slice(-3);
      avgVx = recentHistory.reduce((sum, h) => sum + h.x, 0) / recentHistory.length;
      avgVy = recentHistory.reduce((sum, h) => sum + h.y, 0) / recentHistory.length;
    }
    
    const { setIsDragging, setVelocity } = useGridStore.getState();
    setVelocity(avgVx * 1.5, avgVy * 1.5);
    setIsDragging(false);
    
    velocityHistoryRef.current = [];
  }, []);
  
  useEffect(() => {
    const canvas = gl.domElement;
    
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
  }, [gl.domElement, handleWheel, handlePointerDown, handlePointerMove, handlePointerUp]);
  
  return null;
};
