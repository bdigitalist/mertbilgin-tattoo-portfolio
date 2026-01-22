import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGridStore } from '@/store/useGridStore';

// Scroll configuration
const CONFIG = {
  wheelMultiplier: 1.0,
  dragMultiplier: 1.0,
  touchMultiplier: 1.5,
};

export const InputController = () => {
  const { gl } = useThree();

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const isFirstMoveRef = useRef(true);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;

    // Wheel handler - bidirectional (X and Y)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const deltaX = e.deltaX * CONFIG.wheelMultiplier;
      const deltaY = e.deltaY * CONFIG.wheelMultiplier;

      useGridStore.getState().addTargetScroll(deltaX, deltaY);

      useGridStore.getState().addTargetScroll(deltaX, deltaY);
    };

    // Pointer down
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      isFirstMoveRef.current = true;
      hasMovedRef.current = false;

      useGridStore.getState().setIsDragging(true);
      (e.target as Element)?.setPointerCapture?.(e.pointerId);

      useGridStore.getState().setIsDragging(true);
      (e.target as Element)?.setPointerCapture?.(e.pointerId);
    };

    // Pointer move
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      // Skip delta on first move, just update position
      if (isFirstMoveRef.current) {
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        isFirstMoveRef.current = false;
        return;
      }

      const deltaX = (lastPosRef.current.x - e.clientX) * CONFIG.dragMultiplier;
      const deltaY = (lastPosRef.current.y - e.clientY) * CONFIG.dragMultiplier;

      useGridStore.getState().addTargetScroll(deltaX, deltaY);
      hasMovedRef.current = true;

      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    // Pointer up
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      (e.target as Element)?.releasePointerCapture?.(e.pointerId);

      // Delay clearing store isDragging so click handler can see it
      if (hasMovedRef.current) {
        setTimeout(() => {
          useGridStore.getState().setIsDragging(false);
        }, 50);
      } else {
        useGridStore.getState().setIsDragging(false);
      }
    };

    // Touch handlers for better mobile experience
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      isDraggingRef.current = true;
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isFirstMoveRef.current = true;
      hasMovedRef.current = false;

      useGridStore.getState().setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];

      // Skip delta on first move, just update position
      if (isFirstMoveRef.current) {
        lastPosRef.current = { x: touch.clientX, y: touch.clientY };
        isFirstMoveRef.current = false;
        return;
      }

      const deltaX = (lastPosRef.current.x - touch.clientX) * CONFIG.touchMultiplier;
      const deltaY = (lastPosRef.current.y - touch.clientY) * CONFIG.touchMultiplier;

      useGridStore.getState().addTargetScroll(deltaX, deltaY);
      hasMovedRef.current = true;

      lastPosRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;

      // Delay clearing store isDragging so click handler can see it
      if (hasMovedRef.current) {
        setTimeout(() => {
          useGridStore.getState().setIsDragging(false);
        }, 50);
      } else {
        useGridStore.getState().setIsDragging(false);
      }
    };

    // Event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl.domElement]);

  return null;
};
