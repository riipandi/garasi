/**
 * API Response Types
 * Type definitions for authentication API responses
 */

export interface SigninResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
  }
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  token?: string
  resetLink?: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

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
