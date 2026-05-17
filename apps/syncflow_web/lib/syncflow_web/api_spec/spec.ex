defmodule SyncFlow.Web.ApiSpec do
  @moduledoc "OpenAPI 3.0 specification for the SyncFlow API."

  alias OpenApiSpex.{Components, Info, License, OpenApi, Paths, SecurityScheme, Server, Tag}
  alias SyncFlow.Web.{Router, Endpoint}

  @behaviour OpenApiSpex.OpenApi

  @impl OpenApiSpex.OpenApi
  def spec do
    %OpenApi{
      servers: [
        %Server{url: "http://localhost:4000", description: "Development"},
        %Server{url: "https://api.syncflow.rw", description: "Production"}
      ],
      info: %Info{
        title: "SyncFlow API",
        version: "1.1.0",
        description: """
        ## Real-Time Multiplayer ERP

        SyncFlow is a state-synchronized business operating system combining ERP, real-time
        collaboration, live analytics, and AI automation — built with Elixir/Phoenix.

        ### Authentication
        All protected endpoints require a Bearer JWT token in the `Authorization` header.

        ```
        Authorization: Bearer <access_token>
        ```

        Obtain tokens via `POST /api/auth/login`. Tokens embed `role`, `org_id`, and
        `permissions` — no database lookup on each request.

        ### Real-Time WebSocket Channels
        Connect via WebSocket at `ws://localhost:4000/socket/websocket?token=<jwt>` and join:

        | Channel | Purpose |
        |---------|---------|
        | `invoice:<id>` | Collaborative invoice editing (Google Docs style) |
        | `dashboard:ceo` | Live CEO KPIs — invoices, fleet, inventory |
        | `dashboard:warehouse` | Warehouse stock levels & alerts |
        | `fleet:live` | GPS positions for all active vehicles (~1 Hz) |
        | `fleet:vehicle:<id>` | Per-vehicle — driver sends location pings |
        | `inventory:<warehouse_id>` | Live stock adjustments & low-stock alerts |
        | `notifications:<user_id>` | Personal notifications (payroll, approvals, reports) |

        ### Background Reports
        Use `POST /api/reports/generate` to enqueue heavy reports.
        Results are pushed to your `notifications:<user_id>` channel when ready.

        ### CQRS Architecture
        Write operations dispatch **Commands → Aggregates → Events → Projectors → PubSub → Channels**.
        Read operations query denormalized PostgreSQL read models directly.
        """,
        license: %License{name: "MIT", url: "https://opensource.org/licenses/MIT"}
      },
      tags: [
        %Tag{name: "Auth", description: "Authentication & JWT token management"},
        %Tag{name: "Invoices", description: "Collaborative invoice lifecycle with real-time multi-user editing (CQRS/ES)"},
        %Tag{name: "Warehouses", description: "Warehouse management & inventory value snapshots"},
        %Tag{name: "Stock Items", description: "Stock control — adjustments, transfers, low-stock monitoring"},
        %Tag{name: "Employees", description: "HR employee records & department headcount"},
        %Tag{name: "Payroll", description: "Payroll runs, Rwanda PAYE calculation, and pay slips"},
        %Tag{name: "Customers", description: "CRM customer records & interaction history"},
        %Tag{name: "Fleet", description: "Vehicle registration, driver assignment & fleet summary"},
        %Tag{name: "Trips", description: "Fleet trip history (read-only)"},
        %Tag{name: "Dashboard", description: "Live CEO, Warehouse, and Regional analytics dashboards"},
        %Tag{name: "Reports", description: "Async report generation (monthly revenue, inventory audit, payroll summary, fleet utilization)"},
        %Tag{name: "AI", description: "Natural language ERP commands powered by Claude (Anthropic)"},
        %Tag{name: "Admin", description: "User & organization management (admin/superadmin only)"}
      ],
      paths: Paths.from_router(Router),
      components: %Components{
        securitySchemes: %{
          "bearerAuth" => %SecurityScheme{
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        },
        schemas: SyncFlow.Web.ApiSpec.Schemas.all()
      }
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end
