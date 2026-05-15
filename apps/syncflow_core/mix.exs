defmodule SyncFlow.Core.MixProject do
  use Mix.Project

  def project do
    [
      app: :syncflow_core,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.16",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  def application do
    [
      mod: {SyncFlow.Core.Application, []},
      extra_applications: [:logger, :runtime_tools, :crypto]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      # Database
      {:ecto_sql, "~> 3.11"},
      {:postgrex, ">= 0.0.0"},

      # CQRS / Event Sourcing
      {:commanded, "~> 1.4"},
      {:commanded_eventstore_adapter, "~> 1.4"},
      {:eventstore, "~> 1.4"},

      # Background jobs
      {:oban, "~> 2.17"},

      # Auth
      {:guardian, "~> 2.3"},
      {:bcrypt_elixir, "~> 3.0"},
      {:comeonin, "~> 5.4"},

      # JSON
      {:jason, "~> 1.4"},

      # HTTP client
      {:finch, "~> 0.18"},
      {:tesla, "~> 1.9"},

      # Email
      {:swoosh, "~> 1.16"},

      # Telemetry
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.1"},

      # Utilities
      {:uuid, "~> 1.1"},
      {:timex, "~> 3.7"},
      {:decimal, "~> 2.1"},
      {:ex_money, "~> 5.18"},

      # Validation
      {:vex, "~> 0.9"},

      # AI
      {:anthropic, "~> 0.1", optional: true},

      # Test
      {:ex_machina, "~> 2.7", only: :test},
      {:faker, "~> 0.17", only: :test}
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
