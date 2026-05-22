defmodule SyncFlow.CRM.Projectors.CustomerProjector do
  use Commanded.Projections.Ecto,
    application: SyncFlow.Core.CommandedApp,
    repo: SyncFlow.CRM.Repo,
    name: "customer_projector",
    consistency: :strong

  alias SyncFlow.CRM.Events
  alias SyncFlow.CRM.Schema.{Customer, Interaction}

  project(%Events.CustomerRegistered{} = evt, _meta, fn multi ->
    Ecto.Multi.insert(multi, :customer, %Customer{
      id: evt.customer_id,
      org_id: evt.org_id,
      name: evt.name,
      email: evt.email,
      phone: evt.phone,
      type: evt.type,
      status: evt.status || :active,
      address: evt.address,
      country: evt.country,
      industry: evt.industry
    })
  end)

  project(%Events.CustomerUpdated{} = evt, _meta, fn multi ->
    Ecto.Multi.update_all(multi, :customer,
      from(c in Customer, where: c.id == ^evt.customer_id),
      set: Enum.map(evt.changes, fn {k, v} -> {k, v} end)
    )
  end)

  project(%Events.InteractionRecorded{} = evt, _meta, fn multi ->
    Ecto.Multi.insert(multi, :interaction, %Interaction{
      id: evt.interaction_id,
      customer_id: evt.customer_id,
      type: evt.type,
      notes: evt.notes,
      outcome: evt.outcome,
      recorded_by: evt.recorded_by,
      occurred_at: evt.occurred_at
    })
  end)

  project(%Events.CustomerStatusChanged{} = evt, _meta, fn multi ->
    Ecto.Multi.update_all(multi, :customer,
      from(c in Customer, where: c.id == ^evt.customer_id),
      set: [status: evt.new_status]
    )
  end)

  @impl true
  def after_update(%Events.CustomerRegistered{} = evt, _, _) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "org:#{evt.org_id}:crm", {:customer_registered, evt})
    :ok
  end

  def after_update(_, _, _), do: :ok
end
