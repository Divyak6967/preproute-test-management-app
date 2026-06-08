import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { login as authLogin } from '../services/authApi'
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../services/storage'
import { AuthContext } from './authContextValue'
import type { LoginPayload, User } from '../types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  async function login(payload: LoginPayload) {
    const response = await authLogin(payload)

    setStoredToken(response.token)
    setStoredUser(response.user)
    setToken(response.token)
    setUser(response.user)
  }

  function logout() {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
