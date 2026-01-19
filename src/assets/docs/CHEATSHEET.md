# Quick Reference Cheat Sheet

---

## GRID LAYOUT

### Cell Structure
```
ALL CELLS ARE UNIFORM (same size)
Aspect ratio: ~4:3
Images use: object-fit: cover
```

### Responsive Columns
| Width | Columns |
|-------|---------|
| >1200px | 4 |
| 900-1200px | 3 |
| <900px | 2 |

### Scroll Direction
```
BIDIRECTIONAL: X + Y axes
Infinite wrap on both axes
```

---

## HUD LAYOUTS

### Desktop (>900px)
```
Horizontal layout
Info panel: VISIBLE
Custom cursor: VISIBLE
Social links: Stacked
CTA buttons: Stacked
```

### Mobile (<900px)
```
Vertical stacked layout
Info panel: HIDDEN
Custom cursor: HIDDEN
Social links: INLINE horizontal
CTA buttons: SIDE BY SIDE
```

---

## Z-INDEX STACK

```
200 - Cursor, Preloader
100 - CRT Overlay
 50 - HUD (Header, Panel, Footer)
 40 - Progressive Blur
  0 - Canvas Grid
```

---

## KEY ANIMATIONS

### Button Hover
```css
transform: translateY(-1.3em);
transition: 0.6s cubic-bezier(0.625, 0.05, 0, 1);
```

### Link Underline
```css
transition: transform 0.735s cubic-bezier(0.625, 0.05, 0, 1);
```

### Preloader Exit
```javascript
gsap.to('.preloader', {
  scaleY: 0,
  transformOrigin: 'top center',
  duration: 0.8,
  ease: 'power4.inOut'
});
```

---

## INFINITE WRAP MATH

```javascript
function wrapPosition(pos, gridSize) {
  const wrapped = ((pos % gridSize) + gridSize) % gridSize;
  return wrapped > gridSize / 2 ? wrapped - gridSize : wrapped;
}

// Apply to BOTH axes
plane.x = wrapPosition(baseX + scrollX, totalWidth);
plane.y = wrapPosition(baseY + scrollY, totalHeight);
```

---

## SCROLL CONFIG

```javascript
{
  ease: 0.08,
  friction: 0.95,
  touchMultiplier: 2,
  mouseMultiplier: 0.5,
  directions: ['x', 'y']  // BOTH
}
```

---

## COLOR PALETTE

```css
--bg: #0a0a0a;
--text: #ffffff;
--text-muted: rgba(255,255,255,0.7);
--text-dim: rgba(255,255,255,0.5);
--border: rgba(255,255,255,0.3);
--accent: #ff564a;
```

---

## TYPOGRAPHY

```css
font-family: 'Host Grotesk', sans-serif;
letter-spacing: 0.05em; /* uppercase */
```

---

## BREAKPOINTS

```scss
$desktop-large: 1400px;   // 4 cols
$desktop-medium: 1200px;  // 4 cols
$desktop-small: 900px;    // 3 cols
$mobile: 900px;           // 2 cols, stacked HUD
```

---

## FILE LOCATIONS

```
components/canvas/    → Grid, WebGL
components/hud/       → Header, Panel, Footer
components/effects/   → CRT, Blur, Cursor
components/preloader/ → Loading screen
components/ui/        → Button, Link
```

---

## GSAP PLUGINS

```javascript
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  ScrambleTextPlugin,  // Title effect
  Observer,
  Draggable,
  InertiaPlugin,
  CustomEase
);
```

---

## CSS PATTERNS

### Hide Scrollbar
```css
::-webkit-scrollbar { display: none; }
scrollbar-width: none;
```

### CRT Scanlines
```css
background: linear-gradient(
  to bottom,
  transparent 50%,
  rgba(0,0,0,0.25) 50%
);
background-size: 100% 4px;
```

### Flicker Animation
```css
@keyframes flicker {
  0% { opacity: 0.95; }
  50% { opacity: 0.92; }
  100% { opacity: 0.96; }
}
```

---

## TECH STACK

| Library | Version |
|---------|---------|
| Next.js | 14.x |
| Three.js | 0.161+ |
| @react-three/fiber | 8.x |
| gsap | 3.12+ |
| lenis | 1.x |
| zustand | 4.x |
| tailwindcss | 3.x |

---

## CRITICAL REMINDERS

✓ Grid cells are UNIFORM (all same size)
✓ Scroll is BIDIRECTIONAL (X + Y)
✓ Info panel is DESKTOP ONLY
✓ Custom cursor is DESKTOP ONLY
✓ Mobile HUD is VERTICAL STACKED
✓ Mobile social links are INLINE
✓ Mobile CTA buttons are SIDE BY SIDE

---

*Cheat Sheet v2.0*
