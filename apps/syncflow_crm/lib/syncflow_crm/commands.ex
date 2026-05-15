defmodule SyncFlow.CRM.Commands do
  defmodule RegisterCustomer do
    @derive Jason.Encoder
    defstruct [:customer_id, :org_id, :name, :email, :phone, :type, :address, :created_by]
  end

  defmodule UpdateCustomer do
    @derive Jason.Encoder
    defstruct [:customer_id, :name, :email, :phone, :address, :updated_by]
  end

  defmodule RecordInteraction do
    @derive Jason.Encoder
    defstruct [:customer_id, :type, :notes, :outcome, :recorded_by, :occurred_at]
  end

  defmodule ChangeCustomerStatus do
    @derive Jason.Encoder
    defstruct [:customer_id, :status, :reason, :changed_by]
  end
end
