defmodule SyncFlow.Accounting.MixProject do
  use Mix.Project

  def project do
    [
      app: :syncflow_accounting,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.16",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {SyncFlow.Accounting.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:syncflow_core, in_umbrella: true},
      {:ecto_sql, "~> 3.11"},
      {:postgrex, ">= 0.0.0"},
      {:jason, "~> 1.4"},
      {:decimal, "~> 2.1"},
      {:ex_money, "~> 5.18"},
      {:commanded, "~> 1.4"},
      {:ex_machina, "~> 2.7", only: :test}
    ]
  end
end
