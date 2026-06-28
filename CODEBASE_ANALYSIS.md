# FT_TRANSCENDENCE - Codebase Architecture Analysis

## Project Overview
**Project Type:** Full-stack TypeScript/JavaScript web application  
**Backend:** NestJS  
**Frontend:** React 18 with Vite  
**Build Tool:** Vite (for frontend development and bundling)  
**Real-time Communication:** Socket.io  

---

## 1. FRAMEWORK & TECHNOLOGY STACK

### Frontend Framework
- **Framework:** React 18.3.1
- **Build Tool:** Vite 8.0.1
- **Language:** TypeScript 5.9.3
- **Runtime:** Vite with React plugin (@vitejs/plugin-react 6.0.1)
- **Package Manager:** npm

### Key Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "socket.io-client": "^4.8.3",
  "react-datepicker": "^9.1.0",
  "date-fns": "^4.1.0"
}
```

### Development Tools
- TypeScript with strict type checking
- ESLint for code linting
- React Fast Refresh for hot module replacement

---

## 2. 3-COLUMN LAYOUT IMPLEMENTATION

### Main Layout Structure (Lines 358-407 in Home.tsx)

The layout is implemented using **inline CSS with React inline styles** (no separate CSS framework like Tailwind).

**3-Column Architecture:**

```
┌─────────────────────────────────────────────┐
│ FT TRANSCENDENCE (Header/Footer Bar)        │  Fixed height, bottom
├────────────┬──────────────┬─────────────────┤
│            │              │                 │  Main content area
│ LEFT       │   CENTER     │    RIGHT        │  (flex: 1)
│ COLUMN     │   COLUMN     │    COLUMN       │
│ (Variable) │ (Flexible)   │ (24% fixed)     │
│            │              │                 │
└────────────┴──────────────┴─────────────────┘
```

#### Left Column: ProfilePanel
- **File:** `/home/notasier/ft_transcendence/frontend/src/components/ProfilePanel.tsx`
- **Flex ratio:** Variable (flex grows to available space)
- **Components:** Player profile, statistics, settings

#### Center Column: GameCenter
- **File:** `/home/notasier/ft_transcendence/frontend/src/components/GameCenter.tsx`
- **Flex ratio:** `flex: "1 1 auto"` (grows and shrinks with available space)
- **Components:** Tic-tac-toe game board, leaderboard, game history

#### Right Column: PlayerList & FriendsPanel
- **Files:** 
  - `/home/notasier/ft_transcendence/frontend/src/components/PlayerList.tsx`
  - `/home/notasier/ft_transcendence/frontend/src/components/FriendsPanel.tsx`
- **Flex ratio:** `flex: "0 0 24%"` (fixed 24% width, no grow/shrink)
- **Components:** Online players list, friends list, pending friend requests

### Layout CSS (Lines 358-407 in Home.tsx)

```tsx
// Main container
<div style={{
  display: "flex", 
  flexDirection: "column", 
  width: "100vw", 
  height: "100vh",
  background: theme.background, 
  fontFamily: "'Courier New', monospace",
  boxSizing: "border-box", 
  padding: 20, 
  gap: 16,
}}>
  
  {/* Main row with 3 columns */}
  <div style={{ 
    display: "flex", 
    flex: 1, 
    gap: 16, 
    minHeight: 0 
  }}>
    <ProfilePanel ... />
    
    <GameCenter ... />
    
    {/* Right column with fixed 24% width */}
    <div style={{ 
      flex: "0 0 24%", 
      display: "flex", 
      flexDirection: "column", 
      gap: 16 
    }}>
      <PlayerList ... />
      <FriendsPanel ... />
    </div>
  </div>

  {/* Bottom bar */}
  <div style={{ /* footer styling */ }}>
    ...
  </div>
</div>
```

---

## 3. STYLING SYSTEM

### Styling Approach
**Type:** Inline CSS-in-JS with React inline styles (NO external CSS-in-JS library)

**Key Characteristics:**
- Plain inline `style={{ }}` objects in React components
- No Tailwind CSS
- No styled-components or Emotion
- Uses custom theme system via Context API

### CSS Files
1. **`/home/notasier/ft_transcendence/frontend/src/index.css`** (110 lines)
   - Global CSS custom properties (CSS variables)
   - Theme colors defined as CSS variables
   - Light/dark mode media queries
   - Base typography and resets
   
2. **`/home/notasier/ft_transcendence/frontend/src/App.css`** (184 lines)
   - Hero section styles
   - Center content layout
   - Next steps section (3-column layout example)
   - Responsive media queries for max-width: 1024px
   - Spacer and tick mark decorations

### Theme System
**Files:** 
- `/home/notasier/ft_transcendence/frontend/src/themes.ts` - Theme definitions
- `/home/notasier/ft_transcendence/frontend/src/context/ThemeContext.tsx` - Theme provider
- `/home/notasier/ft_transcendence/frontend/src/styles.ts` - Shared style objects

**Available Themes:** 4 themes
1. **dark** - Dark mode (default)
2. **light** - Light mode (Apple/Notion style)
3. **retro** - Retro green terminal style
4. **lila** - Purple/lavender theme

**Theme Properties:**
```typescript
interface Theme {
  background: string;
  surface: string;
  surface2: string;
  inputBg: string;
  border: string;
  border2: string;
  text: string;
  textMuted: string;
  textDim: string;
  textFaint: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  successBg: string;
  successText: string;
  rejectBg: string;
  rejectText: string;
}
```

### CSS Variables (index.css)
- `--text`, `--text-h`, `--bg`, `--border`, `--code-bg`
- `--accent`, `--accent-bg`, `--accent-border`
- `--social-bg`, `--shadow`
- `--sans`, `--heading`, `--mono` (font families)
- Automatic switching for dark mode via `@media (prefers-color-scheme: dark)`

### Reusable Style Objects (styles.ts)
**File:** `/home/notasier/ft_transcendence/frontend/src/styles.ts`

Contains a `makeStyles()` function that generates style objects:
```typescript
export const makeStyles = (t: Theme): Record<string, any> => ({
  wrapper: { /* flexbox centering */ },
  card: { /* card styling */ },
  title: { /* typography */ },
  btn: { /* button base */ },
  btnPrimary: { /* primary button */ },
  btnSecondary: { /* secondary button */ },
  btnSmall: { /* small button */ },
  form: { /* form container */ },
  input: { /* input styling */ },
  error: { /* error message styling */ },
  // ... more style objects
});
```

---

## 4. MAIN LAYOUT/GRID COMPONENTS LOCATIONS

### Component Hierarchy
```
/frontend/src/
├── pages/
│   └── Home.tsx (Main layout orchestrator, 540 lines)
│       ├── shows different views: "home", "login", "register", "lobby"
│       └── Manages all state for the 3-column layout
│
├── components/
│   ├── ProfilePanel.tsx (217 lines) - Left column
│   │   └── Player profile, stats, settings form
│   │
│   ├── GameCenter.tsx (313 lines) - Center column
│   │   ├── TicTacToe component integration
│   │   ├── Leaderboard display
│   │   ├── Game history
│   │   └── Start game buttons
│   │
│   ├── PlayerList.tsx (74 lines) - Right column, top
│   │   └── Online players with add friend button
│   │
│   ├── FriendsPanel.tsx (113 lines) - Right column, bottom
│   │   ├── Friends list
│   │   ├── Pending friend requests
│   │   └── Friend actions
│   │
│   ├── TicTacToe.tsx (349 lines)
│   │   └── Game board and logic (local, online, AI)
│   │
│   ├── GameCenter.tsx
│   ├── FloatingChat.tsx
│   ├── MultiplayerModal.tsx
│   ├── InvitationToast.tsx
│   ├── LoginView.tsx
│   └── RegisterView.tsx
│
├── context/
│   └── ThemeContext.tsx (32 lines)
│       └── Theme management and switching
│
├── hooks/
│   ├── useSocial.ts
│   └── useSocket.ts
│
├── styles.ts (60 lines)
│   └── makeStyles() function
│
├── themes.ts (127 lines)
│   └── Theme definitions
│
├── types/ (TypeScript interfaces)
├── mocks/ (Mock data)
├── assets/ (Static assets)
├── index.css (Global styles, 110 lines)
├── App.css (Component styles, 184 lines)
├── main.tsx (React root)
└── App.tsx (App wrapper)
```

---

## 5. CURRENT RESPONSIVE DESIGN IMPLEMENTATION

### Responsive Approach
**Type:** Mobile-first media queries with breakpoints at **max-width: 1024px**

### Media Query Breakpoints Found
```css
@media (max-width: 1024px) {
  /* Mobile/tablet adjustments */
}
```

**Only ONE breakpoint:** 1024px (for tablets/small screens)  
**No mobile-specific layout (< 640px)**

### Responsive Behaviors

#### In `index.css` (lines 28-30, 79-81, 89-91)
```css
@media (max-width: 1024px) {
  :root { font-size: 16px; } /* Reduce base font */
  h1 { font-size: 36px; margin: 20px 0; } /* Smaller headings */
  h2 { font-size: 20px; } /* Smaller subheadings */
}
```

#### In `App.css` (lines 67-70, 81-83, 92-95, 101-104, 139-153, 159-161)
```css
#center {
  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  @media (max-width: 1024px) {
    flex-direction: column; /* Stack columns vertically */
    text-align: center;
  }
}

#docs {
  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  @media (max-width: 1024px) {
    flex-wrap: wrap;
    justify-content: center;
    li { flex: 1 1 calc(50% - 8px); } /* 2 columns */
    a { width: 100%; }
  }
}
```

#### In `Home.tsx` - LOBBY view (lines 350-495)
**Current state:** NO responsive adjustments in the main 3-column layout
- Uses fixed `flex: "0 0 24%"` for right column (no breakpoint changes)
- Main layout doesn't adapt for smaller screens
- Hard-coded padding: `padding: 20` (doesn't respond to viewport)

**Responsive elements present:**
- Bottom footer bar has theme selector (responsive styling via inline styles)
- Individual panels have scrollable overflow handling

### Responsive Design Gaps
1. **3-column layout NOT responsive** - Fixed 24% right column on all screen sizes
2. **No mobile layout** - No stacking to 1-column on small screens
3. **No tablet optimization** - No media queries in main layout
4. **Fixed padding/gap** - Doesn't adjust for smaller viewports
5. **Only applied to auth views** - Responsive CSS only used in login/register/home pages

### Current Viewport Meta Tag (index.html)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
✓ Correct mobile viewport configuration

---

## 6. SUMMARY TABLE

| Aspect | Technology | Details |
|--------|-----------|---------|
| **Framework** | React 18.3.1 | Functional components with hooks |
| **Build Tool** | Vite 8.0.1 | Fast development server, optimized builds |
| **Language** | TypeScript 5.9.3 | Fully typed application |
| **Styling** | Inline CSS-in-JS | No external CSS library (Tailwind/styled-components) |
| **Layout System** | Flexbox | `display: flex` with flex ratios |
| **3-Column Setup** | Custom inline styles | Left: variable, Center: auto, Right: fixed 24% |
| **Component Architecture** | React Components | 11 main components |
| **State Management** | React Hooks + Context | useState, useContext, custom hooks |
| **Real-time** | Socket.io | Live chat, multiplayer games, invitations |
| **Theme System** | Context API + CSS Vars | 4 themes (dark, light, retro, lila) |
| **Responsive Design** | Media queries | Breakpoint at 1024px only (incomplete) |
| **Type Safety** | TypeScript | Interfaces for all major entities |

---

## 7. FILE PATHS - KEY COMPONENTS

### Layout & Structure
- Main Page: `/home/notasier/ft_transcendence/frontend/src/pages/Home.tsx`
- Main App: `/home/notasier/ft_transcendence/frontend/src/App.tsx`

### Components
- **Left Column:** `/home/notasier/ft_transcendence/frontend/src/components/ProfilePanel.tsx`
- **Center Column:** `/home/notasier/ft_transcendence/frontend/src/components/GameCenter.tsx`
- **Right Column (Top):** `/home/notasier/ft_transcendence/frontend/src/components/PlayerList.tsx`
- **Right Column (Bottom):** `/home/notasier/ft_transcendence/frontend/src/components/FriendsPanel.tsx`
- **Game Board:** `/home/notasier/ft_transcendence/frontend/src/components/TicTacToe.tsx`

### Styling & Themes
- **Global CSS:** `/home/notasier/ft_transcendence/frontend/src/index.css`
- **Component CSS:** `/home/notasier/ft_transcendence/frontend/src/App.css`
- **Theme Definitions:** `/home/notasier/ft_transcendence/frontend/src/themes.ts`
- **Style Factory:** `/home/notasier/ft_transcendence/frontend/src/styles.ts`
- **Theme Provider:** `/home/notasier/ft_transcendence/frontend/src/context/ThemeContext.tsx`

### Configuration
- **Build Config:** `/home/notasier/ft_transcendence/frontend/vite.config.ts`
- **HTML Entry:** `/home/notasier/ft_transcendence/frontend/index.html`
- **Package.json:** `/home/notasier/ft_transcendence/frontend/package.json`

---

## 8. OBSERVATIONS & RECOMMENDATIONS

### Current Strengths
✓ Clean component-based architecture  
✓ Flexible theme system with 4 variations  
✓ Real-time capabilities with Socket.io  
✓ TypeScript for type safety  
✓ Vite for fast development workflow  
✓ No external CSS dependencies (lightweight)

### Current Limitations
✗ Inline styles make components verbose  
✗ No responsive design for 3-column layout  
✗ Only one mobile breakpoint (1024px)  
✗ No grid system for complex layouts  
✗ Responsive adjustments missing for main lobby view  
✗ Styles scattered across components (no separation of concerns)

### Potential Improvements
1. Add mobile/tablet responsive layout (3 → 2 → 1 column)
2. Consider Tailwind CSS or CSS Modules for cleaner code
3. Extract shared inline styles to CSS files
4. Add more responsive breakpoints
5. Implement proper mobile navigation for collapsed views
