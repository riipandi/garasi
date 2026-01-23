/**
 * Instruct one or several nodes to take a snapshot of
 * their metadata databases.
 */
export interface CreateMetadataSnapshotParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface CreateMetadataSnapshotResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * Return information about the Garage daemon running on
 * one or several nodes.
 */
export interface GetNodeInfoRequest {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface GetNodeInfoResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * Fetch statistics for one or several Garage nodes.
 * Note: do not try to parse the freeform field of the
 * response, it is given as a string specifically because
 * its format is not stable.
 */
export interface GetNodeStatisticsParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface GetNodeStatisticsResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

export type RepairScrub = 'start' | 'pause' | 'resume' | 'cancel'

export type RepairType =
  | 'tables'
  | 'blocks'
  | 'versions'
  | 'multipartUploads'
  | 'blockRefs'
  | 'blockRc'
  | 'rebalance'
  | { scrub: RepairScrub }
  | 'aliases'
  | 'clearResyncQueue'

/**
 * Launch a repair operation on one or several cluster nodes.
 */
export interface LaunchRepairOperationParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface LaunchRepairOperationRequest {
  repairType: RepairType
}

export interface LaunchRepairOperationResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}
