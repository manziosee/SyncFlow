defmodule SyncFlow.Core.Router do
  use Commanded.Commands.Router

  # Accounting
  alias SyncFlow.Accounting.Aggregates.Invoice
  alias SyncFlow.Accounting.Commands

  dispatch(
    [
      Commands.CreateInvoice,
      Commands.UpdateInvoiceField,
      Commands.AddInvoiceLine,
      Commands.RemoveInvoiceLine,
      Commands.SubmitInvoiceForApproval,
      Commands.ApproveInvoice,
      Commands.RejectInvoice,
      Commands.VoidInvoice
    ],
    to: Invoice,
    identity: :invoice_id
  )

  # Inventory
  alias SyncFlow.Inventory.Aggregates.StockItem
  alias SyncFlow.Inventory.Commands, as: InvCmds

  dispatch(
    [
      InvCmds.CreateStockItem,
      InvCmds.AdjustStock,
      InvCmds.TransferStock,
      InvCmds.ReserveStock,
      InvCmds.ReleaseReservation
    ],
    to: StockItem,
    identity: :item_id
  )

  # Fleet
  alias SyncFlow.Fleet.Aggregates.Vehicle
  alias SyncFlow.Fleet.Commands, as: FleetCmds

  dispatch(
    [
      FleetCmds.RegisterVehicle,
      FleetCmds.AssignDriver,
      FleetCmds.StartTrip,
      FleetCmds.UpdateLocation,
      FleetCmds.EndTrip,
      FleetCmds.LogFuelEvent
    ],
    to: Vehicle,
    identity: :vehicle_id
  )

  # CRM
  alias SyncFlow.CRM.Aggregates.Customer
  alias SyncFlow.CRM.Commands, as: CRMCmds

  dispatch(
    [
      CRMCmds.RegisterCustomer,
      CRMCmds.UpdateCustomer,
      CRMCmds.RecordInteraction,
      CRMCmds.ChangeCustomerStatus
    ],
    to: Customer,
    identity: :customer_id
  )
end
