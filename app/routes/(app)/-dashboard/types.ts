// Import types from shared schemas
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'

// Re-export types for convenience
export type { ClusterStatistics } from '~/shared/schemas/dashboard.schema'
export type { WhoamiResponse } from '~/shared/schemas/user.schema'
export type { GetClusterHealthResponse as ClusterHealthResponse } from '~/shared/schemas/cluster.schema'
export type { ListBucketsResponse as BucketResponse } from '~/shared/schemas/bucket.schema'

/**
 * Extended key response with deleted field for dashboard
 */
export interface KeyResponse extends ListAccessKeysResponse {
  deleted: boolean
}
