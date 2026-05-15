import Config

# Shared config across all apps
config :syncflow_core,
  ecto_repos: [SyncFlow.Core.Repo],
  event_store: [
    serializer: Commanded.Serialization.JsonSerializer,
    username: System.get_env("PGUSER", "postgres"),
    password: System.get_env("PGPASSWORD", "postgres"),
    database: System.get_env("EVENT_STORE_DB", "syncflow_events"),
    hostname: System.get_env("PGHOST", "localhost"),
    pool_size: 10
  ]

config :syncflow_accounting, ecto_repos: [SyncFlow.Accounting.Repo]
config :syncflow_inventory, ecto_repos: [SyncFlow.Inventory.Repo]
config :syncflow_hr, ecto_repos: [SyncFlow.HR.Repo]
config :syncflow_crm, ecto_repos: [SyncFlow.CRM.Repo]
config :syncflow_fleet, ecto_repos: [SyncFlow.Fleet.Repo]

config :syncflow_web,
  ecto_repos: [],
  generators: [context_app: false]

# Phoenix endpoint
config :syncflow_web, SyncFlow.Web.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: SyncFlow.Web.ErrorJSON],
    layout: false
  ],
  pubsub_server: SyncFlow.PubSub,
  live_view: [signing_salt: System.get_env("LIVE_VIEW_SALT", "syncflow_salt")]

# Guardian JWT auth
config :syncflow_core, SyncFlow.Core.Auth.Guardian,
  issuer: "syncflow",
  secret_key: System.get_env("GUARDIAN_SECRET", "change_me_in_production")

# Oban background jobs
config :syncflow_core, Oban,
  repo: SyncFlow.Core.Repo,
  queues: [
    default: 10,
    invoices: 5,
    notifications: 20,
    reports: 3,
    ai: 5,
    fleet: 10
  ]

# Swoosh mailer
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: SyncFlow.Finch

# Commanded CQRS/ES
config :commanded,
  event_store_adapter: Commanded.EventStore.Adapters.EventStore

config :commanded_eventstore_adapter,
  serializer: Commanded.Serialization.JsonSerializer

import_config "#{config_env()}.exs"
