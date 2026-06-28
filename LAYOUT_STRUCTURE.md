# FT_TRANSCENDENCE - Layout & Component Structure

## Visual Layout Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Viewport (100vw × 100vh)                   │
│                    (padding: 20px, gap: 16px)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     MAIN CONTENT AREA                          │ │
│  │        flex: 1 (main row, flex-direction: row)                 │ │
│  │                     gap: 16px                                  │ │
│  │                                                                │ │
│  │  ┌──────────────┐  ┌────────────────────┐  ┌─────────────────┐ │
│  │  │  LEFT PANEL  │  │   CENTER PANEL     │  │   RIGHT PANEL   │ │
│  │  │              │  │                    │  │   (24% fixed)   │ │
│  │  │ ProfilePanel │  │   GameCenter       │  │                 │ │
│  │  │              │  │  • TicTacToe       │  │ ┌───────────────┐ │
│  │  │ • Profile    │  │  • Leaderboard     │  │ │ PlayerList    │ │
│  │  │ • Stats      │  │  • Game History    │  │ │               │ │
│  │  │ • Settings   │  │  • Game Controls   │  │ │ • Online      │ │
│  │  │ • Avatar     │  │                    │  │ │   Players     │ │
│  │  │              │  │                    │  │ │ • Add Friend  │ │
│  │  │              │  │                    │  │ └───────────────┘ │
│  │  │              │  │                    │  │                 │ │
│  │  │ (Variable)   │  │  (flex: 1 1 auto)  │  │ ┌───────────────┐ │
│  │  │              │  │                    │  │ │ FriendsPanel  │ │
│  │  │ • flex: auto │  │                    │  │ │               │ │
│  │  │ • overflow-y │  │                    │  │ │ • Friends     │ │
│  │  │ • minHeight: │  │                    │  │ │ • Requests    │ │
│  │  │   0          │  │                    │  │ │ • Chat        │ │
│  │  │              │  │                    │  │ │ • Actions     │ │
│  │  └──────────────┘  └────────────────────┘  └─────────────────┘ │
│  │                                                                  │
│  └──────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      FOOTER / NAVBAR                           │ │
│  │          (flex: 0, height: auto, bottom position)              │ │
│  │                                                                │ │
│  │     [FT TRANSCENDENCE]        [THEME BUTTONS]   [LEGAL LINKS] │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─ COLUMN DISTRIBUTION ─────────────────────────────────────────────────┐
│                                                                       │
│ LEFT COLUMN (ProfilePanel):                                          │
│   - flex: auto (grows to fill available space)                       │
│   - 200-250px typical width                                         │
│   - scrollable content (overflow-y: auto)                           │
│                                                                       │
│ CENTER COLUMN (GameCenter):                                          │
│   - flex: 1 1 auto (primary flexible column)                        │
│   - consumes most of the viewport width                             │
│   - contains main game board and controls                           │
│                                                                       │
│ RIGHT COLUMN (PlayerList + FriendsPanel):                           │
│   - flex: 0 0 24% (fixed 24% width, no grow/shrink)               │
│   - 200-250px on typical desktop (1200px viewport)                 │
│   - Two sub-panels stacked vertically (flex-direction: column)      │
│   - Each sub-panel has flex: 1 and overflow-y: auto               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component File Relationships

```
frontend/src/
│
├── main.tsx
│   └── ThemeProvider (Context wrapper)
│       └── App.tsx
│           └── pages/Home.tsx (MAIN ORCHESTRATOR - 540 lines)
│               ├── STATE MANAGEMENT
│               │   ├── view (home|login|register|lobby)
│               │   ├── player1 & player2
│               │   ├── game state (online, AI, etc.)
│               │   └── social state (friends, invitations, chat)
│               │
│               ├── RENDER: Authentication Views (home/login/register)
│               │   ├── components/LoginView.tsx
│               │   └── components/RegisterView.tsx
│               │
│               └── RENDER: Lobby View (main 3-column layout)
│                   ├── LEFT COLUMN:
│                   │   └── components/ProfilePanel.tsx (217 lines)
│                   │       ├── components/TicTacToe.tsx (349 lines)
│                   │       └── Profile editing, avatar upload
│                   │
│                   ├── CENTER COLUMN:
│                   │   └── components/GameCenter.tsx (313 lines)
│                   │       ├── components/TicTacToe.tsx
│                   │       ├── Leaderboard modal/display
│                   │       ├── Game history modal/display
│                   │       └── AI difficulty selector
│                   │
│                   ├── RIGHT COLUMN (vertical stack):
│                   │   ├── components/PlayerList.tsx (74 lines)
│                   │   │   └── Online players + add friend button
│                   │   │
│                   │   └── components/FriendsPanel.tsx (113 lines)
│                   │       ├── Friend requests section
│                   │       └── Friends list + actions
│                   │
│                   └── OVERLAYS & MODALS:
│                       ├── components/FloatingChat.tsx
│                       │   └── Real-time chat window
│                       ├── components/MultiplayerModal.tsx
│                       │   └── Invite friends to play
│                       ├── components/InvitationToast.tsx
│                       │   └── Incoming game invitation notification
│                       └── Footer/Theme selector

├── context/
│   └── ThemeContext.tsx (32 lines)
│       ├── theme state management
│       └── theme switching logic
│
├── hooks/
│   ├── useSocial.ts
│   │   └── friend management, profiles, requests
│   └── useSocket.ts
│       └── real-time socket.io event handling
│
├── styles.ts (60 lines)
│   └── makeStyles(theme) factory function
│
├── themes.ts (127 lines)
│   ├── dark theme
│   ├── light theme (Apple/Notion style)
│   ├── retro theme (terminal green)
│   └── lila theme (purple/lavender)
│
├── types/ (TypeScript interfaces)
│   └── Game, Player, User, etc.
│
└── CSS Files:
    ├── index.css (110 lines)
    │   ├── CSS variables (colors, fonts)
    │   └── Global media queries
    └── App.css (184 lines)
        └── Authentication views styling
```

## Styling Architecture

```
STYLING HIERARCHY:
═════════════════

1. GLOBAL DEFAULTS (index.html)
   └─ Viewport meta tag
   └─ Font smoothing

2. CSS VARIABLES (index.css)
   ├─ Color scheme (light/dark mode via @media prefers-color-scheme)
   ├─ Font families
   ├─ Typography scale
   └─ Shadow definitions

3. THEME SYSTEM (themes.ts)
   ├─ dark: { background, surface, text, ... }
   ├─ light: { background, surface, text, ... }
   ├─ retro: { background, surface, text, ... }
   └─ lila: { background, surface, text, ... }

4. THEME PROVIDER (context/ThemeContext.tsx)
   └─ Distributes selected theme via React Context

5. INLINE STYLES (React components)
   ├─ Generated from makeStyles(theme) factory
   └─ Computed CSS objects: { display, flex, gap, ... }

6. COMPONENT CSS (App.css)
   └─ Animations, complex selectors, media queries
   └─ Used for authentication views

FLOW:
  ThemeContext.setThemeName('dark')
    → themes['dark'] = Theme object
    → Consumed by makeStyles(theme)
    → Applied to all components via style={{...s.btnPrimary}}
    → Media query @media (prefers-color-scheme: dark) as fallback
```

## Flexbox Layout Details

```
PRIMARY FLEX CONTAINER (Home.tsx, line 352):
┌──────────────────────────────────────────────┐
│ display: flex                                │
│ flexDirection: column                        │
│ width: 100vw                                 │
│ height: 100vh                               │
│ padding: 20px                               │
│ gap: 16px                                   │
└──────────────────────────────────────────────┘
          │
          ├─ Child 1: flex: 1
          │   └─ MAIN CONTENT ROW
          │       ├─ ProfilePanel (flex: auto)
          │       ├─ GameCenter (flex: 1 1 auto)
          │       └─ RightColumn (flex: 0 0 24%)
          │           ├─ PlayerList (flex: 1)
          │           └─ FriendsPanel (flex: 1)
          │
          └─ Child 2: flex: 0
              └─ FOOTER BAR

KEY FLEX PROPERTIES:
═════════════════════

flex: auto
  ├─ flex-grow: 1
  ├─ flex-shrink: 1
  ├─ flex-basis: auto
  └─ Common use: LEFT column shrinks when needed

flex: 1 1 auto
  ├─ flex-grow: 1
  ├─ flex-shrink: 1
  ├─ flex-basis: auto
  └─ Common use: CENTER column (main content area)

flex: 0 0 24%
  ├─ flex-grow: 0 (doesn't expand)
  ├─ flex-shrink: 0 (doesn't shrink)
  ├─ flex-basis: 24% (fixed width)
  └─ Common use: RIGHT column (fixed sidebar)

minHeight: 0
  ├─ Allows flex container to be smaller than content
  ├─ Enables proper scrolling behavior
  └─ Critical for nested flex layouts
```

## Responsive Breakpoints (Current Implementation)

```
DESKTOP (1024px+):
└─ Full 3-column layout
   ├─ Left: variable
   ├─ Center: ~50-60% of viewport
   └─ Right: 24% fixed

TABLET (≤1024px):
└─ APPLIES TO: Auth views only (index.css + App.css)
   └─ Font size reduced
   └─ Layout adjusts to column stacking
   └─ Padding reduced
   ✗ DOES NOT APPLY: Main lobby 3-column layout

MOBILE (<640px):
└─ NO DEDICATED BREAKPOINT
   ✗ Layout breaks on mobile devices
   ✗ 24% right column becomes too narrow
   ✗ Game board becomes unplayable
   ✗ No hamburger menu or nav drawer

MISSING RESPONSIVE BEHAVIORS:
═════════════════════════════

1. No tablet layout transformation
   → 3-column should collapse to 2-column
   → Right column could slide into overlay

2. No mobile layout transformation
   → 2-column should collapse to 1-column
   → Bottom panels should be in modals/tabs

3. No mobile navigation
   → No hamburger menu
   → No drawer navigation
   → No bottom tab bar

4. No touch-optimized buttons
   → Buttons need minimum 44px height
   → Current buttons too small for touch

5. No viewport-specific font scaling
   → Header size doesn't adapt
   → Padding/gap remains fixed
```

## Socket.io Integration Points

```
REAL-TIME DATA FLOW:
═══════════════════

useSocket hook (hooks/useSocket.ts)
  └─ Connects to backend via socket.io-client
     ├─ on('user_connected', userId) → onUserConnected callback
     ├─ on('user_disconnected', userId) → onUserDisconnected callback
     ├─ on('online_friends', ids[]) → onOnlineFriends callback
     ├─ on('direct_message', msg) → onDirectMessage callback
     ├─ on('invitation_received', data) → onInvitationReceived callback
     ├─ on('game_start', data) → onGameStart callback
     └─ on('users_snapshot', users[]) → onOnlineUsersSnapshot callback

HOME.TSX EVENT HANDLERS:
  ├─ Emit: 'send_invitation' (to GameCenter → onOpenMultiModal)
  ├─ Emit: 'accept_invitation' (to TicTacToe game start)
  ├─ Emit: 'reject_invitation' (to close pending)
  ├─ Emit: 'directMessage' (from FloatingChat)
  └─ Listen: socket events in useSocket hook

TICTTACTOE COMPONENT:
  ├─ Emit: 'join_game_room' (on mount)
  ├─ Emit: 'leave_game_room' (on unmount)
  ├─ Emit: 'move' (on cell click)
  ├─ Listen: 'game_updated' (opponent moved)
  ├─ Listen: 'game_over' (game finished)
  └─ Listen: 'move_error' (invalid move)
```

## Theme System Usage Pattern

```
THEME CONSUMPTION PATTERN:
═════════════════════════

1. In Component:
   const { theme, themeName, setThemeName } = useTheme()
   const s = makeStyles(theme)

2. Use Theme Colors:
   style={{ background: theme.surface }}
   style={{ color: theme.text }}

3. Use Preset Styles:
   style={{ ...s.btn }}
   style={{ ...s.btnPrimary }}
   style={{ ...s.form }}

4. Override Specific Properties:
   style={{ ...s.btn, color: '#ff0000' }}

AVAILABLE THEME COLORS:
  └─ background, surface, surface2
  └─ text, textMuted, textDim, textFaint
  └─ border, border2
  └─ errorBg, errorBorder, errorText
  └─ btnPrimaryBg, btnPrimaryText
  └─ successBg, successText
  └─ rejectBg, rejectText
  └─ inputBg

PRESET STYLE OBJECTS:
  └─ wrapper, card, title, subtitle
  └─ btn, btnPrimary, btnSecondary, btnSmall, btnLink
  └─ form, formTitle, label, input
  └─ error, profileLabel, profileValue
```

## File Size Summary

| File | Lines | Purpose |
|------|-------|---------|
| Home.tsx | 540 | Main orchestrator & layout |
| GameCenter.tsx | 313 | Game UI & controls |
| TicTacToe.tsx | 349 | Game logic & board |
| ProfilePanel.tsx | 217 | User profile display/edit |
| FriendsPanel.tsx | 113 | Friends list & requests |
| PlayerList.tsx | 74 | Online players list |
| themes.ts | 127 | 4 theme definitions |
| styles.ts | 60 | Style factory function |
| App.css | 184 | Component/auth styles |
| index.css | 110 | Global styles & variables |
| ThemeContext.tsx | 32 | Theme provider |
| **TOTAL** | ~2,119 | Core frontend code |

