import type { LoginPayload, LoginResponse } from '../types/api'
import { jsonBody, request } from './api'

export function login(payload: LoginPayload) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: jsonBody(payload),
    auth: false,
  })
}
