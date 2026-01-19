# Video & Screenshot Analysis

> Detailed findings from analyzing webrecord-ui.webm and viewport screenshots

---

## 1. GRID LAYOUT STRUCTURE

### Confirmed: UNIFORM Cell Layout

All cells are **IDENTICAL in size**. The grid uses:
- Fixed aspect ratio (~4:3)
- `object-fit: cover` for images
- Small gap (~4px) between cells

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
```

### Bidirectional Scroll

The grid scrolls on **BOTH X and Y axes**:
- Mouse wheel: deltaX → horizontal, deltaY → vertical
- Drag: moves in direction of drag
- Infinite wrap on both axes

---

## 2. RESPONSIVE COLUMN COUNT

Analyzed from viewport screenshots:

| Viewport | Columns | Source |
|----------|---------|--------|
| Desktop Large (1512px wide) | 4 | ui-ss-desktop-medium.png |
| Desktop Small (1100px wide) | 3 | ui-ss-desktop-small.png |
| Mobile Landscape | 2 | ui-ss-mobile-wide.jpg |

### Breakpoint Summary
```
>1200px  → 4 columns
900-1200px → 3 columns
<900px   → 2 columns
```

---

## 3. RESPONSIVE HUD LAYOUTS

### Desktop Layout (>900px)

From `ui-ss-desktop-medium.png`:

```
┌────────────────────────────────────────────────────────────────┐
│ BASED IN ITALY,   (MY.EXPERTISE)   (SOCIAL.CONTACTS)           │
│ WORKING GLOBALLY. ART DIRECTION    AWWWARDS     ┌───────────┐  │
│ 11:32:31 CET      WEB DESIGN+DEV   LINKEDIN     │THE ARCHIVE│  │
│                   WEBFLOW DEV      CONTACTS     ├───────────┤  │
│                                                 │THE PROFILE│  │
│   [Description text runs across...]             └───────────┘  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│       [GRID - 4 columns]              [INFO PANEL]             │
│                                       minimap                  │
│                                       instructions             │
│                                       [CLOSE]                  │
│                                                                │
│  THE ARTBOARD™                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Desktop characteristics**:
- Horizontal flex layout for header
- Social links stacked vertically
- CTA buttons stacked vertically
- Info panel visible (bottom-right)
- Custom cursor visible

---

### Mobile Layout (<900px)

From `ui-ss-mobile-wide.jpg`:

```
┌─────────────────────────────────┐
│ BASED IN ITALY,                 │
│ WORKING GLOBALLY.               │
│ 11:30:08 CET                    │
│                                 │
│ (MY.EXPERTISE)                  │
│ ART DIRECTION                   │
│ WEB DESIGN + DEV                │
│ WEBFLOW DEVELOPMENT             │
│                                 │
│ (SOCIAL.CONTACTS)               │
│ AWWWARDS  LINKEDIN  CONTACTS    │  ← INLINE horizontal!
│                                 │
│ [Description paragraph...]      │
│                                 │
│ ┌─────────────┬───────────────┐ │
│ │ THE ARCHIVE │ THE PROFILE   │ │  ← SIDE BY SIDE!
│ └─────────────┴───────────────┘ │
├─────────────────────────────────┤
│       [GRID - 2 columns]        │
│                                 │
│  THE ARTBOARD™                  │
└─────────────────────────────────┘
```

**Mobile characteristics**:
- Vertical stacked layout for header
- Social links **INLINE HORIZONTAL** (not stacked)
- CTA buttons **SIDE BY SIDE** (not stacked)
- Info panel **HIDDEN**
- Custom cursor **HIDDEN** (touch device)

---

## 4. PRELOADER SEQUENCE

From video frames:

### Timeline

| Frame | Time | State |
|-------|------|-------|
| frame_001 | 0s | Loading indicator, progress bar at ~25% |
| frame_005 | 2s | Counter at 99, single image visible, intro text shown |
| frame_010 | 5s | Grid fully revealed, HUD visible |

### Preloader Elements
1. **Single thumbnail** - Centered, reveals via clip-path
2. **Counter** - Below thumbnail, animates 0→100
3. **Progress line** - Below counter, fills left→right
4. **Intro text** - "WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE"

### Exit Animation
- Container collapses upward (scaleY: 0)
- Transform origin: top center
- Duration: ~800ms

---

## 5. CUSTOM CURSOR

### Observed Behavior
- Text: "SCROLL OR CLICK"
- Follows mouse with easing lag
- **Hidden during scroll/wheel events**
- Shows again after scroll stops (~150ms delay)
- **Only visible on desktop** (not in mobile screenshot)

### Cursor Styling
```css
.cursor {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur();
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
}
```

---

## 6. INFO PANEL

### Desktop Only
- Position: Fixed, bottom-right
- Width: ~288px
- Background: Semi-transparent with blur

### Contents
1. **Minimap** - Horizontal strip of 3-4 thumbnails
2. **Instructions** - "SCROLL / DRAG TO INTERACT W/ THE ARTBOARD OR CLICK ON THE GRID TO EXPLORE THE ARCHIVE."
3. **Description** - Philosophy text
4. **CLOSE button**

### Mobile Behavior
**Panel is completely hidden on mobile.** No collapsed/hamburger version.

---

## 7. TITLE ANIMATION

"THE ARTBOARD™" uses a **scramble text animation**:

1. Text starts partially visible/scrambled
2. Characters reveal progressively
3. Scramble effect uses random uppercase characters
4. Uses GSAP ScrambleTextPlugin

---

## 8. LIST VIEW (Alternative)

The site has a second view mode toggled via footer buttons:

### Gallery View (Default)
- WebGL grid with infinite scroll
- Dark theme with CRT effects

### List View
- Clean white background
- Numbered project list on left
- Glitch preview image on hover
- Toggle: [GALLERY] [LIST]

---

## 9. KEY FINDINGS SUMMARY

| Feature | Finding |
|---------|---------|
| Grid cells | **UNIFORM SIZE** (all same) |
| Scroll direction | **BIDIRECTIONAL** (X and Y) |
| Desktop columns | 4 → 3 based on width |
| Mobile columns | 2 |
| Mobile HUD | **VERTICAL STACK** |
| Mobile social links | **INLINE HORIZONTAL** |
| Mobile CTA buttons | **SIDE BY SIDE** |
| Info panel on mobile | **HIDDEN** |
| Cursor on mobile | **HIDDEN** |

---

*Analysis Version: 2.0*
*Sources: webrecord-ui.webm, ui-ss-desktop-medium.png, ui-ss-desktop-small.png, ui-ss-mobile-wide.jpg*
