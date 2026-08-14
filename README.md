# DeployPulse

DeployPulse is a full-stack deployment monitoring dashboard for tracking projects, environments, and deployment health from one place. It provides an authenticated workspace where users can create projects, trigger simulated deployments, follow deployment progress, and review deployment history.

## Highlights

- Secure registration, login, token refresh, and logout flows
- Project creation, search, update, and deletion
- Dashboard metrics for project and deployment health
- Development, staging, and production environment tracking
- Deployment status pipeline with pending, running, success, failed, and cancelled states
- Branch, commit, duration, and deployment-history tracking
- Protected REST API with request validation and centralized error handling
- Responsive dark interface built with React and Tailwind CSS

## Screenshots


| Dashboard                                             | Project details                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| ![DeployPulse dashboard](./screenshots/dashboard.png) | ![DeployPulse project details](./screenshots/project-details.png) |

## Tech Stack

| Layer          | Technologies                                                  |
| -------------- | ------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend        | Node.js, Express 5, TypeScript, Socket.IO                     |
| Database       | PostgreSQL, Prisma ORM                                        |
| Authentication | JSON Web Tokens, bcrypt, HTTP cookies                         |
| Validation     | express-validator                                             |

## Architecture

```text
DeployPulse/
├── client/                 # React application
│   └── src/
│       ├── components/     # Dashboard, modal, and UI components
│       ├── contexts/       # Authentication, project, and deployment state
│       ├── pages/          # Authentication and application screens
│       ├── services/       # API clients
│       └── types/          # Shared frontend types
├── server/                 # Express API
│   ├── prisma/             # Database schema
│   └── src/
│       ├── middleware/     # Validation and error handling
│       └── modules/        # Auth, projects, and deployments
└── screenshots/            # Project previews
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- PostgreSQL
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Tambeezy1890/DeployPulse.git
cd DeployPulse
```

### 2. Configure and run the API

```bash
cd server
npm install
```

Create `server/.env.development.local`:

```env
PORT=5050
NODE_ENV=development
DB_URI=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=replace-with-a-secure-secret
EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=replace-with-another-secure-secret
REFRESH_EXPIRES_IN=7d
```

Prepare the database and start the server:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Run the client

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The API runs on `http://localhost:5050`.

## Available Scripts

### Client

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

### Server

```bash
npm run dev        # Start the API in watch mode
npm run build      # Compile TypeScript
npm run start      # Run the compiled API
npm run typecheck  # Type-check without emitting files
```

## API Overview

| Resource       | Capabilities                                                |
| -------------- | ----------------------------------------------------------- |
| Authentication | Register, log in, view current user, refresh token, log out |
| Projects       | Create, list, view, update, and delete projects             |
| Deployments    | Create, list, view, update status, and delete deployments   |
| Health         | Check API status and uptime                                 |

## Roadmap

- Connect deployments to provider webhooks
- Stream live build logs through Socket.IO
- Add deployment analytics and filtering
- Add automated tests and CI workflows
- Deploy the client and API publicly

## Author

Built by [Tambowoneyi Zvirevo](https://github.com/Tambeezy1890).
