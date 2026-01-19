# THE ARTBOARD - Project Blueprint

> Reference: [nicolaromei.com](https://www.nicolaromei.com/archive)
> Designer: Nicola Romei - Digital Experience Designer & Awwwards Judge

---

## 1. PROJECT OVERVIEW

### 1.1 Concept
An immersive 2D infinite-scroll image grid portfolio with WebGL rendering, featuring:
- Flat 2D canvas grid with **uniform cell sizes**
- **Bidirectional scroll** (both X and Y axes)
- Drag/scroll navigation with inertia physics
- CRT/retro visual overlay effects
- Sophisticated HUD system with info panel
- Preloader with counter and image reveal

### 1.2 Key Differentiators from Phantom
| Aspect | Phantom (Current) | Artboard (Reference) |
|--------|-------------------|----------------------|
| Grid Layout | 3D Cylindrical | 2D Flat Infinite |
| Scroll Direction | Horizontal-only | **Omnidirectional (X+Y)** |
| Cell Sizing | Variable | **Uniform (all same)** |
| Rendering | React Three Fiber | Vanilla Three.js |
| Visual Style | HUD-focused | CRT/Retro aesthetic |

---

## 2. GRID SYSTEM (CRITICAL)

### 2.1 Uniform Cell Layout

**All cells are IDENTICAL in size.** Images use `object-fit: cover` to fill cells.

```
┌──────────┬──────────┬──────────┬──────────┐
│          │          │          │          │
│   Cell   │   Cell   │   Cell   │   Cell   │  ← All same size
│          │          │          │          │
├──────────┼──────────┼──────────┼──────────┤
│          │          │          │          │
│   Cell   │   Cell   │   Cell   │   Cell   │  ← All same size
│          │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
         Gap: ~4px between cells
```

### 2.2 Responsive Column Count

| Viewport | Width | Columns | Rows Visible |
|----------|-------|---------|--------------|
| Desktop Large | >1400px | 4 | 2 |
| Desktop Medium | 1200-1400px | 4 | 2 |
| Desktop Small | 900-1200px | 3 | 3 |
| Tablet/Mobile | <900px | 2 | 2-3 |

### 2.3 Bidirectional Infinite Scroll

The grid scrolls in **BOTH X and Y directions** with infinite wrap:

```javascript
// Scroll updates both axes
function onScroll(deltaX, deltaY) {
  scrollX += deltaX;
  scrollY += deltaY;
}

// Infinite wrap calculation
function wrapPosition(pos, gridSize) {
  const wrapped = ((pos % gridSize) + gridSize) % gridSize;
  return wrapped > gridSize / 2 ? wrapped - gridSize : wrapped;
}
```

### 2.4 Cell Dimensions Calculation

```javascript
const getCellDimensions = (viewportWidth, columns) => {
  const gap = 4; // pixels
  const totalGaps = (columns + 1) * gap;
  const cellWidth = (viewportWidth - totalGaps) / columns;
  const cellHeight = cellWidth * 0.75; // ~4:3 aspect ratio
  return { cellWidth, cellHeight, gap };
};
```

---

## 3. RESPONSIVE HUD LAYOUTS

### 3.1 Desktop Layout (>900px)

```
┌────────────────────────────────────────────────────────────────┐
│ BASED IN ITALY,   (MY.EXPERTISE)   (SOCIAL.CONTACTS)           │
│ WORKING GLOBALLY. ART DIRECTION    AWWWARDS        [THE ARCHIVE]
│ 11:32:31 CET      WEB DESIGN+DEV   LINKEDIN        [THE PROFILE]
│                   WEBFLOW DEV      CONTACTS                    │
│                                                                │
│                   [Description text...]                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────┬────┬────┬────┐                      ┌───────────────┐ │
│  │    │    │    │    │                      │  MINIMAP      │ │
│  ├────┼────┼────┼────┤   ← GRID             │  [thumbs]     │ │
│  │    │    │    │    │                      │               │ │
│  └────┴────┴────┴────┘                      │  SCROLL/DRAG  │ │
│                                              │  instructions │ │
│  THE ARTBOARD™                               │  [CLOSE]      │ │
│                                              └───────────────┘ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (progress bar / URL)      │
└────────────────────────────────────────────────────────────────┘
        + Custom cursor "SCROLL OR CLICK"
        + Info panel visible
```

### 3.2 Mobile/Tablet Layout (<900px)

```
┌─────────────────────────────────┐
│ BASED IN ITALY,                 │
│ WORKING GLOBALLY.               │
│ 11:30:08 CET                    │
│                                 │
│ (MY.EXPERTISE)                  │
│ ART DIRECTION                   │  ← Stacked vertically
│ WEB DESIGN + DEV                │
│ WEBFLOW DEVELOPMENT             │
│                                 │
│ (SOCIAL.CONTACTS)               │
│ AWWWARDS  LINKEDIN  CONTACTS    │  ← Inline horizontal
│                                 │
│ [Description paragraph...]      │
│                                 │
│ ┌─────────────┬───────────────┐ │
│ │ THE ARCHIVE │ THE PROFILE   │ │  ← Side by side buttons
│ └─────────────┴───────────────┘ │
├─────────────────────────────────┤
│  ┌────────┬────────┐            │
│  │  Cell  │  Cell  │            │  ← 2 columns only
│  ├────────┼────────┤            │
│  │  Cell  │  Cell  │            │
│  ├────────┼────────┤            │
│  │  Cell  │  Cell  │            │
│  └────────┴────────┘            │
│                                 │
│  THE ARTBOARD™                  │
└─────────────────────────────────┘

  ✗ NO info panel
  ✗ NO custom cursor (touch device)
```

---

## 4. COMPONENT ARCHITECTURE

### 4.1 Component Tree

```
App
├── Preloader
│   ├── SingleThumbnail (clip-path reveal)
│   ├── Counter (0-100)
│   ├── ProgressLine
│   └── IntroText
│
├── CRTOverlay
│   ├── Scanlines (::before)
│   └── Vignette + Flicker (::after)
│
├── HUDHeader
│   ├── Desktop: horizontal flex layout
│   └── Mobile: vertical stacked layout
│       ├── LocationBlock
│       ├── ExpertiseBlock
│       ├── SocialsBlock (inline on mobile)
│       ├── DescriptionBlock
│       └── CTAButtons (side-by-side on mobile)
│
├── ProgressiveBlur (top)
├── ProgressiveBlur (bottom)
│
├── WebGLCanvas
│   ├── OrthographicCamera
│   ├── GridManager
│   │   └── ImagePlane[] (uniform size, cover mode)
│   └── InputController (X+Y scroll/drag)
│
├── InfoPanel (DESKTOP ONLY)
│   ├── MinimapStrip
│   ├── Instructions
│   └── CloseButton
│
├── FooterTitle ("THE ARTBOARD™")
│
└── CustomCursor (DESKTOP ONLY)
```

---

## 5. VISUAL EFFECTS

### 5.1 CRT Overlay

```css
/* Scanlines */
.crt-overlay::before {
  background: linear-gradient(
    to bottom,
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
}

/* Vignette + Flicker */
.crt-overlay::after {
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0% { opacity: 0.95; }
  50% { opacity: 0.92; }
  100% { opacity: 0.96; }
}
```

### 5.2 Progressive Blur

```css
.progressive-blur_wrap {
  --blur: 3rem;
  position: fixed;
  height: ~100px;
}

/* 10 stacked layers with decreasing blur */
.progressive-blur_panel:nth-child(1) { backdrop-filter: blur(3rem); }
.progressive-blur_panel:nth-child(2) { backdrop-filter: blur(2.5rem); }
/* ... etc */
```

### 5.3 Custom Cursor (Desktop Only)

```javascript
const CustomCursor = () => {
  // Only render on non-touch devices
  if (isTouchDevice()) return null;
  
  return (
    <div className="cursor">
      <span>SCROLL OR CLICK</span>
    </div>
  );
};

// Hide during scroll, show after 150ms
// Follow mouse with easing (8% per frame)
```

---

## 6. PRELOADER SEQUENCE

### Timeline (3.5s total)

| Time | Element | Animation |
|------|---------|-----------|
| 0.0s | Counter | Start 0→100 |
| 0.0s | Progress line | Width 0→100% |
| 0.5s | Thumbnail | clip-path reveal |
| 2.0s | Intro text | Fade in |
| 3.0s | Container | Collapse up (scaleY: 0) |

### Intro Text
> "WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE"

---

## 7. DATA STRUCTURE

```typescript
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
  columns: number;      // 4, 3, or 2 based on viewport
  cellAspect: number;   // 0.75 (4:3)
  gap: number;          // 4px
  totalItems: number;
}
```

---

## 8. TECH STACK

| Layer | Library | Version |
|-------|---------|---------|
| Framework | Next.js | 14.x |
| 3D | @react-three/fiber | 8.x |
| Animation | gsap | 3.12+ |
| Scroll | lenis | 1.x |
| State | zustand | 4.x |
| Styling | tailwindcss | 3.x |

---

## 9. Z-INDEX STACK

| Layer | Z-Index |
|-------|---------|
| Preloader | 200 |
| Custom Cursor | 200 |
| CRT Overlay | 100 |
| HUD (Header, Panel, Footer) | 50 |
| Progressive Blur | 40 |
| Canvas Grid | 0 |

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Grid Foundation
- [ ] Uniform 2D grid with WebGL
- [ ] Bidirectional scroll (X+Y)
- [ ] Infinite wrap logic
- [ ] Responsive column count (4→3→2)

### Phase 2: HUD System
- [ ] Desktop horizontal HUD
- [ ] Mobile vertical stacked HUD
- [ ] Info panel (desktop only)
- [ ] Custom cursor (desktop only)

### Phase 3: Effects & Polish
- [ ] CRT overlay
- [ ] Progressive blur
- [ ] Preloader sequence
- [ ] Footer title scramble

### Phase 4: Views & Navigation
- [ ] List view alternative
- [ ] Page transitions
- [ ] Project detail pages

---

*Blueprint Version: 2.0*
*Last Updated: January 2026*
