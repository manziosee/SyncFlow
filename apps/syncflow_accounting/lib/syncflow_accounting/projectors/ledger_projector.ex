defmodule SyncFlow.Accounting.Projectors.LedgerProjector do
  use Commanded.Projections.Ecto,
    application: SyncFlow.Core.CommandedApp,
    repo: SyncFlow.Accounting.Repo,
    name: "ledger_projector",
    consistency: :eventual

  alias SyncFlow.Accounting.Events
  alias SyncFlow.Accounting.Schema.LedgerEntry

  project(%Events.InvoiceApproved{} = evt, _metadata, fn multi ->
    entry = %LedgerEntry{
      id: UUID.uuid4(),
      org_id: evt.org_id,
      invoice_id: evt.invoice_id,
      type: :accounts_receivable,
      description: "Invoice approved",
      amount: evt.total_amount,
      direction: :debit,
      posted_at: evt.approved_at
    }

    Ecto.Multi.insert(multi, :ledger_entry, entry)
  end)
end
