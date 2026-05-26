import axios from 'axios'

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
    api.get('/api/dashboard/ceo', { params: { year } }),
  warehouse: () =>
    api.get('/api/dashboard/warehouse'),
  regional: () =>
    api.get('/api/dashboard/regional'),
}

// ─── Invoices ─────────────────────────────────────────────────
export const invoicesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get('/api/accounting/invoices', { params }),
  get: (id: string) =>
    api.get(`/api/accounting/invoices/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/api/accounting/invoices', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/accounting/invoices/${id}`, data),
  submit: (id: string) =>
    api.post(`/api/accounting/invoices/${id}/submit`),
  approve: (id: string, notes?: string) =>
    api.post(`/api/accounting/invoices/${id}/approve`, { notes }),
  reject: (id: string, reason: string) =>
    api.post(`/api/accounting/invoices/${id}/reject`, { reason }),
  void: (id: string, reason?: string) =>
    api.post(`/api/accounting/invoices/${id}/void`, { reason }),
  stats: () =>
    api.get('/api/accounting/invoices/stats'),
  overdue: () =>
    api.get('/api/accounting/invoices/overdue'),
  revenueByMonth: (year?: number) =>
    api.get('/api/accounting/revenue/monthly', { params: { year } }),
}

// ─── Inventory ────────────────────────────────────────────────
export const inventoryApi = {
  warehouses: () =>
    api.get('/api/inventory/warehouses'),
  createWarehouse: (data: Record<string, unknown>) =>
    api.post('/api/inventory/warehouses', data),
  inventoryValue: () =>
    api.get('/api/inventory/warehouses/value'),
  stockItems: (params?: Record<string, string | undefined>) =>
    api.get('/api/inventory/stock-items', { params }),
  getStockItem: (id: string) =>
    api.get(`/api/inventory/stock-items/${id}`),
  createStockItem: (data: Record<string, unknown>) =>
    api.post('/api/inventory/stock-items', data),
  adjustStock: (id: string, data: { quantity_delta: number; reason: string }) =>
    api.post(`/api/inventory/stock-items/${id}/adjust`, data),
  transferStock: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/inventory/stock-items/${id}/transfer`, data),
  updateStockItem: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/inventory/stock-items/${id}`, data),
  deleteStockItem: (id: string) =>
    api.delete(`/api/inventory/stock-items/${id}`),
  updateWarehouse: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/inventory/warehouses/${id}`, data),
  deleteWarehouse: (id: string) =>
    api.delete(`/api/inventory/warehouses/${id}`),
  lowStock: (warehouse_id?: string) =>
    api.get('/api/inventory/stock-items/low-stock', { params: { warehouse_id } }),
}

// ─── HR & Payroll ─────────────────────────────────────────────
export const hrApi = {
  employees: (params?: Record<string, string | undefined>) =>
    api.get('/api/hr/employees', { params }),
  getEmployee: (id: string) =>
    api.get(`/api/hr/employees/${id}`),
  createEmployee: (data: Record<string, unknown>) =>
    api.post('/api/hr/employees', data),
  updateEmployee: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/hr/employees/${id}`, data),
  deleteEmployee: (id: string) =>
    api.delete(`/api/hr/employees/${id}`),
  headcount: () =>
    api.get('/api/hr/headcount'),
  payrollRuns: (params?: Record<string, string | undefined>) =>
    api.get('/api/hr/payroll', { params }),
  getPayrollRun: (id: string) =>
    api.get(`/api/hr/payroll/${id}`),
  createPayrollRun: (data: Record<string, unknown>) =>
    api.post('/api/hr/payroll', data),
  processPayroll: (id: string) =>
    api.post(`/api/hr/payroll/${id}/process`),
  approvePayroll: (id: string) =>
    api.post(`/api/hr/payroll/${id}/approve`),
  paySlips: (runId: string) =>
    api.get(`/api/hr/payroll/${runId}/pay-slips`),
  deletePayrollRun: (id: string) =>
    api.delete(`/api/hr/payroll/${id}`),
}

// ─── CRM ──────────────────────────────────────────────────────
export const crmApi = {
  customers: (params?: Record<string, string | undefined>) =>
    api.get('/api/crm/customers', { params }),
  getCustomer: (id: string) =>
    api.get(`/api/crm/customers/${id}`),
  createCustomer: (data: Record<string, unknown>) =>
    api.post('/api/crm/customers', data),
  updateCustomer: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/crm/customers/${id}`, data),
  deleteCustomer: (id: string) =>
    api.delete(`/api/crm/customers/${id}`),
  interactions: (id: string) =>
    api.get(`/api/crm/customers/${id}/interactions`),
  recordInteraction: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/crm/customers/${id}/interactions`, data),
  stats: () =>
    api.get('/api/crm/customers/stats'),
}

// ─── Fleet ────────────────────────────────────────────────────
export const fleetApi = {
  vehicles: (params?: Record<string, string | undefined>) =>
    api.get('/api/fleet/vehicles', { params }),
  getVehicle: (id: string) =>
    api.get(`/api/fleet/vehicles/${id}`),
  createVehicle: (data: Record<string, unknown>) =>
    api.post('/api/fleet/vehicles', data),
  updateVehicle: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/fleet/vehicles/${id}`, data),
  assignDriver: (id: string, data: { driver_id: string; driver_name: string }) =>
    api.post(`/api/fleet/vehicles/${id}/assign-driver`, data),
  livePositions: () =>
    api.get('/api/fleet/vehicles/live'),
  summary: () =>
    api.get('/api/fleet/vehicles/summary'),
  trips: (params?: Record<string, string | undefined>) =>
    api.get('/api/fleet/trips', { params }),
  fuelRecords: (vehicle_id: string) =>
    api.get('/api/fleet/fuel', { params: { vehicle_id } }),
  logFuel: (data: Record<string, unknown>) =>
    api.post('/api/fleet/fuel', data),
}

// ─── AI ───────────────────────────────────────────────────────
export const aiApi = {
  command: (message: string) =>
    api.post('/api/ai/command', { message }),
}

// ─── Reports ──────────────────────────────────────────────────
export const reportsApi = {
  generate: (type: string, extra?: Record<string, unknown>) =>
    api.post('/api/reports/generate', { type, ...extra }),
}

// ─── File Uploads (Appwrite-backed) ───────────────────────────
export const uploadsApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  delete: (fileId: string) =>
    api.delete(`/api/uploads/${fileId}`),
}
