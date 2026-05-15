import Config

if config_env() == :prod do
  db_url =
    System.get_env("DATABASE_URL") ||
      raise "DATABASE_URL environment variable is required in production"

  event_store_url =
    System.get_env("EVENT_STORE_URL") || db_url

  config :syncflow_core, SyncFlow.Core.Repo,
    url: db_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10")),
    socket_options: []

  config :syncflow_accounting, SyncFlow.Accounting.Repo,
    url: System.get_env("ACCOUNTING_DB_URL", db_url),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))

  config :syncflow_inventory, SyncFlow.Inventory.Repo,
    url: System.get_env("INVENTORY_DB_URL", db_url),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))

  config :syncflow_hr, SyncFlow.HR.Repo,
    url: System.get_env("HR_DB_URL", db_url),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))

  config :syncflow_crm, SyncFlow.CRM.Repo,
    url: System.get_env("CRM_DB_URL", db_url),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))

  config :syncflow_fleet, SyncFlow.Fleet.Repo,
    url: System.get_env("FLEET_DB_URL", db_url),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "SECRET_KEY_BASE environment variable is required in production"

  host = System.get_env("PHX_HOST", "example.com")
  port = String.to_integer(System.get_env("PORT", "4000"))

  config :syncflow_web, SyncFlow.Web.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [ip: {0, 0, 0, 0, 0, 0, 0, 0}, port: port],
    secret_key_base: secret_key_base

  config :syncflow_core, SyncFlow.Core.Auth.Guardian,
    secret_key: System.fetch_env!("GUARDIAN_SECRET")

  config :syncflow_core, SyncFlow.Core.Mailer,
    adapter: Swoosh.Adapters.Mailgun,
    api_key: System.get_env("MAILGUN_API_KEY"),
    domain: System.get_env("MAILGUN_DOMAIN")

  config :syncflow_core,
    event_store: [
      serializer: Commanded.Serialization.JsonSerializer,
      url: event_store_url,
      pool_size: 10
    ]
end
