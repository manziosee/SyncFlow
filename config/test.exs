import Config

config :syncflow_core, SyncFlow.Core.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "syncflow_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :syncflow_accounting, SyncFlow.Accounting.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "syncflow_accounting_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :syncflow_inventory, SyncFlow.Inventory.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "syncflow_inventory_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :syncflow_hr, SyncFlow.HR.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "syncflow_hr_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :syncflow_crm, SyncFlow.CRM.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "syncflow_crm_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :syncflow_fleet, SyncFlow.Fleet.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "syncflow_fleet_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :syncflow_web, SyncFlow.Web.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "test_secret_key_base_at_least_64_bytes_long_syncflow_test_env_ok",
  server: false

config :logger, level: :warning
config :phoenix, :plug_init_mode, :runtime
