import { fetcher } from '~/app/fetcher'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateMetadataSnapshotParams } from '~/shared/schemas/node.schema'
import type { CreateMetadataSnapshotResponse } from '~/shared/schemas/node.schema'
import type { GetNodeInfoRequest, GetNodeInfoResponse } from '~/shared/schemas/node.schema'
import type { GetNodeStatisticsParams } from '~/shared/schemas/node.schema'
import type { GetNodeStatisticsResponse } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationParams } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationRequest } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationResponse } from '~/shared/schemas/node.schema'

export interface NodeService {
  getNodeInfo: (params: GetNodeInfoRequest) => Promise<ApiResponse<GetNodeInfoResponse>>
  getNodeStatistics: (
    params: GetNodeStatisticsParams
  ) => Promise<ApiResponse<GetNodeStatisticsResponse>>
  createMetadataSnapshot: (
    params: CreateMetadataSnapshotParams
  ) => Promise<ApiResponse<CreateMetadataSnapshotResponse>>
  launchRepairOperation: (
    params: LaunchRepairOperationParams,
    data: LaunchRepairOperationRequest
  ) => Promise<ApiResponse<LaunchRepairOperationResponse>>
}

function defineNodeService(): NodeService {
  return {
    async getNodeInfo(params: GetNodeInfoRequest) {
      return await fetcher<ApiResponse<GetNodeInfoResponse>>('/node/info', {
        method: 'GET',
        query: params
      })
    },

    async getNodeStatistics(params: GetNodeStatisticsParams) {
      return await fetcher<ApiResponse<GetNodeStatisticsResponse>>('/node/statistics', {
        method: 'GET',
        query: params
      })
    },

    async createMetadataSnapshot(params: CreateMetadataSnapshotParams) {
      return await fetcher<ApiResponse<CreateMetadataSnapshotResponse>>('/node/metadata-snapshot', {
        method: 'POST',
        query: params
      })
    },

    async launchRepairOperation(
      params: LaunchRepairOperationParams,
      data: LaunchRepairOperationRequest
    ) {
      return await fetcher<ApiResponse<LaunchRepairOperationResponse>>('/node/repair', {
        method: 'POST',
        query: params,
        body: data
      })
    }
  }
}

const nodeService = defineNodeService()

export default nodeService
