/**
 * Cluster API Response Types
 * Type definitions for cluster-related API responses
 */

// Cluster Health Response
export interface ClusterHealthResponse {
  status: 'healthy' | 'degraded' | 'unavailable'
  knownNodes: number
  connectedNodes: number
  storageNodes: number
  storageNodesUp: number
  partitions: number
  partitionsQuorum: number
  partitionsAllOk: number
}

// Free Space Response
export interface FreeSpaceResp {
  total: number
  available: number
}

// Node Response
export interface NodeResp {
  id: string
  isUp: boolean
  draining: boolean
  addr: string | null
  hostname: string | null
  garageVersion: string | null
  lastSeenSecsAgo: number | null
  dataPartition: FreeSpaceResp | null
  metadataPartition: FreeSpaceResp | null
  role: object | null
}

// Cluster Status Response
export interface ClusterStatusResponse {
  layoutVersion: number
  nodes: NodeResp[]
}

// Storage Node Statistics
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

// Cluster Statistics Response
export interface ClusterStatisticsResponse {
  nodes: StorageNode[]
  clusterWide: {
    data: string
    metadata: string
  }
}

// Connect Node Response
export interface ConnectNodeResponse {
  success: boolean
  error: string | null
}

// Layout Types
export interface ZoneRedundancy {
  atLeast?: number | null
  maximum?: string | null
}

export interface LayoutParameters {
  zoneRedundancy: ZoneRedundancy
}

export interface LayoutNodeRole {
  id: string
  zone: string
  tags: string[]
  capacity: number | null
  storedPartitions: number | null
  usableCapacity: number | null
}

export interface NodeRoleChange {
  id: string
  remove?: boolean
  zone?: string
  tags?: string[]
  capacity?: number | null
}

export interface ClusterLayoutResponse {
  version: number
  roles: LayoutNodeRole[]
  parameters: LayoutParameters
  partitionSize: number
  stagedRoleChanges: NodeRoleChange[]
  stagedParameters: LayoutParameters | null
}

export interface PreviewLayoutResponseSuccess {
  message: string[]
  newLayout: ClusterLayoutResponse
}

export interface PreviewLayoutResponseError {
  error: string
}

export type PreviewLayoutResponse = PreviewLayoutResponseSuccess | PreviewLayoutResponseError

export interface LayoutHistoryResponse {
  currentVersion: number
  minAck: number
  versions: Array<{
    version: number
    timestamp: number
    nodes: object[]
    roles: object[]
    parameters: object
    partitionSize: number
  }>
  updateTrackers: Record<string, { ack: number; sync: number; syncAck: number }> | null
}

export interface SkipDeadNodesResponse {
  ackUpdated: string[]
  syncUpdated: string[]
}

// Node Types
export interface NodeInfo {
  nodeId: string
  garageVersion: string
  rustVersion: string
  dbEngine: string
  garageFeatures: string[] | null
}

export interface NodeInfoResponse {
  success: Record<string, NodeInfo>
  error: Record<string, string>
}

export type RepairType =
  | 'tables'
  | 'blocks'
  | 'versions'
  | 'multipartUploads'
  | 'blockRefs'
  | 'blockRc'
  | 'rebalance'
  | { scrub: string }
  | 'aliases'
  | 'clearResyncQueue'

export interface RepairOperationResponse {
  success: Record<string, null>
  error: Record<string, string>
}
