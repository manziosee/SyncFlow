defmodule SyncFlow.Web.Dispatch do
  @moduledoc """
  Thin wrapper so web controllers keep the CommandedApp.dispatch interface
  while the actual router lives in syncflow_web (compiled after all domain apps).
  """

  def dispatch(command, opts \\ []) do
    SyncFlow.Web.CommandedRouter.dispatch(
      command,
      Keyword.put(opts, :application, SyncFlow.Core.CommandedApp)
    )
  end
end
