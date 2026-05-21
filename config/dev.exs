import Config

db_url = System.get_env("DATABASE_URL")

if db_url do
  shared = [
    url: db_url,
    ssl: [verify: :verify_none],
    stacktrace: true,
    show_sensitive_data_on_connection_error: true,
    pool_size: 10
  ]

  config :syncflow_core,     SyncFlow.Core.Repo,       shared
  config :syncflow_accounting, SyncFlow.Accounting.Repo, shared
  config :syncflow_inventory,  SyncFlow.Inventory.Repo,  shared
  config :syncflow_hr,         SyncFlow.HR.Repo,         shared
  config :syncflow_crm,        SyncFlow.CRM.Repo,        shared
  config :syncflow_fleet,      SyncFlow.Fleet.Repo,      shared
else
  db_host = System.get_env("PGHOST", "localhost")
  db_user = System.get_env("PGUSER", "postgres")
  db_pass = System.get_env("PGPASSWORD", "postgres")

  for {app, repo, db} <- [
    {:syncflow_core,       SyncFlow.Core.Repo,        "syncflow_dev"},
    {:syncflow_accounting, SyncFlow.Accounting.Repo,  "syncflow_accounting_dev"},
    {:syncflow_inventory,  SyncFlow.Inventory.Repo,   "syncflow_inventory_dev"},
    {:syncflow_hr,         SyncFlow.HR.Repo,           "syncflow_hr_dev"},
    {:syncflow_crm,        SyncFlow.CRM.Repo,          "syncflow_crm_dev"},
    {:syncflow_fleet,      SyncFlow.Fleet.Repo,        "syncflow_fleet_dev"}
  ] do
    config app, repo,
      username: db_user,
      password: db_pass,
      hostname: db_host,
      database: db,
      stacktrace: true,
      show_sensitive_data_on_connection_error: true,
      pool_size: 10
  end
end

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
