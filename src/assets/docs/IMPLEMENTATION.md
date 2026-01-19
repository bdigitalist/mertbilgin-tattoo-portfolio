# Implementation Guide

> Code patterns for The Artboard project with accurate specifications

---

## 1. GRID CANVAS SYSTEM

### 1.1 Grid Store (Zustand)

```tsx
// stores/useGridStore.ts
import { create } from 'zustand';

interface GridState {
  // Scroll position (both axes)
  scrollX: number;
  scrollY: number;
  
  // Velocity for inertia
  velocityX: number;
  velocityY: number;
  
  // Responsive columns
  columns: number;
  
  // UI state
  isLoading: boolean;
  preloaderComplete: boolean;
  infoPanelOpen: boolean;
  
  // Actions
  setScroll: (x: number, y: number) => void;
  setVelocity: (vx: number, vy: number) => void;
  setColumns: (cols: number) => void;
  setPreloaderComplete: (complete: boolean) => void;
  setInfoPanelOpen: (open: boolean) => void;
}

export const useGridStore = create<GridState>((set) => ({
  scrollX: 0,
  scrollY: 0,
  velocityX: 0,
  velocityY: 0,
  columns: 4,
  isLoading: true,
  preloaderComplete: false,
  infoPanelOpen: true,
  
  setScroll: (x, y) => set({ scrollX: x, scrollY: y }),
  setVelocity: (vx, vy) => set({ velocityX: vx, velocityY: vy }),
  setColumns: (cols) => set({ columns: cols }),
  setPreloaderComplete: (complete) => set({ preloaderComplete: complete }),
  setInfoPanelOpen: (open) => set({ infoPanelOpen: open }),
}));
```

### 1.2 Responsive Grid Hook

```tsx
// hooks/useResponsiveGrid.ts
import { useEffect } from 'react';
import { useGridStore } from '@/stores/useGridStore';

export function useResponsiveGrid() {
  const setColumns = useGridStore((s) => s.setColumns);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      
      if (width >= 1200) {
        setColumns(4);
      } else if (width >= 900) {
        setColumns(3);
      } else {
        setColumns(2);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [setColumns]);
  
  return useGridStore((s) => s.columns);
}
```

### 1.3 Grid Canvas Component

```tsx
// components/canvas/GridCanvas.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { Suspense } from 'react';
import GridManager from './GridManager';
import InputController from './InputController';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';

interface GridCanvasProps {
  items: GridItem[];
}

export default function GridCanvas({ items }: GridCanvasProps) {
  const columns = useResponsiveGrid();
  
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <OrthographicCamera
          makeDefault
          position={[0, 0, 100]}
          zoom={1}
          near={0.1}
          far={1000}
        />
        
        <Suspense fallback={null}>
          <GridManager items={items} columns={columns} />
        </Suspense>
        
        <InputController />
      </Canvas>
    </div>
  );
}
```

### 1.4 Grid Manager (Uniform Cells)

```tsx
// components/canvas/GridManager.tsx
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import ImagePlane from './ImagePlane';
import { useGridStore } from '@/stores/useGridStore';

interface GridManagerProps {
  items: GridItem[];
  columns: number;
}

export default function GridManager({ items, columns }: GridManagerProps) {
  const groupRef = useRef<Group>(null);
  const { viewport } = useThree();
  const { scrollX, scrollY } = useGridStore();

  // Calculate uniform cell dimensions
  const { cellWidth, cellHeight, gap, rows, gridWidth, gridHeight } = useMemo(() => {
    const gap = 4;
    const cellWidth = (viewport.width - (columns + 1) * gap) / columns;
    const cellHeight = cellWidth * 0.75; // 4:3 aspect ratio
    const rows = Math.ceil(items.length / columns);
    const gridWidth = columns * (cellWidth + gap);
    const gridHeight = rows * (cellHeight + gap);
    
    return { cellWidth, cellHeight, gap, rows, gridWidth, gridHeight };
  }, [viewport.width, columns, items.length]);

  // Generate grid positions (all cells same size)
  const gridPositions = useMemo(() => {
    return items.map((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      return {
        x: col * (cellWidth + gap) - gridWidth / 2 + cellWidth / 2,
        y: -(row * (cellHeight + gap)) + gridHeight / 2 - cellHeight / 2,
        item,
      };
    });
  }, [items, columns, cellWidth, cellHeight, gap, gridWidth, gridHeight]);

  // Infinite wrap function
  const wrapPosition = (pos: number, size: number) => {
    const wrapped = ((pos % size) + size) % size;
    return wrapped > size / 2 ? wrapped - size : wrapped;
  };

  // Update positions on scroll (both X and Y)
  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      const baseX = gridPositions[i].x;
      const baseY = gridPositions[i].y;

      // Apply scroll offset with infinite wrap on BOTH axes
      child.position.x = wrapPosition(baseX + scrollX, gridWidth);
      child.position.y = wrapPosition(baseY + scrollY, gridHeight);
    });
  });

  return (
    <group ref={groupRef}>
      {gridPositions.map((pos, i) => (
        <ImagePlane
          key={pos.item.id}
          src={pos.item.src}
          width={cellWidth}
          height={cellHeight}
          position={[pos.x, pos.y, 0]}
          href={pos.item.href}
        />
      ))}
    </group>
  );
}
```

### 1.5 Image Plane (Uniform Size, Cover Mode)

```tsx
// components/canvas/ImagePlane.tsx
import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh, LinearFilter } from 'three';
import { useRouter } from 'next/navigation';

interface ImagePlaneProps {
  src: string;
  width: number;
  height: number;
  position: [number, number, number];
  href?: string;
}

export default function ImagePlane({
  src,
  width,
  height,
  position,
  href,
}: ImagePlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const router = useRouter();
  
  const texture = useLoader(TextureLoader, src);
  
  // Configure texture for cover-like behavior
  useMemo(() => {
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    
    // Calculate UV offset for "cover" effect
    const imgAspect = texture.image.width / texture.image.height;
    const cellAspect = width / height;
    
    if (imgAspect > cellAspect) {
      // Image wider than cell - crop sides
      const scale = cellAspect / imgAspect;
      texture.repeat.set(scale, 1);
      texture.offset.set((1 - scale) / 2, 0);
    } else {
      // Image taller than cell - crop top/bottom
      const scale = imgAspect / cellAspect;
      texture.repeat.set(1, scale);
      texture.offset.set(0, (1 - scale) / 2);
    }
  }, [texture, width, height]);

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
```

### 1.6 Input Controller (Bidirectional Scroll)

```tsx
// components/canvas/InputController.tsx
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGridStore } from '@/stores/useGridStore';

export default function InputController() {
  const { gl } = useThree();
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  
  const scrollX = useGridStore((s) => s.scrollX);
  const scrollY = useGridStore((s) => s.scrollY);
  const setScroll = useGridStore((s) => s.setScroll);
  const setVelocity = useGridStore((s) => s.setVelocity);

  useEffect(() => {
    const canvas = gl.domElement;
    
    // Wheel handler (both deltaX and deltaY)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScroll(
        scrollX - e.deltaX * 0.5,
        scrollY + e.deltaY * 0.5
      );
    };

    // Drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - lastPos.current.x;
      const deltaY = e.clientY - lastPos.current.y;
      
      velocity.current = { x: deltaX, y: deltaY };
      
      setScroll(scrollX + deltaX, scrollY - deltaY);
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = 'grab';
      
      // Apply inertia
      setVelocity(velocity.current.x, velocity.current.y);
      applyInertia();
    };

    // Inertia animation
    const applyInertia = () => {
      const friction = 0.95;
      
      const animate = () => {
        const vx = velocity.current.x;
        const vy = velocity.current.y;
        
        if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
          return;
        }
        
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        
        const store = useGridStore.getState();
        store.setScroll(
          store.scrollX + velocity.current.x,
          store.scrollY - velocity.current.y
        );
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.touches[0].clientX - lastPos.current.x;
      const deltaY = e.touches[0].clientY - lastPos.current.y;
      
      velocity.current = { x: deltaX * 2, y: deltaY * 2 }; // Touch multiplier
      
      const store = useGridStore.getState();
      store.setScroll(store.scrollX + deltaX, store.scrollY - deltaY);
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      applyInertia();
    };

    // Event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl, scrollX, scrollY, setScroll, setVelocity]);

  return null;
}
```

---

## 2. HUD COMPONENTS

### 2.1 Responsive HUD Header

```tsx
// components/hud/HUDHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import AnimatedButton from '../ui/AnimatedButton';
import UnderlineLink from '../ui/UnderlineLink';

export default function HUDHeader() {
  const isMobile = useIsMobile(900); // breakpoint at 900px
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Istanbul', // Adjust for your timezone
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isMobile) {
    return <HUDMobile time={time} />;
  }

  return <HUDDesktop time={time} />;
}

// Desktop: Horizontal layout
function HUDDesktop({ time }: { time: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="flex items-start justify-between">
        {/* Location */}
        <div className="pointer-events-auto">
          <p className="text-xs uppercase tracking-wider text-white/70">
            Based in Istanbul,<br />working globally.
          </p>
          <p className="text-xs text-white/50 mt-1 font-mono">
            {time} TRT
          </p>
        </div>

        {/* Expertise */}
        <div className="pointer-events-auto">
          <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
            (my.expertise)
          </p>
          <div className="space-y-0.5 text-xs text-white/70">
            <p>Tattoo Art</p>
            <p>Custom Design</p>
            <p>Cover-ups</p>
          </div>
        </div>

        {/* Socials */}
        <div className="pointer-events-auto">
          <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
            (social.contacts)
          </p>
          <div className="space-y-0.5">
            <UnderlineLink href="https://instagram.com">Instagram</UnderlineLink>
            <UnderlineLink href="https://linkedin.com">LinkedIn</UnderlineLink>
            <UnderlineLink href="mailto:contact@example.com">Contacts</UnderlineLink>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-xs pointer-events-auto hidden lg:block">
          <p className="text-xs text-white/70 leading-relaxed uppercase">
            Tattoo artist creating immersive designs defined by strong visual 
            direction, refined motion, and a distinct design signature.
          </p>
        </div>

        {/* CTA Buttons - Stacked */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <AnimatedButton href="/archive">THE ARCHIVE</AnimatedButton>
          <AnimatedButton href="/about">THE PROFILE</AnimatedButton>
        </div>
      </div>
    </nav>
  );
}

// Mobile: Vertical stacked layout
function HUDMobile({ time }: { time: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="flex flex-col gap-4">
        {/* Location */}
        <div className="pointer-events-auto">
          <p className="text-xs uppercase tracking-wider text-white/70">
            Based in Istanbul,<br />working globally.
          </p>
          <p className="text-xs text-white/50 mt-1 font-mono">
            {time} TRT
          </p>
        </div>

        {/* Expertise */}
        <div className="pointer-events-auto">
          <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
            (my.expertise)
          </p>
          <p className="text-xs text-white/70">Tattoo Art</p>
          <p className="text-xs text-white/70">Custom Design</p>
          <p className="text-xs text-white/70">Cover-ups</p>
        </div>

        {/* Socials - INLINE on mobile */}
        <div className="pointer-events-auto">
          <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
            (social.contacts)
          </p>
          <div className="flex gap-4">
            <UnderlineLink href="#">Instagram</UnderlineLink>
            <UnderlineLink href="#">LinkedIn</UnderlineLink>
            <UnderlineLink href="#">Contacts</UnderlineLink>
          </div>
        </div>

        {/* Description */}
        <div className="pointer-events-auto">
          <p className="text-xs text-white/70 leading-relaxed uppercase">
            Tattoo artist creating immersive designs defined by strong visual 
            direction, refined motion, and a distinct design signature.
          </p>
        </div>

        {/* CTA Buttons - SIDE BY SIDE on mobile */}
        <div className="pointer-events-auto flex gap-2">
          <AnimatedButton href="/archive" className="flex-1">
            THE ARCHIVE
          </AnimatedButton>
          <AnimatedButton href="/about" className="flex-1">
            THE PROFILE
          </AnimatedButton>
        </div>
      </div>
    </nav>
  );
}
```

### 2.2 Info Panel (Desktop Only)

```tsx
// components/hud/InfoPanel.tsx
'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useGridStore } from '@/stores/useGridStore';
import AnimatedButton from '../ui/AnimatedButton';
import Minimap from './Minimap';

interface InfoPanelProps {
  items: GridItem[];
}

export default function InfoPanel({ items }: InfoPanelProps) {
  const isMobile = useIsMobile(900);
  const isOpen = useGridStore((s) => s.infoPanelOpen);
  const setOpen = useGridStore((s) => s.setInfoPanelOpen);

  // Don't render on mobile
  if (isMobile || !isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-black/50 backdrop-blur-sm border border-white/10 p-4">
      {/* Minimap */}
      <Minimap items={items} />

      {/* Instructions */}
      <p className="text-xs text-white/70 leading-relaxed mt-4 mb-4">
        <span className="text-white font-medium">SCROLL / DRAG</span>
        <span className="text-white/50"> TO INTERACT W/ </span>
        <span className="text-white font-medium">THE ARTBOARD</span>
        <span className="text-white/50"> OR </span>
        <span className="text-white font-medium">CLICK ON THE GRID</span>
        <span className="text-white/50"> TO EXPLORE </span>
        <span className="text-white font-medium">THE ARCHIVE.</span>
      </p>

      {/* Description */}
      <p className="text-xs text-white/50 leading-relaxed mb-4 uppercase">
        The artboard serves as a structured environment where creations,
        systems, and design research accumulated over time are organized,
        preserved, and continuously revisited.
      </p>

      {/* Close Button */}
      <AnimatedButton onClick={() => setOpen(false)}>
        CLOSE
      </AnimatedButton>
    </div>
  );
}
```

### 2.3 Custom Cursor (Desktop Only)

```tsx
// components/effects/CustomCursor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function CustomCursor() {
  const isMobile = useIsMobile(900);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Don't render on mobile/touch devices
  if (isMobile) return null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      setHidden(true);
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setHidden(false), 150);
    };

    const animate = () => {
      if (!cursorRef.current) return;

      const ease = 0.08;
      position.current.x += (target.current.x - position.current.x) * ease;
      position.current.y += (target.current.y - position.current.y) * ease;

      cursorRef.current.style.transform = 
        `translate(${position.current.x}px, ${position.current.y}px)`;

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleScroll, { passive: true });
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 z-[200] pointer-events-none 
        transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2
        ${hidden ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20">
        <span className="text-xs text-white uppercase tracking-wider whitespace-nowrap">
          Scroll or Click
        </span>
      </div>
    </div>
  );
}
```

---

## 3. UTILITY HOOKS

### 3.1 useIsMobile Hook

```tsx
// hooks/useIsMobile.ts
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 900) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
```

### 3.2 useIsTouchDevice Hook

```tsx
// hooks/useIsTouchDevice.ts
import { useState, useEffect } from 'react';

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0
    );
  }, []);

  return isTouch;
}
```

---

## 4. MAIN PAGE COMPOSITION

```tsx
// app/page.tsx
import GridCanvas from '@/components/canvas/GridCanvas';
import HUDHeader from '@/components/hud/HUDHeader';
import InfoPanel from '@/components/hud/InfoPanel';
import FooterTitle from '@/components/hud/FooterTitle';
import CRTOverlay from '@/components/effects/CRTOverlay';
import ProgressiveBlur from '@/components/effects/ProgressiveBlur';
import CustomCursor from '@/components/effects/CustomCursor';
import Preloader from '@/components/preloader/Preloader';
import { portfolioItems } from '@/data/portfolio';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950">
      {/* Preloader */}
      <Preloader />

      {/* CRT Effect */}
      <CRTOverlay />

      {/* Edge Blurs */}
      <ProgressiveBlur position="top" />
      <ProgressiveBlur position="bottom" />

      {/* WebGL Grid */}
      <GridCanvas items={portfolioItems} />

      {/* HUD - Responsive */}
      <HUDHeader />
      
      {/* Info Panel - Desktop only */}
      <InfoPanel items={portfolioItems} />
      
      {/* Footer Title */}
      <FooterTitle text="THE ARTBOARD™" />

      {/* Custom Cursor - Desktop only */}
      <CustomCursor />
    </main>
  );
}
```

---

## 5. GLOBAL STYLES

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Hide scrollbar */
::-webkit-scrollbar { display: none; }
html {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Selection color */
::selection {
  background-color: #ff564a;
  color: white;
}

/* CRT Flicker */
@keyframes flicker {
  0% { opacity: 0.95; }
  50% { opacity: 0.92; }
  100% { opacity: 0.96; }
}

.animate-flicker {
  animation: flicker 0.15s infinite;
}

/* Disable selection on grid */
.no-select {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
}
```

---

*Implementation Guide Version: 2.0*
