import { useEffect, useRef, useCallback } from 'react';
import { useGridStore } from '@/store/useGridStore';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

const CURSOR_EASE = 0.12;
const CURSOR_STOP_THRESHOLD = 0.5; // Stop animating when within 0.5px of target

export const CustomCursor = () => {
  const isTouchDevice = useIsTouchDevice();
  const isDragging = useGridStore((state) => state.isDragging);
  const selectedItem = useGridStore((state) => state.selectedItem);

  const cursorRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>();
  const isVisibleRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const hideTimeoutRef = useRef<number>();
  const scrollTimeoutRef = useRef<number>();

  // Animation loop that stops when cursor is stationary
  const animate = useCallback(() => {
    const dx = targetRef.current.x - positionRef.current.x;
    const dy = targetRef.current.y - positionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > CURSOR_STOP_THRESHOLD) {
      positionRef.current.x += dx * CURSOR_EASE;
      positionRef.current.y += dy * CURSOR_EASE;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    } else {
      // Snap to final position and stop
      positionRef.current.x = targetRef.current.x;
      positionRef.current.y = targetRef.current.y;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }
      isAnimatingRef.current = false;
      rafRef.current = undefined;
    }
  }, []);

  // Start animation if not already running
  const startAnimation = useCallback(() => {
    // Cancel any existing RAF first
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    isAnimatingRef.current = true;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };

      // Start animation when mouse moves
      startAnimation();

      // Show cursor
      if (!isVisibleRef.current && cursorRef.current) {
        isVisibleRef.current = true;
        cursorRef.current.style.opacity = '1';
      }

      // Reset hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = window.setTimeout(() => {
        if (cursorRef.current && !isDragging) {
          isVisibleRef.current = false;
          cursorRef.current.style.opacity = '0';
        }
      }, 2000);
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        isVisibleRef.current = false;
        cursorRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isDragging, isTouchDevice, startAnimation]);

  // Restart animation when lightbox closes
  useEffect(() => {
    if (isTouchDevice) return;

    // When lightbox closes (selectedItem becomes null), force restart animation
    if (selectedItem === null) {
      isAnimatingRef.current = false;
      startAnimation();
    }
  }, [selectedItem, isTouchDevice, startAnimation]);

  // Scroll-based hiding
  useEffect(() => {
    if (isTouchDevice) return;

    const handleWheel = () => {
      // Hide cursor immediately
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
        isVisibleRef.current = false;
      }
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Show cursor 150ms after scroll stops
      scrollTimeoutRef.current = window.setTimeout(() => {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1';
          isVisibleRef.current = true;
        }
      }, 150);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isTouchDevice]);

  // Link hover detection
  useEffect(() => {
    if (isTouchDevice) return;

    const hide = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const show = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };

    const attachListeners = () => {
      const links = document.querySelectorAll('a:not(.grid-item), button');
      links.forEach(link => {
        link.addEventListener('mouseenter', hide);
        link.addEventListener('mouseleave', show);
      });
      return links;
    };

    // Initial attach
    let links = attachListeners();

    // Re-attach on DOM changes (debounced for performance)
    let debounceTimeout: number | undefined;
    const observer = new MutationObserver(() => {
      // Debounce: wait 100ms after last mutation before re-scanning
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        // Remove old listeners
        links.forEach(link => {
          link.removeEventListener('mouseenter', hide);
          link.removeEventListener('mouseleave', show);
        });
        // Attach new listeners
        links = attachListeners();
      }, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      links.forEach(link => {
        link.removeEventListener('mouseenter', hide);
        link.removeEventListener('mouseleave', show);
      });
      observer.disconnect();
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{
        opacity: 0,
        transition: 'opacity 0.15s ease-out',
        left: 0,
        top: 0
      }}
    >
      <div className="custom-cursor-inner">
        {isDragging ? 'DRAGGING' : 'DRAG OR SCROLL'}
      </div>
    </div>
  );
};
