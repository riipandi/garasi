import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { ApplyClusterLayoutRequest } from '~/shared/schemas/layout.schema'
import type { ApplyClusterLayoutResponse } from '~/shared/schemas/layout.schema'
import type { GetClusterLayoutResponse } from '~/shared/schemas/layout.schema'
import type { GetLayoutHistoryResponse } from '~/shared/schemas/layout.schema'
import type { PreviewLayoutChangesResponse } from '~/shared/schemas/layout.schema'
import type { RevertClusterLayoutResponse } from '~/shared/schemas/layout.schema'
import type { SkipDeadNodesRequest, SkipDeadNodesResponse } from '~/shared/schemas/layout.schema'
import type { UpdateClusterLayoutResponse } from '~/shared/schemas/layout.schema'
import type { UpdateClusterLayoutRequest } from '~/shared/schemas/layout.schema'
import { fetcher } from '../fetcher'

export async function getClusterLayout() {
  return await fetcher<ApiResponse<GetClusterLayoutResponse>>('/layout', {
    method: 'GET'
  })
}

export async function getLayoutHistory() {
  return await fetcher<ApiResponse<GetLayoutHistoryResponse>>('/layout/history', {
    method: 'GET'
  })
}

export async function updateClusterLayout(data: UpdateClusterLayoutRequest) {
  return await fetcher<ApiResponse<UpdateClusterLayoutResponse>>('/layout', {
    method: 'PUT',
    body: data
  })
}

export async function applyClusterLayout(data: ApplyClusterLayoutRequest) {
  return await fetcher<ApiResponse<ApplyClusterLayoutResponse>>('/layout/apply', {
    method: 'POST',
    body: data
  })
}

export async function previewLayoutChanges() {
  return await fetcher<ApiResponse<PreviewLayoutChangesResponse>>('/layout/preview', {
    method: 'POST'
  })
}

export async function revertClusterLayout() {
  return await fetcher<ApiResponse<RevertClusterLayoutResponse>>('/layout/revert', {
    method: 'POST'
  })
}

export async function skipDeadNodes(data: SkipDeadNodesRequest) {
  return await fetcher<ApiResponse<SkipDeadNodesResponse>>('/layout/skip-dead-nodes', {
    method: 'POST',
    body: data
  })
}
