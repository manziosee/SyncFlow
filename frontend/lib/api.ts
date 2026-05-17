import axios from 'axios'
import * as M from './mock-data'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// 401 → redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('sf_access_token')
        localStorage.removeItem('sf_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Demo helpers ─────────────────────────────────────────────
const isDemo = () =>
  typeof window !== 'undefined' &&
  (localStorage.getItem('sf_access_token') ?? '').startsWith('demo-token-')

// Simulates network latency so loading states are visible
const fake = <T>(data: T, ms = 180): Promise<{ data: T }> =>
  new Promise(resolve => setTimeout(() => resolve({ data }), ms))

const fakeOk = () => fake({ ok: true })

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; org_name: string }) =>
    api.post('/api/auth/register', data),
  refresh: (refresh_token: string) =>
    api.post('/api/auth/refresh', { refresh_token }),
}

// ─── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
  ceo: (year?: number) =>
    isDemo() ? fake(M.MOCK_CEO_DASHBOARD) : api.get('/api/dashboard/ceo', { params: { year } }),
  warehouse: () =>
    isDemo() ? fake({ data: [] }) : api.get('/api/dashboard/warehouse'),
  regional: () =>
    isDemo() ? fake({ data: [] }) : api.get('/api/dashboard/regional'),
}

// ─── Invoices ─────────────────────────────────────────────────
export const invoicesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    isDemo() ? fake(M.MOCK_INVOICES) : api.get('/api/accounting/invoices', { params }),
  get: (id: string) =>
    isDemo() ? fake(M.MOCK_INVOICE_DETAIL) : api.get(`/api/accounting/invoices/${id}`),
  create: (data: Record<string, unknown>) =>
    isDemo()
      ? fake({ data: { ...M.MOCK_INVOICES.data[0], id: 'inv-' + Date.now(), ...data } })
      : api.post('/api/accounting/invoices', data),
  update: (id: string, data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.put(`/api/accounting/invoices/${id}`, data),
  submit: (id: string) =>
    isDemo() ? fakeOk() : api.post(`/api/accounting/invoices/${id}/submit`),
  approve: (id: string, notes?: string) =>
    isDemo() ? fakeOk() : api.post(`/api/accounting/invoices/${id}/approve`, { notes }),
  reject: (id: string, reason: string) =>
    isDemo() ? fakeOk() : api.post(`/api/accounting/invoices/${id}/reject`, { reason }),
  void: (id: string, reason?: string) =>
    isDemo() ? fakeOk() : api.post(`/api/accounting/invoices/${id}/void`, { reason }),
  stats: () =>
    isDemo() ? fake(M.MOCK_CEO_DASHBOARD.invoice_stats) : api.get('/api/accounting/invoices/stats'),
  overdue: () =>
    isDemo()
      ? fake({ data: M.MOCK_INVOICES.data.filter(i => i.status === 'overdue') })
      : api.get('/api/accounting/invoices/overdue'),
  revenueByMonth: (year?: number) =>
    isDemo() ? fake(M.MOCK_REVENUE) : api.get('/api/accounting/revenue/monthly', { params: { year } }),
}

// ─── Inventory ────────────────────────────────────────────────
export const inventoryApi = {
  warehouses: () =>
    isDemo() ? fake(M.MOCK_WAREHOUSES) : api.get('/api/inventory/warehouses'),
  createWarehouse: (data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.post('/api/inventory/warehouses', data),
  inventoryValue: () =>
    isDemo() ? fake(M.MOCK_INVENTORY_VALUE) : api.get('/api/inventory/warehouses/value'),
  stockItems: (params?: Record<string, string | undefined>) =>
    isDemo() ? fake(M.MOCK_STOCK_ITEMS) : api.get('/api/inventory/stock-items', { params }),
  getStockItem: (id: string) =>
    isDemo()
      ? fake({ data: M.MOCK_STOCK_ITEMS.data.find(i => i.id === id) ?? M.MOCK_STOCK_ITEMS.data[0] })
      : api.get(`/api/inventory/stock-items/${id}`),
  createStockItem: (data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.post('/api/inventory/stock-items', data),
  adjustStock: (id: string, data: { quantity_delta: number; reason: string }) =>
    isDemo() ? fakeOk() : api.post(`/api/inventory/stock-items/${id}/adjust`, data),
  transferStock: (id: string, data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.post(`/api/inventory/stock-items/${id}/transfer`, data),
  lowStock: (warehouse_id?: string) =>
    isDemo()
      ? fake(M.MOCK_LOW_STOCK)
      : api.get('/api/inventory/stock-items/low-stock', { params: { warehouse_id } }),
}

// ─── HR & Payroll ─────────────────────────────────────────────
export const hrApi = {
  employees: (params?: Record<string, string | undefined>) =>
    isDemo() ? fake(M.MOCK_EMPLOYEES) : api.get('/api/hr/employees', { params }),
  getEmployee: (id: string) =>
    isDemo()
      ? fake({ data: M.MOCK_EMPLOYEES.data.find(e => e.id === id) ?? M.MOCK_EMPLOYEES.data[0] })
      : api.get(`/api/hr/employees/${id}`),
  createEmployee: (data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.post('/api/hr/employees', data),
  updateEmployee: (id: string, data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.put(`/api/hr/employees/${id}`, data),
  headcount: () =>
    isDemo() ? fake(M.MOCK_HEADCOUNT) : api.get('/api/hr/headcount'),
  payrollRuns: (params?: Record<string, string | undefined>) =>
    isDemo() ? fake(M.MOCK_PAYROLL_RUNS) : api.get('/api/hr/payroll', { params }),
  getPayrollRun: (id: string) =>
    isDemo()
      ? fake({ data: M.MOCK_PAYROLL_RUNS.data.find(r => r.id === id) ?? M.MOCK_PAYROLL_RUNS.data[0] })
      : api.get(`/api/hr/payroll/${id}`),
  createPayrollRun: (data: Record<string, unknown>) =>
    isDemo()
      ? fake({ data: { id: 'pr-' + Date.now(), status: 'draft', total_gross: 0, total_net: 0, employee_count: 47, ...data } })
      : api.post('/api/hr/payroll', data),
  processPayroll: (id: string) =>
    isDemo() ? fakeOk() : api.post(`/api/hr/payroll/${id}/process`),
  approvePayroll: (id: string) =>
    isDemo() ? fakeOk() : api.post(`/api/hr/payroll/${id}/approve`),
  paySlips: (runId: string) =>
    isDemo() ? fake(M.MOCK_PAY_SLIPS) : api.get(`/api/hr/payroll/${runId}/pay-slips`),
}

// ─── CRM ──────────────────────────────────────────────────────
export const crmApi = {
  customers: (params?: Record<string, string | undefined>) =>
    isDemo() ? fake(M.MOCK_CUSTOMERS) : api.get('/api/crm/customers', { params }),
  getCustomer: (id: string) =>
    isDemo()
      ? fake({ data: M.MOCK_CUSTOMERS.data.find(c => c.id === id) ?? M.MOCK_CUSTOMERS.data[0] })
      : api.get(`/api/crm/customers/${id}`),
  createCustomer: (data: Record<string, unknown>) =>
    isDemo()
      ? fake({ data: { id: 'cust-' + Date.now(), status: 'prospect', inserted_at: new Date().toISOString(), ...data } })
      : api.post('/api/crm/customers', data),
  updateCustomer: (id: string, data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.put(`/api/crm/customers/${id}`, data),
  interactions: (id: string) =>
    isDemo() ? fake(M.MOCK_INTERACTIONS) : api.get(`/api/crm/customers/${id}/interactions`),
  recordInteraction: (id: string, data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.post(`/api/crm/customers/${id}/interactions`, data),
  stats: () =>
    isDemo() ? fake(M.MOCK_CRM_STATS) : api.get('/api/crm/customers/stats'),
}

// ─── Fleet ────────────────────────────────────────────────────
export const fleetApi = {
  vehicles: (params?: Record<string, string | undefined>) =>
    isDemo() ? fake(M.MOCK_VEHICLES) : api.get('/api/fleet/vehicles', { params }),
  getVehicle: (id: string) =>
    isDemo()
      ? fake({ data: M.MOCK_VEHICLES.data.find(v => v.id === id) ?? M.MOCK_VEHICLES.data[0] })
      : api.get(`/api/fleet/vehicles/${id}`),
  createVehicle: (data: Record<string, unknown>) =>
    isDemo()
      ? fake({ data: { id: 'veh-' + Date.now(), status: 'idle', ...data } })
      : api.post('/api/fleet/vehicles', data),
  assignDriver: (id: string, data: { driver_id: string; driver_name: string }) =>
    isDemo() ? fakeOk() : api.post(`/api/fleet/vehicles/${id}/assign-driver`, data),
  livePositions: () =>
    isDemo() ? fake(M.MOCK_LIVE_POSITIONS) : api.get('/api/fleet/vehicles/live'),
  summary: () =>
    isDemo() ? fake(M.MOCK_FLEET_SUMMARY) : api.get('/api/fleet/vehicles/summary'),
  trips: (params?: Record<string, string | undefined>) =>
    isDemo() ? fake({ data: [] }) : api.get('/api/fleet/trips', { params }),
  fuelRecords: (vehicle_id: string) =>
    isDemo() ? fake(M.MOCK_FUEL_RECORDS) : api.get('/api/fleet/fuel', { params: { vehicle_id } }),
  logFuel: (data: Record<string, unknown>) =>
    isDemo() ? fakeOk() : api.post('/api/fleet/fuel', data),
}

// ─── AI ───────────────────────────────────────────────────────
export const aiApi = {
  command: (message: string) => {
    if (isDemo()) {
      const msg = message.toLowerCase()
      const key = msg.includes('overdue')                          ? 'overdue'
        : msg.includes('inventor') || msg.includes('value')        ? 'inventory'
        : msg.includes('fleet') || msg.includes('vehicle')         ? 'fleet'
        : msg.includes('headcount') || msg.includes('employ')      ? 'headcount'
        : msg.includes('payroll')                                   ? 'payroll'
        : msg.includes('low stock') || msg.includes('restock')     ? 'stock'
        : msg.includes('invoice')                                   ? 'invoices'
        : 'default'
      return fake(M.MOCK_AI_RESPONSES[key], 800) // slightly longer delay for AI feel
    }
    return api.post('/api/ai/command', { message })
  },
}

// ─── Reports ──────────────────────────────────────────────────
export const reportsApi = {
  generate: (type: string, extra?: Record<string, unknown>) =>
    isDemo()
      ? fake({ job_id: 'job-' + Date.now(), status: 'queued', message: 'Report queued' }, 300)
      : api.post('/api/reports/generate', { type, ...extra }),
}
