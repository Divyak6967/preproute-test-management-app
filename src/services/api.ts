import { getStoredToken } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RequestOptions = RequestInit & {
  auth?: boolean
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiEnvelope<T> = {
  success?: boolean
  status?: 'success' | 'error' | string
  data?: T
  message?: string
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const { auth = true, headers, body, ...rest } = options
  const token = getStoredToken()
  const requestHeaders = new Headers(headers)

  requestHeaders.set('Content-Type', 'application/json')

  if (auth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body,
    headers: requestHeaders,
  })

  const text = await response.text()
  let json: ApiEnvelope<T> | null = null

  if (text) {
    try {
      json = JSON.parse(text) as ApiEnvelope<T>
    } catch {
      // Ignore parse errors and keep raw text for debugging below.
    }
  }

  if (!response.ok) {
    const message = json?.message ?? (text || `Request failed with status ${response.status}`)
    throw new ApiError(message, response.status)
  }

  if (json?.success === false || json?.status === 'error') {
    throw new ApiError(json.message ?? `Request failed with status ${response.status}`, response.status)
  }

  return json?.data as T
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value)
}
