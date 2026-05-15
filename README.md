# SyncFlow — Real-Time Multiplayer ERP

> A state-synchronized business operating system combining ERP, Google Docs-style collaboration,
> Slack-like activity feeds, live analytics, and AI automation — built with Elixir Phoenix.

---

## What Makes It Different

| Traditional ERP | SyncFlow |
|---|---|
| Refreshes pages | Updates instantly via WebSocket |
| Locks records | Multiple users edit simultaneously |
| Feels slow | Dashboard updates live as data changes |
| Per-module silos | Unified event stream across all domains |
| Audit log as afterthought | Event sourcing — every change is permanent history |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Backend** | Elixir + Phoenix 1.7 | Built for millions of connections, fault-tolerant, OTP supervision |
| **Realtime** | Phoenix Channels + Presence | Battle-tested multiplayer sync, cursor tracking, pub/sub |
| **Architecture** | CQRS + Event Sourcing (Commanded) | Immutable audit trail, time-travel debugging, conflict-free collaboration |
| **Database** | PostgreSQL 16 | Projections (read models) + event store |
| **Background Jobs** | Oban | Reliable async processing (payroll, reports, AI) |
| **Auth** | Guardian JWT | Stateless, role-based, field-level security |
| **API Docs** | OpenAPI 3.0 (open_api_spex) | Interactive Swagger UI |
| **AI** | Claude API (Anthropic) | Natural language commands |

---

## Architecture

```
                        ┌─────────────────────────────────┐
                        │         React Frontend           │
                        │  REST API + WebSocket Channels   │
                        └────────────┬────────────────────┘
                                     │
                        ┌────────────▼────────────────────┐
                        │       Phoenix Web (Port 4000)    │
                        │  Router → Controllers            │
                        │  UserSocket → Channels           │
                        │  Presence (cursor tracking)      │
                        └────────────┬────────────────────┘
                                     │
              ┌──────────────────────▼────────────────────────┐
              │                  PubSub                        │
              │  Projectors broadcast → Channels push to UI   │
              └──────────────────────┬────────────────────────┘
                                     │
    ┌──────────────┬─────────────────▼──────────────┬──────────────┐
    │              │                                  │              │
    ▼              ▼                                  ▼              ▼
Command      Commanded           Projectors       Event Store
Dispatch  →  Router &         (update read     (append-only
             Aggregates  →     models in   →   PostgreSQL)
             (business         PostgreSQL)
              rules)
```

### CQRS Flow (Example: Editing an Invoice)

```
User types in UI
      ↓
WebSocket sends "update_field" to InvoiceChannel
      ↓
Channel dispatches UpdateInvoiceField command
      ↓
Invoice aggregate validates (status == :draft?)
      ↓
InvoiceFieldUpdated event appended to event store
      ↓
InvoiceProjector updates read model in PostgreSQL
      ↓
Projector broadcasts via Phoenix PubSub
      ↓
ALL connected editors receive "field_updated" push
      ↓
UI updates instantly — no refresh needed
```

---

## Project Structure

```
syncflow/                           # Umbrella root
├── apps/
│   ├── syncflow_core/              # Foundation
│   │   ├── event_store/            # EventStore + Commanded app
│   │   ├── auth/                   # Guardian JWT, pipelines
│   │   ├── accounts/               # User, Organization schemas
│   │   └── router.ex               # Commanded command router
│   │
│   ├── syncflow_accounting/        # Invoicing & Ledger
│   │   ├── aggregates/invoice.ex   # Invoice business rules
│   │   ├── commands.ex             # CreateInvoice, ApproveInvoice, etc.
│   │   ├── events.ex               # InvoiceCreated, InvoiceApproved, etc.
│   │   ├── projectors/             # Update read models + broadcast
│   │   ├── queries.ex              # Read model queries
│   │   └── schema/                 # Invoice, LedgerEntry, Payment
│   │
│   ├── syncflow_inventory/         # Stock & Warehouses
│   │   ├── aggregates/stock_item.ex
│   │   ├── tracker (ETS)           # Live stock levels
│   │   └── ...
│   │
│   ├── syncflow_hr/                # HR & Payroll
│   │   ├── schema/employee.ex
│   │   ├── schema/payroll_run.ex
│   │   └── queries.ex              # PAYE tax calculation (Rwanda brackets)
│   │
│   ├── syncflow_crm/               # Customer Relations
│   │   ├── aggregates/customer.ex
│   │   └── ...
│   │
│   ├── syncflow_fleet/             # Vehicle & GPS Tracking
│   │   ├── aggregates/vehicle.ex
│   │   ├── tracker.ex              # ETS GenServer — live GPS in memory
│   │   └── ...
│   │
│   └── syncflow_web/               # Phoenix Web Layer
│       ├── channels/               # 5 real-time channels
│       │   ├── invoice_channel.ex  # Multiplayer invoice editing
│       │   ├── dashboard_channel.ex# Live KPIs & analytics
│       │   ├── fleet_channel.ex    # GPS tracking
│       │   ├── inventory_channel.ex# Live stock updates
│       │   └── notification_channel.ex
│       ├── controllers/            # 12 REST controllers
│       ├── api_spec/               # OpenAPI 3.0 schemas & spec
│       └── router.ex
│
├── config/
│   ├── config.exs                  # Shared config
│   ├── dev.exs                     # Dev (local PostgreSQL)
│   ├── test.exs
│   └── runtime.exs                 # Production env vars
│
├── docker-compose.yml              # PostgreSQL 16 + Redis + PgAdmin
├── Makefile                        # Developer commands
├── install.sh                      # One-command setup
└── .env.example
```

---

## Quick Start

### Prerequisites

- Git
- Docker & Docker Compose
- (Elixir will be auto-installed by `install.sh` via asdf)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/syncflow.git
cd syncflow

# Full auto-install (Elixir + Erlang via asdf + infra + DB setup)
./install.sh

# Or step by step:
make install    # Install Elixir via asdf
make infra      # Start Docker (PostgreSQL, Redis)
make deps       # Fetch Mix dependencies
make migrate    # Create databases & run migrations
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set:
# - GUARDIAN_SECRET (required)
# - SECRET_KEY_BASE (required, generate with: mix phx.gen.secret)
# - ANTHROPIC_API_KEY (optional, for AI commands)
```

### 3. Start the Server

```bash
make server
# or:
iex -S mix phx.server
```

The server starts at **http://localhost:4000**

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

**Login example:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.rw", "password": "secret123"}'
```

**All authenticated endpoints require:**
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
| `GET` | `/api/revenue/monthly?year=2024` | Monthly revenue breakdown |

---

### Inventory

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory/warehouses` | List warehouses |
| `POST` | `/api/inventory/warehouses` | Create warehouse |
| `GET` | `/api/inventory/stock-items` | List stock items |
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
| `GET` | `/api/hr/payroll` | List payroll runs |
| `POST` | `/api/hr/payroll` | Create payroll run |
| `POST` | `/api/hr/payroll/:id/process` | Calculate pay slips (Rwanda PAYE) |
| `POST` | `/api/hr/payroll/:id/approve` | Approve payroll |

---

### CRM

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/crm/customers` | List customers |
| `POST` | `/api/crm/customers` | Register customer |
| `GET` | `/api/crm/customers/:id` | Get customer + recent interactions |
| `PUT` | `/api/crm/customers/:id` | Update customer |
| `POST` | `/api/crm/customers/:id/interactions` | Log call/email/meeting |

---

### Fleet

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/fleet/vehicles` | List vehicles |
| `POST` | `/api/fleet/vehicles` | Register vehicle |
| `GET` | `/api/fleet/vehicles/:id` | Vehicle details + live GPS |
| `POST` | `/api/fleet/vehicles/:id/assign-driver` | Assign driver |
| `GET` | `/api/fleet/vehicles/live` | All active vehicle positions |
| `GET` | `/api/fleet/trips` | Trip history |
| `GET` | `/api/fleet/trips/:id` | Trip details |
| `POST` | `/api/fleet/fuel` | Log fuel event |

---

### Dashboard & AI

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/ceo` | CEO dashboard: invoice KPIs + fleet |
| `GET` | `/api/dashboard/warehouse` | Warehouse dashboard |
| `POST` | `/api/ai/command` | Natural language ERP commands |

**AI command example:**
```bash
curl -X POST http://localhost:4000/api/ai/command \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create invoice for MTN Rwanda for 5,000,000 RWF"}'
```

---

## WebSocket Channels

Connect: `ws://localhost:4000/socket/websocket?token=<jwt>`

### Invoice Channel — Multiplayer Editing

```javascript
const channel = socket.channel("invoice:550e8400-e29b-41d4-a716-446655440000")

channel.join()
  .receive("ok", ({invoice_id}) => console.log("Joined invoice", invoice_id))

// Edit a field
channel.push("update_field", {field: "customer_name", value: "MTN Rwanda"})

// Listen for collaborator edits
channel.on("field_updated", ({field, value, user_name}) => {
  console.log(`${user_name} changed ${field} to ${value}`)
  updateUI(field, value)
})

// Cursor tracking
channel.push("cursor_move", {field: "due_date", x: 120, y: 45})
channel.on("cursor_moved", ({user_id, user_name, field}) => {
  showCollaboratorCursor(user_id, user_name, field)
})

// Presence (who's editing)
channel.on("presence_state", (state) => showOnlineEditors(state))
channel.on("presence_diff", (diff) => updateEditorList(diff))
```

### Fleet Channel — Live GPS

```javascript
const fleet = socket.channel("fleet:live")

fleet.join().receive("ok", ({vehicles}) => {
  vehicles.forEach(v => plotVehicleOnMap(v))
})

// Real-time position updates
fleet.on("vehicle_moved", ({vehicle_id, latitude, longitude, speed_kmh}) => {
  updateVehicleMarker(vehicle_id, latitude, longitude)
})

// Driver sends GPS pings
const driverChannel = socket.channel("fleet:vehicle:abc-123")
driverChannel.push("location_ping", {lat: -1.944, lng: 30.062, speed: 65, heading: 90})
```

### Dashboard Channel — Live KPIs

```javascript
const dashboard = socket.channel("dashboard:ceo")

dashboard.join().receive("ok", ({dashboard}) => console.log("Dashboard ready"))

dashboard.on("dashboard_data", (data) => renderKPIs(data))
dashboard.on("kpi_update", ({type, delta}) => updateCounter(type, delta))
dashboard.on("alert", ({type, severity, body}) => showAlert(type, body, severity))
dashboard.on("vehicle_location", (pos) => updateFleetMap(pos))
```

---

## Roles & Permissions

| Role | Access |
|------|--------|
| `superadmin` | Everything across all orgs |
| `admin` | Full access within org |
| `ceo` | Read all dashboards, approve invoices |
| `manager` | Manage team members, approve workflows |
| `accountant` | Full accounting access |
| `cashier` | Create/edit draft invoices |
| `warehouse_manager` | Full inventory access |
| `hr_manager` | Full HR + payroll access |
| `procurement` | Purchase orders, suppliers |
| `driver` | Fleet + own trip management |
| `salesperson` | CRM + create invoices |
| `auditor` | Read-only across all modules |

---

## AI Natural Language Commands

With `ANTHROPIC_API_KEY` set, the `/api/ai/command` endpoint parses free-text:

```
"Create invoice for BK Group for 5,000,000 RWF consulting services"
"Show all Kigali warehouse low stock items"
"What is the total overdue amount this month?"
"Transfer 200 bags of cement from Kigali to Musanze warehouse"
```

Without the API key, a rule-based fallback handles common commands in dev.

---

## Development Commands

```bash
make server          # Start server (iex + Phoenix)
make test            # Run test suite
make test.cover      # Run with coverage report
make format          # Format all .ex files
make lint            # Check formatting + Credo
make reset           # Drop + recreate all databases

# Database
make migrate         # Run pending migrations
mix ecto.rollback    # Rollback last migration (per app)

# Docker infra
docker compose up -d     # Start PostgreSQL + Redis + PgAdmin
docker compose down      # Stop
docker compose logs -f   # Follow logs

# PgAdmin
open http://localhost:5050
# Login: admin@syncflow.local / admin
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Prod only | PostgreSQL connection string |
| `SECRET_KEY_BASE` | Prod only | 64-byte Phoenix secret |
| `GUARDIAN_SECRET` | Yes | JWT signing key |
| `ANTHROPIC_API_KEY` | No | Enable Claude AI commands |
| `MAILGUN_API_KEY` | No | Email delivery |
| `POOL_SIZE` | No | DB connection pool (default 10) |
| `PORT` | No | HTTP port (default 4000) |
| `PHX_HOST` | Prod only | Public hostname |

---

## Event Sourcing & Audit Trail

Every state change is an immutable event in the event store:

```elixir
# View all events for an invoice
SyncFlow.Core.EventStore.read_stream_forward("invoice-#{invoice_id}")

# The full history is always available:
# InvoiceCreated → InvoiceFieldUpdated → InvoiceSubmittedForApproval → InvoiceApproved
```

This gives you:
- **Complete audit trail** — who changed what and when
- **Time travel** — rebuild state at any point in history
- **Event replay** — rebuild read models from scratch
- **Compliance** — nothing is ever deleted, only appended

---

## Production Deployment

```bash
# Build release
MIX_ENV=prod mix release

# Run with environment variables
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

FROM alpine:3.18
RUN apk add --no-cache libstdc++ openssl ncurses-libs
COPY --from=build /app/_build/prod/rel/syncflow ./
CMD ["./bin/syncflow", "start"]
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/procurement-module`
3. Follow the CQRS pattern: Commands → Aggregates → Events → Projectors
4. Add tests for aggregates and projectors
5. Submit a pull request

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built with ❤️ for African businesses. Default currency: RWF. Default timezone: Africa/Kigali.*
