defmodule SyncFlow.Web.Router do
  use Phoenix.Router
  import Plug.Conn
  import Phoenix.Controller

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug OpenApiSpex.Plug.PutApiSpec, module: SyncFlow.Web.ApiSpec
  end

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :authenticated do
    plug SyncFlow.Core.Auth.Pipeline
    plug SyncFlow.Web.Plugs.SetCurrentUser
  end

  pipeline :admin do
    plug SyncFlow.Web.Plugs.RequireRole, roles: [:admin, :superadmin]
  end

  # Swagger UI — served at /api/docs
  scope "/api", SyncFlow.Web do
    pipe_through :browser
    get "/docs", Controllers.SwaggerController, :ui
  end

  scope "/api", SyncFlow.Web do
    pipe_through :api

    # OpenAPI spec endpoint
    get "/openapi", Controllers.SwaggerController, :spec

    # Public
    post "/auth/login", Controllers.AuthController, :login
    post "/auth/refresh", Controllers.AuthController, :refresh
    post "/auth/register", Controllers.AuthController, :register

    # Health check
    get "/health", Controllers.HealthController, :check
  end

  scope "/api", SyncFlow.Web do
    pipe_through [:api, :authenticated]

    # Accounting
    scope "/accounting" do
      resources "/invoices", Controllers.InvoiceController, except: [:new, :edit]
      post "/invoices/:id/submit", Controllers.InvoiceController, :submit
      post "/invoices/:id/approve", Controllers.InvoiceController, :approve
      post "/invoices/:id/reject", Controllers.InvoiceController, :reject
      post "/invoices/:id/void", Controllers.InvoiceController, :void
      get "/invoices/stats", Controllers.InvoiceController, :stats
      get "/invoices/overdue", Controllers.InvoiceController, :overdue
      get "/revenue/monthly", Controllers.InvoiceController, :revenue_by_month
    end

    # Inventory
    scope "/inventory" do
      resources "/warehouses", Controllers.WarehouseController, except: [:new, :edit]
      resources "/stock-items", Controllers.StockItemController, except: [:new, :edit]
      post "/stock-items/:id/adjust", Controllers.StockItemController, :adjust
      post "/stock-items/:id/transfer", Controllers.StockItemController, :transfer
      get "/stock-items/low-stock", Controllers.StockItemController, :low_stock
    end

    # HR
    scope "/hr" do
      resources "/employees", Controllers.EmployeeController, except: [:new, :edit]
      resources "/payroll", Controllers.PayrollController, except: [:new, :edit]
      post "/payroll/:id/process", Controllers.PayrollController, :process
      post "/payroll/:id/approve", Controllers.PayrollController, :approve
    end

    # CRM
    scope "/crm" do
      resources "/customers", Controllers.CustomerController, except: [:new, :edit]
      post "/customers/:id/interactions", Controllers.CustomerController, :record_interaction
    end

    # Fleet
    scope "/fleet" do
      resources "/vehicles", Controllers.VehicleController, except: [:new, :edit]
      post "/vehicles/:id/assign-driver", Controllers.VehicleController, :assign_driver
      get "/vehicles/live", Controllers.VehicleController, :live_positions
      resources "/trips", Controllers.TripController, only: [:index, :show]
      post "/fuel", Controllers.FuelController, :log
    end

    # Dashboard
    get "/dashboard/ceo", Controllers.DashboardController, :ceo
    get "/dashboard/warehouse", Controllers.DashboardController, :warehouse

    # AI
    post "/ai/command", Controllers.AIController, :command

    # Admin only
    scope "/admin" do
      pipe_through :admin
      resources "/users", Controllers.UserController, except: [:new, :edit]
      resources "/organizations", Controllers.OrganizationController, except: [:new, :edit]
    end
  end
end
