defmodule SyncFlow.Web.Controllers.UploadController do
  @moduledoc """
  File upload endpoint backed by Appwrite Storage.
  Accepts multipart uploads and returns the Appwrite file ID + view URL.
  """

  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.Storage.Appwrite

  @max_bytes 20 * 1024 * 1024

  def create(conn, %{"file" => %Plug.Upload{} = upload}) do
    with {:ok, content} <- File.read(upload.path),
         :ok <- check_size(byte_size(content)),
         {:ok, result} <- Appwrite.upload(upload.filename, content, upload.content_type) do
      conn
      |> put_status(:created)
      |> json(%{
        data: %{
          file_id: result.file_id,
          url: result.url,
          name: result.name,
          size: result.size
        }
      })
    else
      {:error, :too_large} ->
        conn |> put_status(:payload_too_large) |> json(%{error: "File exceeds 20 MB limit"})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: reason})
    end
  end

  def create(conn, _params) do
    conn |> put_status(:bad_request) |> json(%{error: "Missing file field in multipart form"})
  end

  def delete(conn, %{"file_id" => file_id}) do
    case Appwrite.delete(file_id) do
      :ok -> send_resp(conn, :no_content, "")
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: reason})
    end
  end

  defp check_size(bytes) when bytes > @max_bytes, do: {:error, :too_large}
  defp check_size(_), do: :ok
end
