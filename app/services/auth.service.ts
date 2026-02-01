import { fetcher } from '~/app/fetcher'
import type { WhoamiResponse } from '~/shared/schemas/user.schema'

// =============================================================================
// AUTHENTICATION
// =============================================================================

export async function signin(email: string, password: string) {
  return await fetcher<any>('/auth/signin', {
    method: 'POST',
    body: { email, password }
  })
}

export async function logout() {
  return await fetcher<any>('/auth/logout', {
    method: 'POST'
  })
}

export async function refresh(refreshToken: string, sessionId: string) {
  return await fetcher<any>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken, session_id: sessionId }
  })
}

export async function validateToken(token: string) {
  return await fetcher<any>('/auth/validate-token', {
    method: 'GET',
    query: { token }
  })
}

export async function whoami() {
  return await fetcher<WhoamiResponse>('/auth/whoami', {
    method: 'GET'
  })
}

// =============================================================================
// PASSWORD RECOVERY
// =============================================================================

export async function passwordChange(currentPassword: string, newPassword: string) {
  return await fetcher<any>('/auth/password/change', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword }
  })
}

export async function passwordForgot(email: string) {
  return await fetcher<any>('/auth/password/forgot', {
    method: 'POST',
    body: { email }
  })
}

export async function passwordReset(token: string, password: string) {
  return await fetcher<any>('/auth/password/reset', {
    method: 'POST',
    body: { token, password }
  })
}

// =============================================================================
// SESSIONS MANAGEMENT
// =============================================================================

export async function getUserSessions() {
  try {
    const response = await fetcher<any>('/auth/sessions', {
      method: 'GET'
    })
    return response.status === 'success' ? response.data.sessions : []
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return []
  }
}

export async function revokeAllSessions() {
  try {
    const response = await fetcher<any>('/auth/sessions/all', {
      method: 'DELETE'
    })
    return response.status === 'success'
  } catch (error) {
    console.error('Failed to revoke all sessions:', error)
    return false
  }
}

export async function revokeSession(sessionId: string) {
  try {
    const response = await fetcher<any>(`/auth/sessions?session_id=${sessionId}`, {
      method: 'DELETE'
    })
    return response.status === 'success'
  } catch (error) {
    console.error('Failed to revoke session:', error)
    return false
  }
}

export async function revokeOtherSessions() {
  try {
    const response = await fetcher<any>('/auth/sessions/others', {
      method: 'DELETE'
    })
    return response.status === 'success'
  } catch (error) {
    console.error('Failed to revoke other sessions:', error)
    return false
  }
}
