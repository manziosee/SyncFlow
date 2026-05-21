import Config

# Shared config across all apps
config :syncflow_core,
  ecto_repos: [SyncFlow.Core.Repo],
  event_stores: [SyncFlow.Core.EventStore]

config :syncflow_core, SyncFlow.Core.EventStore,
  serializer: Commanded.Serialization.JsonSerializer,
  url: (System.get_env("EVENT_STORE_URL") || System.get_env("DATABASE_URL") || "postgresql://postgres:postgres@localhost/syncflow_events") |> String.split("?") |> hd(),
  ssl: [verify: :verify_none],
  pool_size: 10

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

# CLDR / ex_money
config :ex_cldr, default_backend: SyncFlow.Core.Cldr
config :ex_money, default_cldr_backend: SyncFlow.Core.Cldr

# Swoosh mailer
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: SyncFlow.Finch

# Commanded CQRS/ES
config :commanded,
  event_store_adapter: Commanded.EventStore.Adapters.EventStore

config :commanded_eventstore_adapter,
  serializer: Commanded.Serialization.JsonSerializer

# AI providers (overridden per environment via runtime.exs in prod)
config :syncflow_core, :ai,
  openai_api_key: System.get_env("OPENAI_API_KEY"),
  groq_api_key: System.get_env("GROQ_API_KEY"),
  anthropic_api_key: System.get_env("ANTHROPIC_API_KEY")

# File storage — Appwrite (replaces AWS S3)
config :syncflow_core, :appwrite,
  endpoint: System.get_env("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"),
  api_key: System.get_env("APPWRITE_API_KEY"),
  project_id: System.get_env("APPWRITE_PROJECT_ID"),
  bucket_id: System.get_env("APPWRITE_BUCKET_ID", "syncflow-uploads")

import_config "#{config_env()}.exs"
