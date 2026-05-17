defmodule SyncFlow.Web.ApiSpec.Schemas do
  alias OpenApiSpex.Schema

  # --- Primitive helpers ---

  def uuid_schema do
    %Schema{type: :string, format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000"}
  end

  def decimal_schema(example \\ "1500.00") do
    %Schema{type: :string, pattern: "^[0-9]+(\\.\\d{1,4})?$", example: example}
  end

  def all do
    %{
      # Auth
      "LoginRequest" => login_request(),
      "LoginResponse" => login_response(),
      "RegisterRequest" => register_request(),
      "RefreshRequest" => refresh_request(),
      "UserProfile" => user_profile(),

      # Accounting
      "Invoice" => invoice_schema(),
      "InvoiceLine" => invoice_line(),
      "CreateInvoiceRequest" => create_invoice_request(),
      "RejectInvoiceRequest" => reject_invoice_request(),
      "InvoiceStats" => invoice_stats(),
      "RevenueByMonth" => revenue_by_month(),

      # Inventory
      "Warehouse" => warehouse_schema(),
      "CreateWarehouseRequest" => create_warehouse_request(),
      "StockItem" => stock_item_schema(),
      "CreateStockItemRequest" => create_stock_item_request(),
      "AdjustStockRequest" => adjust_stock_request(),
      "TransferStockRequest" => transfer_stock_request(),
      "InventoryValue" => inventory_value_schema(),

      # HR
      "Employee" => employee_schema(),
      "CreateEmployeeRequest" => create_employee_request(),
      "PayrollRun" => payroll_run_schema(),
      "CreatePayrollRunRequest" => create_payroll_run_request(),
      "PaySlip" => pay_slip_schema(),
      "PaySlipList" => pay_slip_list(),
      "HeadcountResponse" => headcount_response(),

      # CRM
      "Customer" => customer_schema(),
      "CreateCustomerRequest" => create_customer_request(),
      "RecordInteractionRequest" => record_interaction_request(),
      "Interaction" => interaction_schema(),
      "CustomerStats" => customer_stats_schema(),

      # Fleet
      "Vehicle" => vehicle_schema(),
      "CreateVehicleRequest" => create_vehicle_request(),
      "AssignDriverRequest" => assign_driver_request(),
      "Trip" => trip_schema(),
      "FuelLogRequest" => fuel_log_request(),
      "FuelRecord" => fuel_record_schema(),
      "LiveVehiclePosition" => live_vehicle_position(),
      "LiveVehiclePositionList" => live_vehicle_position_list(),
      "FleetSummary" => fleet_summary_schema(),

      # Dashboard
      "CEODashboard" => ceo_dashboard_schema(),
      "WarehouseDashboard" => warehouse_dashboard_schema(),
      "RegionalDashboard" => regional_dashboard_schema(),

      # Reports
      "GenerateReportRequest" => generate_report_request(),
      "ReportEnqueuedResponse" => report_enqueued_response(),

      # AI
      "AICommandRequest" => ai_command_request(),
      "AICommandResponse" => ai_command_response(),

      # Generic
      "ErrorResponse" => error_response(),
      "PaginatedResponse" => paginated_response()
    }
  end

  # --- Auth ---

  def login_request do
    %Schema{
      title: "LoginRequest",
      type: :object,
      required: [:email, :password],
      properties: %{
        email: %Schema{type: :string, format: :email, example: "finance@company.rw"},
        password: %Schema{type: :string, minLength: 8, example: "secret123"}
      }
    }
  end

  def refresh_request do
    %Schema{
      title: "RefreshRequest",
      type: :object,
      required: [:refresh_token],
      properties: %{
        refresh_token: %Schema{type: :string}
      }
    }
  end

  def login_response do
    %Schema{
      title: "LoginResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            user: user_profile(),
            access_token: %Schema{type: :string},
            refresh_token: %Schema{type: :string}
          }
        }
      }
    }
  end

  def register_request do
    %Schema{
      title: "RegisterRequest",
      type: :object,
      required: [:email, :password, :name, :org_name],
      properties: %{
        email: %Schema{type: :string, format: :email},
        password: %Schema{type: :string, minLength: 8},
        name: %Schema{type: :string, example: "Jean-Pierre Habimana"},
        org_name: %Schema{type: :string, example: "Kigali Trading Co."},
        role: %Schema{type: :string, example: "admin"}
      }
    }
  end

  def user_profile do
    %Schema{
      title: "UserProfile",
      type: :object,
      properties: %{
        id: uuid_schema(),
        name: %Schema{type: :string},
        email: %Schema{type: :string, format: :email},
        role: %Schema{type: :string, enum: ~w(superadmin admin manager accountant cashier warehouse_manager hr_manager procurement driver salesperson ceo auditor)},
        org_id: uuid_schema(),
        avatar_url: %Schema{type: :string, nullable: true},
        is_active: %Schema{type: :boolean},
        last_seen_at: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    }
  end

  # --- Invoice ---

  def invoice_schema do
    %Schema{
      title: "Invoice",
      type: :object,
      properties: %{
        id: uuid_schema(),
        invoice_number: %Schema{type: :string, example: "INV-2024-0001"},
        org_id: uuid_schema(),
        customer_id: uuid_schema(),
        customer_name: %Schema{type: :string, example: "MTN Rwanda"},
        currency: %Schema{type: :string, example: "RWF"},
        status: %Schema{type: :string, enum: ~w(draft pending_approval approved rejected voided paid)},
        due_date: %Schema{type: :string, format: :date},
        issued_date: %Schema{type: :string, format: :date},
        lines: %Schema{type: :array, items: invoice_line()},
        subtotal: decimal_schema("5000000.00"),
        tax_total: decimal_schema("900000.00"),
        total_amount: decimal_schema("5900000.00"),
        paid_amount: decimal_schema("0.00"),
        notes: %Schema{type: :string, nullable: true},
        inserted_at: %Schema{type: :string, format: :"date-time"},
        updated_at: %Schema{type: :string, format: :"date-time"}
      }
    }
  end

  def invoice_line do
    %Schema{
      title: "InvoiceLine",
      type: :object,
      properties: %{
        id: %Schema{type: :string},
        description: %Schema{type: :string, example: "Consulting services"},
        quantity: %Schema{type: :number, example: 10},
        unit_price: %Schema{type: :number, example: 50000},
        tax_rate: %Schema{type: :number, example: 18, description: "VAT % (Rwanda 18%)"},
        total: %Schema{type: :number, example: 590000}
      }
    }
  end

  def create_invoice_request do
    %Schema{
      title: "CreateInvoiceRequest",
      type: :object,
      required: [:customer_id, :customer_name],
      properties: %{
        customer_id: uuid_schema(),
        customer_name: %Schema{type: :string},
        currency: %Schema{type: :string, default: "RWF"},
        due_date: %Schema{type: :string, format: :date},
        lines: %Schema{type: :array, items: %Schema{type: :object}},
        notes: %Schema{type: :string}
      }
    }
  end

  def reject_invoice_request do
    %Schema{
      title: "RejectInvoiceRequest",
      type: :object,
      properties: %{
        reason: %Schema{type: :string, example: "Missing supporting documents"}
      }
    }
  end

  def invoice_stats do
    %Schema{
      title: "InvoiceStats",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          additionalProperties: %Schema{
            type: :object,
            properties: %{
              count: %Schema{type: :integer},
              total: decimal_schema()
            }
          }
        }
      }
    }
  end

  def revenue_by_month do
    %Schema{
      title: "RevenueByMonth",
      type: :object,
      properties: %{
        year: %Schema{type: :integer, example: 2024},
        data: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              month: %Schema{type: :integer, example: 3},
              total: decimal_schema("15000000.00")
            }
          }
        }
      }
    }
  end

  # --- Warehouse ---

  def warehouse_schema do
    %Schema{
      title: "Warehouse",
      type: :object,
      properties: %{
        id: uuid_schema(),
        org_id: uuid_schema(),
        name: %Schema{type: :string, example: "Kigali Central Warehouse"},
        code: %Schema{type: :string, example: "KGL-01"},
        address: %Schema{type: :object, nullable: true},
        manager_id: %Schema{type: :string, nullable: true},
        is_active: %Schema{type: :boolean},
        latitude: %Schema{type: :number, nullable: true},
        longitude: %Schema{type: :number, nullable: true}
      }
    }
  end

  def create_warehouse_request do
    %Schema{
      title: "CreateWarehouseRequest",
      type: :object,
      required: [:name, :code],
      properties: %{
        name: %Schema{type: :string},
        code: %Schema{type: :string},
        address: %Schema{type: :object},
        manager_id: uuid_schema(),
        latitude: %Schema{type: :number},
        longitude: %Schema{type: :number}
      }
    }
  end

  def inventory_value_schema do
    %Schema{
      title: "InventoryValue",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            total_items: %Schema{type: :integer, example: 1250},
            total_value: decimal_schema("187500000.00"),
            currency: %Schema{type: :string, example: "RWF"},
            low_stock_count: %Schema{type: :integer, example: 12},
            snapshot_at: %Schema{type: :string, format: :"date-time"}
          }
        }
      }
    }
  end

  # --- Stock Item ---

  def stock_item_schema do
    %Schema{
      title: "StockItem",
      type: :object,
      properties: %{
        id: uuid_schema(),
        org_id: uuid_schema(),
        warehouse_id: uuid_schema(),
        sku: %Schema{type: :string, example: "CEMENT-50KG"},
        name: %Schema{type: :string, example: "Cement 50kg bag"},
        category: %Schema{type: :string, example: "Construction"},
        unit: %Schema{type: :string, example: "bags"},
        quantity: decimal_schema("250"),
        reserved_quantity: decimal_schema("50"),
        reorder_point: decimal_schema("100"),
        reorder_quantity: decimal_schema("500"),
        unit_cost: decimal_schema("15000"),
        currency: %Schema{type: :string, example: "RWF"},
        is_low_stock: %Schema{type: :boolean},
        is_active: %Schema{type: :boolean}
      }
    }
  end

  def create_stock_item_request do
    %Schema{
      title: "CreateStockItemRequest",
      type: :object,
      required: [:name, :warehouse_id],
      properties: %{
        warehouse_id: uuid_schema(),
        sku: %Schema{type: :string},
        name: %Schema{type: :string},
        category: %Schema{type: :string},
        unit: %Schema{type: :string},
        quantity: %Schema{type: :number, default: 0},
        reorder_point: %Schema{type: :number, default: 0},
        reorder_quantity: %Schema{type: :number, default: 0},
        unit_cost: %Schema{type: :number},
        currency: %Schema{type: :string, default: "RWF"}
      }
    }
  end

  def adjust_stock_request do
    %Schema{
      title: "AdjustStockRequest",
      type: :object,
      required: [:quantity_delta, :reason],
      properties: %{
        quantity_delta: %Schema{type: :number, description: "Positive to add, negative to remove"},
        reason: %Schema{type: :string, example: "damage_write_off"},
        reference_id: %Schema{type: :string, nullable: true}
      }
    }
  end

  def transfer_stock_request do
    %Schema{
      title: "TransferStockRequest",
      type: :object,
      required: [:from_warehouse_id, :to_warehouse_id, :quantity],
      properties: %{
        from_warehouse_id: uuid_schema(),
        to_warehouse_id: uuid_schema(),
        quantity: %Schema{type: :number},
        notes: %Schema{type: :string, nullable: true}
      }
    }
  end

  # --- HR ---

  def employee_schema do
    %Schema{
      title: "Employee",
      type: :object,
      properties: %{
        id: uuid_schema(),
        org_id: uuid_schema(),
        employee_number: %Schema{type: :string, example: "EMP-0042"},
        name: %Schema{type: :string, example: "Amina Uwimana"},
        email: %Schema{type: :string, format: :email},
        phone: %Schema{type: :string},
        department: %Schema{type: :string},
        position: %Schema{type: :string},
        employment_type: %Schema{type: :string, enum: ~w(full_time part_time contract intern)},
        status: %Schema{type: :string, enum: ~w(active on_leave terminated probation)},
        hire_date: %Schema{type: :string, format: :date},
        base_salary: decimal_schema("300000"),
        currency: %Schema{type: :string}
      }
    }
  end

  def create_employee_request do
    %Schema{
      title: "CreateEmployeeRequest",
      type: :object,
      required: [:name, :employment_type, :hire_date],
      properties: %{
        name: %Schema{type: :string},
        email: %Schema{type: :string, format: :email},
        phone: %Schema{type: :string},
        department: %Schema{type: :string},
        position: %Schema{type: :string},
        employment_type: %Schema{type: :string, enum: ~w(full_time part_time contract intern)},
        hire_date: %Schema{type: :string, format: :date},
        base_salary: %Schema{type: :number},
        currency: %Schema{type: :string, default: "RWF"}
      }
    }
  end

  def payroll_run_schema do
    %Schema{
      title: "PayrollRun",
      type: :object,
      properties: %{
        id: uuid_schema(),
        org_id: uuid_schema(),
        period_start: %Schema{type: :string, format: :date},
        period_end: %Schema{type: :string, format: :date},
        status: %Schema{type: :string, enum: ~w(draft processing approved paid cancelled)},
        total_gross: decimal_schema("12000000"),
        total_deductions: decimal_schema("1500000"),
        total_net: decimal_schema("10500000"),
        currency: %Schema{type: :string},
        processed_by: %Schema{type: :string, nullable: true},
        approved_by: %Schema{type: :string, nullable: true},
        paid_at: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    }
  end

  def create_payroll_run_request do
    %Schema{
      title: "CreatePayrollRunRequest",
      type: :object,
      required: [:period_start, :period_end],
      properties: %{
        period_start: %Schema{type: :string, format: :date},
        period_end: %Schema{type: :string, format: :date},
        currency: %Schema{type: :string, default: "RWF"},
        notes: %Schema{type: :string}
      }
    }
  end

  def pay_slip_schema do
    %Schema{
      title: "PaySlip",
      type: :object,
      properties: %{
        id: uuid_schema(),
        payroll_run_id: uuid_schema(),
        employee_id: uuid_schema(),
        employee_name: %Schema{type: :string, example: "Amina Uwimana"},
        gross_salary: decimal_schema("300000"),
        tax_amount: decimal_schema("68000"),
        deductions: decimal_schema("68000"),
        net_salary: decimal_schema("232000"),
        currency: %Schema{type: :string, example: "RWF"},
        status: %Schema{type: :string, enum: ~w(pending paid)}
      }
    }
  end

  def pay_slip_list do
    %Schema{
      title: "PaySlipList",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: pay_slip_schema()},
        run: payroll_run_schema(),
        count: %Schema{type: :integer}
      }
    }
  end

  def headcount_response do
    %Schema{
      title: "HeadcountResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            by_department: %Schema{
              type: :object,
              additionalProperties: %Schema{type: :integer},
              example: %{"Finance" => 8, "Operations" => 12, "Sales" => 6}
            },
            total_active: %Schema{type: :integer, example: 26}
          }
        }
      }
    }
  end

  # --- CRM ---

  def customer_schema do
    %Schema{
      title: "Customer",
      type: :object,
      properties: %{
        id: uuid_schema(),
        org_id: uuid_schema(),
        name: %Schema{type: :string, example: "BK Group"},
        email: %Schema{type: :string, nullable: true},
        phone: %Schema{type: :string},
        type: %Schema{type: :string, enum: ~w(individual business)},
        status: %Schema{type: :string, enum: ~w(active inactive blocked)},
        credit_limit: decimal_schema("5000000"),
        outstanding_balance: decimal_schema("0"),
        tags: %Schema{type: :array, items: %Schema{type: :string}}
      }
    }
  end

  def create_customer_request do
    %Schema{
      title: "CreateCustomerRequest",
      type: :object,
      required: [:name],
      properties: %{
        name: %Schema{type: :string},
        email: %Schema{type: :string, format: :email},
        phone: %Schema{type: :string},
        type: %Schema{type: :string, enum: ~w(individual business), default: "individual"},
        address: %Schema{type: :object}
      }
    }
  end

  def record_interaction_request do
    %Schema{
      title: "RecordInteractionRequest",
      type: :object,
      required: [:type, :notes],
      properties: %{
        type: %Schema{type: :string, enum: ~w(call email meeting visit note)},
        notes: %Schema{type: :string},
        outcome: %Schema{type: :string, nullable: true},
        occurred_at: %Schema{type: :string, format: :"date-time"}
      }
    }
  end

  def interaction_schema do
    %Schema{
      title: "Interaction",
      type: :object,
      properties: %{
        id: uuid_schema(),
        customer_id: uuid_schema(),
        type: %Schema{type: :string, enum: ~w(call email meeting visit note)},
        notes: %Schema{type: :string},
        outcome: %Schema{type: :string, nullable: true},
        recorded_by: uuid_schema(),
        occurred_at: %Schema{type: :string, format: :"date-time"}
      }
    }
  end

  def customer_stats_schema do
    %Schema{
      title: "CustomerStats",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            active: %Schema{type: :integer, example: 142},
            inactive: %Schema{type: :integer, example: 18},
            blocked: %Schema{type: :integer, example: 3},
            total: %Schema{type: :integer, example: 163}
          }
        }
      }
    }
  end

  # --- Fleet ---

  def vehicle_schema do
    %Schema{
      title: "Vehicle",
      type: :object,
      properties: %{
        id: uuid_schema(),
        org_id: uuid_schema(),
        plate_number: %Schema{type: :string, example: "RAC 123 A"},
        make: %Schema{type: :string, example: "Toyota"},
        model: %Schema{type: :string, example: "Hilux"},
        year: %Schema{type: :integer, example: 2022},
        type: %Schema{type: :string, enum: ~w(truck van motorcycle car bus)},
        status: %Schema{type: :string, enum: ~w(available on_trip maintenance inactive)},
        driver_id: %Schema{type: :string, nullable: true},
        driver_name: %Schema{type: :string, nullable: true},
        odometer: %Schema{type: :integer},
        last_latitude: %Schema{type: :number, nullable: true},
        last_longitude: %Schema{type: :number, nullable: true},
        last_seen_at: %Schema{type: :string, format: :"date-time", nullable: true}
      }
    }
  end

  def create_vehicle_request do
    %Schema{
      title: "CreateVehicleRequest",
      type: :object,
      required: [:plate_number],
      properties: %{
        plate_number: %Schema{type: :string},
        make: %Schema{type: :string},
        model: %Schema{type: :string},
        year: %Schema{type: :integer},
        type: %Schema{type: :string, enum: ~w(truck van motorcycle car bus)}
      }
    }
  end

  def assign_driver_request do
    %Schema{
      title: "AssignDriverRequest",
      type: :object,
      required: [:driver_id, :driver_name],
      properties: %{
        driver_id: uuid_schema(),
        driver_name: %Schema{type: :string}
      }
    }
  end

  def trip_schema do
    %Schema{
      title: "Trip",
      type: :object,
      properties: %{
        id: uuid_schema(),
        vehicle_id: uuid_schema(),
        driver_id: uuid_schema(),
        origin: %Schema{type: :string},
        destination: %Schema{type: :string},
        status: %Schema{type: :string, enum: ~w(in_progress completed cancelled)},
        started_at: %Schema{type: :string, format: :"date-time"},
        ended_at: %Schema{type: :string, format: :"date-time", nullable: true},
        distance_km: %Schema{type: :number, nullable: true}
      }
    }
  end

  def fuel_log_request do
    %Schema{
      title: "FuelLogRequest",
      type: :object,
      required: [:vehicle_id, :liters, :total_cost],
      properties: %{
        vehicle_id: uuid_schema(),
        liters: %Schema{type: :number, example: 60},
        cost_per_liter: %Schema{type: :number, example: 1200},
        total_cost: %Schema{type: :number, example: 72000},
        currency: %Schema{type: :string, default: "RWF"},
        station: %Schema{type: :string, example: "Total Kigali"},
        odometer: %Schema{type: :integer, example: 45230}
      }
    }
  end

  def fuel_record_schema do
    %Schema{
      title: "FuelRecord",
      type: :object,
      properties: %{
        id: uuid_schema(),
        vehicle_id: uuid_schema(),
        liters: %Schema{type: :number},
        cost_per_liter: %Schema{type: :number, nullable: true},
        total_cost: %Schema{type: :number},
        currency: %Schema{type: :string},
        station: %Schema{type: :string, nullable: true},
        odometer: %Schema{type: :integer, nullable: true},
        logged_by: uuid_schema(),
        logged_at: %Schema{type: :string, format: :"date-time"}
      }
    }
  end

  def live_vehicle_position do
    %Schema{
      title: "LiveVehiclePosition",
      type: :object,
      properties: %{
        vehicle_id: uuid_schema(),
        latitude: %Schema{type: :number, example: -1.9441},
        longitude: %Schema{type: :number, example: 30.0619},
        speed_kmh: %Schema{type: :number, example: 65},
        heading: %Schema{type: :number, example: 90},
        updated_at: %Schema{type: :string, format: :"date-time"}
      }
    }
  end

  def live_vehicle_position_list do
    %Schema{
      title: "LiveVehiclePositionList",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: live_vehicle_position()},
        count: %Schema{type: :integer}
      }
    }
  end

  def fleet_summary_schema do
    %Schema{
      title: "FleetSummary",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            by_status: %Schema{
              type: :object,
              additionalProperties: %Schema{type: :integer},
              example: %{"available" => 8, "on_trip" => 5, "maintenance" => 2, "inactive" => 1}
            },
            total_vehicles: %Schema{type: :integer, example: 16},
            active_on_gps: %Schema{type: :integer, example: 5},
            total_fuel_cost: decimal_schema("1250000.00"),
            fuel_cost_by_vehicle: %Schema{
              type: :array,
              items: %Schema{
                type: :object,
                properties: %{
                  vehicle_id: uuid_schema(),
                  plate_number: %Schema{type: :string},
                  total_liters: %Schema{type: :number},
                  total_cost: decimal_schema()
                }
              }
            }
          }
        }
      }
    }
  end

  # --- Dashboards ---

  def ceo_dashboard_schema do
    %Schema{
      title: "CEODashboard",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            year: %Schema{type: :integer},
            invoices: %Schema{
              type: :object,
              properties: %{
                stats: %Schema{type: :object},
                overdue_count: %Schema{type: :integer},
                overdue_total: decimal_schema()
              }
            },
            inventory: %Schema{
              type: :object,
              properties: %{
                total_items: %Schema{type: :integer},
                total_value: decimal_schema(),
                low_stock_count: %Schema{type: :integer}
              }
            },
            fleet: %Schema{
              type: :object,
              properties: %{
                by_status: %Schema{type: :object},
                total: %Schema{type: :integer},
                active_on_gps: %Schema{type: :integer}
              }
            },
            hr: %Schema{
              type: :object,
              properties: %{
                headcount_by_department: %Schema{type: :object},
                total_active: %Schema{type: :integer}
              }
            },
            customers: %Schema{type: :object},
            revenue_by_month: %Schema{
              type: :array,
              items: %Schema{
                type: :object,
                properties: %{
                  month: %Schema{type: :integer},
                  total: decimal_schema()
                }
              }
            }
          }
        }
      }
    }
  end

  def warehouse_dashboard_schema do
    %Schema{
      title: "WarehouseDashboard",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            warehouses: %Schema{
              type: :array,
              items: %Schema{
                type: :object,
                properties: %{
                  id: uuid_schema(),
                  name: %Schema{type: :string},
                  code: %Schema{type: :string},
                  total_items: %Schema{type: :integer},
                  low_stock_count: %Schema{type: :integer}
                }
              }
            },
            totals: %Schema{
              type: :object,
              properties: %{
                total_warehouses: %Schema{type: :integer},
                total_items: %Schema{type: :integer},
                total_value: decimal_schema(),
                low_stock_count: %Schema{type: :integer},
                pending_transfers: %Schema{type: :integer}
              }
            },
            low_stock_items: %Schema{type: :array, items: stock_item_schema()}
          }
        }
      }
    }
  end

  def regional_dashboard_schema do
    %Schema{
      title: "RegionalDashboard",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            regions: %Schema{
              type: :array,
              items: %Schema{
                type: :object,
                properties: %{
                  warehouse_id: uuid_schema(),
                  warehouse_name: %Schema{type: :string},
                  code: %Schema{type: :string},
                  latitude: %Schema{type: :number, nullable: true},
                  longitude: %Schema{type: :number, nullable: true},
                  stock: %Schema{
                    type: :object,
                    properties: %{
                      total_items: %Schema{type: :integer},
                      low_stock_count: %Schema{type: :integer},
                      total_value: decimal_schema()
                    }
                  }
                }
              }
            },
            total_regions: %Schema{type: :integer},
            snapshot_at: %Schema{type: :string, format: :"date-time"}
          }
        }
      }
    }
  end

  # --- Reports ---

  def generate_report_request do
    %Schema{
      title: "GenerateReportRequest",
      type: :object,
      required: [:type],
      properties: %{
        type: %Schema{
          type: :string,
          enum: ~w(monthly_revenue inventory_audit payroll_summary fleet_utilization overdue_invoices),
          example: "monthly_revenue"
        },
        year: %Schema{type: :integer, example: 2024, description: "Required for monthly_revenue report"}
      }
    }
  end

  def report_enqueued_response do
    %Schema{
      title: "ReportEnqueuedResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            job_id: %Schema{type: :integer},
            type: %Schema{type: :string},
            status: %Schema{type: :string, example: "queued"}
          }
        },
        message: %Schema{type: :string}
      }
    }
  end

  # --- AI ---

  def ai_command_request do
    %Schema{
      title: "AICommandRequest",
      type: :object,
      required: [:message],
      properties: %{
        message: %Schema{
          type: :string,
          example: "Create invoice for BK Group for consulting services at 5,000,000 RWF"
        }
      }
    }
  end

  def ai_command_response do
    %Schema{
      title: "AICommandResponse",
      type: :object,
      properties: %{
        data: %Schema{type: :object},
        message: %Schema{type: :string, example: "Invoice created for BK Group"},
        count: %Schema{type: :integer, nullable: true}
      }
    }
  end

  # --- Generic ---

  def error_response do
    %Schema{
      title: "ErrorResponse",
      type: :object,
      properties: %{
        error: %Schema{type: :string, example: "Resource not found"}
      }
    }
  end

  def paginated_response do
    %Schema{
      title: "PaginatedResponse",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: %Schema{type: :object}},
        page: %Schema{type: :integer},
        per_page: %Schema{type: :integer},
        total: %Schema{type: :integer}
      }
    }
  end
end
