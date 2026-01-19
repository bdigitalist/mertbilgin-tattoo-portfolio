import { useEffect, useRef } from 'react';
import { useGridStore } from '@/store/useGridStore';

const LERP_FACTOR = 0.05;
const STOP_THRESHOLD = 0.1;
const IDLE_FRAMES_BEFORE_STOP = 10; // Stop after 10 idle frames

export const useInfiniteScroll = () => {
  const rafRef = useRef<number | null>(null);
  const idleFramesRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      const state = useGridStore.getState();
      const { scrollX, scrollY, targetScrollX, targetScrollY, setScroll, setIsScrolling } = state;

      // Calculate distance to target
      const dx = targetScrollX - scrollX;
      const dy = targetScrollY - scrollY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > STOP_THRESHOLD) {
        // Lerp towards target
        const newX = scrollX + dx * LERP_FACTOR;
        const newY = scrollY + dy * LERP_FACTOR;
        setScroll(newX, newY);
        setIsScrolling(true);
        idleFramesRef.current = 0; // Reset idle counter
      } else {
        // Snap to target when close enough
        if (distance > 0) {
          setScroll(targetScrollX, targetScrollY);
        }
        setIsScrolling(false);
        idleFramesRef.current++;
      }

      // Only stop RAF after several consecutive idle frames
      // This prevents stopping prematurely when new scroll input might come
      if (idleFramesRef.current < IDLE_FRAMES_BEFORE_STOP) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    // Start the animation loop
    rafRef.current = requestAnimationFrame(animate);

    // Subscribe to store changes to restart animation if stopped
    const unsubscribe = useGridStore.subscribe((state, prevState) => {
      if (
        (state.targetScrollX !== prevState.targetScrollX ||
          state.targetScrollY !== prevState.targetScrollY) &&
        rafRef.current === null
      ) {
        // Restart animation when target changes and RAF is stopped
        idleFramesRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
      }
    });

    return () => {
      unsubscribe();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return null;
};
