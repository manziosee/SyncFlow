defmodule SyncFlow.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases(),
      releases: releases()
    ]
  end

  defp deps do
    []
  end

  defp aliases do
    [
      setup: ["cmd mix deps.get", "cmd mix ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end

  defp releases do
    [
      syncflow: [
        applications: [
          syncflow_core: :permanent,
          syncflow_accounting: :permanent,
          syncflow_inventory: :permanent,
          syncflow_hr: :permanent,
          syncflow_crm: :permanent,
          syncflow_fleet: :permanent,
          syncflow_web: :permanent
        ]
      ]
    ]
  end
end
