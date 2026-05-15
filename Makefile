SHELL := /bin/bash

.PHONY: setup install deps infra migrate reset server test lint format

## Install Elixir via asdf and set up project
install:
	@echo "Installing Elixir and Erlang via asdf..."
	@if ! command -v asdf &>/dev/null; then \
		git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0; \
		echo '. "$$HOME/.asdf/asdf.sh"' >> ~/.bashrc; \
		echo '. "$$HOME/.asdf/asdf.sh"' >> ~/.zshrc; \
		echo "Restart your shell or run: source ~/.bashrc"; \
	fi
	. ~/.asdf/asdf.sh && \
	asdf plugin add erlang https://github.com/asdf-vm/asdf-erlang.git 2>/dev/null || true && \
	asdf plugin add elixir https://github.com/asdf-vm/asdf-elixir.git 2>/dev/null || true && \
	asdf install
	@echo "✓ Elixir installed"

## Install Mix hex and rebar, then fetch deps
deps:
	mix local.hex --force
	mix local.rebar --force
	mix deps.get

## Start infrastructure (PostgreSQL, Redis)
infra:
	docker compose up -d
	@echo "Waiting for PostgreSQL..."
	@until docker compose exec postgres pg_isready -U postgres; do sleep 1; done
	@echo "✓ Infrastructure ready"

## Set up databases and run migrations
migrate:
	mix ecto.create
	mix ecto.migrate

## Full setup: deps + infra + migrate
setup: deps infra migrate
	@echo "✓ SyncFlow setup complete"

## Reset databases
reset:
	mix ecto.drop
	make migrate

## Start development server
server:
	iex -S mix phx.server

## Run tests
test:
	mix test

## Run tests with coverage
test.cover:
	mix test --cover

## Format code
format:
	mix format

## Check formatting
lint:
	mix format --check-formatted
	mix credo --strict

## Generate event store tables
eventstore.init:
	mix event_store.init

## Full first-time setup from scratch
bootstrap: install deps infra migrate eventstore.init
	@echo ""
	@echo "======================================"
	@echo "  SyncFlow is ready!"
	@echo "  Run: make server"
	@echo "  API: http://localhost:4000"
	@echo "  PgAdmin: http://localhost:5050"
	@echo "======================================"
