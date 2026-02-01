import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateMetadataSnapshotParams } from '~/shared/schemas/node.schema'
import type { CreateMetadataSnapshotResponse } from '~/shared/schemas/node.schema'
import type { GetNodeInfoRequest, GetNodeInfoResponse } from '~/shared/schemas/node.schema'
import type { GetNodeStatisticsParams } from '~/shared/schemas/node.schema'
import type { GetNodeStatisticsResponse } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationParams } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationRequest } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationResponse } from '~/shared/schemas/node.schema'
import { fetcher } from '../fetcher'

export async function getNodeInfo(params: GetNodeInfoRequest) {
  return await fetcher<ApiResponse<GetNodeInfoResponse>>('/node/info', {
    method: 'GET',
    query: params
  })
}

export async function getNodeStatistics(params: GetNodeStatisticsParams) {
  return await fetcher<ApiResponse<GetNodeStatisticsResponse>>('/node/statistics', {
    method: 'GET',
    query: params
  })
}

export async function createMetadataSnapshot(params: CreateMetadataSnapshotParams) {
  return await fetcher<ApiResponse<CreateMetadataSnapshotResponse>>('/node/metadata-snapshot', {
    method: 'POST',
    query: params
  })
}

export async function launchRepairOperation(
  params: LaunchRepairOperationParams,
  data: LaunchRepairOperationRequest
) {
  return await fetcher<ApiResponse<LaunchRepairOperationResponse>>('/node/repair', {
    method: 'POST',
    query: params,
    body: data
  })
}
