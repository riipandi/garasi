// TODO: Move to `services`

import { decodeJwt, type JWTPayload } from 'jose'
import type { $Fetch, FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { authStore } from '~/app/stores'

/**
 * JWT payload interface for decoding access tokens
 */
export interface JWTClaims extends JWTPayload {
  typ: 'access' | 'refresh' // Type - Token type (standard JWT claim)
  sid?: string // Session ID
}

/**
 * Extract session ID from access token using jose library
 *
 * @param token - The access token
 * @returns The session ID or null if not found
 */
function extractSessionIdFromToken(token: string): string | null {
  try {
    const payload = decodeJwt<JWTClaims>(token)
    return payload?.sid || null
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - The refresh token to use
 * @returns New tokens or null if refresh failed
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
  sid: string
} | null> {
  try {
    const response = await ofetch<{
      success: boolean
      data: {
        access_token: string
        refresh_token: string
        access_token_expiry: number
        refresh_token_expiry: number
        sid: string
      }
    }>('/api/auth/refresh', {
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        session_id: extractSessionIdFromToken(refreshToken) || ''
      }
    })

    if (response.success && response.data) {
      // Update auth store with new tokens
      const currentAuth = authStore.get()
      authStore.set({
        atoken: response.data.access_token,
        atokenexp: response.data.access_token_expiry,
        rtoken: response.data.refresh_token,
        rtokenexp: response.data.refresh_token_expiry,
        remember: currentAuth.remember
      })

      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return null
  }
}

/**
 * Check if access token is expired or will expire soon
 *
 * @param expiry - Token expiry timestamp (Unix timestamp in seconds)
 * @param bufferSeconds - Buffer time in seconds before expiry (default: 60 seconds)
 * @returns True if token is expired or will expire soon
 */
function isTokenExpired(expiry: number | null, bufferSeconds: number = 60): boolean {
  if (!expiry) return true
  const now = Math.floor(Date.now() / 1000)
  return expiry <= now + bufferSeconds
}

/**
 * Track in-progress refresh to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false
let refreshPromise: Promise<any> | null = null

/**
 * Create a fetcher instance with Bearer token interceptor and automatic token refresh
 *
 * This wrapper automatically adds Authorization header with Bearer token header
 * from auth store to all requests. It also handles automatic token refresh when
 * access token expires.
 *
 * @param baseUrl - The base URL for all requests
 * @param options - Additional fetch options
 * @returns A configured ofetch instance
 *
 * @example
 * ```tsx
 * const api = createFetcher('https://api.example.com')
 *
 * // GET request - automatically adds Bearer token and session ID
 * const data = await api('/users')
 *
 * // POST request - automatically adds Bearer token and session ID
 * const result = await api('/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * })
 * ```
 */
export function createFetcher(baseUrl: string, options: FetchOptions = {}): $Fetch {
  return ofetch.create({
    baseURL: baseUrl,
    ...options,
    async onRequest({ options }) {
      // Get current auth state from store
      const authState = authStore.get()

      // Check if access token is expired or will expire soon
      if (authState?.atoken && authState?.rtoken) {
        if (isTokenExpired(authState.atokenexp)) {
          // If already refreshing, wait for existing refresh to complete
          if (isRefreshing && refreshPromise) {
            await refreshPromise
          } else {
            // Start a new refresh
            isRefreshing = true
            refreshPromise = refreshAccessToken(authState.rtoken)
            await refreshPromise
            isRefreshing = false
            refreshPromise = null
          }

          // Get updated auth state after refresh
          const updatedAuthState = authStore.get()
          if (updatedAuthState?.atoken) {
            options.headers = new Headers(options.headers)
            options.headers.set('Authorization', `Bearer ${updatedAuthState.atoken}`)
          }
        } else {
          // Add Bearer token if access token exists and is valid
          options.headers = new Headers(options.headers)
          options.headers.set('Authorization', `Bearer ${authState.atoken}`)
        }
      }
    },
    onResponseError({ response }) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Clear auth store on 401 error
        authStore.set({
          atoken: null,
          atokenexp: null,
          rtoken: null,
          rtokenexp: null,
          remember: false
        })
      }
    }
  })
}

/**
 * Default fetcher instance for API requests
 * Can be used directly or as a base for creating new fetchers
 *
 * @example
 * ```tsx
 * import { fetcher } from '~/app/fetcher'
 *
 * // GET request
 * const users = await fetcher('/users')
 *
 * // POST request
 * const result = await fetcher('/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * })
 * ```
 */
export const fetcher = createFetcher('/api')

/**
 * Type-safe API client with typed responses
 *
 * @example
 * ```tsx
 * interface User {
 *   id: string
 *   name: string
 *   email: string
 * }
 *
 * const users = await fetcher<User[]>('/users')
 * const user = await fetcher<User>('/users/1')
 * ```
 */
export default fetcher

/**
 * Logout function to clear auth state and call logout endpoint
 *
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
  const authState = authStore.get()

  if (authState?.rtoken && authState?.atoken) {
    const sessionId = extractSessionIdFromToken(authState.atoken)
    if (sessionId) {
      try {
        // Call logout endpoint to revoke refresh token and deactivate session
        await ofetch('/api/auth/logout', {
          method: 'POST',
          body: {
            refresh_token: authState.rtoken,
            session_id: sessionId
          }
        })
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }
  }

  // Clear auth store
  authStore.set({
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    remember: false
  })
}

/**
 * Get user sessions
 *
 * @returns Promise that resolves with user sessions
 */
export async function getUserSessions(): Promise<
  Array<{
    id: string
    ip_address: string
    device_info: string
    last_activity_at: number
    expires_at: number
    created_at: number
  }>
> {
  const response = await fetcher<{
    success: boolean
    data: {
      sessions: Array<{
        id: string
        ip_address: string
        device_info: string
        last_activity_at: number
        expires_at: number
        created_at: number
      }>
    }
  }>('/auth/sessions')

  if (response.success && response.data) {
    return response.data.sessions
  }

  return []
}

/**
 * Revoke a specific session
 *
 * @param sessionId - The session ID to revoke
 * @returns Promise that resolves when session is revoked
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetcher<{
      success: boolean
      data: null
    }>('/auth/sessions', {
      method: 'DELETE',
      body: {
        session_id: sessionId
      }
    })

    return response.success
  } catch (error) {
    console.error('Failed to revoke session:', error)
    return false
  }
}

/**
 * List all buckets
 *
 * @returns Promise that resolves with list of buckets
 */
export async function listBuckets(): Promise<
  Array<{
    id: string
    created: string
    globalAliases: string[]
    localAliases: Array<{
      accessKeyId: string
      alias: string
    }>
  }>
> {
  const response = await fetcher<{
    success: boolean
    data: Array<{
      id: string
      created: string
      globalAliases: string[]
      localAliases: Array<{
        accessKeyId: string
        alias: string
      }>
    }>
  }>('/bucket')

  if (response.success && response.data) {
    return response.data
  }

  return []
}

/**
 * Get bucket information
 *
 * @param bucketId - The bucket ID
 * @param globalAlias - Global alias of bucket to look up
 * @param search - Partial ID or alias to search for
 * @returns Promise that resolves with bucket information
 */
export async function getBucketInfo(
  bucketId: string,
  globalAlias?: string,
  search?: string
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>(`/bucket/${bucketId}`, {
      params: { globalAlias, search }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to get bucket info:', error)
    return null
  }
}

/**
 * Inspect an object in a bucket
 *
 * @param bucketId - The bucket ID
 * @param key - The object key
 * @returns Promise that resolves with object inspection data
 */
export async function inspectObject(
  bucketId: string,
  key: string
): Promise<{
  bucketId: string
  key: string
  versions: Array<{
    uuid: string
    timestamp: string
    encrypted: boolean
    uploading: boolean
    aborted: boolean
    deleteMarker: boolean
    inline: boolean
    etag?: string | null
    size?: number | null
    headers?: Array<[string, string]>
    blocks?: Array<{
      partNumber: number
      offset: number
      hash: string
      size: number
    }>
  }>
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        bucketId: string
        key: string
        versions: Array<{
          uuid: string
          timestamp: string
          encrypted: boolean
          uploading: boolean
          aborted: boolean
          deleteMarker: boolean
          inline: boolean
          etag?: string | null
          size?: number | null
          headers?: Array<[string, string]>
          blocks?: Array<{
            partNumber: number
            offset: number
            hash: string
            size: number
          }>
        }>
      }
    }>(`/bucket/${bucketId}/inspect-object`, {
      params: { key }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to inspect object:', error)
    return null
  }
}

/**
 * Create a new bucket
 *
 * @param globalAlias - Global alias for the bucket
 * @param localAlias - Local alias for the bucket
 * @returns Promise that resolves with created bucket information
 */
export async function createBucket(
  globalAlias?: string | null,
  localAlias?: {
    accessKeyId: string
    alias: string
    allow?: {
      owner?: boolean
      read?: boolean
      write?: boolean
    }
  } | null
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>('/bucket', {
      method: 'POST',
      body: { globalAlias, localAlias }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to create bucket:', error)
    return null
  }
}

/**
 * Delete a bucket
 *
 * @param bucketId - The bucket ID to delete
 * @returns Promise that resolves when bucket is deleted
 */
export async function deleteBucket(bucketId: string): Promise<boolean> {
  try {
    const response = await fetcher<{
      success: boolean
      data: { id: string }
    }>(`/bucket/${bucketId}`, {
      method: 'DELETE'
    })

    return response.success
  } catch (error) {
    console.error('Failed to delete bucket:', error)
    return false
  }
}

/**
 * Update a bucket
 *
 * @param bucketId - The bucket ID to update
 * @param websiteAccess - Website access configuration
 * @param quotas - Bucket quotas
 * @returns Promise that resolves with updated bucket information
 */
export async function updateBucket(
  bucketId: string,
  websiteAccess?: {
    enabled: boolean
    indexDocument?: string | null
    errorDocument?: string | null
  } | null,
  quotas?: {
    maxObjects: number | null
    maxSize: number | null
  } | null
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>(`/bucket/${bucketId}`, {
      method: 'PUT',
      body: { websiteAccess, quotas }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to update bucket:', error)
    return null
  }
}

/**
 * Cleanup incomplete uploads in a bucket
 *
 * @param bucketId - The bucket ID
 * @param olderThanSecs - Number of seconds; incomplete uploads older than this will be deleted
 * @returns Promise that resolves with number of uploads deleted
 */
export async function cleanupIncompleteUploads(
  bucketId: string,
  olderThanSecs: number
): Promise<number> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        uploadsDeleted: number
      }
    }>(`/bucket/${bucketId}/cleanup`, {
      method: 'POST',
      body: { olderThanSecs }
    })

    if (response.success && response.data) {
      return response.data.uploadsDeleted
    }

    return 0
  } catch (error) {
    console.error('Failed to cleanup incomplete uploads:', error)
    return 0
  }
}

/**
 * Add an alias to a bucket
 *
 * @param bucketId - The bucket ID
 * @param globalAlias - Global alias to add
 * @param localAlias - Local alias to add
 * @returns Promise that resolves with updated bucket information
 */
export async function addBucketAlias(
  bucketId: string,
  globalAlias?: string,
  localAlias?: {
    accessKeyId: string
    alias: string
  }
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>(`/bucket/${bucketId}/aliases`, {
      method: 'POST',
      body: { globalAlias, localAlias }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to add bucket alias:', error)
    return null
  }
}

/**
 * Remove an alias from a bucket
 *
 * @param bucketId - The bucket ID
 * @param globalAlias - Global alias to remove
 * @param localAlias - Local alias to remove
 * @returns Promise that resolves with updated bucket information
 */
export async function removeBucketAlias(
  bucketId: string,
  globalAlias?: string,
  localAlias?: {
    accessKeyId: string
    alias: string
  }
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>(`/bucket/${bucketId}/aliases`, {
      method: 'DELETE',
      body: { globalAlias, localAlias }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to remove bucket alias:', error)
    return null
  }
}

/**
 * Allow a key to access a bucket
 *
 * @param bucketId - The bucket ID
 * @param accessKeyId - The access key ID
 * @param permissions - Permissions to grant
 * @returns Promise that resolves with updated bucket information
 */
export async function allowBucketKey(
  bucketId: string,
  accessKeyId: string,
  permissions?: {
    owner?: boolean
    read?: boolean
    write?: boolean
  }
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>(`/bucket/${bucketId}/allow-key`, {
      method: 'POST',
      body: { accessKeyId, permissions }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to allow bucket key:', error)
    return null
  }
}

/**
 * Deny a key from accessing a bucket
 *
 * @param bucketId - The bucket ID
 * @param accessKeyId - The access key ID
 * @param permissions - Permissions to deny
 * @returns Promise that resolves with updated bucket information
 */
export async function denyBucketKey(
  bucketId: string,
  accessKeyId: string,
  permissions?: {
    owner?: boolean
    read?: boolean
    write?: boolean
  }
): Promise<{
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        id: string
        created: string
        globalAliases: string[]
        localAliases: Array<{
          accessKeyId: string
          alias: string
        }>
        websiteAccess: boolean
        websiteConfig: {
          indexDocument: string
          errorDocument: string | null
        } | null
        keys: Array<{
          accessKeyId: string
          name: string
          permissions: {
            owner: boolean
            read: boolean
            write: boolean
          }
          bucketLocalAliases: string[]
        }>
        objects: number
        bytes: number
        unfinishedUploads: number
        unfinishedMultipartUploads: number
        unfinishedMultipartUploadParts: number
        unfinishedMultipartUploadBytes: number
        quotas: {
          maxObjects: number | null
          maxSize: number | null
        }
      }
    }>(`/bucket/${bucketId}/deny-key`, {
      method: 'POST',
      body: { accessKeyId, permissions }
    })

    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to deny bucket key:', error)
    return null
  }
}

/**
 * Create a folder in a bucket
 *
 * @param bucket - The bucket name or ID
 * @param folderName - The name of folder to create
 * @returns Promise that resolves with created folder information
 */
export async function createFolder(
  bucket: string,
  folderName: string
): Promise<{
  folderName: string
  folderKey: string
  bucket: string
} | null> {
  try {
    const response = await fetcher<{
      status: 'success' | 'error'
      message: string
      data: {
        folderName: string
        folderKey: string
        bucket: string
      }
    }>('/objects/folder', {
      method: 'POST',
      params: { bucket },
      body: { name: folderName }
    })

    if (response.status === 'success' && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to create folder:', error)
    return null
  }
}

/**
 * List objects in a bucket
 *
 * @param bucket - The bucket name or ID
 * @param prefix - Optional prefix to filter objects (for folder navigation)
 * @param key - Optional specific key to inspect
 * @returns Promise that resolves with list of objects
 */
export async function listObjects(
  bucket: string,
  prefix?: string | null,
  key?: string | null
): Promise<{
  contents: Array<{
    key: string
    lastModified: string
    size: number
    eTag: string
  }>
  commonPrefixes: Array<{
    prefix: string
  }>
  isTruncated: boolean
} | null> {
  try {
    const params: Record<string, string> = { bucket }
    if (prefix) {
      params.prefix = prefix
    }
    if (key) {
      params.key = key
    }

    const response = await fetcher<{
      status: 'success' | 'error'
      message: string
      data: {
        name: string
        isTruncated: boolean
        keyCount: number
        maxKeys: number
        commonPrefixes?: Array<{
          prefix: string
        }>
        contents: Array<{
          key: string
          lastModified: string
          size: number
          eTag: string
          storageClass: string
        }>
      }
    }>('/objects', {
      params
    })

    if (response.status === 'success' && response.data) {
      return {
        contents: response.data.contents,
        commonPrefixes: response.data.commonPrefixes || [],
        isTruncated: response.data.isTruncated
      }
    }

    return null
  } catch (error) {
    console.error('Failed to list objects:', error)
    return null
  }
}

/**
 * Upload a file to a bucket
 *
 * @param bucket - The bucket name or ID
 * @param file - The file to upload
 * @param prefix - Optional prefix (folder path) to upload the file to
 * @param overwrite - Whether to overwrite existing file (optional)
 * @returns Promise that resolves with upload result
 */
export async function uploadFile(
  bucket: string,
  file: File,
  prefix?: string,
  overwrite?: boolean
): Promise<{
  filename: string
  contentType: string
  fileSize: string
  forceUpload: boolean
} | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const params: Record<string, string> = { bucket }
    if (prefix !== undefined && prefix !== null) {
      params.prefix = prefix
    }
    if (overwrite !== undefined) {
      params.overwrite = overwrite.toString()
    }

    const response = await fetcher<{
      status: 'success' | 'error'
      message: string
      data: {
        filename: string
        contentType: string
        fileSize: string
        forceUpload: boolean
      }
    }>('/objects', {
      method: 'POST',
      params,
      body: formData
    })

    if (response.status === 'success' && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to upload file:', error)
    return null
  }
}
