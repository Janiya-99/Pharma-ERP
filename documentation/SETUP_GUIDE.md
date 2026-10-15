# Pharmacy Distribution ERP — Setup & Deployment Guide

**Version:** 1.0  
**Generated:** 2026-10-15

---

## Prerequisites

| Requirement | Version |
|---|---|
| Go | 1.25+ |
| Node.js | 20+ |
| MySQL | 8.0+ |
| Redis | 7+ |
| Docker + Docker Compose | Optional (recommended) |

---

## 1. Backend Setup

### 1.1 Clone and Configure
```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
```

Key `.env` values to change:
```env
APP_ENV=development
PLATFORM_DB_HOST=localhost
PLATFORM_DB_PORT=3306
PLATFORM_DB_NAME=erp_platform
PLATFORM_DB_USER=your_user
PLATFORM_DB_PASSWORD=your_password
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=your_32_char_secret_here
JWT_REFRESH_SECRET=your_32_char_refresh_secret_here
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 1.2 Create Platform Database
```sql
CREATE DATABASE erp_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
The application auto-migrates the platform schema on first run.

### 1.3 Run the Backend
```bash
cd backend
go mod download
go run cmd/main.go
```
The API server starts on port 8080 (or the port in `APP_PORT`).

### 1.4 Verify
```bash
curl http://localhost:8080/api/v1/health
# Expected: {"status":"ok"}
```

---

## 2. Frontend Setup

### 2.1 Install Dependencies
```bash
cd frontend
npm install
```

### 2.2 Configure Environment
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2.3 Run Development Server
```bash
npm run dev
# Starts at http://localhost:3000
```

### 2.4 Build for Production
```bash
npm run build
# Output in dist/
```

---

## 3. Docker Compose Setup (Recommended)

```bash
# From the project root
docker-compose up -d
```

This starts:
- MySQL on port 3306
- Redis on port 6379
- Go API on port 8080
- Nginx + React on port 80

---

## 4. Onboarding a New Company

Once the backend is running, use the Platform Admin API to provision a new company:

```bash
# 1. Authenticate as platform admin
POST /api/v1/platform-admin/login

# 2. Create the company
POST /api/v1/platform-admin/companies
{
  "company_code": "PHARMACO",
  "company_name": "Pharma Co Ltd",
  "registration_number": "PV12345",
  "tax_number": "123456789V"
}
```

This creates the company record and auto-provisions the company database with all tables.

---

## 5. First-Time ERP Setup Sequence

After company is provisioned, log in as the company admin and perform in this order:

1. **Control Center → Company** — Set logo, address, phone, email
2. **Control Center → Branches** — Create at least one branch
3. **Control Center → Departments** — Create org departments
4. **Control Center → Designations** — Create job designations, link to departments
5. **Control Center → Users** — Create user accounts
6. **Control Center → Roles & Permissions** — Define roles, assign permissions
7. **Control Center → User Access** — Assign users to branches and roles
8. **Control Center → Document Numbering** — Configure invoice/GRN number formats
9. **Control Center → Approval Settings** — Set up approval workflows
10. **Finance → Financial Years** — Create and open the current financial year
11. **Finance → Accounting Periods** — Create monthly periods
12. **Finance → Account Classifications** — Set up classifications (Assets, Liabilities, etc.)
13. **Finance → Chart of Accounts** — Build the COA hierarchy
14. **Finance → Tax Settings** — Configure VAT/SSCL rates
15. **Finance → Opening Balances** — Enter opening account balances
16. **Inventory → Warehouses** — Create warehouse(s)
17. **Inventory → Product Master** — Set up units, dosage forms, generic names, manufacturers, suppliers, categories
18. **Inventory → Products** — Register medicines and products
19. **Inventory → Opening Stock** — Enter initial stock balances
20. **Invoice Center → Finance Settings** — Map chart of accounts for AR, revenue, tax
21. **Invoice Center → Customers** — Register customer pharmacies

---

## 6. User Management

### Creating a User
```
Control Center → Users → Create User
```
Required fields:
- Name, Email, Employee Code
- Department, Designation, Default Branch
- Set initial password (user will be prompted to change if `force_password_change = true`)

### Assigning Access
1. Go to the user's profile
2. Under **Branch Access** — add the branches this user can access
3. Under **Software Access** — enable the software modules (INVOICE_CENTER, etc.)
4. Under **Role Assignment** — assign roles per branch
5. Optionally set direct permissions via the Access Matrix

---

## 7. Security Configuration

### Security Settings (Control Center → Security Settings)
- **Password Policy**: Minimum length, complexity requirements, expiry days
- **Login Policy**: Max failed attempts, lockout duration, max concurrent sessions
- **MFA**: Optional/required MFA policy
- **Trusted IPs**: IP whitelist/blacklist rules
- **Backup Policies**: Automated backup scheduling

### JWT Security
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` before production
- Secrets must be at least 32 characters

---

## 8. Log Levels

| Level | Use Case |
|---|---|
| `debug` | Development: full request/response detail |
| `info` | Production: operational events |
| `warn` | Non-critical errors |
| `error` | Critical failures |

Set via `LOG_LEVEL` in `.env`. Log output format via `LOG_FORMAT=json` or `LOG_FORMAT=console`.
