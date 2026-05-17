defmodule SyncFlow.Core.Workers.NotificationWorker do
  @moduledoc """
  Async Oban worker for sending notifications.
  Supports in-app PubSub broadcast and email via Swoosh/Mailgun.

  Enqueue with:
    NotificationWorker.enqueue(:in_app, user_id, payload)
    NotificationWorker.enqueue(:email, recipient_email, payload)
    NotificationWorker.enqueue(:broadcast, org_id, payload)
  """

  use Oban.Worker, queue: :notifications, max_attempts: 5

  alias Phoenix.PubSub

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"channel" => "in_app", "user_id" => user_id, "payload" => payload}}) do
    PubSub.broadcast(
      SyncFlow.PubSub,
      "user:#{user_id}:notifications",
      {:notification, atomize_keys(payload)}
    )

    :ok
  end

  def perform(%Oban.Job{args: %{"channel" => "broadcast", "org_id" => org_id, "payload" => payload}}) do
    PubSub.broadcast(
      SyncFlow.PubSub,
      "org:#{org_id}:alerts",
      {:notification, atomize_keys(payload)}
    )

    :ok
  end

  def perform(%Oban.Job{args: %{"channel" => "email", "email" => email, "subject" => subject, "body" => body}}) do
    send_email(email, subject, body)
  end

  def perform(%Oban.Job{args: args}) do
    {:error, "Unknown notification args: #{inspect(args)}"}
  end

  # --- Public enqueue helpers ---

  def enqueue(:in_app, user_id, payload) do
    %{"channel" => "in_app", "user_id" => user_id, "payload" => payload}
    |> new()
    |> Oban.insert()
  end

  def enqueue(:broadcast, org_id, payload) do
    %{"channel" => "broadcast", "org_id" => org_id, "payload" => payload}
    |> new()
    |> Oban.insert()
  end

  def enqueue(:email, recipient_email, %{subject: subject, body: body}) do
    %{"channel" => "email", "email" => recipient_email, "subject" => subject, "body" => body}
    |> new()
    |> Oban.insert()
  end

  # --- Notification presets ---

  def notify_invoice_approved(user_id, invoice_number) do
    enqueue(:in_app, user_id, %{
      "type" => "invoice_approved",
      "title" => "Invoice Approved",
      "body" => "Invoice #{invoice_number} has been approved.",
      "severity" => "success"
    })
  end

  def notify_invoice_rejected(user_id, invoice_number, reason) do
    enqueue(:in_app, user_id, %{
      "type" => "invoice_rejected",
      "title" => "Invoice Rejected",
      "body" => "Invoice #{invoice_number} was rejected: #{reason}",
      "severity" => "error"
    })
  end

  def notify_low_stock(org_id, item_name, warehouse_name) do
    enqueue(:broadcast, org_id, %{
      "type" => "low_stock",
      "title" => "Low Stock Alert",
      "body" => "#{item_name} is below reorder point at #{warehouse_name}.",
      "severity" => "warning"
    })
  end

  def notify_payroll_ready(user_id, period) do
    enqueue(:in_app, user_id, %{
      "type" => "payroll_ready",
      "title" => "Payroll Ready for Approval",
      "body" => "Payroll for #{period} has been processed and is awaiting approval.",
      "severity" => "info"
    })
  end

  # --- Private ---

  defp send_email(to, subject, body) do
    api_key = System.get_env("MAILGUN_API_KEY")
    domain = System.get_env("MAILGUN_DOMAIN", "syncflow.rw")
    from = "SyncFlow <noreply@#{domain}>"

    if is_nil(api_key) do
      # Dev: log instead of send
      require Logger
      Logger.info("[NotificationWorker] Email to #{to}: #{subject}\n#{body}")
      :ok
    else
      case Finch.build(
             :post,
             "https://api.mailgun.net/v3/#{domain}/messages",
             [
               {"Authorization", "Basic " <> Base.encode64("api:#{api_key}")},
               {"Content-Type", "application/x-www-form-urlencoded"}
             ],
             URI.encode_query(%{from: from, to: to, subject: subject, text: body})
           )
           |> Finch.request(SyncFlow.Finch) do
        {:ok, %{status: s}} when s in [200, 202] -> :ok
        {:ok, %{status: s, body: b}} -> {:error, "Mailgun error #{s}: #{b}"}
        {:error, reason} -> {:error, inspect(reason)}
      end
    end
  end

  defp atomize_keys(map) when is_map(map) do
    Map.new(map, fn {k, v} -> {String.to_atom(k), v} end)
  end
end
