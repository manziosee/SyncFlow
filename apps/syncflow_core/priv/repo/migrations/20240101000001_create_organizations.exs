defmodule SyncFlow.Core.Repo.Migrations.CreateOrganizations do
  use Ecto.Migration

  def change do
    create table(:organizations, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :slug, :string, null: false
      add :country, :string, default: "RW"
      add :currency, :string, default: "RWF"
      add :timezone, :string, default: "Africa/Kigali"
      add :tax_id, :string
      add :address, :jsonb
      add :logo_url, :string
      add :settings, :jsonb, default: "{}"
      add :plan, :string, default: "free"
      add :is_active, :boolean, default: true

      timestamps(type: :utc_datetime)
    end

    create unique_index(:organizations, [:slug])
  end
end
