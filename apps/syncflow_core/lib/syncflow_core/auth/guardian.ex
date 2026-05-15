defmodule SyncFlow.Core.Auth.Guardian do
  use Guardian, otp_app: :syncflow_core

  alias SyncFlow.Core.Accounts.User

  def subject_for_token(%User{id: id}, _claims), do: {:ok, to_string(id)}
  def subject_for_token(_, _), do: {:error, :invalid_resource}

  def resource_from_claims(%{"sub" => id}) do
    case SyncFlow.Core.Accounts.get_user(id) do
      nil -> {:error, :resource_not_found}
      user -> {:ok, user}
    end
  end

  def resource_from_claims(_), do: {:error, :invalid_claims}

  def build_claims(claims, resource, _opts) do
    claims =
      claims
      |> Map.put("role", resource.role)
      |> Map.put("org_id", resource.org_id)
      |> Map.put("permissions", resource.permissions)

    {:ok, claims}
  end
end
