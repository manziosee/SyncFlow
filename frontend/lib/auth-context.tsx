'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  org_id: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'sf_access_token'
const USER_KEY  = 'sf_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const userJson = localStorage.getItem(USER_KEY)

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setState({ user, token, isLoading: false, isAuthenticated: true })
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setState(s => ({ ...s, isLoading: false }))
      }
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Demo mode — bypass backend
    const DEMO_CREDENTIALS = [
      { email: 'admin@syncflow.io', password: 'password123' },
      { email: 'manager@syncflow.io', password: 'password123' },
    ]
    const isDemo = DEMO_CREDENTIALS.some(c => c.email === email && c.password === password)

    if (isDemo) {
      const { MOCK_USER } = await import('./mock-data')
      const demoUser = { ...MOCK_USER, email, name: email === 'manager@syncflow.io' ? 'Jane Manager' : MOCK_USER.name }
      const fakeToken = 'demo-token-' + Date.now()
      localStorage.setItem(TOKEN_KEY, fakeToken)
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
      setState({ user: demoUser, token: fakeToken, isLoading: false, isAuthenticated: true })
      return
    }

    const res = await api.post('/api/auth/login', { email, password })
    const { user, access_token } = res.data.data
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setState({ user, token: access_token, isLoading: false, isAuthenticated: true })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false })
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
