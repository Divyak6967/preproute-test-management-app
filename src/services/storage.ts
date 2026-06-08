import type { User } from '../types/api'

const TOKEN_KEY = 'preproute_token'
const USER_KEY = 'preproute_user'
const ACTIVE_TEST_KEY = 'preproute_active_test_id'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser(): User | null {
  const value = localStorage.getItem(USER_KEY)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as User
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ACTIVE_TEST_KEY)
}

export function getActiveTestId() {
  return localStorage.getItem(ACTIVE_TEST_KEY)
}

export function setActiveTestId(testId: string) {
  localStorage.setItem(ACTIVE_TEST_KEY, testId)
}

export function clearActiveTestId() {
  localStorage.removeItem(ACTIVE_TEST_KEY)
}
