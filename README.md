*This project has been created as part of the 42 curriculum by aarranz-, ciestrad, izperez, aszamora.*

---

# FT Transcendence

## Description

FT Transcendence is a real-time multiplayer Tic-Tac-Toe web platform built as the final project of the 42 Common Core curriculum. The application allows users to play Tic-Tac-Toe against each other online, against an AI opponent with three difficulty levels, or locally on the same device.

Key features include:

- **Real-time multiplayer**: Play against friends or other online users with instant move synchronization via WebSockets.
- **AI Opponent**: Three difficulty levels (Easy, Medium, Hard) powered by the minimax algorithm.
- **Social system**: Add friends, see who is online, send game invitations, and chat via direct messages.
- **Leaderboard & History**: Track your wins, view match history, and compete on the global leaderboard.
- **Theme system**: 4 customizable themes (Dark, Light, Retro, Lila).
- **Responsive design**: Fully functional on desktop and mobile with a swipeable carousel layout.
- **Monitoring**: Full observability stack with ELK (Elasticsearch, Logstash, Kibana) for logs and Prometheus + Grafana for metrics.

## Instructions

### Prerequisites

- **Docker** and **Docker Compose** (v2.0+)
- **Node.js** 20+ (only if running frontend/backend outside Docker)
- A Google Cloud project with OAuth 2.0 credentials (optional, for Google login)

### Environment Setup

1. Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

2. Edit `.env` and set the following at minimum:

```
What ever you want:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ft_transcendence
DATABASE_URL="postgresql://postgres:postgres@db:5432/ft_transcendence"
Create with : openssl rand -base64 32
    JWT_SECRET=your_jwt_secret_here
GRAFANA_ADMIN_PASSWORD=your_grafana_password
ELASTIC_PASSWORD=your_elastic_password
KIBANA_PASSWORD=your_kibana_password
```

3. For Google OAuth, uncomment and fill in:

```

Google OAuth (OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET)
  Go to https://console.cloud.google.com
  Create a new project or select an existing one
  In the side menu go to APIs & Services → Credentials
  Click Create Credentials → OAuth client ID
  Select Web application
  Under Authorized JavaScript origins add:

       https://localhost:8443

  Under Authorized redirect URIs add:

       https://localhost:8443/api/auth/google/callback

Click Create
Copy the Client ID → OAUTH_CLIENT_ID
Copy the Client Secret → OAUTH_CLIENT_SECRET


You also need to enable the Google+ API:
APIs & Services → Library → search "Google+ API" → Enable

https://www.youtube.com/watch?v=lhs_oXO1EHY

Important limitation: The Google OAuth callback URL is set to https://localhost:8443/api/auth/google/callback, which means Google will always redirect the user's browser back to localhost after authentication. This only works if the browser and the Docker server are running on the same machine.
If you try to sign in with Google from a different device (e.g. a phone or another computer on the same network), the authentication will fail — Google will redirect to https://localhost:8443/... but on that device localhost points to itself, not to the machine running Docker.
To support Google OAuth from external devices, a public domain or a tunneling tool like ngrok would be required, which is outside the scope of this project.


OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_CALLBACK_URL=https://localhost:8443/api/auth/google/callback
```

### Running the Application

```bash
docker-compose up --build
```

This will start all services:

| Service | URL | Description |
|---------|-----|-------------|
| App | https://localhost:8443 | Main application (via Nginx) |
| Backend API | https://localhost:3000 | NestJS REST API |
| Grafana | http://localhost:3001 | Metrics dashboards (admin / your password) |
| Kibana | http://localhost:5601 | Log visualization |
| Prometheus | http://localhost:9090 | Raw metrics |

### Stopping the Application

```bash
docker-compose down
```

To remove all data (including the database):

```bash
docker-compose down -v
```

## Resources

### Documentation and References

- [NestJS Documentation](https://docs.nestjs.com/) — Backend framework used for building scalable Node.js server-side applications.
- [React Documentation](https://react.dev/) — Frontend library for building user interfaces.
- [Prisma Documentation](https://www.prisma.io/docs) — Next-generation ORM for Node.js and TypeScript.
- [Socket.io Documentation](https://socket.io/docs/v4/) — Real-time bidirectional event-based communication.
- [Docker Documentation](https://docs.docker.com/) — Containerization platform for deployment.
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) — Relational database system.
- [Prometheus Documentation](https://prometheus.io/docs/) — Monitoring and alerting toolkit.
- [Grafana Documentation](https://grafana.com/docs/) — Analytics and interactive visualization platform.
- [Elasticsearch Documentation](https://www.elastic.co/guide/) — Distributed search and analytics engine.
- [Passport.js Documentation](https://www.passportjs.org/) — Authentication middleware for Node.js.
- [Vite Documentation](https://vitejs.dev/) — Next generation frontend tooling.

### AI Usage

AI tools (ChatGPT, GitHub Copilot) were used during the development of this project for the following tasks:

- **Debugging**: Assistance with resolving WebSocket connection issues, Prisma migration errors, and Docker networking problems.
- **Code generation**: Help with boilerplate code for NestJS modules, Passport strategies, and Socket.io event handlers.
- **Architecture decisions**: Discussion of approaches for real-time game state synchronization and AI opponent implementation.
- **Documentation**: Assistance with structuring and writing technical documentation.

All AI-generated code was reviewed, tested, and understood by the team before being included in the project.

## Team Information

| Member | Role | Responsibilities |
|--------|------|-----------------|
| aarranz- | Developer, Technical Leader| Online multiplayer (WebSocket game gateway), chat system (WebSocket gateway, direct messages), friends system,  match history, reconnection, Kibana dashboards, Grafana provisioning, responsive UI |
| ciestrad | Developer, Product Owner | Authentication system (JWT + Google OAuth), frontend components, theming system, Nginx/SSL configuration, , logging, user profiles |
| izperez | Developer | DevOps infrastructure (Docker, ELK stack, Prometheus, Grafana), monitoring/metrics system, profile editor|
| aszamora | Developer, Proyect Manager| Tic-Tac-Toe core game logic, AI opponent (minimax), leaderboard, user profiles, Prisma schema, Privacy Policy & Terms of Service |

## Project Management

### Work Organization

The team organized work using an informal Scrum-like approach with the following practices:

- **Task distribution**: Tasks were divided based on each member's strengths and availability. aarranz- focused on online multiplayer, chat, and social features, ciestrad on authentication and UI, izperez on DevOps and monitoring, and aszamora on game logic, AI opponent, and database design.
- **Branching strategy**: The team used a main branch with feature branches for individual work. Merge conflicts were resolved collaboratively.
- **Code reviews**: Important changes were reviewed by at least one other team member before merging.
- **Regular syncs**: The team held regular meetings to discuss progress, blockers, and next steps.

### Tools

- **GitHub**: Version control, issue tracking, and collaboration.
- **Discord**: Primary communication channel for quick discussions and coordination.
- **VS Code**: Shared development environment with Live Share for pair programming sessions.

### Communication

- Daily communication via Discord for status updates and quick questions.
- Weekly in-person or video meetings to review progress and plan upcoming work.
- GitHub Issues were used to track bugs and feature requests.

## Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library for building component-based interfaces |
| Vite | 8.x | Fast development server and build tool |
| TypeScript | 5.9 | Type-safe JavaScript for better code quality |
| Socket.io-client | 4.8 | Real-time communication with the backend |

**Justification**: React was chosen for its component-based architecture and large ecosystem. Vite provides fast hot module replacement during development. TypeScript adds type safety which reduces runtime errors. Socket.io-client is the natural companion to the Socket.io server used in the backend.

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Progressive Node.js framework with TypeScript support |
| Prisma | 6.x | Next-generation ORM with type-safe database access |
| Socket.io | 4.8 | WebSocket server for real-time features |
| Passport | 0.7 | Authentication middleware (JWT + Google OAuth) |
| Winston | 3.x | Logging library with multiple transports |
| prom-client | 15.x | Prometheus metrics collection |

**Justification**: NestJS provides a structured, modular architecture ideal for scalable applications. Prisma offers excellent TypeScript integration and migration management. Passport.js simplifies authentication with strategies for JWT and Google OAuth. Winston handles logging to multiple destinations (console + Logstash).

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15 | Relational database for all application data |

**Justification**: PostgreSQL was chosen for its reliability, ACID compliance, support for complex queries, and excellent Prisma integration. It handles the relational nature of the data model (users, matches, friendships, messages) efficiently.

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization of all services |
| Nginx | Reverse proxy, SSL termination, static file serving |
| Elasticsearch | Log storage and indexing |
| Logstash | Log collection and transformation |
| Kibana | Log visualization and dashboards |
| Prometheus | Metrics collection and alerting |
| Grafana | Metrics visualization and dashboards |

**Justification**: Docker ensures consistent environments across development and production. Nginx handles SSL termination and routes traffic to the appropriate services. The ELK stack provides centralized logging for debugging and monitoring. Prometheus + Grafana offers real-time metrics visualization for application health and performance.

## Database Schema

### Models and Relationships

```
User (1) ──────< Friendship >────── (1) User
  │                                    │
  │ (1)                            (1) │
  │                                    │
  ├──< Match (as Player1)              ├──< Match (as Player2)
  │                                    │
  └──< Message (as author)             │
                                       │
Channel (1) ────< Message              │
```

### Tables

#### User
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incrementing identifier |
| email | String (unique) | User's email address |
| username | String (unique) | Unique display username |
| displayName | String? | Optional display name |
| avatarUrl | String? | Path to uploaded avatar |
| password | String? | Hashed password (null for OAuth users) |
| oauthId | String? (unique) | Google OAuth ID |
| oauthProvider | String? | OAuth provider name |
| wins | Int | Total wins count |
| birthDate | DateTime? | User's birth date |
| country | String? | User's country |
| gender | String? | User's gender |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Match
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incrementing identifier |
| player1Id | Int (FK) | First player's user ID |
| player2Id | Int? (FK) | Second player's user ID (null if waiting) |
| score1 | Int | Player 1's score |
| score2 | Int | Player 2's score |
| board | String | 9-character board state (e.g., "X_O___O__") |
| status | String | Game status: "waiting", "playing", "finished" |
| winner | String? | Winner: "player1", "player2", "draw", or null |
| isVsAI | Boolean | Whether the game is against AI |
| customRules | Json? | Optional custom rules |
| playedAt | DateTime | Game start timestamp |
| finishedAt | DateTime? | Game end timestamp |

#### Friendship
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incrementing identifier |
| fromUserId | Int (FK) | User who sent the request |
| toUserId | Int (FK) | User who received the request |
| accepted | Boolean | Whether the request was accepted |
| createdAt | DateTime | Request timestamp |

Unique constraint: (fromUserId, toUserId)

#### Channel
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incrementing identifier |
| name | String (unique) | Channel name (e.g., "dm_1_2" for DMs) |
| isPrivate | Boolean | Whether the channel is private |
| createdAt | DateTime | Channel creation timestamp |

#### Message
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incrementing identifier |
| content | String | Message content |
| authorId | Int (FK) | Message author's user ID |
| channelId | Int (FK) | Channel where the message was sent |
| sentAt | DateTime | Message timestamp |

## Features List

### Game Features

| Feature | Description | Implemented by |
|---------|-------------|----------------|
| Tic-Tac-Toe Game | Core 3x3 board game with win/draw detection and turn management | aszamora, ciestrad |
| Local Multiplayer | Two players on the same browser taking turns | ciestrad |
| Online Multiplayer | Real-time multiplayer via WebSocket invitations | aarranz- |
| AI Opponent | Three difficulty levels (Easy/Medium/Hard) using minimax algorithm | aszamora |
| Game Reconnection | Rejoin ongoing games after disconnection | aarranz- |
| Match History | View last 50 matches with results and opponent info | aarranz- |
| Leaderboard | Top 10 players ranked by wins | aszamora |

### Social Features

| Feature | Description | Implemented by |
|---------|-------------|----------------|
| User Registration | Email/password registration with validation | ciestrad |
| User Login | Email/password authentication with JWT | ciestrad |
| Google OAuth | Login with Google account via OAuth 2.0 | ciestrad |
| User Profiles | View and edit profile (avatar, display name, country, gender, birth date) | aarranz-, izperez |
| Avatar Upload | Upload and change profile picture | izperez |
| Friends System | Send/accept/remove friend requests | aarranz- |
| Online Status | See which friends are currently online | aarranz- |
| Game Invitations | Invite online friends to play via modal | aszamora, ciestrad |
| Direct Messages | Real-time chat with friends via WebSocket | aarranz- |

### UI/UX Features

| Feature | Description | Implemented by |
|---------|-------------|----------------|
| Theme System | 4 switchable themes: Dark, Light, Retro, Lila | ciestrad |
| Responsive Design | Mobile-first with swipeable carousel layout | aarranz- |
| Invitation Toasts | Real-time notifications for incoming game invites | ciestrad |
| Privacy Policy | Legal page accessible from footer | aszamora |
| Terms of Service | Legal page accessible from footer | aszamora |

### Infrastructure Features

| Feature | Description | Implemented by |
|---------|-------------|----------------|
| Docker Deployment | Full containerization with docker-compose | izperez |
| Nginx Reverse Proxy | SSL termination, routing, static file serving | ciestrad, izperez |
| ELK Stack | Elasticsearch + Logstash + Kibana for centralized logging | izperez |
| Prometheus Metrics | HTTP, WebSocket, game and chat metrics collection | izperez |
| Grafana Dashboards | Real-time visualization of application metrics | izperez, aarranz- |
| Health Checks | Service health monitoring and status endpoint | izperez |

## Modules

| # | Module | Category | Type | Points | Justification |
|---|--------|----------|------|--------|---------------|
| 1 | Frontend + Backend Framework | Web | Major | 2 | React (frontend) + NestJS (backend) — structured, maintainable architecture with rich ecosystems |
| 2 | Real-time Features (WebSockets) | Web | Major | 2 | Socket.io for game state synchronization, chat, online presence, and invitations |
| 3 | User Interaction | Web | Major | 2 | Direct messaging system, user profiles, friends list with online status |
| 4 | Standard User Management | User Management | Major | 2 | Profile management, avatar upload, friend system, online status tracking |
| 5 | OAuth 2.0 | User Management | Minor | 1 | Google OAuth integration for seamless authentication |
| 6 | AI Opponent | Artificial Intelligence | Major | 2 | Minimax algorithm with 3 difficulty levels, challenging and human-like behavior |
| 7 | Web-based Game | Gaming | Major | 2 | Complete Tic-Tac-Toe with clear rules, win/loss conditions, and real-time gameplay |
| 8 | Remote Players | Gaming | Major | 2 | Two players on separate computers playing in real-time with reconnection support |
| 9 | ELK Stack | DevOps | Major | 2 | Elasticsearch for log storage, Logstash for processing, Kibana for visualization |
| 10 | Prometheus + Grafana | DevOps | Major | 2 | Custom metrics for HTTP, WebSocket, game, and chat with Grafana dashboards |
| 11 | ORM | Web | Minor | 1 | Prisma for type-safe database access, migrations, and schema management |

**Total: 20 points** (14 required + 6 bonus)

### Module Implementation Details

**Frontend + Backend Framework (2 pts)**
- Frontend: React 18 with Vite, component-based architecture, custom hooks for socket and social logic
- Backend: NestJS with modular structure (Auth, User, Game, Chat, Health, Metrics modules)

**Real-time Features (2 pts)**
- Socket.io server with JWT authentication on connection
- Game gateway: online moves, invitations, reconnection, room management
- Chat gateway: direct messages, message history
- Graceful handling of connections/disconnections

**User Interaction (2 pts)**
- Direct messaging system with persistent history
- User profiles with editable information
- Friends system with request/accept/remove flow
- Online status tracking for all connected users

**Standard User Management (2 pts)**
- Registration with email validation and unique constraints
- Profile editing (displayName, country, gender, birthDate)
- Avatar upload with multer disk storage
- Friend request system with accepted/pending states

**OAuth 2.0 (1 pt)**
- Google OAuth 2.0 via Passport.js
- Account linking if email matches existing user
- Seamless redirect flow with JWT token generation

**AI Opponent (2 pts)**
- Minimax algorithm with depth-based scoring
- Easy: random moves; Medium: 30% random, 70% optimal; Hard: always optimal
- AI plays as "O" (player2) with configurable difficulty
- 500ms delay for natural UX

**Web-based Game (2 pts)**
- Tic-Tac-Toe with 3x3 board (9-character string representation)
- 8 winning lines checked via checkWinner()
- Status management: waiting → playing → finished
- Score tracking per match

**Remote Players (2 pts)**
- Real-time move synchronization via WebSocket rooms
- Network latency handling with optimistic updates
- Reconnection logic: fetch game state, rejoin room
- Abandonment handling: opponent wins on disconnect

**ELK Stack (2 pts)**
- Elasticsearch for log storage and indexing
- Logstash pipeline receiving logs via TCP (port 5001)
- Kibana dashboards for log visualization
- Winston logger with Logstash TCP transport

**Prometheus + Grafana (2 pts)**
- HTTP metrics: request count, duration, status codes
- WebSocket metrics: connections, disconnects, messages
- Game metrics: created, started, finished, abandoned, moves
- Chat metrics: connections, messages, latency
- Custom Grafana dashboards with auto-provisioning

**ORM (1 pt)**
- Prisma with PostgreSQL
- Type-safe queries and relations
- Automated migrations
- Seed script for initial data

## Individual Contributions

### aarranz- (26 commits)

**Primary areas**: Online multiplayer, chat system, friends system, dashboards

- Built the game WebSocket gateway (`game.gateway.ts`) handling real-time moves, invitations, room management, and reconnection
- Implemented online multiplayer with real-time move synchronization
- Implemented game reconnection after disconnection
- Developed the multiplayer invitation flow (modal, toast notifications)
- Created the match history feature
- Built the chat WebSocket gateway (`chat.gateway.ts`) for real-time direct messaging
- Implemented the friends system: send/accept/remove friend requests, online status tracking
- Created the user profile frontend with display of user information
- Developed the FloatingChat component for direct message conversations
- Set up Kibana dashboards for log visualization
- Configured Grafana provisioning for metrics dashboards
- Resolved merge conflicts and integrated features from all team members

### ciestrad (20 commits)

**Primary areas**: Authentication, frontend components, theming, UI/UX

- Implemented the complete authentication system: JWT strategy, guards, registration, login
- Integrated Google OAuth 2.0 via Passport.js
- Created all major frontend components: LoginView, RegisterView, ProfilePanel, GameCenter, FriendsPanel, PlayerList, FloatingChat, MultiplayerModal, InvitationToast
- Designed and implemented the 4-theme system (Dark, Light, Retro, Lila) with ThemeContext
- Configured Nginx reverse proxy with SSL termination
- Fixed build issues and Vite configuration problems
- Refactored frontend code for consistency and maintainability
- Implemented user profile viewing for other users

### izperez (17 commits)

**Primary areas**: DevOps, monitoring, infrastructure, logging

- Set up the entire Docker infrastructure (docker-compose.yml with 8 services, Dockerfiles for backend and frontend)
- Configured Nginx as reverse proxy with SSL certificates
- Implemented the complete monitoring stack:
  - Prometheus metrics collection (HTTP, WebSocket, game, chat, process)
  - Grafana dashboards with auto-provisioning
  - ELK stack (Elasticsearch + Logstash + Kibana) for centralized logging
- Created the metrics system with custom counters, histograms, and gauges
- Implemented Winston logger with Logstash TCP transport
- Built the UserActivityInterceptor for HTTP request logging
- Created user profile editing with avatar upload functionality
- Set up health check endpoints

### aszamora (16 commits)

**Primary areas**: Game logic, AI opponent, responsive UI, database design

- Implemented the core Tic-Tac-Toe game component (`TicTacToe.tsx`) supporting local and AI modes
- Implemented the AI opponent using the minimax algorithm with three difficulty levels (Easy, Medium, Hard)
- Created the leaderboard feature
- Fixed responsive design with mobile carousel layout
- Designed and implemented the complete Prisma schema with 5 models (User, Match, Friendship, Channel, Message) and their relationships
- Created the initial database migration and seed script
- Implemented Privacy Policy and Terms of Service pages
