defmodule SyncFlow.Core.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :email, :string, null: false
      add :name, :string, null: false
      add :password_hash, :string
      add :role, :string, null: false, default: "cashier"
      add :org_id, references(:organizations, type: :binary_id, on_delete: :delete_all), null: false
      add :permissions, {:array, :string}, default: []
      add :avatar_url, :string
      add :phone, :string
      add :department, :string
      add :is_active, :boolean, default: true
      add :last_seen_at, :utc_datetime
      add :timezone, :string, default: "Africa/Kigali"
      add :locale, :string, default: "en"

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
    create index(:users, [:org_id])
    create index(:users, [:role])
  end
end
