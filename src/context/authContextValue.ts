import { createContext } from 'react'
import type { LoginPayload, User } from '../types/api'

export type AuthContextValue = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
