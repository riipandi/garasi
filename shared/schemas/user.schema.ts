import type { ApiResponse } from './common.schema'

export interface User {
  id: string
  email: string
  name: string
}

export interface WhoamiData {
  user_id: string
  email: string
  name: string
}

export interface WhoamiResponse extends ApiResponse<WhoamiData> {}

export interface SigninData {
  user_id: string
  email: string
  name: string
  session_id: string
  access_token: string
  access_token_expiry: number
}

export interface SigninResponse extends ApiResponse<SigninData> {}

export interface LogoutResponse {
  success: boolean
}

export interface SessionInfo {
  id: string
  userId: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  expiresAt: string
  isCurrent: boolean
}

export interface ListSessionsResponse {
  sessions: SessionInfo[]
}

export interface RevokeSessionResponse {
  session_id: string
}

export interface RevokeOtherSessionsResponse {
  deactivated_count: number
}

export interface ValidateTokenResponse {
  valid: boolean
  user_id?: string
}

export interface UpdateProfileResponse {
  user_id: string
  email: string
  name: string
}
