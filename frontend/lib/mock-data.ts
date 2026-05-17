// Realistic demo data for Rwanda ERP

export const MOCK_USER = {
  id: 'usr-001',
  name: 'Manzi Osee',
  email: 'admin@syncflow.io',
  role: 'admin',
  org_id: 'org-001',
  avatar_url: undefined,
}

export const MOCK_CEO_DASHBOARD = {
  total_revenue: 48_750_000,
  overdue_amount: 3_200_000,
  overdue_count: 7,
  invoice_stats: { draft: 4, pending: 9, paid: 62, rejected: 2 },
  fleet_stats: { total: 12, active: 8, idle: 3, maintenance: 1, gps_active: 6 },
  inventory_summary: { total_items: 284, low_stock: 11, warehouses: 3 },
  hr_stats: { total: 47, departments: 6, pending_payroll: 1 },
  crm_stats: { total: 138, active: 94, prospect: 31, churned: 13 },
}

export const MOCK_REVENUE = {
  data: [
    { month: 1,  total: 3_800_000 },
    { month: 2,  total: 4_200_000 },
    { month: 3,  total: 3_500_000 },
    { month: 4,  total: 5_100_000 },
    { month: 5,  total: 4_750_000 },
    { month: 6,  total: 6_200_000 },
    { month: 7,  total: 5_900_000 },
    { month: 8,  total: 4_400_000 },
    { month: 9,  total: 4_900_000 },
    { month: 10, total: 3_600_000 },
    { month: 11, total: 2_200_000 },
    { month: 12, total: 0 },
  ],
}

export const MOCK_INVOICES = {
  data: [
    { id: 'inv-001', number: 'INV-2025-001', customer_name: 'Kigali Tech Hub', customer_email: 'billing@kigalitech.rw', total_amount: 2_400_000, due_date: '2025-05-20', status: 'paid', inserted_at: '2025-04-15' },
    { id: 'inv-002', number: 'INV-2025-002', customer_name: 'Rwanda Breweries Ltd', customer_email: 'ap@rbl.rw', total_amount: 8_750_000, due_date: '2025-04-30', status: 'overdue', inserted_at: '2025-04-01' },
    { id: 'inv-003', number: 'INV-2025-003', customer_name: 'MTN Rwanda', customer_email: 'procurement@mtn.rw', total_amount: 5_200_000, due_date: '2025-06-01', status: 'submitted', inserted_at: '2025-05-02' },
    { id: 'inv-004', number: 'INV-2025-004', customer_name: 'BPR Bank', customer_email: 'finance@bpr.rw', total_amount: 1_800_000, due_date: '2025-06-15', status: 'approved', inserted_at: '2025-05-05' },
    { id: 'inv-005', number: 'INV-2025-005', customer_name: 'Equity Bank Rwanda', customer_email: 'ap@equityrw.com', total_amount: 3_600_000, due_date: '2025-07-01', status: 'draft', inserted_at: '2025-05-10' },
    { id: 'inv-006', number: 'INV-2025-006', customer_name: 'Airtel Rwanda', customer_email: 'billing@airtel.rw', total_amount: 4_100_000, due_date: '2025-04-15', status: 'overdue', inserted_at: '2025-03-20' },
    { id: 'inv-007', number: 'INV-2025-007', customer_name: 'Crystal Telecom', customer_email: 'finance@crystal.rw', total_amount: 920_000, due_date: '2025-06-30', status: 'paid', inserted_at: '2025-05-01' },
    { id: 'inv-008', number: 'INV-2025-008', customer_name: 'Sonarwa Insurance', customer_email: 'ap@sonarwa.rw', total_amount: 2_750_000, due_date: '2025-05-28', status: 'submitted', inserted_at: '2025-05-08' },
  ],
}

export const MOCK_INVOICE_DETAIL = {
  data: {
    id: 'inv-003',
    number: 'INV-2025-003',
    customer_name: 'MTN Rwanda',
    customer_email: 'procurement@mtn.rw',
    total_amount: 5_200_000,
    due_date: '2025-06-01',
    status: 'submitted',
    notes: 'Net 30. Please pay via bank transfer to BK Account 0001-XXXX.',
    inserted_at: '2025-05-02',
    submitted_at: '2025-05-03',
    line_items: [
      { description: 'Enterprise Software License (12 months)', quantity: 1, unit_price: 3_600_000 },
      { description: 'Implementation & Setup', quantity: 1, unit_price: 1_200_000 },
      { description: 'Training (2 days on-site)', quantity: 2, unit_price: 200_000 },
    ],
  },
}

export const MOCK_WAREHOUSES = {
  data: [
    { id: 'wh-001', name: 'Kigali Central', location: 'Nyarugenge, Kigali', capacity: 500 },
    { id: 'wh-002', name: 'Musanze Depot', location: 'Musanze, Northern Province', capacity: 200 },
    { id: 'wh-003', name: 'Huye Branch', location: 'Huye, Southern Province', capacity: 150 },
  ],
}

export const MOCK_STOCK_ITEMS = {
  data: [
    { id: 'si-001', name: 'Laptop Dell XPS 15', sku: 'TECH-001', quantity: 24, reorder_point: 5, unit_cost: 1_800_000, warehouse_id: 'wh-001', warehouse_name: 'Kigali Central', category: 'Electronics' },
    { id: 'si-002', name: 'Office Chair Ergonomic', sku: 'FURN-001', quantity: 4, reorder_point: 10, unit_cost: 280_000, warehouse_id: 'wh-001', warehouse_name: 'Kigali Central', category: 'Furniture' },
    { id: 'si-003', name: 'Cement (50kg bag)', sku: 'CONST-001', quantity: 120, reorder_point: 50, unit_cost: 18_000, warehouse_id: 'wh-002', warehouse_name: 'Musanze Depot', category: 'Construction' },
    { id: 'si-004', name: 'Generator 10kVA', sku: 'ELEC-001', quantity: 3, reorder_point: 2, unit_cost: 4_200_000, warehouse_id: 'wh-001', warehouse_name: 'Kigali Central', category: 'Electrical' },
    { id: 'si-005', name: 'Water Pump 5HP', sku: 'EQUIP-001', quantity: 2, reorder_point: 5, unit_cost: 950_000, warehouse_id: 'wh-003', warehouse_name: 'Huye Branch', category: 'Equipment' },
    { id: 'si-006', name: 'Printer Toner HP', sku: 'TECH-002', quantity: 8, reorder_point: 10, unit_cost: 85_000, warehouse_id: 'wh-001', warehouse_name: 'Kigali Central', category: 'Electronics' },
    { id: 'si-007', name: 'Steel Rebar (12mm)', sku: 'CONST-002', quantity: 500, reorder_point: 100, unit_cost: 4_200, warehouse_id: 'wh-002', warehouse_name: 'Musanze Depot', category: 'Construction' },
    { id: 'si-008', name: 'Ethernet Switch 24-port', sku: 'NET-001', quantity: 6, reorder_point: 3, unit_cost: 320_000, warehouse_id: 'wh-001', warehouse_name: 'Kigali Central', category: 'Networking' },
  ],
}

export const MOCK_LOW_STOCK = {
  data: MOCK_STOCK_ITEMS.data.filter(i => i.quantity <= i.reorder_point),
}

export const MOCK_INVENTORY_VALUE = {
  total_value: MOCK_STOCK_ITEMS.data.reduce((s, i) => s + i.quantity * i.unit_cost, 0),
  item_count: MOCK_STOCK_ITEMS.data.length,
  low_stock_count: MOCK_LOW_STOCK.data.length,
}

export const MOCK_EMPLOYEES = {
  data: [
    { id: 'emp-001', name: 'Amina Uwera', email: 'a.uwera@syncflow.io', department: 'Engineering', position: 'Senior Developer', salary: 850_000, status: 'active', hire_date: '2022-03-01' },
    { id: 'emp-002', name: 'Celestin Ndayisaba', email: 'c.ndayisaba@syncflow.io', department: 'Finance', position: 'Finance Manager', salary: 780_000, status: 'active', hire_date: '2021-07-15' },
    { id: 'emp-003', name: 'Diane Mukamana', email: 'd.mukamana@syncflow.io', department: 'HR', position: 'HR Officer', salary: 550_000, status: 'active', hire_date: '2023-01-10' },
    { id: 'emp-004', name: 'Eric Habimana', email: 'e.habimana@syncflow.io', department: 'Sales', position: 'Sales Executive', salary: 480_000, status: 'active', hire_date: '2023-06-01' },
    { id: 'emp-005', name: 'Francoise Ingabire', email: 'f.ingabire@syncflow.io', department: 'Logistics', position: 'Fleet Coordinator', salary: 520_000, status: 'active', hire_date: '2022-11-20' },
    { id: 'emp-006', name: 'Gaspard Nkurunziza', email: 'g.nkurunziza@syncflow.io', department: 'Engineering', position: 'DevOps Engineer', salary: 720_000, status: 'active', hire_date: '2022-08-05' },
    { id: 'emp-007', name: 'Honorine Rugamba', email: 'h.rugamba@syncflow.io', department: 'Marketing', position: 'Marketing Lead', salary: 630_000, status: 'active', hire_date: '2023-02-14' },
    { id: 'emp-008', name: 'Jean Pierre Ntirenganya', email: 'jp.ntirenganya@syncflow.io', department: 'Finance', position: 'Accountant', salary: 490_000, status: 'active', hire_date: '2023-09-01' },
    { id: 'emp-009', name: 'Keza Ineza', email: 'k.ineza@syncflow.io', department: 'Sales', position: 'Account Manager', salary: 560_000, status: 'active', hire_date: '2022-04-15' },
    { id: 'emp-010', name: 'Lionel Bizimana', email: 'l.bizimana@syncflow.io', department: 'Engineering', position: 'Junior Developer', salary: 380_000, status: 'active', hire_date: '2024-01-08' },
  ],
}

export const MOCK_HEADCOUNT = {
  total: 47,
  by_department: {
    Engineering: 14,
    Finance: 8,
    Sales: 10,
    HR: 4,
    Logistics: 6,
    Marketing: 5,
  },
}

export const MOCK_PAYROLL_RUNS = {
  data: [
    { id: 'pr-001', period_start: '2025-04-01', period_end: '2025-04-30', status: 'approved', total_gross: 26_840_000, total_net: 21_472_000, employee_count: 47 },
    { id: 'pr-002', period_start: '2025-03-01', period_end: '2025-03-31', status: 'approved', total_gross: 26_840_000, total_net: 21_472_000, employee_count: 47 },
    { id: 'pr-003', period_start: '2025-05-01', period_end: '2025-05-31', status: 'draft', total_gross: 0, total_net: 0, employee_count: 47 },
  ],
}

export const MOCK_PAY_SLIPS = {
  data: [
    { id: 'ps-001', employee_name: 'Amina Uwera', gross_salary: 850_000, tax_deduction: 170_000, net_salary: 680_000 },
    { id: 'ps-002', employee_name: 'Celestin Ndayisaba', gross_salary: 780_000, tax_deduction: 156_000, net_salary: 624_000 },
    { id: 'ps-003', employee_name: 'Diane Mukamana', gross_salary: 550_000, tax_deduction: 98_000, net_salary: 452_000 },
    { id: 'ps-004', employee_name: 'Eric Habimana', gross_salary: 480_000, tax_deduction: 84_000, net_salary: 396_000 },
    { id: 'ps-005', employee_name: 'Francoise Ingabire', gross_salary: 520_000, tax_deduction: 92_000, net_salary: 428_000 },
  ],
}

export const MOCK_VEHICLES = {
  data: [
    { id: 'veh-001', plate: 'RAA 123 A', make: 'Toyota', model: 'Hilux', year: 2021, status: 'active', driver_name: 'Jean Claude Uwimana', fuel_type: 'diesel', last_seen: '2025-05-17', current_lat: -1.9441, current_lng: 30.0619 },
    { id: 'veh-002', plate: 'RAB 456 B', make: 'Isuzu', model: 'D-Max', year: 2020, status: 'active', driver_name: 'Patrick Niyonzima', fuel_type: 'diesel', last_seen: '2025-05-17', current_lat: -1.9512, current_lng: 30.0589 },
    { id: 'veh-003', plate: 'RAC 789 C', make: 'Mitsubishi', model: 'L200', year: 2022, status: 'idle', driver_name: null, fuel_type: 'diesel', last_seen: '2025-05-16' },
    { id: 'veh-004', plate: 'RAD 321 D', make: 'Toyota', model: 'Land Cruiser', year: 2019, status: 'maintenance', driver_name: null, fuel_type: 'petrol', last_seen: '2025-05-14' },
    { id: 'veh-005', plate: 'RAE 654 E', make: 'Ford', model: 'Ranger', year: 2023, status: 'active', driver_name: 'Gasasira Nkurunziza', fuel_type: 'diesel', last_seen: '2025-05-17', current_lat: -1.9320, current_lng: 30.0710 },
    { id: 'veh-006', plate: 'RAF 987 F', make: 'Nissan', model: 'Navara', year: 2021, status: 'active', driver_name: 'Alice Murenzi', fuel_type: 'diesel', last_seen: '2025-05-17' },
  ],
}

export const MOCK_FLEET_SUMMARY = {
  total: 12,
  active: 8,
  idle: 3,
  maintenance: 1,
  gps_active: 6,
  total_fuel_cost: 4_820_000,
}

export const MOCK_LIVE_POSITIONS = {
  data: [
    { vehicle_id: 'veh-001', plate: 'RAA 123 A', lat: -1.9441, lng: 30.0619, speed: 42, heading: 90, timestamp: new Date().toISOString() },
    { vehicle_id: 'veh-002', plate: 'RAB 456 B', lat: -1.9512, lng: 30.0589, speed: 0, heading: 180, timestamp: new Date().toISOString() },
    { vehicle_id: 'veh-005', plate: 'RAE 654 E', lat: -1.9320, lng: 30.0710, speed: 67, heading: 270, timestamp: new Date().toISOString() },
  ],
}

export const MOCK_FUEL_RECORDS = {
  data: [
    { id: 'fr-001', vehicle_id: 'veh-001', liters: 80, cost: 144_000, odometer: 42_800, filled_at: '2025-05-15' },
    { id: 'fr-002', vehicle_id: 'veh-002', liters: 60, cost: 108_000, odometer: 31_200, filled_at: '2025-05-14' },
    { id: 'fr-003', vehicle_id: 'veh-005', liters: 75, cost: 135_000, odometer: 18_500, filled_at: '2025-05-16' },
    { id: 'fr-004', vehicle_id: 'veh-001', liters: 90, cost: 162_000, odometer: 42_100, filled_at: '2025-05-10' },
  ],
}

export const MOCK_CUSTOMERS = {
  data: [
    { id: 'cust-001', name: 'Kigali Tech Hub', email: 'billing@kigalitech.rw', phone: '+250 788 111 222', country: 'Rwanda', industry: 'Technology', status: 'active', inserted_at: '2023-02-10' },
    { id: 'cust-002', name: 'Rwanda Breweries Ltd', email: 'ap@rbl.rw', phone: '+250 252 555 001', country: 'Rwanda', industry: 'FMCG', status: 'active', inserted_at: '2022-08-01' },
    { id: 'cust-003', name: 'MTN Rwanda', email: 'procurement@mtn.rw', phone: '+250 788 200 200', country: 'Rwanda', industry: 'Telecoms', status: 'active', inserted_at: '2021-11-15' },
    { id: 'cust-004', name: 'BPR Bank', email: 'finance@bpr.rw', phone: '+250 252 500 100', country: 'Rwanda', industry: 'Banking', status: 'active', inserted_at: '2022-05-22' },
    { id: 'cust-005', name: 'Equity Bank Rwanda', email: 'ap@equityrw.com', phone: '+250 788 333 000', country: 'Rwanda', industry: 'Banking', status: 'prospect', inserted_at: '2024-01-05' },
    { id: 'cust-006', name: 'Airtel Rwanda', email: 'billing@airtel.rw', phone: '+250 788 100 100', country: 'Rwanda', industry: 'Telecoms', status: 'active', inserted_at: '2023-06-18' },
    { id: 'cust-007', name: 'Sonarwa Insurance', email: 'ap@sonarwa.rw', phone: '+250 252 500 200', country: 'Rwanda', industry: 'Insurance', status: 'inactive', inserted_at: '2022-03-30' },
    { id: 'cust-008', name: 'Crystal Ventures Ltd', email: 'finance@crystal.rw', phone: '+250 788 444 500', country: 'Rwanda', industry: 'Real Estate', status: 'prospect', inserted_at: '2024-03-12' },
    { id: 'cust-009', name: 'Inyange Industries', email: 'procurement@inyange.rw', phone: '+250 252 572 100', country: 'Rwanda', industry: 'Manufacturing', status: 'active', inserted_at: '2021-09-01' },
    { id: 'cust-010', name: 'Rulindo District', email: 'finance@rulindo.gov.rw', phone: '+250 252 560 100', country: 'Rwanda', industry: 'Government', status: 'churned', inserted_at: '2022-01-15' },
  ],
}

export const MOCK_CRM_STATS = {
  total: 138,
  active: 94,
  prospect: 31,
  inactive: 8,
  churned: 5,
}

export const MOCK_INTERACTIONS = {
  data: [
    { id: 'int-001', type: 'meeting', notes: 'Discussed Q2 contract renewal. Client happy with service. Will send revised proposal by Friday.', inserted_at: '2025-05-12', user_name: 'Manzi Osee' },
    { id: 'int-002', type: 'email', notes: 'Sent invoice INV-2025-003 with updated payment terms.', inserted_at: '2025-05-03', user_name: 'Manzi Osee' },
    { id: 'int-003', type: 'call', notes: 'Follow-up on overdue payment. Client promised EFT by end of week.', inserted_at: '2025-04-28', user_name: 'Keza Ineza' },
  ],
}

export const MOCK_AI_RESPONSES: Record<string, { message: string; data?: unknown }> = {
  default: { message: 'I found the information you requested. Here are the results from SyncFlow.' },
  overdue: { message: 'Found 7 overdue invoices totalling 3,200,000 RWF. The oldest is 47 days past due from Airtel Rwanda.', data: MOCK_INVOICES.data.filter(i => i.status === 'overdue') },
  inventory: { message: 'Current inventory value is 312,450,000 RWF across 3 warehouses with 284 items. 11 items are below reorder point.', data: MOCK_STOCK_ITEMS.data.slice(0, 5) },
  fleet: { message: '8 of 12 vehicles are currently active. 6 are transmitting live GPS. Monthly fuel cost is 4,820,000 RWF.', data: MOCK_VEHICLES.data },
  headcount: { message: 'SyncFlow has 47 employees across 6 departments. Largest department is Engineering with 14 staff.', data: Object.entries(MOCK_HEADCOUNT.by_department).map(([dept, count]) => ({ department: dept, count })) },
  payroll: { message: 'April payroll was approved: gross 26,840,000 RWF, net 21,472,000 RWF for 47 employees. May payroll is in draft.', data: MOCK_PAYROLL_RUNS.data },
  stock: { message: '11 items are below reorder point and need restocking urgently.', data: MOCK_LOW_STOCK.data },
  invoices: { message: 'Showing all invoices. You have 62 paid, 9 pending approval, 7 overdue, and 4 in draft.', data: MOCK_INVOICES.data },
}
