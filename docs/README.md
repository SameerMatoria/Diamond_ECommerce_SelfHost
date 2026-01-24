# Docs

Project documentation and architecture notes.

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- Docker Desktop

### 1) Install dependencies

```bash
cd "e:\Sameer\Code\Diamon Ecom Self hosted\diamond-electronics"
npm install
```

### 2) Configure environment

- Copy `server/.env.example` to `server/.env` and fill:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `ADMIN_EMAIL_ALLOWLIST` (comma-separated admin emails)
  - S3/Minio vars if testing uploads

- Copy `web/.env.example` to `web/.env`:
  - `VITE_GOOGLE_CLIENT_ID`

### 3) Start local services

```bash
docker compose up -d
```

### 4) Setup database

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5) Start API

```bash
cd server
npm run dev
```

### 6) Start web app

```bash
cd web
npm run dev
```

### 7) Verify

- API: `http://localhost:4000/api/health`
- Web: `http://localhost:5173`

### Optional: Run tests

```bash
cd server
npm test
```
