// User interface for dummy authentication
export interface User {
  id: string
  email: string
  name: string
}

/**
 * User information response from whoami endpoint
 */
export interface WhoamiResponse {
  success: boolean
  message: string | null
  data: {
    user_id: string
    email: string
    name: string
  } | null
}
