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
        version: "1.0.0",
        description: """
        ## Real-Time Multiplayer ERP

        SyncFlow is a state-synchronized business operating system combining ERP, real-time
        collaboration, live analytics, and AI automation.

        ### Authentication
        All protected endpoints require a Bearer JWT token in the `Authorization` header.

        ```
        Authorization: Bearer <access_token>
        ```

        Obtain tokens via `POST /api/auth/login`.

        ### Real-Time Channels
        Connect via WebSocket at `ws://localhost:4000/socket/websocket?token=<jwt>` and join:
        - `invoice:<id>` — Collaborative invoice editing
        - `dashboard:<type>` — Live KPI dashboards (`ceo`, `warehouse`)
        - `fleet:live` — GPS vehicle tracking
        - `inventory:warehouse:<id>` — Live stock updates
        - `notifications:<user_id>` — Personal notifications
        """,
        license: %License{name: "MIT", url: "https://opensource.org/licenses/MIT"}
      },
      tags: [
        %Tag{name: "Auth", description: "Authentication & token management"},
        %Tag{name: "Invoices", description: "Collaborative invoice lifecycle (CQRS)"},
        %Tag{name: "Warehouses", description: "Warehouse management"},
        %Tag{name: "Stock Items", description: "Inventory & stock control"},
        %Tag{name: "Employees", description: "HR employee management"},
        %Tag{name: "Payroll", description: "Payroll runs & pay slips"},
        %Tag{name: "Customers", description: "CRM customer records"},
        %Tag{name: "Fleet", description: "Vehicle registration & GPS tracking"},
        %Tag{name: "Trips", description: "Fleet trip history"},
        %Tag{name: "Dashboard", description: "Live analytics & KPIs"},
        %Tag{name: "AI", description: "Natural language command interface"},
        %Tag{name: "Admin", description: "User & organization management (admin only)"}
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
