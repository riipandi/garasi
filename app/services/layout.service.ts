import { fetcher } from '~/app/fetcher'
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

export interface LayoutService {
  getClusterLayout: () => Promise<ApiResponse<GetClusterLayoutResponse>>
  getLayoutHistory: () => Promise<ApiResponse<GetLayoutHistoryResponse>>
  updateClusterLayout: (
    data: UpdateClusterLayoutRequest
  ) => Promise<ApiResponse<UpdateClusterLayoutResponse>>
  applyClusterLayout: (
    data: ApplyClusterLayoutRequest
  ) => Promise<ApiResponse<ApplyClusterLayoutResponse>>
  previewLayoutChanges: () => Promise<ApiResponse<PreviewLayoutChangesResponse>>
  revertClusterLayout: () => Promise<ApiResponse<RevertClusterLayoutResponse>>
  skipDeadNodes: (data: SkipDeadNodesRequest) => Promise<ApiResponse<SkipDeadNodesResponse>>
}

function defineLayoutService(): LayoutService {
  return {
    async getClusterLayout() {
      return await fetcher<ApiResponse<GetClusterLayoutResponse>>('/layout', {
        method: 'GET'
      })
    },

    async getLayoutHistory() {
      return await fetcher<ApiResponse<GetLayoutHistoryResponse>>('/layout/history', {
        method: 'GET'
      })
    },

    async updateClusterLayout(data: UpdateClusterLayoutRequest) {
      return await fetcher<ApiResponse<UpdateClusterLayoutResponse>>('/layout', {
        method: 'PUT',
        body: data
      })
    },

    async applyClusterLayout(data: ApplyClusterLayoutRequest) {
      return await fetcher<ApiResponse<ApplyClusterLayoutResponse>>('/layout/apply', {
        method: 'POST',
        body: data
      })
    },

    async previewLayoutChanges() {
      return await fetcher<ApiResponse<PreviewLayoutChangesResponse>>('/layout/preview', {
        method: 'POST'
      })
    },

    async revertClusterLayout() {
      return await fetcher<ApiResponse<RevertClusterLayoutResponse>>('/layout/revert', {
        method: 'POST'
      })
    },

    async skipDeadNodes(data: SkipDeadNodesRequest) {
      return await fetcher<ApiResponse<SkipDeadNodesResponse>>('/layout/skip-dead-nodes', {
        method: 'POST',
        body: data
      })
    }
  }
}

const layoutService = defineLayoutService()

export default layoutService
