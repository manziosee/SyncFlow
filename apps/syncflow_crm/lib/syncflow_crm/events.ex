defmodule SyncFlow.CRM.Events do
  defmodule CustomerRegistered do
    @derive Jason.Encoder
    defstruct [:customer_id, :org_id, :name, :email, :phone, :type, :status, :address, :country, :industry, :created_by, :created_at]
  end

  defmodule CustomerUpdated do
    @derive Jason.Encoder
    defstruct [:customer_id, :changes, :updated_by, :updated_at]
  end

  defmodule InteractionRecorded do
    @derive Jason.Encoder
    defstruct [:customer_id, :interaction_id, :type, :notes, :outcome, :recorded_by, :occurred_at]
  end

  defmodule CustomerStatusChanged do
    @derive Jason.Encoder
    defstruct [:customer_id, :old_status, :new_status, :reason, :changed_by, :changed_at]
  end
end
