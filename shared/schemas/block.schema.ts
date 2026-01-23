/**
 * Get detailed information about a data block stored on a Garage node,
 * including all object versions and in-progress multipart uploads that
 * contain a reference to this block.
 */
export interface GetBlockInfoParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface GetBlockInfoRequest {
  blockHash: string
}

export interface GetBlockInfoResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * List data blocks that are currently in an errored state on
 * one or several Garage nodes.
 */
export interface ListBlockErrorsParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface ListBlockErrorsResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * Purge references to one or several missing data blocks.
 * This will remove all objects and in-progress multipart uploads
 * that contain the specified data block(s). The objects will be
 * permanently deleted from the buckets in which they appear.
 * Use with caution.
 */
export interface PurgeBlocksParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface PurgeBlocksResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * Instruct Garage node(s) to retry the resynchronization of one
 * or several missing data block(s).
 */
export interface RetryBlockResyncParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface RetryBlockResyncRequest {
  all: boolean
}

export interface RetryBlockResyncResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}
