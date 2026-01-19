/**
 * API Response Types
 * Type definitions for authentication API responses
 */

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  message: string | null
  data: T
}

// Error response structure
export interface ApiErrorResponse {
  status: 'error'
  message: string
  errors?: any
}

export interface SigninResponseData {
  user_id: string
  email: string
  name: string
  access_token: string
  refresh_token: string
  access_token_expiry: number | null
  refresh_token_expiry: number | null
}

export interface SigninResponse extends ApiResponse<SigninResponseData> {}

export interface ForgotPasswordData {
  token?: string
  reset_link?: string
  expires_at?: number
}

export interface ForgotPasswordResponse extends ApiResponse<ForgotPasswordData | null> {}

export interface ValidateTokenData {
  is_token_valid: boolean
}

export interface ValidateTokenResponse extends ApiResponse<ValidateTokenData> {}

export interface ResetPasswordResponse extends ApiResponse<null> {}

export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: {
    message?: string
  }
}

export interface SigninRequest {
  email: string
  password: string
  remember?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}
