# FT_TRANSCENDENCE - Quick Reference Guide

## Project Stats
- **Framework:** React 18.3.1 + TypeScript 5.9.3
- **Build Tool:** Vite 8.0.1
- **Styling:** Inline CSS-in-JS (no external CSS framework)
- **Real-time:** Socket.io v4.8.3
- **Package Manager:** npm
- **Main Files:** ~2,119 lines of core code

---

## 1. Framework: React + TypeScript

### Why React?
- Component-based architecture
- React 18 with Fast Refresh for hot reloading
- Hooks-based state management (no Redux)
- Context API for theme management

### Why Vite?
- Fast development server (instant page reloads)
- Optimized production builds
- Native TypeScript support
- Lower configuration overhead vs Webpack

---

## 2. 3-Column Layout Details

### Location
**File:** `/frontend/src/pages/Home.tsx` (lines 358-407)

### Structure
```
CONTAINER: flexDirection="column", height="100vh"
  ├─ MAIN ROW: flex=1, flexDirection="row", gap=16px
  │   ├─ ProfilePanel (left)    → variable flex
  │   ├─ GameCenter (center)     → flex: 1 1 auto
  │   └─ RightColumn (right)     → flex: 0 0 24% [FIXED]
  │       ├─ PlayerList
  │       └─ FriendsPanel
  └─ FOOTER: flex=0, flexDirection="row"
```

### Key CSS Properties
```css
/* Main container */
display: flex;
flexDirection: column;
width: 100vw;
height: 100vh;
padding: 20px;
gap: 16px;

/* Main row (3 columns) */
display: flex;
flex: 1;
gap: 16px;
minHeight: 0; /* Critical for scrolling! */

/* Right column (fixed 24%) */
flex: 0 0 24%; /* no grow, no shrink, 24% basis */
display: flex;
flexDirection: column;
gap: 16px;
```

### Column Behavior
| Column | Flex | Width | Behavior |
|--------|------|-------|----------|
| Left | auto | ~200-250px | Grows to fill, shrinks if needed |
| Center | 1 1 auto | ~50-60% | Primary flexible area, grows most |
| Right | 0 0 24% | ~240px on 1000px view | FIXED, never changes |

---

## 3. Styling System

### No External CSS Framework
✗ NO Tailwind CSS  
✗ NO styled-components  
✗ NO Emotion  
✓ Plain inline styles + CSS variables

### Three-Layer Styling

**Layer 1: CSS Variables** (index.css)
```css
:root {
  --text: #ffffff;
  --bg: #0f0f0f;
  --border: #2a2a2a;
  --accent: #aa3bff;
}
```

**Layer 2: Theme Objects** (themes.ts)
```typescript
dark: {
  background: "#0f0f0f",
  surface: "#1a1a1a",
  text: "#ffffff",
  // ... 15+ properties
}
```

**Layer 3: Inline Styles** (all components)
```tsx
<div style={{ background: theme.surface, color: theme.text }}>
  {/* component */}
</div>
```

### Four Available Themes
1. **dark** (default) - Pure dark mode
2. **light** - Apple/Notion style
3. **retro** - Green terminal style
4. **lila** - Purple/lavender

### How to Use Theme
```tsx
import { useTheme } from "../context/ThemeContext";
import { makeStyles } from "../styles";

export default function MyComponent() {
  const { theme, themeName, setThemeName } = useTheme();
  const s = makeStyles(theme);
  
  return <div style={s.card}>...</div>;
}
```

---

## 4. File Structure & Locations

### Layout Components
```
frontend/src/
├── pages/Home.tsx              ← MAIN ORCHESTRATOR (540 lines)
├── components/
│   ├── ProfilePanel.tsx        ← Left column (217 lines)
│   ├── GameCenter.tsx          ← Center column (313 lines)
│   ├── PlayerList.tsx          ← Right top (74 lines)
│   ├── FriendsPanel.tsx        ← Right bottom (113 lines)
│   ├── TicTacToe.tsx           ← Game board (349 lines)
│   ├── FloatingChat.tsx        ← Chat overlay
│   ├── MultiplayerModal.tsx    ← Invite modal
│   ├── InvitationToast.tsx     ← Toast notification
│   ├── LoginView.tsx           ← Auth view
│   └── RegisterView.tsx        ← Auth view
├── context/
│   └── ThemeContext.tsx        ← Theme provider (32 lines)
├── hooks/
│   ├── useSocial.ts            ← Friend management
│   └── useSocket.ts            ← Real-time events
├── styles.ts                   ← Style factory (60 lines)
├── themes.ts                   ← 4 themes (127 lines)
├── types/                      ← TypeScript interfaces
├── App.css                     ← Component styles (184 lines)
└── index.css                   ← Global styles (110 lines)
```

---

## 5. Responsive Design Status

### Current Implementation
✓ Viewport meta tag correct  
✓ One breakpoint: `max-width: 1024px`  
✓ Applied to: Auth views only  
✗ **NOT applied to:** Main 3-column layout  

### Media Query in index.css
```css
@media (max-width: 1024px) {
  :root { font-size: 16px; }  /* reduce font */
  h1 { font-size: 36px; }     /* smaller headings */
}
```

### Media Query in App.css
```css
@media (max-width: 1024px) {
  #next-steps { flex-direction: column; }  /* stack vertically */
  #docs { border-right: none; border-bottom: 1px solid...; }
}
```

### MISSING Responsive Features
✗ No mobile layout (< 640px)  
✗ No tablet layout transformation (641-1023px)  
✗ 3-column layout doesn't adapt  
✗ No hamburger menu  
✗ No bottom navigation  
✗ No drawer/modal navigation  

**Impact:** On phones, right column becomes too narrow; layout breaks.

---

## 6. Technology Comparison

| Aspect | Current | Typical | Note |
|--------|---------|---------|------|
| CSS Framework | None | Tailwind | More lightweight, less abstracted |
| Styling Approach | Inline | Utility classes | More verbose but portable |
| Theme System | Custom | shadcn/ui | More flexible |
| Build Tool | Vite | Webpack | Faster, simpler |
| Framework | React | Next.js | Client-side only, no SSR |
| State | Hooks/Context | Redux | Simpler but limited at scale |

---

## 7. Key Imports Reference

### In Home.tsx
```tsx
import type { View, Player, User } from "../types";
import { useSocial } from "../hooks/useSocial";
import { useSocket } from "../hooks/useSocket";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

import ProfilePanel from "../components/ProfilePanel";
import GameCenter from "../components/GameCenter";
import PlayerList from "../components/PlayerList";
import FriendsPanel from "../components/FriendsPanel";
```

### In Components
```tsx
import { useTheme } from "../context/ThemeContext";
import { makeStyles } from "../styles";

const { theme, themeName, setThemeName } = useTheme();
const s = makeStyles(theme);
```

---

## 8. Build & Development Commands

### Development
```bash
cd frontend
npm install
npm run dev          # Start Vite dev server on localhost:5173
```

### Production
```bash
npm run build        # Optimized production build
npm run preview      # Test production build locally
```

### Code Quality
```bash
npm run lint         # ESLint check
```

---

## 9. State Management Pattern

### Global State (Home.tsx)
Uses plain `useState` hooks:
```tsx
const [view, setView] = useState<View>("home");
const [player1, setPlayer1] = useState<Player | null>(null);
const [player2, setPlayer2] = useState<User | null>(null);
```

### Theme State (ThemeContext.tsx)
Uses `useContext` + `useState`:
```tsx
const [themeName, setThemeName] = useState<ThemeName>("dark");
```

### Real-time State (useSocket.ts)
Uses Socket.io event listeners:
```tsx
socket.on("user_connected", (userId) => {
  onUserConnected(userId);
});
```

---

## 10. Important Notes

### Flex Container with minHeight: 0
```tsx
<div style={{ display: "flex", flex: 1, minHeight: 0 }}>
```
The `minHeight: 0` is CRITICAL for nested scrollable flex containers. Without it, content won't scroll properly inside flex children.

### Three-Column Layout Flex Ratios
- **Left:** `flex: auto` = `flex: 1 1 auto` (grows, shrinks)
- **Center:** `flex: 1 1 auto` (primary flexible area)
- **Right:** `flex: 0 0 24%` (fixed width, never changes)

### No Responsive Adjustments in Main Layout
The right column is hardcoded to `24%` width on ALL screen sizes. There are NO media queries adjusting this for mobile/tablet.

---

## 11. Performance Considerations

### Strengths
✓ Vite's fast bundling  
✓ React 18 concurrent features available  
✓ No large CSS-in-JS libraries  
✓ Lightweight overall bundle  

### Potential Issues
✗ Many inline style objects recreated per render  
✗ No CSS optimization/minification of inline styles  
✗ No critical CSS path optimization  
✗ Theme switching not memoized  

### Optimization Ideas
1. Memoize `makeStyles()` function output
2. Extract complex inline styles to CSS Modules
3. Use CSS containment for performance
4. Memoize components with `React.memo()`

---

## 12. Real-Time Architecture

### Socket.io Connection
```tsx
const socket = io('/', {
  auth: { token: player1.token },
  reconnection: true,
  reconnectionDelay: 1000,
});
```

### Key Events
```
EMIT:
  send_invitation    → Invite friend to play
  accept_invitation  → Accept game invitation
  move              → Send tic-tac-toe move
  directMessage     → Send chat message

LISTEN:
  user_connected    → Player came online
  game_updated      → Opponent moved
  game_over         → Game finished
  invitation_received → Friend invited
```

