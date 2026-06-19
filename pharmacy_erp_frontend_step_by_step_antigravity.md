# Pharmacy Distribution ERP — Frontend Step-by-Step Development Guideline

## Project Rule

Build the frontend first using React + Vite, but do not build everything as one large module.

The ERP must be developed as five separate modules:

1. Control Center
2. Finance
3. Inventory
4. Invoice Center
5. Compliance Center

Each module must be developed step by step. Do not connect modules deeply at the beginning. First complete each module's frontend flow using mock data. Backend integration can come later.

---

# Step 1 — Prepare the Frontend Project

## Goal
Create the base frontend project and confirm it runs correctly.

## Tasks
- Create the React + Vite frontend project.
- Use TypeScript.
- Install required UI, form, routing, validation, and API libraries.
- Set the base theme colors.
- Set the application name as Pharmacy Distribution ERP.

## Theme Direction
- Primary color: Navy blue
- Background: White / light grey
- Accent: Soft blue or green for success states
- Warning: Amber
- Danger: Red

## Completion Check
- Project runs successfully.
- Basic blank dashboard loads.
- No module development yet.

---

# Step 2 — Create the Main ERP Layout

## Goal
Build the base ERP shell before building module pages.

## Tasks
- Create a left sidebar.
- Create a top navigation bar.
- Create a main content area.
- Add module names to the sidebar.
- Add user profile area in the top bar.
- Add company selector placeholder.
- Add branch selector placeholder.

## Sidebar Modules
- Dashboard
- Control Center
- Finance
- Inventory
- Invoice Center
- Compliance Center
- Reports
- Settings

## Completion Check
- Sidebar is visible.
- Top bar is visible.
- User can switch between placeholder module pages.
- Layout looks clean and professional.

---

# Step 3 — Create Common UI Components

## Goal
Create reusable UI parts before building ERP pages.

## Tasks
Create reusable components for:

- Page title
- Action button
- Search bar
- Filter section
- Data table
- Status badge
- Form input
- Dropdown
- Date picker placeholder
- Modal
- Confirmation dialog
- Empty state
- Loading state
- Error state

## Completion Check
- All modules can reuse the same table, forms, buttons, and badges.
- UI is consistent across the ERP.
- Do not design each page differently.

---

# Step 4 — Create Mock Data System

## Goal
Allow frontend development without waiting for the Go backend.

## Tasks
- Create mock data for each module.
- Create mock list data.
- Create mock detail data.
- Create mock status values.
- Create mock user permissions.

## Mock Data Required
- Companies
- Branches
- Users
- Roles
- Permissions
- Chart of accounts
- Journal entries
- Products
- Batches
- Warehouses
- GRNs
- Sales orders
- Invoices
- Credit notes
- Customer receipts
- License documents
- Batch recalls
- Batch holds

## Completion Check
- Every module page can display sample data.
- No backend API is required at this stage.
- Data should look realistic for a pharmacy distribution business.

---

# Step 5 — Build Control Center First

## Goal
Develop the admin foundation of the ERP.

## Pages to Build
1. Company Management
2. Branch Management
3. User Management
4. Role Management
5. Permission Management
6. Designation Management
7. Settings
8. Audit Logs

## Page Requirements
Each main page should have:

- List view
- Search
- Filter
- Add button
- Edit option
- View details option
- Active/inactive status
- Basic validation

## Important Rules
- Users belong to a company.
- Users can be assigned to branches.
- Users can have roles.
- Roles contain permissions.
- Audit logs must be visible, but not editable.

## Completion Check
- Admin can manage company data.
- Admin can manage users.
- Admin can assign roles.
- Admin can view audit logs.
- No finance, inventory, invoice, or compliance logic yet.

---

# Step 6 — Build Finance Module

## Goal
Develop the accounting frontend module separately.

## Pages to Build
1. Chart of Accounts
2. Journal Entries
3. General Ledger
4. Accounts Receivable
5. Accounts Payable
6. Payments
7. Receipts
8. Bank Accounts
9. Tax Settings
10. Finance Reports

## Page Requirements
Finance pages should support:

- Listing records
- Viewing details
- Creating draft entries
- Approval status display
- Posted status display
- Reversed status display
- Date filters
- Branch filters
- Export placeholder

## Important Rules
- Posted journal entries cannot be edited.
- Reversal must be shown as a separate action.
- Debit and credit totals must be displayed clearly.
- Finance must be treated as its own module.

## Completion Check
- Chart of accounts page is complete.
- Journal entry list and create flow are complete.
- GL page can display ledger movements.
- Payment and receipt pages display mock data.
- Finance reports can show placeholder report cards.

---

# Step 7 — Build Inventory Module

## Goal
Develop pharmacy-specific stock management frontend.

## Pages to Build
1. Product Management
2. Batch Management
3. Expiry Management
4. Warehouse Management
5. GRN Management
6. Stock Transfers
7. Stock Adjustments
8. Stock Ledger

## Page Requirements
Inventory pages should show:

- Product code
- Product name
- Generic name
- Brand
- Batch number
- Expiry date
- Warehouse
- Available quantity
- Reserved quantity
- Stock status

## Important Rules
- Products must support batch tracking.
- Expiry date must be visible in stock views.
- Stock ledger must be read-only.
- Stock adjustment must require a reason.
- Expired, recalled, or blocked batches must show clear status badges.

## Completion Check
- Product list is complete.
- Batch-wise stock list is complete.
- GRN flow is visible.
- Stock transfer and adjustment pages are visible.
- Stock ledger shows movement history using mock data.

---

# Step 8 — Build Invoice Center

## Goal
Develop the sales, billing, and customer payment module.

## Pages to Build
1. Sales Orders
2. Invoices
3. Invoice Items
4. Credit Notes
5. Debit Notes
6. Customer Receipts
7. Customer Outstanding

## Page Requirements
Invoice pages should show:

- Customer name
- Document number
- Document date
- Due date
- Total amount
- Paid amount
- Balance amount
- Status
- Created by
- Posted by

## Important Rules
- Invoice draft can be edited.
- Posted invoice cannot be edited.
- Credit note must be separate from invoice editing.
- Customer receipt must support allocation against invoices.
- Invoice items must show batch number and expiry date.

## Completion Check
- Sales order page is complete.
- Invoice list and invoice detail view are complete.
- Credit note and debit note pages are visible.
- Customer receipt page is complete.
- Outstanding amount view is available.

---

# Step 9 — Build Compliance Center

## Goal
Develop pharmaceutical compliance tracking frontend.

## Pages to Build
1. NMRA / License Documents
2. Product Registration Records
3. Batch Recalls
4. Batch Holds
5. Expiry Disposal
6. Regulatory Records
7. Complaint Records

## Page Requirements
Compliance pages should show:

- Document type
- Product
- Batch number
- License number
- Expiry date
- Status
- Responsible person
- Remarks
- Attachment placeholder

## Important Rules
- Compliance records must not be deleted directly.
- Batch recall records must show affected batch and product.
- Batch hold/release must have reason and user trail.
- Expiry disposal must record product, batch, quantity, and reason.

## Completion Check
- License document tracking is visible.
- Batch recall page is complete.
- Batch hold page is complete.
- Expiry disposal page is complete.
- Regulatory record page is complete.

---

# Step 10 — Add Permission-Based Frontend Control

## Goal
Make the frontend respect user roles and permissions.

## Tasks
- Create mock logged-in user.
- Create mock permission list.
- Hide buttons if user does not have permission.
- Disable actions if user has view-only permission.
- Show unauthorized state for restricted pages.

## Permission Examples
- control_center.users.create
- control_center.roles.update
- finance.journal.post
- inventory.stock_adjustment.approve
- invoice.invoice.post
- compliance.batch_recall.create

## Completion Check
- Buttons are hidden based on permission.
- Restricted pages show access denied.
- Frontend is ready for backend permission API later.

---

# Step 11 — Add Status Workflows

## Goal
Standardize document statuses across the ERP.

## Common Statuses
- Draft
- Pending Approval
- Approved
- Posted
- Rejected
- Cancelled
- Reversed
- Closed

## Module-Specific Statuses
Inventory:
- Available
- Reserved
- Quarantine
- Expired
- Damaged
- Recalled
- Blocked

Invoice:
- Unpaid
- Partially Paid
- Paid
- Overdue

Compliance:
- Active
- Expiring Soon
- Expired
- Under Review
- Released

## Completion Check
- Status badges are consistent.
- Each module uses the same visual language.
- Users can understand document state quickly.

---

# Step 12 — Add Dashboard Summary

## Goal
Create a useful ERP dashboard after main modules exist.

## Dashboard Cards
- Total sales today
- Pending invoices
- Outstanding customer balance
- Low stock products
- Near expiry batches
- Pending GRNs
- Pending approvals
- Compliance alerts

## Dashboard Tables
- Recent invoices
- Recent stock movements
- Upcoming expiry batches
- Pending approvals

## Completion Check
- Dashboard gives quick business overview.
- Dashboard uses mock data only.
- No backend integration yet.

---

# Step 13 — Prepare API Contract Notes for Go Backend

## Goal
Prepare frontend for backend connection without rewriting pages.

## Tasks
For each page, define:

- List API requirement
- Detail API requirement
- Create API requirement
- Update API requirement
- Delete or deactivate API requirement
- Approval API requirement
- Post API requirement

## Example API Contract Notes
For invoices:

- Get invoice list
- Get invoice details
- Create invoice draft
- Update invoice draft
- Post invoice
- Cancel invoice
- Create credit note
- Get customer receipt allocation

## Completion Check
- Each page has clear backend requirements.
- Go backend developer can understand what endpoints are needed.
- Frontend can later replace mock data with API calls.

---

# Step 14 — Replace Mock Data With Go Backend APIs

## Goal
Connect frontend to the real backend gradually.

## Recommended Order
1. Authentication
2. Company and branch data
3. Users, roles, permissions
4. Products and warehouses
5. Chart of accounts
6. Customers and suppliers
7. GRN
8. Stock ledger
9. Sales orders
10. Invoices
11. Receipts and payments
12. Compliance records
13. Reports

## Important Rule
Do not connect all APIs at once.

Connect one module at a time.

## Completion Check
- Mock data can be switched off gradually.
- Pages continue working after API integration.
- Loading, error, and empty states are handled.

---

# Step 15 — Final Frontend Quality Check

## Goal
Make the ERP frontend production-ready.

## Checklist
- All pages have loading state.
- All pages have empty state.
- All pages have error state.
- All forms have validation.
- All tables have search and filter.
- All important actions have confirmation dialogs.
- Posted documents cannot show edit action.
- Audit log pages are read-only.
- User permissions are respected.
- Status badges are consistent.
- Mobile/tablet layout is acceptable for basic viewing.
- Desktop layout is optimized for daily ERP users.

---

# Final Development Order

Follow this exact order:

1. Base project setup
2. ERP layout
3. Common UI components
4. Mock data system
5. Control Center
6. Finance
7. Inventory
8. Invoice Center
9. Compliance Center
10. Permission-based frontend control
11. Status workflows
12. Dashboard
13. API contract notes
14. Go backend API integration
15. Final frontend quality check

---

# Important Instruction for Antigravity

Build this project step by step.

Do not generate the full ERP at once.

Complete one step, verify it, then continue to the next step.

Do not merge the five modules.

Keep the modules separate:

- Control Center
- Finance
- Inventory
- Invoice Center
- Compliance Center

Use mock data first.

Do not wait for the backend.

Do not create backend code during frontend development.

Keep the frontend clean, modular, and ready for Go API integration later.
