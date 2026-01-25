/**
 * Dashboard-specific types that are not part of the Garage API schemas
 * These types are used for parsed data and custom dashboard features
 */

/**
 * Storage node information parsed from cluster statistics
 */
export interface StorageNode {
  id: string
  hostname: string
  zone: string
  capacity: string
  partitions: number
  dataAvailable: {
    used: string
    total: string
    percentage: number
  }
  metaAvailable: {
    used: string
    total: string
    percentage: number
  }
}

/**
 * Cluster statistics parsed from the Garage API freeform string
 */
export interface ClusterStatistics {
  nodes: StorageNode[]
  clusterWide: {
    data: string
    metadata: string
  }
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
