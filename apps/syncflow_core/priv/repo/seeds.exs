alias SyncFlow.Core.Repo
alias SyncFlow.Core.Accounts.{Organization, User}

IO.puts("==> Seeding SyncFlow demo data…")

# --- Demo Organisation ---
org =
  case Repo.get_by(Organization, name: "SyncFlow Demo") do
    nil ->
      %Organization{}
      |> Organization.changeset(%{name: "SyncFlow Demo"})
      |> Repo.insert!()

    existing ->
      existing
  end

IO.puts("    Org: #{org.name} (#{org.id})")

# --- Admin user ---
unless Repo.get_by(User, email: "admin@syncflow.io") do
  %User{}
  |> User.changeset(%{
    name:     "Admin User",
    email:    "admin@syncflow.io",
    password: "password123",
    role:     "admin",
    org_id:   org.id
  })
  |> Repo.insert!()

  IO.puts("    Created admin@syncflow.io / password123")
end

# --- Manager user ---
unless Repo.get_by(User, email: "manager@syncflow.io") do
  %User{}
  |> User.changeset(%{
    name:     "Jane Manager",
    email:    "manager@syncflow.io",
    password: "password123",
    role:     "manager",
    org_id:   org.id
  })
  |> Repo.insert!()

  IO.puts("    Created manager@syncflow.io / password123")
end

IO.puts("==> Seeds done.")
