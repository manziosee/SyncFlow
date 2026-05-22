defmodule SyncFlow.CRM.Aggregates.Customer do
  alias SyncFlow.CRM.{Commands, Events}

  defstruct [:customer_id, :org_id, :name, :status]

  def execute(%__MODULE__{customer_id: nil}, %Commands.RegisterCustomer{} = cmd) do
    %Events.CustomerRegistered{
      customer_id: cmd.customer_id,
      org_id: cmd.org_id,
      name: cmd.name,
      email: cmd.email,
      phone: cmd.phone,
      type: cmd.type || :individual,
      status: cmd.status || :active,
      address: cmd.address,
      country: cmd.country,
      industry: cmd.industry,
      created_by: cmd.created_by,
      created_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = c, %Commands.UpdateCustomer{} = cmd) do
    changes = Map.take(cmd, [:name, :email, :phone, :address]) |> Enum.reject(fn {_, v} -> is_nil(v) end) |> Map.new()

    %Events.CustomerUpdated{
      customer_id: c.customer_id,
      changes: changes,
      updated_by: cmd.updated_by,
      updated_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = c, %Commands.RecordInteraction{} = cmd) do
    %Events.InteractionRecorded{
      customer_id: c.customer_id,
      interaction_id: UUID.uuid4(),
      type: cmd.type,
      notes: cmd.notes,
      outcome: cmd.outcome,
      recorded_by: cmd.recorded_by,
      occurred_at: cmd.occurred_at || DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = c, %Commands.ChangeCustomerStatus{} = cmd) do
    %Events.CustomerStatusChanged{
      customer_id: c.customer_id,
      old_status: c.status,
      new_status: cmd.status,
      reason: cmd.reason,
      changed_by: cmd.changed_by,
      changed_at: DateTime.utc_now()
    }
  end

  def apply(%__MODULE__{} = c, %Events.CustomerRegistered{} = evt) do
    %{c | customer_id: evt.customer_id, org_id: evt.org_id, name: evt.name, status: evt.status || :active}
  end

  def apply(%__MODULE__{} = c, %Events.CustomerUpdated{changes: changes}) do
    Enum.reduce(changes, c, fn {k, v}, acc -> Map.put(acc, k, v) end)
  end

  def apply(%__MODULE__{} = c, %Events.CustomerStatusChanged{new_status: status}) do
    %{c | status: status}
  end

  def apply(c, _), do: c
end
