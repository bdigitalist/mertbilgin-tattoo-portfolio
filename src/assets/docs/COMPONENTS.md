# Component Specifications

> Detailed specifications for The Artboard project components

---

## 1. CANVAS COMPONENTS

### 1.1 GridCanvas

**Purpose**: Root canvas container for WebGL rendering

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `GridItem[]` | Yes | Portfolio items to display |

**Behavior**:
- Wraps R3F Canvas with OrthographicCamera
- Passes responsive column count to GridManager
- Fixed fullscreen positioning (z-index: 0)

---

### 1.2 GridManager

**Purpose**: Manages uniform grid layout with bidirectional infinite scroll

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `GridItem[]` | required | Portfolio items |
| `columns` | `number` | `4` | Responsive column count |

**Cell Calculation**:
```javascript
cellWidth = (viewportWidth - totalGaps) / columns
cellHeight = cellWidth * 0.75  // 4:3 aspect
```

**Behavior**:
- All cells are **UNIFORM SIZE**
- Scroll updates both X and Y axes
- Infinite wrap on both axes using modulo math

---

### 1.3 ImagePlane

**Purpose**: Single image mesh in the grid (uniform size)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `src` | `string` | Yes | Image URL |
| `width` | `number` | Yes | Cell width (uniform) |
| `height` | `number` | Yes | Cell height (uniform) |
| `position` | `[x,y,z]` | Yes | 3D position |
| `href` | `string` | No | Click navigation |

**Behavior**:
- All planes have identical dimensions
- Texture UV adjusted for "cover" effect
- Click navigates to href

---

### 1.4 InputController

**Purpose**: Handles scroll and drag input on both axes

**Input Types**:

| Input | X Scroll | Y Scroll |
|-------|----------|----------|
| Mouse wheel deltaX | ✓ | - |
| Mouse wheel deltaY | - | ✓ |
| Mouse drag X | ✓ | - |
| Mouse drag Y | - | ✓ |
| Touch drag X | ✓ | - |
| Touch drag Y | - | ✓ |

**Inertia**:
- Friction: 0.95 per frame
- Stop threshold: 0.1
- Touch multiplier: 2x

---

## 2. HUD COMPONENTS

### 2.1 HUDHeader

**Purpose**: Responsive header with site info and navigation

**Desktop Layout** (>900px):
```
[Location] [Expertise] [Socials] [Description] [CTA Buttons]
    ↓          ↓          ↓           ↓            ↓
 Stacked    Stacked    Stacked    Paragraph    Stacked
```

**Mobile Layout** (<900px):
```
Location
Expertise
Socials (INLINE: link link link)
Description
[CTA] [CTA]  ← Side by side
```

**Key Responsive Changes**:
| Element | Desktop | Mobile |
|---------|---------|--------|
| Layout | Horizontal flex | Vertical stack |
| Social links | Stacked | Inline horizontal |
| CTA buttons | Stacked | Side by side |
| Description | Max-width constrained | Full width |

---

### 2.2 InfoPanel

**Purpose**: Collapsible info panel with minimap (desktop only)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `GridItem[]` | Yes | For minimap display |

**Visibility**:
- Desktop (>900px): Visible
- Mobile (<900px): **HIDDEN**

**Sections**:
1. Minimap (horizontal thumbnail strip)
2. Instructions ("SCROLL / DRAG...")
3. Description paragraph
4. CLOSE button

**Position**: Fixed, bottom-right, 288px width

---

### 2.3 FooterTitle

**Purpose**: Large branded title at bottom

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"THE ARTBOARD™"` | Title text |

**Animation**: Scramble text effect on load using GSAP ScrambleTextPlugin

**Typography**:
- Size: 6xl → 9xl (responsive)
- Weight: Bold
- Text shadow: `0 0 0.6em rgba(255,255,255,0.15)`

---

### 2.4 Minimap

**Purpose**: Horizontal strip of visible grid thumbnails

**Behavior**:
- Shows 3-4 thumbnails
- Updates as grid scrolls
- Only visible inside InfoPanel (desktop only)

---

## 3. EFFECT COMPONENTS

### 3.1 CRTOverlay

**Purpose**: Retro CRT monitor visual effect

**Layers**:
1. `::before` - Scanlines (4px horizontal lines)
2. `::after` - Vignette + flicker animation

**Properties**:
- Fixed fullscreen
- z-index: 100
- pointer-events: none

---

### 3.2 ProgressiveBlur

**Purpose**: Gradient blur at viewport edges

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `position` | `'top' \| 'bottom'` | Yes | Edge position |
| `layers` | `number` | No | Blur layers (default: 10) |

**Behavior**:
- Creates stacked blur layers with decreasing intensity
- Height: ~100px
- Uses CSS mask for gradient fade

---

### 3.3 CustomCursor

**Purpose**: Custom cursor following mouse (desktop only)

**Visibility**:
- Desktop: Visible
- Mobile/Touch: **HIDDEN**

**States**:
| State | Trigger | Visual |
|-------|---------|--------|
| Visible | Default | "SCROLL OR CLICK" pill |
| Hidden | During scroll/wheel | Fade out |
| Hidden | Touch device | Never renders |

**Animation**:
- Follow ease: 8% per frame
- Hide delay: 150ms after scroll stops

---

## 4. UI COMPONENTS

### 4.1 AnimatedButton

**Purpose**: Button with character stagger animation

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `string` | Yes | Button text |
| `href` | `string` | No | Link destination |
| `onClick` | `function` | No | Click handler |
| `className` | `string` | No | Additional classes |

**Animation**:
- Characters stagger on hover
- Y translate: -1.3em
- Duration: 600ms
- Easing: cubic-bezier(0.625, 0.05, 0, 1)

---

### 4.2 UnderlineLink

**Purpose**: Link with animated underline

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | required | Link URL |
| `children` | `ReactNode` | required | Link content |
| `external` | `boolean` | `true` | Open in new tab |

**Animation**:
- Underline wipes left→right on hover
- Duration: 735ms
- Uses two pseudo-elements

---

## 5. PRELOADER

### 5.1 Preloader

**Purpose**: Initial loading screen

**Elements**:
1. Single thumbnail image (clip-path reveal)
2. Counter (0 → 100)
3. Progress line (width animation)
4. Intro text (fade in)

**Exit Animation**:
- scaleY: 1 → 0
- Origin: top center
- Duration: 800ms

---

## 6. RESPONSIVE BREAKPOINTS

| Name | Width | Columns | HUD Layout | Info Panel | Cursor |
|------|-------|---------|------------|------------|--------|
| Desktop Large | >1400px | 4 | Horizontal | Visible | Visible |
| Desktop Medium | 1200-1400px | 4 | Horizontal | Visible | Visible |
| Desktop Small | 900-1200px | 3 | Horizontal | Visible | Visible |
| Tablet/Mobile | <900px | 2 | **Stacked** | **Hidden** | **Hidden** |

---

## 7. Z-INDEX STACK

| Layer | Z-Index | Component |
|-------|---------|-----------|
| Top | 200 | Preloader, CustomCursor |
| Overlay | 100 | CRTOverlay |
| HUD | 50 | HUDHeader, InfoPanel, FooterTitle |
| Blur | 40 | ProgressiveBlur |
| Base | 0 | GridCanvas |

---

## 8. TYPE DEFINITIONS

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

*Component Specifications Version: 2.0*
