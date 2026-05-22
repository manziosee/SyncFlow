import Config

if config_env() == :prod do
  db_url =
    System.get_env("DATABASE_URL") ||
      raise "DATABASE_URL environment variable is required in production"

  event_store_url =
    System.get_env("EVENT_STORE_URL") || db_url

  pool = String.to_integer(System.get_env("POOL_SIZE", "10"))
  ssl = [verify: :verify_none]

  config :syncflow_core, SyncFlow.Core.Repo,
    url: db_url, pool_size: pool, ssl: ssl, migration_source: "schema_migrations"

  config :syncflow_accounting, SyncFlow.Accounting.Repo,
    url: System.get_env("ACCOUNTING_DB_URL", db_url), pool_size: pool, ssl: ssl,
    migration_source: "schema_migrations_accounting"

  config :syncflow_inventory, SyncFlow.Inventory.Repo,
    url: System.get_env("INVENTORY_DB_URL", db_url), pool_size: pool, ssl: ssl,
    migration_source: "schema_migrations_inventory"

  config :syncflow_hr, SyncFlow.HR.Repo,
    url: System.get_env("HR_DB_URL", db_url), pool_size: pool, ssl: ssl,
    migration_source: "schema_migrations_hr"

  config :syncflow_crm, SyncFlow.CRM.Repo,
    url: System.get_env("CRM_DB_URL", db_url), pool_size: pool, ssl: ssl,
    migration_source: "schema_migrations_crm"

  config :syncflow_fleet, SyncFlow.Fleet.Repo,
    url: System.get_env("FLEET_DB_URL", db_url), pool_size: pool, ssl: ssl,
    migration_source: "schema_migrations_fleet"

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

  # AI providers
  config :syncflow_core, :ai,
    openai_api_key: System.get_env("OPENAI_API_KEY"),
    groq_api_key: System.get_env("GROQ_API_KEY"),
    anthropic_api_key: System.get_env("ANTHROPIC_API_KEY")

  # File storage — Appwrite
  config :syncflow_core, :appwrite,
    endpoint: System.get_env("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"),
    api_key: System.get_env("APPWRITE_API_KEY"),
    project_id: System.get_env("APPWRITE_PROJECT_ID"),
    bucket_id: System.get_env("APPWRITE_BUCKET_ID", "syncflow-uploads")
end
