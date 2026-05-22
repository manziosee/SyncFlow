#!/bin/bash
set -e

# Load .env if present
if [ -f "$(dirname "$0")/.env" ]; then
  set -a
  # Strip inline comments and export valid KEY=VALUE lines
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip blank lines and comment lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    # Only export lines that look like KEY=VALUE
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line"
    fi
  done < "$(dirname "$0")/.env"
  set +a
fi

# Ensure asdf shims are on PATH
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"

# Fix UTF-8 locale for Erlang on Ubuntu
export ELIXIR_ERL_OPTIONS="+fnu"

# Default dev SECRET_KEY_BASE if not set in .env
if [ -z "$SECRET_KEY_BASE" ]; then
  export SECRET_KEY_BASE="local_dev_secret_key_base_must_be_at_least_64_bytes_long_syncflow_dev"
fi

echo "Starting SyncFlow backend..."
echo "  DB:    ${DATABASE_URL:0:60}..."
echo "  ES:    ${EVENT_STORE_URL:0:60}..."
echo "  Host:  http://localhost:${PORT:-4000}"
echo "  Docs:  http://localhost:${PORT:-4000}/api/docs"
echo ""

cd "$(dirname "$0")"
exec iex -S mix phx.server
