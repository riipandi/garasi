import type { ConnectClusterNodesRequest } from '~/shared/schemas/cluster.schema'
import type { ConnectClusterNodesResponse } from '~/shared/schemas/cluster.schema'
import type { GetClusterHealthResponse } from '~/shared/schemas/cluster.schema'
import type { GetClusterStatisticsResponse } from '~/shared/schemas/cluster.schema'
import type { GetClusterStatusResponse } from '~/shared/schemas/cluster.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import fetcher from '../fetcher'

export async function getClusterStatus() {
  return await fetcher<ApiResponse<GetClusterStatusResponse>>('/cluster/status', {
    method: 'GET'
  })
}

export async function getClusterHealth() {
  return await fetcher<ApiResponse<GetClusterHealthResponse>>('/cluster/health', {
    method: 'GET'
  })
}

export async function getClusterStatistics() {
  return await fetcher<ApiResponse<GetClusterStatisticsResponse>>('/cluster/statistics', {
    method: 'GET'
  })
}

export async function connectClusterNodes(data: ConnectClusterNodesRequest) {
  return await fetcher<ApiResponse<ConnectClusterNodesResponse[]>>('/cluster/connect-nodes', {
    method: 'POST',
    body: data
  })
}
