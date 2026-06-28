# Pharma ERP System

A modern, comprehensive Enterprise Resource Planning (ERP) system designed specifically for pharmaceutical distribution and management.

## Project Structure
This repository contains two main projects:
- **`frontend/`**: The React/Vite web application with a modern Tailwind CSS & Shadcn UI dashboard.
- **`backend/`**: The Go/Gin RESTful API that serves the frontend and interacts with the MySQL database.

---

## Frontend Standard
All frontend application code must use TypeScript, React + Vite, shadcn/ui components, and Tailwind CSS.

- Use TypeScript only.
- Use `.tsx` for React components.
- Use `.ts` for API, hooks, utilities, and types.
- Use shadcn/ui components for UI.
- Do not create `.js` or `.jsx` frontend application files.
- Use `react-hook-form` and `zod` for forms and validation where suitable.

Future frontend implementation steps must explicitly mention these rules.

---

## 🚀 Running the Project Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Go](https://go.dev/) (v1.20 or higher)
- [MySQL](https://www.mysql.com/) Database (Running locally or via Docker/Laradock)
- [Goose](https://github.com/pressly/goose) (For Go database migrations)

### 1. Database Setup
Ensure you have a MySQL server running (e.g., via Laradock) with a database created for the ERP system.
Default database name: `erp_phrma`.

### 2. Backend (Go/Gin API)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your MySQL database credentials (e.g., `DB_USER=root`, `DB_PASSWORD=root`, `DB_PORT=3306`).
4. Run the database migrations using `goose` to set up the schema and seed data:
   ```bash
   goose -dir db/migrations mysql "root:root@tcp(127.0.0.1:3306)/erp_phrma?parseTime=true" up
   ```
5. Start the Go server:
   ```bash
   go run main.go
   ```
   *(Alternatively, if you have `air` installed, you can just run `air` for hot-reloading).*

The backend API will now be running on `http://localhost:8888`.

### 3. Frontend (React/Vite Dashboard)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend dashboard will be available at `http://localhost:5173`.

---

## 🔐 Authentication
The system uses JWT-based authentication. When the backend migrations run, an initial admin user is seeded into the database.

Use the following credentials to log in:
- **Email**: `admin@example.com`
- **Password**: `password123`

---

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Zustand, Tanstack Table, ApexCharts
- **Backend**: Go, Gin Web Framework, GORM, Goose Migrations
- **Database**: MySQL
