defmodule SyncFlow.Core.Repo.Migrations.CreateActivityLog do
  use Ecto.Migration

  def change do
    create table(:activity_logs, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :user_id, :binary_id
      add :user_name, :string
      add :action, :string, null: false
      add :resource_type, :string, null: false
      add :resource_id, :string
      add :old_value, :jsonb
      add :new_value, :jsonb
      add :metadata, :jsonb, default: "{}"
      add :ip_address, :string
      add :inserted_at, :utc_datetime, null: false
    end

    create index(:activity_logs, [:org_id])
    create index(:activity_logs, [:user_id])
    create index(:activity_logs, [:resource_type, :resource_id])
    create index(:activity_logs, [:inserted_at])
  end
end
