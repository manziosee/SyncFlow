<div align="center">

# SyncFlow

### Real-Time Multiplayer ERP

*A state-synchronized business operating system — combining ERP, Google Docs-style collaboration, live analytics, and AI automation into one platform.*

---

![Elixir](https://img.shields.io/badge/Elixir-1.16-4B275F?style=for-the-badge&logo=elixir&logoColor=white)
![Phoenix](https://img.shields.io/badge/Phoenix-1.7-FD4F00?style=for-the-badge&logo=phoenixframework&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-Storage-FD366E?style=for-the-badge&logo=appwrite&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude_AI-Anthropic-000000?style=for-the-badge&logo=anthropic&logoColor=white)

</div>

---

## What Makes It Different

| Traditional ERP | SyncFlow |
|---|---|
| Refreshes pages | Updates instantly via WebSocket |
| Locks records | Multiple users edit simultaneously |
| Feels slow | Dashboard updates live as data changes |
| Per-module silos | Unified event stream across all domains |
| Audit log as afterthought | Event sourcing — every change is permanent history |
| Batch payroll | Background PAYE calculation with live notification |

---

## Tech Stack

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| **Language** | ![Elixir](https://img.shields.io/badge/Elixir-4B275F?logo=elixir&logoColor=white) Elixir 1.16 + Erlang/OTP 26 | Fault-tolerant concurrency, millions of connections |
| **Web** | ![Phoenix](https://img.shields.io/badge/Phoenix-FD4F00?logo=phoenixframework&logoColor=white) Phoenix 1.7 | HTTP + WebSocket channels + Presence |
| **Architecture** | Commanded 1.4 + EventStore 1.4 | CQRS + Event Sourcing — immutable audit trail |
| **Database** | [Neon PostgreSQL](https://neon.tech) (cloud-hosted) | Event store + read model projections — no local DB needed |
| **File Storage** | [Appwrite](https://appwrite.io) | Document/file uploads replacing AWS S3 |
| **In-Memory** | Erlang ETS (GenServer) | Live GPS cache — 1 000 vehicles × ~200 bytes |
| **Background Jobs** | Oban 2.17 | Async payroll, notifications, report generation |
| **Auth** | Guardian 2.3 (JWT) | Stateless, role + org embedded in token |
| **API Docs** | OpenAPI 3.0 (open_api_spex 3.22) | Interactive Swagger UI |
| **AI** | Groq (primary) → OpenAI → Claude Sonnet → rule-based | Natural language ERP commands with multi-provider fallback |

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white) Next.js 15 (App Router) | React server + client components, file-based routing |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) TypeScript 5 | Type-safe API contracts and component props |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white) Tailwind CSS 3 | Utility-first design system with custom SyncFlow tokens |
| **Data Fetching** | TanStack Query v5 | Server state, caching, background refetch |
| **HTTP Client** | Axios | REST API calls with 401 interceptor → auto logout |
| **Real-time** | Phoenix JS (WebSocket) | Live channels — invoice collaboration, GPS, live feed |
| **Charts** | Recharts | Area charts, bar charts, responsive containers |
| **Icons** | Lucide React | Consistent icon set across all modules |
| **Notifications** | react-hot-toast | Action feedback (success / error toasts) |
| **Demo Mode** | Hardcoded mock data | Offline-capable UI with realistic RWF figures |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       React / Mobile Client                          │
│                REST API  +  WebSocket Channels                       │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP / WS
┌────────────────────────────▼─────────────────────────────────────────┐
│                  Phoenix Web  (Port 4000)                             │
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Router    │  │   Controllers    │  │    WebSocket Channels    │  │
│  │  (REST)    │  │   (12 domains)   │  │  invoice · fleet ·       │  │
│  └────────────┘  └──────────────────┘  │  dashboard · inventory · │  │
│                                        │  notifications           │  │
│                  Guardian JWT Auth     └──────────────────────────┘  │
│                  OpenAPI 3.0 / Swagger    Phoenix Presence            │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ PubSub broadcast
┌────────────────────────────▼─────────────────────────────────────────┐
│                       Phoenix.PubSub                                  │
│          Projectors broadcast events → Channels push to UI            │
└──────┬───────────────┬─────────────┬──────────────┬──────────────────┘
       │               │             │              │
       ▼               ▼             ▼              ▼
  Command          Commanded     Projectors     Event Store
  Dispatch    →   Router &    (update read   (append-only
  (REST/WS)       Aggregates   models in    PostgreSQL)
                  (business    PostgreSQL)
                   rules &
                   validation)
       │
       ▼
  Oban Workers  ──→  PayrollWorker
  (background)       NotificationWorker
                     ReportWorker
                     (email via Mailgun)
```

### CQRS Flow — Editing an Invoice Live

```
Accountant A types in browser
       ↓
WebSocket pushes "update_field" to InvoiceChannel
       ↓
InvoiceChannel.handle_in() dispatches UpdateInvoiceField command
       ↓
Invoice aggregate validates (status == :draft? field allowed?)
       ↓
InvoiceFieldUpdated event appended to PostgreSQL event store
       ↓
InvoiceProjector receives event → updates Invoice read model
       ↓
Projector broadcasts via Phoenix.PubSub
       ↓
ALL connected editors receive "field_updated" push  (<100 ms)
       ↓
Accountant B's screen updates instantly — no refresh needed
```

### Background Payroll Processing

```
POST /api/hr/payroll/:id/process
       ↓
PayrollWorker enqueued via Oban (queue: :payroll)
       ↓  (async — returns 202 immediately)
Worker fetches all active employees
       ↓
Rwanda PAYE calculated per employee:
  0 – 60,000 RWF    →  0%
  60,001 – 100,000  →  20% on excess
  100,001+          →  8,000 + 30% on excess
       ↓
PaySlips inserted in transaction
       ↓
PubSub broadcast to dashboard + personal notification
```

---

## Project Structure

```
syncflow/                            # Umbrella root
├── apps/
│   ├── syncflow_core/               # Foundation
│   │   ├── auth/                    # Guardian JWT, pipeline
│   │   ├── accounts/                # User, Organization schemas
│   │   ├── event_store/             # EventStore + Commanded app
│   │   ├── cldr.ex                  # ex_cldr backend (en/fr, RWF money formatting)
│   │   ├── storage/appwrite.ex      # Appwrite file upload client
│   │   ├── router.ex                # Commanded command router stub
│   │   └── workers/
│   │       ├── payroll_worker.ex    # ★ Oban — async PAYE payroll
│   │       ├── notification_worker.ex # ★ Oban — in-app + email
│   │       └── report_worker.ex     # ★ Oban — async report generation
│   │
│   ├── syncflow_accounting/         # Invoicing & Ledger (CQRS/ES)
│   │   ├── aggregates/invoice.ex    # Invoice state machine
│   │   ├── commands.ex              # CreateInvoice, ApproveInvoice …
│   │   ├── events.ex                # InvoiceCreated, InvoiceApproved …
│   │   ├── projectors/              # Update read models + PubSub broadcast
│   │   ├── queries.ex               # Read model queries + revenue reports
│   │   └── schema/                  # Invoice, LedgerEntry
│   │
│   ├── syncflow_inventory/          # Stock & Warehouses (CQRS/ES)
│   │   ├── aggregates/stock_item.ex # Stock state machine + reservations
│   │   ├── commands.ex              # AdjustStock, TransferStock, ReserveStock …
│   │   ├── projectors/              # Updates + low-stock alerts
│   │   └── queries.ex               # Low-stock queries + inventory value
│   │
│   ├── syncflow_hr/                 # HR & Payroll (Ecto CRUD)
│   │   ├── schema/employee.ex       # Employee record
│   │   ├── schema/payroll_run.ex    # PayrollRun + PaySlip schemas
│   │   └── queries.ex               # PAYE calculation + pay slip generation
│   │
│   ├── syncflow_crm/                # Customer Relations (CQRS/ES)
│   │   ├── aggregates/customer.ex   # Customer state machine
│   │   ├── commands.ex              # RegisterCustomer, RecordInteraction …
│   │   └── queries.ex               # List customers, interaction history, stats
│   │
│   ├── syncflow_fleet/              # Fleet & GPS (CQRS/ES)
│   │   ├── aggregates/vehicle.ex    # Vehicle state machine
│   │   ├── tracker.ex               # ETS GenServer — live GPS in memory
│   │   ├── commands.ex              # StartTrip, UpdateLocation, LogFuelEvent …
│   │   └── queries.ex               # Trip history, fuel costs, fleet summary
│   │
│   └── syncflow_web/                # Phoenix Web Layer
│       ├── commanded_router.ex      # Full Commanded router (compiled last — avoids cross-app ordering)
│       ├── dispatch.ex              # Thin shim: CommandedApp.dispatch/2 interface
│       ├── channels/
│       │   ├── invoice_channel.ex   # Multiplayer invoice editing + presence
│       │   ├── dashboard_channel.ex # Live CEO / Warehouse KPIs
│       │   ├── fleet_channel.ex     # GPS tracking + driver pings
│       │   ├── inventory_channel.ex # Live stock updates
│       │   └── notification_channel.ex # Personal alerts
│       ├── controllers/             # 14 REST controllers
│       │   ├── dashboard_controller.ex  # ★ CEO + Warehouse + Regional
│       │   ├── report_controller.ex     # ★ Async report generation
│       │   ├── upload_controller.ex     # ★ File uploads via Appwrite (max 20 MB)
│       │   ├── ai_controller.ex         # ★ 9 NL intents, Groq→OpenAI→Claude fallback
│       │   └── ...
│       ├── api_spec/                # OpenAPI 3.0 schemas + spec
│       └── router.ex
│
├── frontend/                        # Next.js 15 App Router (TypeScript)
│   ├── app/
│   │   ├── (auth)/                  # Public auth routes
│   │   │   ├── layout.tsx           # Split-screen dark auth layout
│   │   │   ├── login/page.tsx       # Login with demo-mode shortcut
│   │   │   └── register/page.tsx    # Org registration form
│   │   ├── (app)/                   # Protected app routes
│   │   │   ├── layout.tsx           # Sidebar + Topbar shell
│   │   │   ├── dashboard/page.tsx   # CEO KPI dashboard + Recharts
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx         # Invoice list + search + create modal
│   │   │   │   └── [id]/page.tsx    # Invoice detail + live presence
│   │   │   ├── inventory/page.tsx   # Stock items + warehouses + low-stock
│   │   │   ├── hr/page.tsx          # Employees + payroll runs + pay slips
│   │   │   ├── fleet/page.tsx       # Vehicles + GPS map + fuel log
│   │   │   ├── customers/page.tsx   # CRM cards + interaction panel
│   │   │   ├── ai/page.tsx          # AI chat with data table renderer
│   │   │   ├── reports/page.tsx     # Report generator + inline charts
│   │   │   └── settings/page.tsx    # Profile, notifications, security
│   │   ├── page.tsx                 # Public landing page
│   │   └── globals.css              # Tailwind base + component utilities
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx          # Collapsible dark nav + role badges
│   │       └── Topbar.tsx           # Page title + breadcrumb bar
│   ├── lib/
│   │   ├── api.ts                   # Axios client + demo-mode mock stubs
│   │   ├── auth-context.tsx         # Auth state, demo login bypass
│   │   ├── mock-data.ts             # Realistic Rwandan demo dataset
│   │   └── socket.ts                # Phoenix WebSocket channel helpers
│   ├── tailwind.config.js           # Custom tokens: primary, sidebar, canvas, ink
│   └── package.json
│
├── config/
│   ├── config.exs                   # Shared config (Oban, Commanded, Guardian, CLDR)
│   ├── dev.exs                      # Dev config — DATABASE_URL → Neon, fallback to local
│   ├── test.exs
│   └── runtime.exs                  # Production env vars
│
├── docker-compose.yml               # Redis 7 (optional) + PgAdmin
├── Makefile                         # Developer commands
└── .env.example
```

---

## Quick Start

### Prerequisites

- Git
- [asdf](https://asdf-vm.com) (manages Elixir + Erlang versions)
- A free [Neon PostgreSQL](https://neon.tech) account (two databases: main + event store)
- A free [Appwrite](https://appwrite.io) project (for file uploads)

### 1. Install Elixir & Erlang via asdf (Ubuntu 24.04)

```bash
# Install asdf
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc && source ~/.bashrc

# Add plugins
asdf plugin add erlang
asdf plugin add elixir

# Build Erlang (Ubuntu 24.04 — disable wx and odbc which are unavailable)
export KERL_CONFIGURE_OPTIONS="--disable-debug --without-javac --without-wx --without-odbc"
asdf install erlang 26.2.5
asdf install elixir 1.16.3-otp-26

asdf global erlang 26.2.5
asdf global elixir 1.16.3-otp-26
```

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/syncflow.git
cd syncflow
mix deps.get
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```bash
# Neon PostgreSQL — create two databases (main + event store) at https://neon.tech
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require&channel_binding=require
EVENT_STORE_URL=postgresql://<user>:<password>@<host>.neon.tech/<eventdb>?sslmode=require&channel_binding=require

# Phoenix secrets — generate with:
#   mix phx.gen.secret        → SECRET_KEY_BASE
#   mix phx.gen.secret 32     → GUARDIAN_SECRET
#   openssl rand -base64 32   → LIVE_VIEW_SALT
SECRET_KEY_BASE=
GUARDIAN_SECRET=
LIVE_VIEW_SALT=

# Appwrite — https://appwrite.io (free tier)
APPWRITE_API_KEY=
APPWRITE_PROJECT_ID=
APPWRITE_BUCKET_ID=syncflow-uploads

# Optional — enables AI natural language commands
GROQ_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional — enables email notifications
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
```

### 4. Create Databases & Run Migrations

```bash
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
export ELIXIR_ERL_OPTIONS="+fnu"
export DATABASE_URL="<your neon url>"
export EVENT_STORE_URL="<your neon event store url>"

mix ecto.create
mix ecto.migrate
```

### 5. Start the Server

```bash
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
export ELIXIR_ERL_OPTIONS="+fnu"
export DATABASE_URL="<your neon url>"
export EVENT_STORE_URL="<your neon event store url>"
export SECRET_KEY_BASE="<your secret>"

iex -S mix phx.server
# → http://localhost:4000
# → Swagger UI: http://localhost:4000/api/docs
```

---

## API Reference

### Interactive Swagger UI

```
http://localhost:4000/api/docs
```

### OpenAPI Spec (JSON)

```
http://localhost:4000/api/openapi
```

---

## REST API Endpoints

### Authentication (Public)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Get access + refresh tokens |
| `POST` | `/api/auth/register` | Register org + admin user |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/health` | Health check |

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.rw", "password": "secret123"}'
```

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

---

### Accounting

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/accounting/invoices` | List invoices (filter by status, search) |
| `POST` | `/api/accounting/invoices` | Create invoice |
| `GET` | `/api/accounting/invoices/:id` | Get invoice |
| `PUT` | `/api/accounting/invoices/:id` | Update invoice |
| `POST` | `/api/accounting/invoices/:id/submit` | Submit for approval |
| `POST` | `/api/accounting/invoices/:id/approve` | Approve invoice |
| `POST` | `/api/accounting/invoices/:id/reject` | Reject with reason |
| `POST` | `/api/accounting/invoices/:id/void` | Void invoice |
| `GET` | `/api/accounting/invoices/stats` | Invoice KPIs by status |
| `GET` | `/api/accounting/invoices/overdue` | Overdue invoices |
| `GET` | `/api/accounting/revenue/monthly?year=2024` | Monthly revenue breakdown |

---

### Inventory

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory/warehouses` | List warehouses |
| `POST` | `/api/inventory/warehouses` | Create warehouse |
| `GET` | `/api/inventory/warehouses/value` | ★ Total inventory value (all warehouses) |
| `GET` | `/api/inventory/stock-items` | List stock items (filter by warehouse, category) |
| `POST` | `/api/inventory/stock-items` | Add stock item |
| `POST` | `/api/inventory/stock-items/:id/adjust` | Adjust quantity (±delta) |
| `POST` | `/api/inventory/stock-items/:id/transfer` | Transfer between warehouses |
| `GET` | `/api/inventory/stock-items/low-stock` | Items below reorder point |

---

### HR & Payroll

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/hr/employees` | List employees |
| `POST` | `/api/hr/employees` | Register employee |
| `GET` | `/api/hr/employees/:id` | Get employee |
| `PUT` | `/api/hr/employees/:id` | Update employee |
| `GET` | `/api/hr/headcount` | ★ Headcount by department |
| `GET` | `/api/hr/payroll` | List payroll runs |
| `POST` | `/api/hr/payroll` | Create payroll run |
| `POST` | `/api/hr/payroll/:id/process` | ★ Process (async PAYE via Oban) |
| `POST` | `/api/hr/payroll/:id/approve` | Approve payroll |
| `GET` | `/api/hr/payroll/:id/pay-slips` | ★ Individual pay slips |

---

### CRM

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/crm/customers` | List customers |
| `POST` | `/api/crm/customers` | Register customer |
| `GET` | `/api/crm/customers/:id` | Get customer + recent interactions |
| `PUT` | `/api/crm/customers/:id` | Update customer |
| `GET` | `/api/crm/customers/stats` | ★ Customer stats by status |
| `POST` | `/api/crm/customers/:id/interactions` | Log call/email/meeting |
| `GET` | `/api/crm/customers/:id/interactions` | ★ Full interaction history |

---

### Fleet

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/fleet/vehicles` | List vehicles |
| `POST` | `/api/fleet/vehicles` | Register vehicle |
| `GET` | `/api/fleet/vehicles/:id` | Vehicle details + live GPS |
| `POST` | `/api/fleet/vehicles/:id/assign-driver` | Assign driver |
| `GET` | `/api/fleet/vehicles/live` | All active vehicle GPS positions |
| `GET` | `/api/fleet/vehicles/summary` | ★ Fleet status summary + fuel costs |
| `GET` | `/api/fleet/trips` | Trip history |
| `GET` | `/api/fleet/trips/:id` | Trip details |
| `GET` | `/api/fleet/fuel?vehicle_id=<id>` | ★ Fuel records for a vehicle |
| `POST` | `/api/fleet/fuel` | Log fuel event |

---

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/ceo` | ★ CEO dashboard: all KPIs across every domain |
| `GET` | `/api/dashboard/warehouse` | ★ Warehouse dashboard: stock levels per warehouse |
| `GET` | `/api/dashboard/regional` | ★ Regional breakdown by warehouse location |

---

### Reports (Async)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/reports/generate` | ★ Enqueue report (result pushed to notification channel) |

**Report types:** `monthly_revenue`, `inventory_audit`, `payroll_summary`, `fleet_utilization`, `overdue_invoices`

```bash
curl -X POST http://localhost:4000/api/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "monthly_revenue", "year": 2024}'
# → 202 Accepted. Result pushed via notifications:<user_id> channel.
```

---

### AI — Natural Language Commands

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/command` | Free-text ERP command |
| `POST` | `/api/uploads` | Upload a file (multipart, max 20 MB) |

**AI provider fallback chain:** Groq → OpenAI → Anthropic Claude → built-in rule-based parser

**Supported intents:**

| Intent | Example |
|--------|---------|
| `create_invoice` | "Create invoice for MTN Rwanda for 5,000,000 RWF" |
| `list_invoices` | "Show all pending invoices" |
| `overdue_query` | "What is the total overdue amount this month?" |
| `low_stock_query` | "Show Kigali warehouse low stock items" |
| `transfer_stock` | "Transfer 200 bags of cement from Kigali to Musanze" |
| `fleet_status` | "How many vehicles are on trip right now?" |
| `headcount_query` | "How many employees do we have in Finance?" |
| `payroll_status` | "Is payroll for April approved?" |
| `inventory_value` | "What is the total inventory value?" |

```bash
curl -X POST http://localhost:4000/api/ai/command \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the total overdue amount this month?"}'
```

---

## WebSocket Channels

Connect: `ws://localhost:4000/socket/websocket?token=<jwt>`

### Invoice Channel — Multiplayer Editing

```javascript
const channel = socket.channel("invoice:550e8400-e29b-41d4-a716-446655440000")
channel.join()

// Edit a field — all connected users see the change instantly
channel.push("update_field", {field: "customer_name", value: "MTN Rwanda"})
channel.on("field_updated", ({field, value, user_name}) => updateUI(field, value))

// Cursor tracking
channel.push("cursor_move", {field: "due_date"})
channel.on("cursor_moved", ({user_id, user_name, field}) => showCursor(user_id, field))

// Who's editing right now
channel.on("presence_state", state => showOnlineEditors(state))
channel.on("presence_diff", diff => updateEditorList(diff))
```

### Fleet Channel — Live GPS

```javascript
const fleet = socket.channel("fleet:live")
fleet.join().receive("ok", ({vehicles}) => vehicles.forEach(plotOnMap))
fleet.on("vehicle_moved", ({vehicle_id, latitude, longitude, speed_kmh}) => updateMarker(vehicle_id, latitude, longitude))

// Driver app sends GPS pings
const driverCh = socket.channel("fleet:vehicle:abc-123")
driverCh.push("location_ping", {lat: -1.944, lng: 30.062, speed: 65, heading: 90})
```

### Dashboard Channel — Live KPIs

```javascript
const dash = socket.channel("dashboard:ceo")
dash.join()
dash.on("dashboard_data", data => renderKPIs(data))
dash.on("kpi_update", ({type, delta}) => updateCounter(type, delta))
dash.on("alert", ({type, severity, body}) => showAlert(type, body, severity))
dash.on("vehicle_location", pos => updateFleetMap(pos))
```

### Notifications Channel — Personal Alerts

```javascript
const notif = socket.channel(`notifications:${userId}`)
notif.join()
notif.on("notification", ({type, title, body, severity}) => showToast(title, body))
// Receives: payroll_done, invoice_approved, low_stock, report_ready, ...
```

---

## Background Job Workers

| Worker | Queue | Trigger | Effect |
|--------|-------|---------|--------|
| `PayrollWorker` | `:payroll` | `POST /payroll/:id/process` | Calculates PAYE for all employees, inserts pay slips, notifies dashboard |
| `NotificationWorker` | `:notifications` | Any domain event | Broadcasts in-app notification or sends email via Mailgun |
| `ReportWorker` | `:reports` | `POST /reports/generate` | Generates heavy report, pushes result to user's notification channel |

---

## Roles & Permissions

| Role | Access |
|------|--------|
| `superadmin` | Everything across all orgs |
| `admin` | Full access within org |
| `ceo` | Read all dashboards, approve invoices |
| `manager` | Manage team, approve workflows |
| `accountant` | Full accounting access |
| `cashier` | Create/edit draft invoices |
| `warehouse_manager` | Full inventory access |
| `hr_manager` | Full HR + payroll access |
| `procurement` | Purchase orders, suppliers |
| `driver` | Fleet + own trip management |
| `salesperson` | CRM + create invoices |
| `auditor` | Read-only across all modules |

---

## Event Sourcing & Audit Trail

Every state change is an immutable event in the event store:

```elixir
# View full history for an invoice
SyncFlow.Core.EventStore.read_stream_forward("invoice-#{invoice_id}")
# → [InvoiceCreated, InvoiceFieldUpdated, InvoiceSubmittedForApproval, InvoiceApproved]
```

This gives you:
- **Complete audit trail** — who changed what and when
- **Time travel** — rebuild state at any point in history
- **Event replay** — rebuild read models from scratch if needed
- **Conflict-free collaboration** — per-field last-write-wins

---

## Development Commands

```bash
# Start the server (set env vars first — see Quick Start)
iex -S mix phx.server
# → http://localhost:4000
# → Swagger UI: http://localhost:4000/api/docs

# Database (env vars must be set)
mix ecto.create         # Create all databases on Neon
mix ecto.migrate        # Run all pending migrations
mix ecto.rollback       # Rollback last migration

# Code quality
mix format              # Format all .ex / .exs files
mix credo               # Static analysis
mix test                # Run test suite
mix test --cover        # Run with coverage report
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (main DB) |
| `EVENT_STORE_URL` | Yes | Neon PostgreSQL connection string (event store DB) |
| `SECRET_KEY_BASE` | Yes | 64-byte Phoenix secret (`mix phx.gen.secret`) |
| `GUARDIAN_SECRET` | Yes | JWT signing key (`mix phx.gen.secret 32`) |
| `LIVE_VIEW_SALT` | No | LiveView signing salt (`openssl rand -base64 32`) |
| `APPWRITE_API_KEY` | No | Appwrite server API key — enables file uploads |
| `APPWRITE_PROJECT_ID` | No | Appwrite project ID |
| `APPWRITE_BUCKET_ID` | No | Appwrite storage bucket (default: `syncflow-uploads`) |
| `APPWRITE_ENDPOINT` | No | Appwrite endpoint (default: `https://cloud.appwrite.io/v1`) |
| `GROQ_API_KEY` | No | Groq API key — primary AI provider for NL commands |
| `OPENAI_API_KEY` | No | OpenAI API key — secondary AI provider |
| `ANTHROPIC_API_KEY` | No | Anthropic API key — tertiary AI provider |
| `MAILGUN_API_KEY` | No | Email delivery for notifications |
| `MAILGUN_DOMAIN` | No | Mailgun sending domain |
| `POOL_SIZE` | No | DB connection pool size (default: 10) |
| `PORT` | No | HTTP port (default: 4000) |
| `PHX_HOST` | Prod only | Public hostname for WebSocket URL generation |

---

## Production Deployment

```bash
# Build release
MIX_ENV=prod mix release

# Run
DATABASE_URL=postgresql://... \
SECRET_KEY_BASE=$(mix phx.gen.secret) \
GUARDIAN_SECRET=$(mix phx.gen.secret 32) \
PHX_HOST=api.syncflow.rw \
PORT=4000 \
./_build/prod/rel/syncflow/bin/syncflow start
```

### Docker (Production)

```dockerfile
FROM elixir:1.16-alpine AS build
WORKDIR /app
COPY . .
RUN mix deps.get && MIX_ENV=prod mix release

FROM alpine:3.19
RUN apk add --no-cache libstdc++ openssl ncurses-libs
COPY --from=build /app/_build/prod/rel/syncflow ./
CMD ["./bin/syncflow", "start"]
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/procurement-module`
3. Follow the CQRS pattern: **Commands → Aggregates → Events → Projectors → PubSub**
4. Add tests for aggregates and projectors
5. Submit a pull request

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

*Built for African businesses. Default currency: RWF. Default timezone: Africa/Kigali.*

![Elixir](https://img.shields.io/badge/Elixir-1.16-4B275F?style=flat-square&logo=elixir&logoColor=white)
![Phoenix](https://img.shields.io/badge/Phoenix-1.7-FD4F00?style=flat-square&logo=phoenixframework&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat-square&logo=postgresql&logoColor=white)
![Oban](https://img.shields.io/badge/Oban-2.17-000000?style=flat-square)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539?style=flat-square&logo=openapiinitiative&logoColor=white)

</div>
