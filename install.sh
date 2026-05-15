#!/usr/bin/env bash
set -e

ERLANG_VERSION="26.2.5"
ELIXIR_VERSION="1.16.3-otp-26"

echo ""
echo "======================================"
echo "  SyncFlow Backend Installer"
echo "======================================"
echo ""

# 1. Install asdf if missing
if ! command -v asdf &>/dev/null; then
  echo "Installing asdf version manager..."
  git clone https://github.com/asdf-vm/asdf.git "$HOME/.asdf" --branch v0.14.0

  SHELL_RC=""
  if [ -f "$HOME/.zshrc" ]; then SHELL_RC="$HOME/.zshrc"; fi
  if [ -f "$HOME/.bashrc" ]; then SHELL_RC="$HOME/.bashrc"; fi

  if [ -n "$SHELL_RC" ]; then
    echo '. "$HOME/.asdf/asdf.sh"' >> "$SHELL_RC"
    echo '. "$HOME/.asdf/completions/asdf.bash"' >> "$SHELL_RC"
  fi

  source "$HOME/.asdf/asdf.sh"
  echo "✓ asdf installed"
else
  source "$HOME/.asdf/asdf.sh" 2>/dev/null || true
  echo "✓ asdf already installed"
fi

# 2. Install build deps (Ubuntu/Debian)
if command -v apt-get &>/dev/null; then
  echo "Installing system dependencies..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq \
    build-essential autoconf m4 libncurses-dev libssl-dev \
    libwxgtk3.0-gtk3-dev libgl1-mesa-dev libglu1-mesa-dev \
    libpng-dev libssh-dev unixodbc-dev xsltproc fop libxml2-utils \
    git curl wget inotify-tools
  echo "✓ System dependencies installed"
fi

# 3. Add Erlang + Elixir plugins
asdf plugin add erlang https://github.com/asdf-vm/asdf-erlang.git 2>/dev/null || echo "  erlang plugin already added"
asdf plugin add elixir https://github.com/asdf-vm/asdf-elixir.git 2>/dev/null || echo "  elixir plugin already added"

# 4. Install Erlang (takes a while)
echo "Installing Erlang $ERLANG_VERSION (this may take 10-15 minutes)..."
KERL_CONFIGURE_OPTIONS="--disable-debug --without-javac" asdf install erlang "$ERLANG_VERSION"
echo "✓ Erlang installed"

# 5. Install Elixir
echo "Installing Elixir $ELIXIR_VERSION..."
asdf install elixir "$ELIXIR_VERSION"
echo "✓ Elixir installed"

# 6. Install hex and rebar
mix local.hex --force
mix local.rebar --force
echo "✓ Hex and Rebar installed"

# 7. Fetch dependencies
echo "Fetching Mix dependencies..."
mix deps.get
echo "✓ Dependencies fetched"

# 8. Start Docker infra
if command -v docker &>/dev/null; then
  echo "Starting Docker infrastructure..."
  docker compose up -d
  echo "Waiting for PostgreSQL to be ready..."
  until docker compose exec -T postgres pg_isready -U postgres 2>/dev/null; do
    sleep 2
  done
  echo "✓ Infrastructure ready"
else
  echo ""
  echo "⚠  Docker not found. Please:"
  echo "   1. Install Docker: https://docs.docker.com/get-docker/"
  echo "   2. Or start PostgreSQL manually on port 5432"
  echo "   3. Then run: mix ecto.create && mix ecto.migrate"
  echo ""
fi

# 9. Create .env from example
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ .env created from .env.example (please update secrets!)"
fi

# 10. Setup databases
echo "Setting up databases..."
mix ecto.create
mix ecto.migrate
mix event_store.init 2>/dev/null || echo "  (event store already initialized)"
echo "✓ Databases ready"

echo ""
echo "======================================"
echo "  ✓ SyncFlow is ready!"
echo ""
echo "  Start server:  make server"
echo "                 OR: iex -S mix phx.server"
echo ""
echo "  API:           http://localhost:4000"
echo "  Health check:  http://localhost:4000/api/health"
echo "  PgAdmin:       http://localhost:5050"
echo "                 (admin@syncflow.local / admin)"
echo "======================================"
