import type { ApiResponse } from './common.schema'

export interface User {
  id: string
  email: string
  name: string
}

export interface WhoamiResponse extends ApiResponse<{
  user_id: string
  email: string
  name: string
}> {}

export interface SigninResponse extends ApiResponse<{
  user_id: string
  email: string
  name: string
  session_id: string
  access_token: string
  access_token_expiry: number
}> {}
