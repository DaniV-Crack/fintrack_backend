# FinTrack Backend — Agent Guide

## Quick start
```bash
cp .env.example .env      # then edit DATABASE_URL
npm install
npx prisma migrate deploy
npm run dev               # ts-node-dev with hot reload at :3000
```

## Commands
| `npm run dev`  | dev server (ts-node-dev, respawn on change) |
| `npm run build` | `tsc` → `dist/` |
| `npm start`    | `node dist/index.js` |
| `npx prisma migrate dev` | create+apply migration |
| `npx prisma migrate deploy` | apply pending migrations in prod |

No test/lint/typecheck scripts exist.

## Architecture
- **Express 5** + **TypeScript** (strict, ES2020, commonjs)
- **Prisma ORM v7** (needs `prisma.config.ts`, not legacy `prisma` CLI flags)
- **PostgreSQL** — schema uses snake_case (`@@map("users")`, `@map("password_hash")`)
- Layered: `routes/*` → `controllers/*` → `services/*` → `models/*` (DTOs) + Prisma Client
- Singleton `PrismaClient` in `src/config/prisma.ts` (global cache for ts-node-dev hot reload)
- Also uses raw `pg.Pool` (`src/config/database.ts`) — health endpoint only

## State of implementation
- **Users**: full CRUD wired (`/api/users`)
- **Categories / Transactions / Budgets**: DTO models defined, but controllers, services, and routes are **empty files**. Not wired in `src/index.ts`.
- Middlewares and utils dirs are empty.

## Notable quirks
- Password stored in **plaintext** (`user.service.ts:37`); TODO for bcrypt
- `dotenv.config()` called in both `src/index.ts` and `src/config/database.ts`
- TypeScript 6.x, Prisma v7.9, Express 5
- All model IDs are UUIDs
- Skills lock installed Prisma agent skills under `.agents/skills/` and `.claude/skills/`
