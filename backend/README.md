# procurement-docs backend

Node.js + TypeScript + Express + Prisma/PostgreSQL API implementing RBAC, the case
approval workflow, vendor master data, and an immutable audit log for the procurement
document manager. See `src/domain/workflow.ts` for the full state machine and
`src/domain/performAction.ts` for the transaction that enforces it.

## Run locally

```bash
npm install

# Postgres — either:
docker compose up -d
# or point DATABASE_URL in .env at any Postgres 14+ instance you already have running

cp .env.example .env
npx prisma migrate dev   # creates tables from prisma/schema.prisma

npm run dev               # http://localhost:3001
```

`GET /health` needs no auth. Every other route requires `x-user-id` (a real `users.id`)
and `x-user-roles` (comma-separated role codes) headers — there is no login flow yet;
see the warning in `src/middleware/auth.ts`.

## Driving a case through the workflow

```bash
curl -X POST http://localhost:3001/cases/<id>/submit \
  -H "x-user-id: <owner user id>" -H "x-user-roles: procurement_officer" \
  -H "Content-Type: application/json" -d '{}'

curl -X POST http://localhost:3001/cases/<id>/review_pass \
  -H "x-user-id: <auditor id>" -H "x-user-roles: auditor" -d '{}'

curl -X POST http://localhost:3001/cases/<id>/approve \
  -H "x-user-id: <approver id>" -H "x-user-roles: approver" -d '{}'

curl http://localhost:3001/cases/<id>   # full case + approvals history
```

Every transition is validated against `TRANSITIONS` in `src/domain/workflow.ts`
(current status, role, ownership, required comment) and, on `submit`, against
`src/domain/validation.ts` (the 500,000-baht threshold / VAT checks ported from the
frontend's `src/lib/validation.ts`). Every successful transition writes one row to
`case_approvals` (the business workflow log) and one row to `audit_log` (the generic,
immutable compliance log) in the same transaction as the status change.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the API with hot-reload (`tsx watch`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` / `npm start` | Compiles to `dist/` and runs the compiled output |
| `npm run prisma:migrate` | Creates/applies a Prisma migration from `prisma/schema.prisma` |

## What's not here yet

- Real authentication (session/JWT) — `x-user-id`/`x-user-roles` headers are trusted as-is
- Routes for creating/editing cases, vendors, and users (only the workflow-transition
  routes exist: `POST /cases/:id/:action` and `GET /cases/:id`)
- Multi-level approval by amount (explicitly out of scope for now — see workflow design notes)
