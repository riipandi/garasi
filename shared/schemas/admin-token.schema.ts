/**
 * Returns all admin API tokens in the cluster.
 */
export interface ListAdminTokensResponse {
  created?: string | null // Creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean // Whether this admin token is expired already
  id?: string | null // Identifier of the admin token (which is also a prefix of the full bearer token)
  name: string // Name of the admin API token
  scope: string[] // Scope of the admin API token, a list of admin endpoint names (such as `GetClusterStatus`, etc), or the special value `*` to allow all admin endpoints
}

/**
 * Creates a new admin API token.
 *
 * Scope of the admin API token: a list of admin endpoint names
 * (such as GetClusterStatus, etc), or the special value `*` to
 * allow all admin endpoints.
 *
 * WARNING: Granting a scope of `CreateAdminToken` or `UpdateAdminToken`
 * trivially allows for privilege escalation, and is thus functionnally
 * equivalent to granting a scope of `*`.
 */
export interface CreateAdminTokenRequest {
  expiration: string | null // Expiration time and date, formatted according to RFC3339
  name: string | null // Name of the admin API token
  neverExpires: boolean // Set the admin token to never expire
  scope: string[] | null
}

export interface CreateAdminTokenResponse {
  created?: string | null // Creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean // Whether this admin token is expired already
  id?: string | null // Identifier of the admin token (which is also a prefix of the full bearer token)
  name: string // Name of the admin API token
  scope: string[] // Scope of the admin API token, a list of admin endpoint names (such as `GetClusterStatus`, etc), or the special value `*` to allow all admin endpoints
  secretToken: string // The secret bearer token. This token will be shown only ONCE.
}

/**
 * Delete an admin API token from the cluster, revoking all its permissions.
 */
export interface DeleteAdminTokenParams {
  id: string // Admin API token ID
}

export interface DeleteAdminTokenResponse {
  id: string
}

/**
 * Return information about a specific admin API token.
 * You can search by specifying the exact token identifier
 * (`id`) or by specifying a pattern (`search`).
 */
export interface GetAdminTokenInfoParams {
  id?: string // Admin API token ID
  search?: string // Partial token ID or name to search for
}

export interface GetAdminTokenInfoResponse {
  created?: string | null // Creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean // Whether this admin token is expired already
  id?: string | null // Identifier of the admin token (which is also a prefix of the full bearer token)
  name: string // Name of the admin API token
  scope: string[] // Scope of the admin API token, a list of admin endpoint names (such as `GetClusterStatus`, etc), or the special value `*` to allow all admin endpoints
}

/**
 * Return information about the calling admin API token.
 */
export interface GetCurrentTokenInfoResponse {
  created?: string | null // Creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean // Whether this admin token is expired already
  id?: string | null // Identifier of the admin token (which is also a prefix of the full bearer token)
  name: string // Name of the admin API token
  scope: string[] // Scope of the admin API token, a list of admin endpoint names (such as `GetClusterStatus`, etc), or the special value `*` to allow all admin endpoints
}

export interface UpdateAdminTokenParams {
  id: string // Admin API token ID
}

/**
 * Updates information about the specified admin API token.
 *
 * Scope of the admin API token, a list of admin endpoint names
 * (such as `GetClusterStatus`, etc), or the special value * to
 * allow all admin endpoints.
 *
 * WARNING: Granting a scope of CreateAdminToken or `UpdateAdminToken`
 * trivially allows for privilege escalation, and is thus functionnally
 * equivalent to granting a scope of `*`.
 */
export interface UpdateAdminTokenRequest {
  expiration?: string | null // Expiration time and date, formatted according to RFC 3339
  name?: string | null // Name of the admin API token
  neverExpires?: boolean // Set the admin token to never expire
  scope?: [] // Scope of the admin API token, a list of admin endpoint names.
}

export interface UpdateAdminTokenResponse {
  created?: string | null // Creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean // Whether this admin token is expired already
  id?: string | null // Identifier of the admin token (which is also a prefix of the full bearer token)
  name: string // Name of the admin API token
  scope: string[] // Scope of the admin API token, a list of admin endpoint names (such as `GetClusterStatus`, etc), or the special value `*` to allow all admin endpoints
}
