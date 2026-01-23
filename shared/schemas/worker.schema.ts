/**
 * Get information about the specified background worker on one or several cluster nodes.
 */
export interface GetWorkerInfoParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface GetWorkerInfoRequest {
  id: number
}

export interface GetWorkerInfoResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * List background workers currently running on one or several cluster nodes.
 */

export interface ListWorkersParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface ListWorkersRequest {
  busyOnly?: boolean
  errorOnly?: boolean
}

export interface ListWorkersResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * Fetch values of one or several worker variables, from one or several cluster nodes.
 */
export interface GetWorkerVariableParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface GetWorkerVariableRequest {
  variable?: string | null
}

export interface GetWorkerVariableResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}

/**
 * Set the value for a worker variable, on one or several cluster nodes.
 */
export interface SetWorkerVariableParams {
  node: '*' | 'self' | string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

export interface SetWorkerVariableRequest {
  value: string
  variable: string
}

export interface SetWorkerVariableResponse {
  error: {
    [key: string]: string // Map of node id to error message, for nodes that were unable to complete the API call
  }
  success: {
    [key: string]: any | null // Map of node id to response returned by this node, for nodes that were able to successfully complete the API call
  }
}
