defmodule SyncFlow.CRM.Repo.Migrations.AddCustomerFields do
  use Ecto.Migration

  def change do
    alter table(:customers) do
      add :country, :string
      add :industry, :string
    end
  end
end
