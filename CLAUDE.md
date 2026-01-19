# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (default port 5173)
npm run build        # Production build (TypeScript + Vite)
npm run build:dev    # Development build with source maps
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run test         # Run tests once (vitest)
npm run test:watch   # Run tests in watch mode
npm run test -- path/to/file.test.ts  # Run single test file
```

## Architecture

WebGL-based infinite-scrolling portfolio grid built with React, Three.js (via React Three Fiber), Zustand, and GSAP.

### Core Data Flow

```
InputController (wheel/pointer events)
    ↓ addTargetScroll(deltaX, deltaY)
useGridStore (Zustand)
    ↓ targetScrollX/Y updated
useInfiniteScroll (RAF loop)
    ↓ LERP interpolation (0.05 factor)
    ↓ scrollX/Y updated
GridManager.useFrame()
    ↓ reads scroll via getState()
    ↓ calculates visible cells, wraps with modulo
Mesh pool positions updated → Three.js renders
```

### Key Components

**WebGL Grid System** (`src/components/WebGLGrid/`):
- `WebGLCanvas.tsx` - R3F Canvas with orthographic camera, `dpr={[1, 2]}` for retina
- `GridManager.tsx` - Fixed mesh pool, modulo-based infinite wrap, shared PlaneGeometry
- `InputController.tsx` - Wheel (1.0x), drag (1.0x), touch (1.5x) multipliers

**State Management** (`src/store/useGridStore.ts`):
- Zustand store: scroll position, target scroll, velocity, grid config, UI state
- Critical: use `getState()` in `useFrame` to avoid React subscription re-renders

**Hooks** (`src/hooks/`):
- `useGridConfig.ts` - Responsive columns and cell dimensions on resize
- `useInfiniteScroll.ts` - LERP animation loop, stops after 10 idle frames

**UI Layer**:
- `Preloader.tsx` - GSAP timeline, texture preloading with progress
- `Lightbox.tsx` - Item detail modal
- `HUD/` - Responsive header (desktop/mobile layouts), footer, info panel
- `Effects/` - Custom cursor (0.12 ease), progressive blur

### Responsive Breakpoints

```
≥900px: 3 columns (desktop)
<900px: 2 columns (mobile)
```

Cell aspect ratio: 4:5 (height = width × 1.25)
Gap: 16px

Configuration in `src/hooks/useGridConfig.ts` - GRID_CONFIG object.

### Infinite Scroll Math

```javascript
// Center cell calculation
const centerCellX = Math.floor(scrollX / cellWidth);
const centerCellY = Math.floor(scrollY / cellHeight);

// Wrap to portfolio array (handles negative values)
const wrappedCol = ((gridCol % columns) + columns) % columns;
const wrappedRow = ((gridRow % rows) + rows) % rows;
const itemIndex = (wrappedRow * columns + wrappedCol) % portfolioItems.length;
```

### LERP Animation Constants

```
LERP_FACTOR = 0.05        (5% of distance per frame)
STOP_THRESHOLD = 0.1px    (snap when closer)
IDLE_FRAMES_BEFORE_STOP = 10
```

### Performance Patterns

- Shared `PlaneGeometry(1,1)` instance across all meshes
- Texture cache (`Map<string, THREE.Texture>`) in `utils/textureLoader.ts`
- Store reads in `useFrame` use `getState()` not hooks
- RAF stops after idle frames, restarts on store subscription trigger

### Path Alias

`@/` maps to `./src/` (vite.config.ts and tsconfig.json)

### Portfolio Data

Edit `src/data/portfolioData.ts`:
- `portfolioItems[]` - id, src, alt, title, category, year, description, href?
- `personalInfo` - location, tagline, timezone, expertise[], socials[], cta[]

### Z-Index Stack

```
200: Preloader, Custom Cursor
100: CRT Overlay (not yet implemented)
 50: HUD (Header, Panel, Footer)
 40: Progressive Blur
  0: WebGL Canvas
```

### Reference Documentation

Additional specs in `src/assets/docs/`:
- `BLUEPRINT.md` - Full architecture blueprint
- `IMPLEMENTATION.md` - Step-by-step guide
- `CHEATSHEET.md` - Quick reference
