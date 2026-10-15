# Pharmacy Distribution ERP — Architecture Guide

**Version:** 1.0  
**Generated:** 2026-10-15

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         BROWSER / CLIENT                                  │
│                  React 19 + Vite + TypeScript + Tailwind                  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTPS  (Axios)
┌────────────────────────────────▼─────────────────────────────────────────┐
│                          NGINX (frontend)                                  │
│                       Serves static SPA build                              │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ Reverse proxy  /api/*
┌────────────────────────────────▼─────────────────────────────────────────┐
│                        GO GIN API SERVER  (:8080)                          │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  Middleware Chain                                                   │   │
│  │  CORS → CompanyAuthMiddleware → BranchAccessMiddleware             │   │
│  │  → SoftwareAccessMiddleware → RequirePermission                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────┬──────────────┬────────────┬───────────────────────────┐  │
│  │  Control    │   Finance    │ Inventory  │    Invoice Center         │  │
│  │  Center     │   Module     │   Module   │       Module              │  │
│  │  Handlers   │   Handlers   │  Handlers  │      Handlers             │  │
│  └─────────────┴──────────────┴────────────┴───────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Services + Repositories  (GORM)                        │   │
│  └──────────────────────────┬──────────────────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │
             ┌────────────────┴────────────────┐
             │                                 │
┌────────────▼──────────────┐    ┌─────────────▼─────────────┐
│     MySQL (per company)    │    │        Redis Cache         │
│   erp_<company_code>       │    │   Country list, API resp   │
└────────────────────────────┘    └───────────────────────────┘
```

---

## 2. Multi-Tenancy Architecture

### Database-per-Company Model
- **Platform DB** (`erp_platform`): Stores company registrations, manages platform-admin operations
- **Company DBs** (`erp_<company_code>`): Each company has a fully isolated MySQL database
- The `CompanyResolver` in `internal/database/` dynamically picks the company DB based on the JWT `company_code` claim on every request

### JWT Structure
```json
{
  "user_id": 1,
  "company_code": "PHARMACO",
  "company_id": 100,
  "active_branch_id": 1,
  "active_software_code": "INVOICE_CENTER",
  "exp": 1734567890
}
```

### Session Management
- Access tokens: short-lived (configurable, default 15 min per `.env.example`)
- Refresh tokens: longer-lived (24h)
- Branch switching: `POST /api/v1/auth/switch-branch` — issues new JWT with updated `active_branch_id`
- Software switching: `POST /api/v1/auth/switch-software` — issues new JWT with updated `active_software_code`

---

## 3. Backend Code Organisation

```
backend/
├── cmd/                    Application entry point
├── internal/
│   ├── auth/               Login, refresh, me, context, switch-branch/software handlers
│   ├── company/            Core shared models (User, Branch, Role, etc.)
│   │   ├── models/         24 GORM model files
│   │   ├── migrations/     Company DB auto-migrate
│   │   ├── repositories/
│   │   ├── seeders/        Default permissions, roles seeding
│   │   └── services/
│   ├── config/             Config struct, env loading
│   ├── control/            Control Center module
│   │   ├── handlers/       19 handler files
│   │   ├── routes.go       Route registration
│   │   ├── services/
│   │   └── repositories/
│   ├── database/           DB connection pool + CompanyResolver
│   ├── finance/            Finance module
│   │   ├── handlers/       ~30 handler files
│   │   ├── models/         37 model files
│   │   ├── migrations/     Auto-migrate
│   │   ├── routes.go
│   │   ├── services/
│   │   └── repositories/
│   ├── inventory/          Inventory module
│   │   ├── handlers/       ~25 handler files
│   │   ├── models/         31 model files
│   │   ├── routes.go
│   │   ├── services/
│   │   └── repositories/
│   ├── invoicecenter/      Invoice Center module
│   │   ├── handlers/
│   │   ├── models/         23 model files
│   │   ├── routes/
│   │   │   └── invoice_center_routes.go
│   │   ├── services/
│   │   └── repositories/
│   ├── middleware/         Auth, branch, software, permission, cache middlewares
│   ├── platform/           Platform admin handlers (company provisioning)
│   ├── router/             Main Gin router (router.go)
│   └── security/           JWT (jwt.go), password (password.go), encryption (encrypt.go)
```

---

## 4. Frontend Code Organisation

```
frontend/src/
├── components/             Shared UI components
├── hooks/                  Custom React hooks (useAuth, useCompany, etc.)
├── layouts/                AdminLayout, AuthLayout wrappers
├── pages/                  One directory per module
│   ├── control-center/
│   ├── finance/
│   ├── inventory/
│   ├── invoice-center/
│   └── compliance/
├── routes.tsx              Central lazy-loaded route definitions
├── services/               Axios service functions per module
├── store/                  Zustand state stores
├── types/                  TypeScript type definitions
└── utils/                  Date formatting, number formatting, etc.
```

---

## 5. Permission Architecture

### Permission Naming Convention
```
<module>.<resource>.<action>
```
Examples:
- `control.user.create`
- `finance.journal.approve`
- `inventory.grn.post`
- `invoice_center.sales_invoice.view`

### Access Control Layers
1. **JWT validation** — `CompanyAuthMiddleware` verifies signature and expiry
2. **Branch access** — `BranchAccessMiddleware` checks user has access to the branch in their JWT claim
3. **Software access** — `SoftwareAccessMiddleware` checks `active_software_code` in JWT is enabled for the user
4. **Permission check** — `RequirePermission()` checks if the user's roles grant the specific permission
5. **Row-level** — `company_id` filters on all queries prevent cross-company data leakage

### Role → Permission Flow
```
User
 └── UserBranchRole (per branch)
      └── Role
           └── RolePermission[]
                └── Permission (module.resource.action)
```

Users can also have direct permissions via the access matrix (`user_organization_assignments`).

---

## 6. Document Lifecycle State Machine

All transactional documents follow this state machine:

```
        ┌─────────────────────────────────────────────────────┐
        │                    DRAFT                            │
        │    (default on create)                              │
        └─────────────────────────┬───────────────────────────┘
                                  │ submit
        ┌─────────────────────────▼───────────────────────────┐
        │                  SUBMITTED                          │
        └─────────┬────────────────────────┬──────────────────┘
                  │ approve                 │ reject
        ┌─────────▼────────────┐   ┌───────▼──────────────────┐
        │     APPROVED         │   │       REJECTED            │
        └─────────┬────────────┘   └───────────────────────────┘
                  │ post
        ┌─────────▼────────────┐
        │      POSTED          │  ← Irreversible (committed to GL/Stock)
        └──────────────────────┘
```

Some documents (Journal Entries) also support:
- `reverse` — creates a reversing journal entry
- `cancel` — available on invoices before posting

---

## 7. Finance Integration Architecture

The Invoice Center integrates with Finance through a two-stage finance posting system:

```
Sales Invoice APPROVED
        │
        ▼ (separate action)
POST /invoice-center/finance-posting/sales-invoice/:id/post
        │
        ▼
InvoiceCenterFinancePosting record created
        │
        ▼
GeneralLedgerEntry records created (debit AR, credit Revenue + Tax)
        │
        ▼
sales_invoices.finance_post_status = "posted"
```

Finance settings (chart of account mappings for AR, revenue, tax accounts) are configured per-company in `invoice_center_finance_settings`.

---

## 8. Inventory ↔ Invoice Center Integration

When a sales invoice is posted:
1. `stock_ledger_entries` are created for each line item (quantity out)
2. `stock_balances` are updated for the warehouse + product + batch
3. The sales invoice records the `warehouse_id` for the delivery warehouse

Lookups from Invoice Center to Inventory:
- `GET /invoice-center/lookups/products` — product search
- `GET /invoice-center/lookups/product-batches` — batch lookup with expiry
- `GET /invoice-center/lookups/stock-availability` — real-time stock check
- `GET /invoice-center/lookups/warehouses` — warehouse list

---

## 9. Environment Configuration

Key environment variables (from `.env.example`):

| Variable | Purpose |
|---|---|
| `APP_NAME` | Application name |
| `APP_ENV` | `development` / `production` |
| `APP_PORT` | API server port (default 8080) |
| `PLATFORM_DB_HOST/PORT/NAME/USER/PASSWORD` | Platform MySQL connection |
| `REDIS_HOST/PORT/PASSWORD/DB` | Redis connection |
| `JWT_SECRET` | JWT signing secret (must be changed) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_ACCESS_EXPIRY_MINUTES` | Access token TTL (default 15) |
| `JWT_REFRESH_EXPIRY_HOURS` | Refresh token TTL (default 24) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins |
| `RATE_LIMIT_LOGIN_PER_MINUTE` | Login rate limit (default 5) |
| `RATE_LIMIT_API_PER_MINUTE` | API rate limit (default 100) |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` |
| `LOG_FORMAT` | `json` / `console` |

---

## 10. API Base URL Convention

All API endpoints are prefixed with `/api/v1/`. Module prefixes:

| Module | Prefix |
|---|---|
| Authentication | `/api/v1/auth/` |
| Control Center | `/api/v1/control/` |
| Finance | `/api/v1/finance/` |
| Inventory | `/api/v1/inventory/` |
| Invoice Center | `/api/v1/invoice-center/` |
| Platform Admin | `/api/v1/platform-admin/` |
| Health | `/api/v1/health` |
| Countries | `/api/v1/countries` |
