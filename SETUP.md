# Setup & Run Instructions

This project has two parts that both need to run at the same time: the **backend**
(Spring Boot, port 8080) and the **frontend** (Vite dev server, default port 5173).

## Prerequisites

Install these before starting:

- **Java 21+** — https://adoptium.net
- **PostgreSQL 14+** — https://www.postgresql.org/download/
  (pgAdmin is bundled with the installer — useful for managing the database visually)
- **Bun** — install with:
  - Windows (PowerShell): `powershell -c "irm bun.sh/install.ps1 | iex"`
  - Mac/Linux: `curl -fsSL https://bun.sh/install | bash`
- **Git**
- An IDE — IntelliJ IDEA (backend) and VS Code (frontend) recommended

## 1. Clone the repository

```bash
git clone https://github.com/sujan2050/harvest-ledger.git
cd harvest-ledger
```

## 2. Set up PostgreSQL

1. Start your PostgreSQL server.
2. Create the database:
```sql
   CREATE DATABASE farmer_procurement_db;
```
   You can do this via `psql -U postgres` or pgAdmin's Create → Database dialog.

## 3. Configure and run the backend

```bash
cd backend
```

Set your database credentials as environment variables:

**Windows (PowerShell):**
```powershell
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_actual_postgres_password"
```

**Mac/Linux:**
```bash
export DB_USERNAME=postgres
export DB_PASSWORD=your_actual_postgres_password
```

Then run:
```bash
./mvnw spring-boot:run
```
(or open the `backend` folder in IntelliJ and run `FarmerProcurementSystemApplication`
directly — set the same environment variables in IntelliJ's Run Configuration under
"Environment variables" if you use this route)

The backend must be running on port 8080. On startup, Hibernate automatically creates
all required tables in `farmer_procurement_db`.

## 4. Configure and run the frontend

Open a **new** terminal (keep the backend running in the first one):

```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```

Check `.env` — it should contain:

VITE_API_BASE_URL=http://localhost:8080/api



**Port note:** the frontend dev server may try to use port 8080 by default, which
conflicts with the backend. If you see `Port 8080 is in use, trying another one...`,
that's expected — it automatically falls back to 8081 or another free port. Use
whichever URL is printed in the terminal.

To force a specific port instead:
```bash
bun run dev --port 5173
```

## 5. Create your first admin account

Register your first user through the frontend's Register screen, selecting **Admin**
as the role. Use that account to add at least one Procurement Centre and one Crop
Type (Admin Panel) before testing the Farmer flow — token generation requires at
least one of each to exist.

## Troubleshooting

**"Port already in use" errors** — either stop whatever's using that port, or let
Vite auto-select a new one (it prints the URL it picked).

**Backend fails to connect to the database** — confirm PostgreSQL is running, the
database `farmer_procurement_db` exists, and your `DB_USERNAME`/`DB_PASSWORD`
environment variables match your actual PostgreSQL login.

**Frontend shows "Failed to fetch" on login/register** — confirm the backend is
running and reachable at the URL in `frontend/.env`'s `VITE_API_BASE_URL`. Both
must run locally at the same time, in separate terminals.

**CORS errors in the browser console** — the backend's `CorsConfig` allows all
origins for development by default; if modified, ensure it still permits your
frontend's actual origin/port.

