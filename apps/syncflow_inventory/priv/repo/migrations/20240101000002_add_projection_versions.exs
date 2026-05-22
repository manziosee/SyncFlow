defmodule SyncFlow.Inventory.Repo.Migrations.AddProjectionVersions do
  use Ecto.Migration

  def change do
    create_if_not_exists table(:projection_versions, primary_key: false) do
      add :projection_name, :string, null: false, primary_key: true
      add :last_seen_event_number, :bigint
      timestamps(null: false)
    end
  end
end
