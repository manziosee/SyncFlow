defmodule SyncFlow.Web.Controllers.AIController do
  @moduledoc """
  Natural language command interface.
  Parses user intent and dispatches the appropriate domain command.
  """

  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Accounting.{Commands, Queries}

  @system_prompt """
  You are SyncFlow AI, an ERP assistant. Parse user commands and return JSON with:
  {
    "intent": "create_invoice" | "list_invoices" | "low_stock_query" | "unknown",
    "parameters": { ... relevant params ... }
  }
  Only return valid JSON, nothing else.
  """

  def command(conn, %{"message" => message}) do
    user = conn.assigns.current_user
    org_id = conn.assigns.current_org_id

    case parse_intent(message) do
      {:ok, %{"intent" => "create_invoice", "parameters" => params}} ->
        handle_create_invoice(conn, params, user, org_id)

      {:ok, %{"intent" => "list_invoices", "parameters" => params}} ->
        invoices = Queries.list_invoices(org_id, status: params["status"])
        json(conn, %{data: invoices, message: "Found #{length(invoices)} invoices"})

      {:ok, %{"intent" => "low_stock_query"}} ->
        json(conn, %{message: "Checking low stock items..."})

      {:ok, %{"intent" => "unknown"}} ->
        conn |> put_status(:bad_request) |> json(%{error: "I didn't understand that command"})

      {:error, reason} ->
        conn |> put_status(:service_unavailable) |> json(%{error: reason})
    end
  end

  defp handle_create_invoice(conn, params, user, org_id) do
    invoice_id = UUID.uuid4()

    cmd = %Commands.CreateInvoice{
      invoice_id: invoice_id,
      org_id: org_id,
      customer_id: params["customer_id"],
      customer_name: params["customer_name"],
      currency: params["currency"] || "RWF",
      due_date: params["due_date"],
      lines: params["lines"] || [],
      notes: params["notes"],
      created_by: user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        json(conn, %{
          data: %{invoice_id: invoice_id},
          message: "Invoice created for #{params["customer_name"]}"
        })

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  defp parse_intent(message) do
    api_key = System.get_env("ANTHROPIC_API_KEY")

    if is_nil(api_key) do
      {:ok, rule_based_parse(message)}
    else
      call_anthropic(message, api_key)
    end
  end

  # Fallback rule-based parser (no AI key needed in dev)
  defp rule_based_parse(message) do
    msg = String.downcase(message)

    cond do
      String.contains?(msg, ["create invoice", "new invoice", "make invoice"]) ->
        %{"intent" => "create_invoice", "parameters" => %{}}

      String.contains?(msg, ["list invoice", "show invoice", "invoices"]) ->
        %{"intent" => "list_invoices", "parameters" => %{}}

      String.contains?(msg, ["low stock", "out of stock", "reorder"]) ->
        %{"intent" => "low_stock_query", "parameters" => %{}}

      true ->
        %{"intent" => "unknown", "parameters" => %{}}
    end
  end

  defp call_anthropic(message, api_key) do
    body = Jason.encode!(%{
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      system: @system_prompt,
      messages: [%{role: "user", content: message}]
    })

    case Finch.build(:post, "https://api.anthropic.com/v1/messages",
           [
             {"content-type", "application/json"},
             {"x-api-key", api_key},
             {"anthropic-version", "2023-06-01"}
           ],
           body
         )
         |> Finch.request(SyncFlow.Finch) do
      {:ok, %{status: 200, body: resp_body}} ->
        with {:ok, %{"content" => [%{"text" => text} | _]}} <- Jason.decode(resp_body),
             {:ok, parsed} <- Jason.decode(text) do
          {:ok, parsed}
        else
          _ -> {:ok, %{"intent" => "unknown", "parameters" => %{}}}
        end

      {:error, reason} ->
        {:error, "AI service unavailable: #{inspect(reason)}"}
    end
  end
end
