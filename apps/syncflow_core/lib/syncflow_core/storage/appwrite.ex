defmodule SyncFlow.Core.Storage.Appwrite do
  @moduledoc """
  Appwrite file storage client. Replaces AWS S3 for all file uploads.

  Configuration (read from application env, populated via runtime.exs):
    config :syncflow_core, :appwrite,
      endpoint:   "https://cloud.appwrite.io/v1",
      api_key:    "...",
      project_id: "...",
      bucket_id:  "syncflow-uploads"
  """

  @doc """
  Upload a file to Appwrite Storage.

  `filename`  - original file name (used as Appwrite file name)
  `content`   - binary file content
  `mime_type` - e.g. "application/pdf", "image/jpeg"

  Returns `{:ok, %{file_id: id, url: url}}` or `{:error, reason}`.
  """
  def upload(filename, content, mime_type \\ "application/octet-stream") do
    %{endpoint: endpoint, api_key: api_key, project_id: project_id, bucket_id: bucket_id} = cfg()

    file_id = UUID.uuid4()
    boundary = "----FormBoundary#{:crypto.strong_rand_bytes(12) |> Base.encode16()}"

    body =
      "--#{boundary}\r\n" <>
      "Content-Disposition: form-data; name=\"fileId\"\r\n\r\n#{file_id}\r\n" <>
      "--#{boundary}\r\n" <>
      "Content-Disposition: form-data; name=\"file\"; filename=\"#{filename}\"\r\n" <>
      "Content-Type: #{mime_type}\r\n\r\n" <>
      content <>
      "\r\n--#{boundary}--\r\n"

    url = "#{endpoint}/storage/buckets/#{bucket_id}/files"

    headers = [
      {"content-type", "multipart/form-data; boundary=#{boundary}"},
      {"x-appwrite-project", project_id},
      {"x-appwrite-key", api_key}
    ]

    case Finch.build(:post, url, headers, body) |> Finch.request(SyncFlow.Finch) do
      {:ok, %{status: status, body: resp_body}} when status in [200, 201] ->
        with {:ok, data} <- Jason.decode(resp_body) do
          view_url = "#{endpoint}/storage/buckets/#{bucket_id}/files/#{data["$id"]}/view?project=#{project_id}"
          {:ok, %{file_id: data["$id"], url: view_url, name: data["name"], size: data["sizeOriginal"]}}
        end

      {:ok, %{status: status, body: resp_body}} ->
        {:error, "Appwrite returned #{status}: #{resp_body}"}

      {:error, reason} ->
        {:error, "Appwrite request failed: #{inspect(reason)}"}
    end
  end

  @doc """
  Get a public view URL for an existing file.
  """
  def file_url(file_id) do
    %{endpoint: endpoint, project_id: project_id, bucket_id: bucket_id} = cfg()
    "#{endpoint}/storage/buckets/#{bucket_id}/files/#{file_id}/view?project=#{project_id}"
  end

  @doc """
  Delete a file from Appwrite Storage.
  """
  def delete(file_id) do
    %{endpoint: endpoint, api_key: api_key, project_id: project_id, bucket_id: bucket_id} = cfg()
    url = "#{endpoint}/storage/buckets/#{bucket_id}/files/#{file_id}"
    headers = [{"x-appwrite-project", project_id}, {"x-appwrite-key", api_key}]

    case Finch.build(:delete, url, headers) |> Finch.request(SyncFlow.Finch) do
      {:ok, %{status: 204}} -> :ok
      {:ok, %{status: status, body: body}} -> {:error, "Appwrite delete #{status}: #{body}"}
      {:error, reason} -> {:error, inspect(reason)}
    end
  end

  defp cfg do
    app_cfg = Application.get_env(:syncflow_core, :appwrite, [])
    %{
      endpoint:   Keyword.get(app_cfg, :endpoint, "https://cloud.appwrite.io/v1"),
      api_key:    Keyword.get(app_cfg, :api_key, System.get_env("APPWRITE_API_KEY", "")),
      project_id: Keyword.get(app_cfg, :project_id, System.get_env("APPWRITE_PROJECT_ID", "")),
      bucket_id:  Keyword.get(app_cfg, :bucket_id, System.get_env("APPWRITE_BUCKET_ID", "syncflow-uploads"))
    }
  end
end
