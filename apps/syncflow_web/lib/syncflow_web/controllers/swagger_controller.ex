defmodule SyncFlow.Web.Controllers.SwaggerController do
  use Phoenix.Controller

  def spec(conn, _params) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(SyncFlow.Web.ApiSpec.spec()))
  end

  def ui(conn, _params) do
    # Serve the Swagger UI HTML
    html = swagger_html("/api/openapi")

    conn
    |> put_resp_content_type("text/html")
    |> send_resp(200, html)
  end

  defp swagger_html(spec_url) do
    """
    <!DOCTYPE html>
    <html>
    <head>
      <title>SyncFlow API — Swagger UI</title>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
      <style>
        body { margin: 0; }
        #syncflow-banner {
          background: linear-gradient(135deg, #1e3a5f 0%, #0d7377 100%);
          color: white; padding: 12px 20px;
          display: flex; align-items: center; gap: 12px;
        }
        #syncflow-banner h1 { margin: 0; font-size: 1.4rem; font-family: sans-serif; }
        #syncflow-banner p { margin: 0; font-size: 0.85rem; opacity: 0.8; }
      </style>
    </head>
    <body>
      <div id="syncflow-banner">
        <div>
          <h1>⚡ SyncFlow API</h1>
          <p>Real-Time Multiplayer ERP · REST + WebSocket · Built with Elixir Phoenix</p>
        </div>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          SwaggerUIBundle({
            url: "#{spec_url}",
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
            layout: "StandaloneLayout",
            deepLinking: true,
            persistAuthorization: true,
            displayRequestDuration: true,
            tryItOutEnabled: true,
            requestInterceptor: (req) => {
              req.headers['X-Request-Id'] = crypto.randomUUID();
              return req;
            }
          })
        }
      </script>
    </body>
    </html>
    """
  end
end
