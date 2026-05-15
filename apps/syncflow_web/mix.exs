defmodule SyncFlow.Web.MixProject do
  use Mix.Project

  def project do
    [
      app: :syncflow_web,
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
      mod: {SyncFlow.Web.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:syncflow_core, in_umbrella: true},
      {:syncflow_accounting, in_umbrella: true},
      {:syncflow_inventory, in_umbrella: true},
      {:syncflow_hr, in_umbrella: true},
      {:syncflow_crm, in_umbrella: true},
      {:syncflow_fleet, in_umbrella: true},

      # Phoenix
      {:phoenix, "~> 1.7"},
      {:phoenix_ecto, "~> 4.5"},
      {:phoenix_live_view, "~> 0.20"},
      {:phoenix_pubsub, "~> 2.1"},

      # HTTP
      {:plug_cowboy, "~> 2.7"},
      {:corsica, "~> 2.1"},

      # JSON
      {:jason, "~> 1.4"},

      # OpenAPI / Swagger
      {:open_api_spex, "~> 3.21"},

      # Telemetry
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.1"},

      # Test
      {:phoenix_live_view, "~> 0.20", only: :test},
      {:plug_cowboy, "~> 2.7", only: :test}
    ]
  end

  defp aliases do
    [test: ["test"]]
  end
end
