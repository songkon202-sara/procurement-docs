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

cp .env.example .env        # set a real JWT_SECRET beyond local dev
npx prisma migrate dev      # creates tables from prisma/schema.prisma
npx prisma db seed          # creates the roles + one bootstrap admin account (prints its password once)

npm run dev                 # http://localhost:3001
```

## Logging in and provisioning accounts

There's no self-registration — an internal government tool provisions accounts, it doesn't
let people sign themselves up. `npx prisma db seed` creates the first admin; log in with it,
create real accounts through `POST /users`, then treat the seeded admin as break-glass only.

```bash
TOKEN=$(curl -s http://localhost:3001/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@example.go.th","password":"<printed by the seed command>"}' | jq -r .token)

curl -X POST http://localhost:3001/users -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"fullName":"นางสาวสุนีย์รัตน์ มงคลมะไฟ","position":"พยาบาลวิชาชีพชำนาญการ","email":"suneerat@example.go.th","password":"<min 8 chars>","roleCodes":["procurement_officer"]}'
```

`GET /health` and `POST /auth/login` need no auth. Every other route requires
`Authorization: Bearer <token>` from `/auth/login` — see `src/middleware/auth.ts` /
`src/domain/auth.ts`. Tokens are valid 8 hours; a role granted via `POST /users` (or revoked)
takes effect on the holder's next login, not retroactively on an existing token.

## Creating and driving a case

```bash
# find or register a vendor (upserts by tax_id — reuses an existing row for the same tax id)
curl -X POST http://localhost:3001/vendors -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"legalName": "ร้านไอทีอุบล จำกัด", "taxId": "9876543210123"}'

curl -X POST http://localhost:3001/cases -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"category":"purchase","projectName":"จัดซื้อหมึกพิมพ์","method":"เฉพาะเจาะจง","legalRef":"มาตรา 56 วรรคหนึ่ง (2) (ข)","amount":5000,"vendorId":"<vendor id>"}'

# editable (line items / members / everything) only while status = draft
curl -X PATCH http://localhost:3001/cases/<id> -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"lineItems":[{"name":"หมึกพิมพ์ HP 680","qty":5,"unit":"กล่อง","unitPrice":1000}]}'

curl -X POST http://localhost:3001/cases/<id>/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:3001/cases/<id>/review_pass -H "Authorization: Bearer $AUDITOR_TOKEN" -d '{}'
curl -X POST http://localhost:3001/cases/<id>/approve -H "Authorization: Bearer $APPROVER_TOKEN" -d '{}'

curl http://localhost:3001/cases/<id> -H "Authorization: Bearer $TOKEN"          # full case + approvals history
curl "http://localhost:3001/cases?status=draft&mine=true" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:3001/vendors?search=อุบล" -H "Authorization: Bearer $TOKEN"
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

- Token revocation before expiry (deactivating a user via `is_active` blocks their *next*
  login, but an already-issued token stays valid until it naturally expires in ≤8h)
- Password reset / "forgot password" flow
- Multi-level approval by amount (explicitly out of scope for now — see workflow design notes)
