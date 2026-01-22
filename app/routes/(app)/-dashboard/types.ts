// Types
export interface WhoamiResponse {
  success: boolean
  message: string | null
  data: {
    user_id: string
    email: string
    name: string
  } | null
}

export interface ClusterHealthResponse {
  status: string
  knownNodes: number
  connectedNodes: number
  storageNodes: number
  storageNodesUp: number
  partitions: number
  partitionsQuorum: number
  partitionsAllOk: number
}

export interface ClusterStatisticsResponse {
  nodes: Array<{
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
  }>
  clusterWide: {
    data: string
    metadata: string
  }
}

export interface BucketResponse {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
}

export interface KeyResponse {
  id: string
  name: string
  created: string | null
  deleted: boolean
}
