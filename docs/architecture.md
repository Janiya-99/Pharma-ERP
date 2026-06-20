# Pharma ERP Architecture

## Main Architecture

- One domain
- One Go backend
- One React frontend
- One platform database
- One separate database per company

## Platform Database

Database name:

erp_platform

Purpose:

- Store registered companies
- Store company database connection details
- Store software/module subscription details

## Company Database

Each company has its own database.

Example:

- erp_omacx
- erp_abc_pharma

Each company database stores:

- Company profile
- Branches
- Users
- Roles
- Permissions
- User branch access
- User software access
- ERP transactions

## Access Model

One user can have:

- Multiple branch access
- Multiple software access
- Different role per branch
- Different role per software

## Important Rule

Do not use tenant_id inside company databases.

Use:

- company_id
- branch_id
- created_by
- updated_by
- created_at
- updated_at
- deleted_at
