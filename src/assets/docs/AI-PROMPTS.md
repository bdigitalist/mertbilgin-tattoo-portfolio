# AI Development Prompts

> Ready-to-use prompts for LLM coding assistants (Cursor, Claude, etc.)

---

## PHASE 1: PROJECT SETUP

### Prompt 1.1: Initialize Next.js Project

```
Create a Next.js 14+ project with:
- App Router
- TypeScript
- Tailwind CSS
- ESLint

Install dependencies:
- three @react-three/fiber @react-three/drei
- gsap
- @studio-freight/lenis  
- zustand

Set up folder structure:
src/
├── app/
├── components/
│   ├── canvas/
│   ├── hud/
│   ├── effects/
│   ├── preloader/
│   └── ui/
├── hooks/
├── stores/
├── data/
├── types/
└── styles/

Configure TypeScript paths for @/ imports.
```

### Prompt 1.2: Create Type Definitions

```
Create types at src/types/index.ts:

interface GridItem {
  id: string;
  src: string;
  srcAvif?: string;
  srcWebp?: string;
  alt: string;
  href: string;
  category?: string;
  year?: string;
  title?: string;
}

interface GridConfig {
  columns: number;
  cellAspect: number;
  gap: number;
}

interface ScrollState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}
```

---

## PHASE 2: GRID SYSTEM

### Prompt 2.1: Create Grid Store

```
Create Zustand store at src/stores/useGridStore.ts:

State needed:
- scrollX, scrollY (both axes for bidirectional scroll)
- velocityX, velocityY (for inertia)
- columns (responsive: 4, 3, or 2)
- preloaderComplete
- infoPanelOpen

Actions:
- setScroll(x, y)
- setVelocity(vx, vy)
- setColumns(n)
- setPreloaderComplete(bool)
- setInfoPanelOpen(bool)
```

### Prompt 2.2: Create Responsive Grid Hook

```
Create hook at src/hooks/useResponsiveGrid.ts:

- Listen to window resize
- Update columns in store based on breakpoints:
  - >1200px: 4 columns
  - 900-1200px: 3 columns
  - <900px: 2 columns
- Return current column count
```

### Prompt 2.3: Create Grid Manager

```
Create GridManager at src/components/canvas/GridManager.tsx:

CRITICAL REQUIREMENTS:
1. ALL cells must be UNIFORM SIZE (same width/height)
2. Cell aspect ratio: 4:3 (height = width * 0.75)
3. Scroll works on BOTH X and Y axes
4. Infinite wrap on BOTH axes

Props:
- items: GridItem[]
- columns: number (from responsive hook)

Calculate:
- cellWidth = (viewportWidth - gaps) / columns
- cellHeight = cellWidth * 0.75

Position each cell, then in useFrame:
- Apply scrollX and scrollY offsets
- Use wrapPosition() for infinite loop on both axes:

function wrapPosition(pos, gridSize) {
  const wrapped = ((pos % gridSize) + gridSize) % gridSize;
  return wrapped > gridSize / 2 ? wrapped - gridSize : wrapped;
}
```

### Prompt 2.4: Create Input Controller

```
Create InputController at src/components/canvas/InputController.tsx:

Handle BIDIRECTIONAL scroll/drag:

1. Wheel events:
   - deltaX → scrollX
   - deltaY → scrollY

2. Mouse drag:
   - Track isDragging state
   - Update both scrollX and scrollY on drag
   - Apply inertia on mouseup (friction: 0.95)

3. Touch events:
   - Same as mouse but with touchMultiplier: 2

Both axes must scroll independently and wrap infinitely.
```

---

## PHASE 3: HUD SYSTEM

### Prompt 3.1: Create Responsive HUD Header

```
Create HUDHeader at src/components/hud/HUDHeader.tsx:

Must be RESPONSIVE with two distinct layouts:

DESKTOP (>900px) - Horizontal:
[Location] [Expertise] [Socials] [Description] [CTA Buttons]
- All sections in horizontal flex row
- Social links stacked vertically
- CTA buttons stacked vertically

MOBILE (<900px) - Vertical:
- All sections stacked vertically
- Social links INLINE HORIZONTAL (not stacked)
- CTA buttons SIDE BY SIDE (not stacked)

Use useIsMobile(900) hook to switch layouts.
```

### Prompt 3.2: Create Info Panel (Desktop Only)

```
Create InfoPanel at src/components/hud/InfoPanel.tsx:

CRITICAL: Only render on desktop (>900px).
Return null if isMobile is true.

Contains:
1. Minimap (horizontal thumbnail strip)
2. Instructions text
3. Description paragraph
4. CLOSE button

Position: fixed, bottom-right, width 288px
```

### Prompt 3.3: Create Custom Cursor (Desktop Only)

```
Create CustomCursor at src/components/effects/CustomCursor.tsx:

CRITICAL: Only render on desktop/non-touch devices.
Return null if isMobile or isTouchDevice.

Features:
- Shows "SCROLL OR CLICK" text
- Follows mouse with 8% easing per frame
- Hides during scroll (opacity 0)
- Shows again 150ms after scroll stops
- z-index: 200
```

---

## PHASE 4: EFFECTS

### Prompt 4.1: Create CRT Overlay

```
Create CRTOverlay at src/components/effects/CRTOverlay.tsx:

Two pseudo-element layers:

1. ::before - Scanlines:
   - Horizontal lines every 4px
   - linear-gradient alternating transparent/semi-black

2. ::after - Vignette + Flicker:
   - Radial gradient dark at edges
   - Flicker animation (0.15s loop, subtle opacity change)

Fixed fullscreen, z-index: 100, pointer-events: none
```

### Prompt 4.2: Create Progressive Blur

```
Create ProgressiveBlur at src/components/effects/ProgressiveBlur.tsx:

Props:
- position: 'top' | 'bottom'
- layers: number (default 10)

Creates 10 stacked divs with decreasing backdrop-filter blur.
Uses mask-image for gradient fade effect.
Height: ~100px
For 'top' position, flip with scaleY(-1).
```

---

## PHASE 5: PRELOADER

### Prompt 5.1: Create Preloader

```
Create Preloader at src/components/preloader/Preloader.tsx:

Timeline sequence with GSAP:

0.0s - Counter starts (0 → 100, duration 2.5s)
0.0s - Progress line width (0% → 100%, duration 2.5s)
0.5s - Single thumbnail reveals (clip-path animation)
2.0s - Intro text fades in
3.0s - Container collapses up (scaleY: 0, origin: top)

Intro text: "WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE"

On complete, set preloaderComplete: true in store.
```

---

## UTILITY PROMPTS

### Debug: Grid Not Scrolling Both Directions

```
My grid only scrolls in one direction. I need BIDIRECTIONAL scroll (X and Y).

Current implementation: [paste code]

Fix requirements:
1. Wheel deltaX should affect scrollX
2. Wheel deltaY should affect scrollY  
3. Drag should update both scrollX and scrollY
4. Both axes should wrap infinitely using modulo math
```

### Debug: Mobile Layout Issues

```
My HUD doesn't switch to mobile layout properly.

Requirements for mobile (<900px):
1. HUD should stack VERTICALLY
2. Social links should be INLINE HORIZONTAL
3. CTA buttons should be SIDE BY SIDE
4. Info panel should be HIDDEN
5. Custom cursor should be HIDDEN

Current code: [paste code]
```

### Debug: Cells Not Uniform

```
My grid cells have different sizes. They should ALL be the same size.

Requirements:
- Calculate cellWidth = (viewport - gaps) / columns
- Calculate cellHeight = cellWidth * 0.75 (4:3 ratio)
- ALL ImagePlane components use same width/height
- Images use "cover" mode (UV adjustment or CSS object-fit)

Current code: [paste code]
```

---

## COMMON MISTAKES TO AVOID

### ❌ Wrong: Variable cell sizes
```javascript
// DON'T DO THIS
const cellWidth = image.naturalWidth;
const cellHeight = image.naturalHeight;
```

### ✓ Correct: Uniform cell sizes
```javascript
// DO THIS
const cellWidth = (viewportWidth - totalGaps) / columns;
const cellHeight = cellWidth * 0.75; // Fixed aspect ratio
```

---

### ❌ Wrong: Single-axis scroll
```javascript
// DON'T DO THIS
setScroll(scrollX - e.deltaY);
```

### ✓ Correct: Bidirectional scroll
```javascript
// DO THIS
setScroll(
  scrollX - e.deltaX,
  scrollY + e.deltaY
);
```

---

### ❌ Wrong: Same HUD on all devices
```javascript
// DON'T DO THIS
return <DesktopHUD />;
```

### ✓ Correct: Responsive HUD
```javascript
// DO THIS
if (isMobile) return <MobileHUD />;
return <DesktopHUD />;
```

---

### ❌ Wrong: Cursor on mobile
```javascript
// DON'T DO THIS
return <CustomCursor />;
```

### ✓ Correct: Desktop-only cursor
```javascript
// DO THIS
if (isMobile || isTouchDevice) return null;
return <CustomCursor />;
```

---

*AI Prompts Version: 2.0*
