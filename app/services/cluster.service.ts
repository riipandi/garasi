import { fetcher } from '~/app/fetcher'
import type { ConnectClusterNodesRequest } from '~/shared/schemas/cluster.schema'
import type { ConnectClusterNodesResponse } from '~/shared/schemas/cluster.schema'
import type { GetClusterHealthResponse } from '~/shared/schemas/cluster.schema'
import type { GetClusterStatisticsResponse } from '~/shared/schemas/cluster.schema'
import type { GetClusterStatusResponse } from '~/shared/schemas/cluster.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'

export interface ClusterService {
  getClusterStatus: () => Promise<ApiResponse<GetClusterStatusResponse>>
  getClusterHealth: () => Promise<ApiResponse<GetClusterHealthResponse>>
  getClusterStatistics: () => Promise<ApiResponse<GetClusterStatisticsResponse>>
  connectClusterNodes: (
    data: ConnectClusterNodesRequest
  ) => Promise<ApiResponse<ConnectClusterNodesResponse[]>>
}

function defineClusterService(): ClusterService {
  return {
    async getClusterStatus() {
      return await fetcher<ApiResponse<GetClusterStatusResponse>>('/cluster/status', {
        method: 'GET'
      })
    },

    async getClusterHealth() {
      return await fetcher<ApiResponse<GetClusterHealthResponse>>('/cluster/health', {
        method: 'GET'
      })
    },

    async getClusterStatistics() {
      return await fetcher<ApiResponse<GetClusterStatisticsResponse>>('/cluster/statistics', {
        method: 'GET'
      })
    },

    async connectClusterNodes(data: ConnectClusterNodesRequest) {
      return await fetcher<ApiResponse<ConnectClusterNodesResponse[]>>('/cluster/connect-nodes', {
        method: 'POST',
        body: data
      })
    }
  }
}

const clusterService = defineClusterService()

export default clusterService
