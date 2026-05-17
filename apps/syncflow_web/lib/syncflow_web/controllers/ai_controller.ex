defmodule SyncFlow.Web.Controllers.AIController do
  @moduledoc """
  Natural language command interface powered by Claude.
  Parses user intent and dispatches the appropriate domain command.
  """

  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Accounting.{Commands, Queries}
  alias SyncFlow.Inventory.Queries, as: IQ
  alias SyncFlow.Fleet.{Queries, Tracker}
  alias SyncFlow.HR.Queries, as: HQ

  tags ["AI"]
  security [%{"bearerAuth" => []}]

  operation :command,
    summary: "Natural language ERP command",
    description: """
    Parse a free-text business instruction and execute it.

    **Supported intents:**
    - `create_invoice` — "Create invoice for MTN Rwanda for 5,000,000 RWF"
    - `list_invoices` — "Show me all pending invoices"
    - `overdue_query` — "What is the total overdue amount this month?"
    - `low_stock_query` — "Show Kigali warehouse low stock items"
    - `transfer_stock` — "Transfer 200 bags of cement from Kigali to Musanze"
    - `fleet_status` — "How many vehicles are on trip right now?"
    - `headcount_query` — "How many employees do we have in Finance?"
    - `payroll_status` — "Is payroll for April approved?"
    - `inventory_value` — "What is the total inventory value?"

    Without `ANTHROPIC_API_KEY`, a rule-based fallback is used for development.
    """,
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Natural language command", "AICommandRequest"),
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Command result", "AICommandResponse"),
      400 => SyncFlow.Web.ApiSpec.Operations.json_response(400, "Unrecognized intent", "ErrorResponse"),
      503 => SyncFlow.Web.ApiSpec.Operations.json_response(503, "AI service unavailable", "ErrorResponse")
    }

  @system_prompt """
  You are SyncFlow AI, an ERP assistant for African businesses. Parse user commands and return JSON:
  {
    "intent": "<one of the supported intents>",
    "parameters": { ...relevant params... }
  }

  Supported intents: create_invoice, list_invoices, overdue_query, low_stock_query,
  transfer_stock, fleet_status, headcount_query, payroll_status, inventory_value, unknown.

  For create_invoice extract: customer_name, customer_id (if mentioned), currency, amount, due_date, lines.
  For list_invoices extract: status (optional).
  For low_stock_query extract: warehouse_name (optional).
  For transfer_stock extract: item_name, from_warehouse, to_warehouse, quantity.
  For headcount_query extract: department (optional).

  Return only valid JSON. Default currency is RWF.
  """

  def command(conn, %{"message" => message}) do
    user = conn.assigns.current_user
    org_id = conn.assigns.current_org_id

    case parse_intent(message) do
      {:ok, %{"intent" => "create_invoice", "parameters" => params}} ->
        handle_create_invoice(conn, params, user, org_id)

      {:ok, %{"intent" => "list_invoices", "parameters" => params}} ->
        invoices = Queries.list_invoices(org_id, status: params["status"])
        json(conn, %{data: invoices, count: length(invoices), message: "Found #{length(invoices)} invoices"})

      {:ok, %{"intent" => "overdue_query"}} ->
        overdue = Queries.overdue_invoices(org_id)
        total = Enum.reduce(overdue, Decimal.new("0"), &Decimal.add(&2, &1.total_amount || Decimal.new("0")))
        json(conn, %{
          data: %{count: length(overdue), total_overdue: total, currency: "RWF"},
          message: "#{length(overdue)} overdue invoices totalling #{total} RWF"
        })

      {:ok, %{"intent" => "low_stock_query", "parameters" => params}} ->
        items = IQ.low_stock_items(org_id)
        filtered = if params["warehouse_name"], do: items, else: items
        json(conn, %{
          data: filtered,
          count: length(filtered),
          message: "#{length(filtered)} items below reorder point"
        })

      {:ok, %{"intent" => "transfer_stock", "parameters" => params}} ->
        json(conn, %{
          data: %{status: "pending", params: params},
          message: "To transfer stock, use POST /api/inventory/stock-items/:id/transfer with from_warehouse_id, to_warehouse_id, and quantity."
        })

      {:ok, %{"intent" => "fleet_status"}} ->
        counts = SyncFlow.Fleet.Queries.fleet_summary(org_id)
        active = Tracker.all_active_vehicles()
        json(conn, %{
          data: %{by_status: counts, active_on_gps: length(active)},
          message: "Fleet status: #{inspect(counts)}"
        })

      {:ok, %{"intent" => "headcount_query", "parameters" => params}} ->
        breakdown = HQ.headcount_by_department(org_id)
        dept = params["department"]

        result =
          if dept do
            count = Map.get(breakdown, dept, 0)
            %{department: dept, count: count}
          else
            %{by_department: breakdown, total: breakdown |> Map.values() |> Enum.sum()}
          end

        json(conn, %{data: result, message: "Headcount data"})

      {:ok, %{"intent" => "payroll_status"}} ->
        runs = HQ.list_payroll_runs(org_id, per_page: 3)
        json(conn, %{
          data: Enum.map(runs, &%{period: &1.period_start, status: &1.status, net: &1.total_net}),
          message: "Latest payroll runs"
        })

      {:ok, %{"intent" => "inventory_value"}} ->
        value = IQ.inventory_value(org_id)
        json(conn, %{
          data: value,
          message: "Total inventory value: #{value[:total_value] || 0} RWF across #{value[:total_items] || 0} items"
        })

      {:ok, %{"intent" => "unknown"}} ->
        conn |> put_status(:bad_request) |> json(%{error: "I didn't understand that. Try: 'Create invoice for MTN Rwanda for 5,000,000 RWF' or 'Show low stock items'."})

      {:error, reason} ->
        conn |> put_status(:service_unavailable) |> json(%{error: reason})
    end
  end

  defp handle_create_invoice(conn, params, user, org_id) do
    invoice_id = UUID.uuid4()

    cmd = %Commands.CreateInvoice{
      invoice_id: invoice_id,
      org_id: org_id,
      customer_id: params["customer_id"] || UUID.uuid4(),
      customer_name: params["customer_name"] || "Unknown",
      currency: params["currency"] || "RWF",
      due_date: params["due_date"],
      lines: build_lines(params),
      notes: params["notes"],
      created_by: user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        json(conn, %{
          data: %{invoice_id: invoice_id},
          message: "Invoice created for #{cmd.customer_name}"
        })

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  defp build_lines(%{"lines" => lines}) when is_list(lines) and length(lines) > 0, do: lines
  defp build_lines(%{"amount" => amount, "description" => desc}) do
    [%{"description" => desc, "quantity" => 1, "unit_price" => amount, "tax_rate" => 18}]
  end
  defp build_lines(%{"amount" => amount}) do
    [%{"description" => "Services", "quantity" => 1, "unit_price" => amount, "tax_rate" => 18}]
  end
  defp build_lines(_), do: []

  defp parse_intent(message) do
    api_key = System.get_env("ANTHROPIC_API_KEY")

    if is_nil(api_key) do
      {:ok, rule_based_parse(message)}
    else
      call_anthropic(message, api_key)
    end
  end

  defp rule_based_parse(message) do
    msg = String.downcase(message)

    cond do
      String.contains?(msg, ["create invoice", "new invoice", "make invoice", "generate invoice"]) ->
        %{"intent" => "create_invoice", "parameters" => extract_invoice_params(msg)}

      String.contains?(msg, ["list invoice", "show invoice", "all invoices", "pending invoice"]) ->
        status = cond do
          String.contains?(msg, "pending") -> "pending_approval"
          String.contains?(msg, "approved") -> "approved"
          String.contains?(msg, "paid") -> "paid"
          true -> nil
        end
        %{"intent" => "list_invoices", "parameters" => %{"status" => status}}

      String.contains?(msg, ["overdue", "unpaid", "past due"]) ->
        %{"intent" => "overdue_query", "parameters" => %{}}

      String.contains?(msg, ["low stock", "out of stock", "reorder", "below threshold"]) ->
        %{"intent" => "low_stock_query", "parameters" => %{}}

      String.contains?(msg, ["transfer", "move stock", "send to warehouse"]) ->
        %{"intent" => "transfer_stock", "parameters" => %{}}

      String.contains?(msg, ["fleet", "vehicle", "truck", "driver", "on trip"]) ->
        %{"intent" => "fleet_status", "parameters" => %{}}

      String.contains?(msg, ["headcount", "how many employee", "staff count", "department"]) ->
        %{"intent" => "headcount_query", "parameters" => %{}}

      String.contains?(msg, ["payroll", "salary", "pay slip"]) ->
        %{"intent" => "payroll_status", "parameters" => %{}}

      String.contains?(msg, ["inventory value", "stock value", "total inventory"]) ->
        %{"intent" => "inventory_value", "parameters" => %{}}

      true ->
        %{"intent" => "unknown", "parameters" => %{}}
    end
  end

  defp extract_invoice_params(msg) do
    amount_match = Regex.run(~r/(\d[\d,]+)\s*(?:rwf|frw)/i, msg)
    customer_match = Regex.run(~r/for\s+([\w\s]+?)(?:\s+for|\s+\d|\s+rwf|$)/i, msg)

    %{
      "customer_name" => (customer_match && String.trim(Enum.at(customer_match, 1))) || nil,
      "amount" => (amount_match && String.replace(Enum.at(amount_match, 1), ",", "")) || nil,
      "currency" => "RWF"
    }
  end

  defp call_anthropic(message, api_key) do
    body = Jason.encode!(%{
      model: "claude-sonnet-4-6",
      max_tokens: 512,
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
