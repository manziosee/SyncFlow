defmodule SyncFlow.Web.ApiSpec.Operations do
  @moduledoc """
  Reusable OpenAPI operation building blocks.
  Controllers call these to attach swagger metadata.
  """

  alias OpenApiSpex.{Parameter, Reference, RequestBody, Response, Schema}

  def bearer_security, do: [%{"bearerAuth" => []}]

  def json_response(_status, description, schema_ref) do
    %Response{
      description: description,
      content: %{
        "application/json" => %OpenApiSpex.MediaType{
          schema: %Reference{"$ref": "#/components/schemas/#{schema_ref}"}
        }
      }
    }
  end

  def json_request_body(description, schema_ref, required \\ true) do
    %RequestBody{
      description: description,
      required: required,
      content: %{
        "application/json" => %OpenApiSpex.MediaType{
          schema: %Reference{"$ref": "#/components/schemas/#{schema_ref}"}
        }
      }
    }
  end

  def id_path_param(description \\ "Resource UUID") do
    %Parameter{
      name: :id,
      in: :path,
      required: true,
      description: description,
      schema: %Schema{type: :string, format: :uuid}
    }
  end

  def page_params do
    [
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}},
      %Parameter{name: :per_page, in: :query, schema: %Schema{type: :integer, default: 20}}
    ]
  end

  def error_responses do
    %{
      "400" => json_response(400, "Bad request", "ErrorResponse"),
      "401" => json_response(401, "Unauthorized", "ErrorResponse"),
      "404" => json_response(404, "Not found", "ErrorResponse"),
      "422" => json_response(422, "Unprocessable entity", "ErrorResponse")
    }
  end
end
