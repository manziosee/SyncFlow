import Config

db_host = System.get_env("PGHOST", "localhost")
db_user = System.get_env("PGUSER", "postgres")
db_pass = System.get_env("PGPASSWORD", "postgres")

config :syncflow_core, SyncFlow.Core.Repo,
  username: db_user,
  password: db_pass,
  hostname: db_host,
  database: "syncflow_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :syncflow_accounting, SyncFlow.Accounting.Repo,
  username: db_user,
  password: db_pass,
  hostname: db_host,
  database: "syncflow_accounting_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :syncflow_inventory, SyncFlow.Inventory.Repo,
  username: db_user,
  password: db_pass,
  hostname: db_host,
  database: "syncflow_inventory_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :syncflow_hr, SyncFlow.HR.Repo,
  username: db_user,
  password: db_pass,
  hostname: db_host,
  database: "syncflow_hr_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :syncflow_crm, SyncFlow.CRM.Repo,
  username: db_user,
  password: db_pass,
  hostname: db_host,
  database: "syncflow_crm_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :syncflow_fleet, SyncFlow.Fleet.Repo,
  username: db_user,
  password: db_pass,
  hostname: db_host,
  database: "syncflow_fleet_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :syncflow_web, SyncFlow.Web.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "local_dev_secret_key_base_must_be_at_least_64_bytes_long_syncflow_dev",
  watchers: []

config :logger, :console,
  format: "[$level] $message\n",
  metadata: [:request_id, :user_id]

config :phoenix, :plug_init_mode, :runtime

config :swoosh, :api_client, false
