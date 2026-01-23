export interface FreeSpaceResp {
  available: number // Number of bytes available
  total: number // Total number of bytes
}

export interface NodeAssignedRole {
  capacity?: number | null // Capacity (in bytes) assigned by the cluster administrator, absent for gateway nodes
  tags: string[] // List of tags assigned by the cluster administrator
  zone: string // Zone name assigned by the cluster administrator
}

export interface NodeResp {
  addr: string | null // Socket address used by other nodes to connect to this node for RPC
  dataPartition: FreeSpaceResp | null
  draining: boolean // Whether this node is part of an older layout version and is draining data.
  garageVersion: string | null // Garage version
  hostname: string | null // Hostname of the node
  id: string // Full-length node identifier
  isUp: boolean // Whether this node is connected in the cluster
  lastSeenSecsAgo: number | null // For disconnected nodes, the number of seconds since last contact, or null if no contact was established since Garage restarted.
  metadataPartition: FreeSpaceResp | null
  role: NodeAssignedRole | null
}

/**
 * Returns the cluster's current status, including:
 *  - ID of the node being queried and its version of the Garage daemon
 *  - Live nodes
 *  - Currently configured cluster layout
 *  - Staged changes to the cluster layout
 * Capacity is given in bytes
 */
export interface GetClusterStatusResponse {
  layoutVersion: number // Current version number of the cluster layout
  nodes: NodeResp[]
}

/**
 * Returns the global status of the cluster, the number
 * of connected nodes (over the number of known ones),
 * the number of healthy storage nodes (over the declared ones),
 * and the number of healthy partitions (over the total).
 *
 * Statuses:
 *  - healthy: Garage node is connected to all storage nodes
 *  - degraded: Garage node is not connected to all storage nodes, but a quorum of write nodes is available for all partitions
 *  - unavailable: a quorum of write nodes is not available for some partitions
 */
export interface GetClusterHealthResponse {
  connectedNodes: number // the nubmer of nodes this Garage node currently has an open connection to
  knownNodes: number // the number of nodes this Garage node has had a TCP connection to since the daemon started
  partitions: number // the total number of partitions of the data (currently always 256)
  partitionsAllOk: number // the number of partitions for which we are connected to all storage nodes responsible of storing it
  partitionsQuorum: number // the number of partitions for which a quorum of write nodes is available
  status: 'healthy' | 'degraded' | 'unavailable'
  storageNodes: number // the number of storage nodes currently registered in the cluster layout
  storageNodesUp: number // the number of storage nodes to which a connection is currently open
}

/**
 * Fetch global cluster statistics.
 * Note: do not try to parse the freeform field of the response,
 * it is given as a string specifically because its format is not stable.
 */
export interface GetClusterStatisticsResponse {
  freeform: string
}

/**
 * Instructs this Garage node to connect to other Garage
 * nodes at specified `<node_id>@<net_address>`. `node_id`
 * is generated automatically on node start.
 */
export interface ConnectClusterNodesRequest {
  nodes: string[] // Array of node ids
}

export interface ConnectClusterNodesResponse {
  error: string | null // An error message if Garage did not manage to connect to this node
  success: boolean // `true` if Garage managed to connect to this node
}
