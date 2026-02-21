import { fetcher } from '~/app/fetcher'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { SigninResponse, WhoamiResponse } from '~/shared/schemas/user.schema'

interface SessionData {
  id: string
  ip_address: string
  device_info: string
  last_activity_at: number
  expires_at: number
  created_at: number
  is_current: boolean
}

interface SessionsData {
  sessions: SessionData[]
}

export interface AuthService {
  signin: (email: string, password: string, remember?: boolean) => Promise<SigninResponse>
  logout: (sessionId: string) => Promise<ApiResponse<null>>
  validateToken: (token: string) => Promise<ApiResponse<{ is_token_valid: boolean }>>
  whoami: () => Promise<WhoamiResponse>
  passwordChange: (currentPassword: string, newPassword: string) => Promise<ApiResponse<null>>
  passwordForgot: (email: string) => Promise<ApiResponse<null>>
  passwordReset: (token: string, password: string) => Promise<ApiResponse<null>>
  getUserSessions: () => Promise<ApiResponse<SessionsData>>
  revokeAllSessions: () => Promise<ApiResponse<null>>
  revokeSession: (sessionId: string) => Promise<ApiResponse<null>>
  revokeOtherSessions: () => Promise<ApiResponse<null>>
}

function defineAuthService(): AuthService {
  return {
    async signin(email: string, password: string, remember = false) {
      return await fetcher<SigninResponse>('/auth/signin', {
        method: 'POST',
        body: { email, password, remember }
      })
    },

    async logout(sessionId: string) {
      return await fetcher<ApiResponse<null>>('/auth/logout', {
        method: 'POST',
        body: { session_id: sessionId }
      })
    },

    async validateToken(token: string) {
      return await fetcher<ApiResponse<{ is_token_valid: boolean }>>('/auth/validate-token', {
        method: 'GET',
        query: { token }
      })
    },

    async whoami() {
      return await fetcher<WhoamiResponse>('/auth/whoami', {
        method: 'GET'
      })
    },

    async passwordChange(currentPassword: string, newPassword: string) {
      return await fetcher<ApiResponse<null>>('/auth/password/change', {
        method: 'POST',
        body: { current_password: currentPassword, new_password: newPassword }
      })
    },

    async passwordForgot(email: string) {
      return await fetcher<ApiResponse<null>>('/auth/password/forgot', {
        method: 'POST',
        body: { email }
      })
    },

    async passwordReset(token: string, password: string) {
      return await fetcher<ApiResponse<null>>('/auth/password/reset', {
        method: 'POST',
        body: { token, password }
      })
    },

    async getUserSessions() {
      return await fetcher<ApiResponse<SessionsData>>('/auth/sessions', {
        method: 'GET'
      })
    },

    async revokeAllSessions() {
      return await fetcher<ApiResponse<null>>('/auth/sessions/all', {
        method: 'DELETE'
      })
    },

    async revokeSession(sessionId: string) {
      return await fetcher<ApiResponse<null>>(`/auth/sessions?session_id=${sessionId}`, {
        method: 'DELETE'
      })
    },

    async revokeOtherSessions() {
      return await fetcher<ApiResponse<null>>('/auth/sessions/others', {
        method: 'DELETE'
      })
    }
  }
}

const authService = defineAuthService()

export default authService
