import { fetcher } from '~/app/fetcher'
import type { GetBlockInfoRequest, GetBlockInfoParams } from '~/shared/schemas/block.schema'
import type { GetBlockInfoResponse } from '~/shared/schemas/block.schema'
import type { ListBlockErrorsParams, ListBlockErrorsResponse } from '~/shared/schemas/block.schema'
import type { PurgeBlocksParams, PurgeBlocksResponse } from '~/shared/schemas/block.schema'
import type { RetryBlockResyncParams, RetryBlockResyncRequest } from '~/shared/schemas/block.schema'
import type { RetryBlockResyncResponse } from '~/shared/schemas/block.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'

export interface BlockService {
  listBlockErrors: (params: ListBlockErrorsParams) => Promise<ApiResponse<ListBlockErrorsResponse>>
  getBlockInfo: (
    params: GetBlockInfoParams,
    data: GetBlockInfoRequest
  ) => Promise<ApiResponse<GetBlockInfoResponse>>
  purgeBlocks: (
    params: PurgeBlocksParams,
    blockHashes: string[]
  ) => Promise<ApiResponse<PurgeBlocksResponse>>
  retryBlockResync: (
    params: RetryBlockResyncParams,
    data: RetryBlockResyncRequest
  ) => Promise<ApiResponse<RetryBlockResyncResponse>>
}

function defineBlockService(): BlockService {
  return {
    async listBlockErrors(params: ListBlockErrorsParams) {
      return await fetcher<ApiResponse<ListBlockErrorsResponse>>('/block/errors', {
        method: 'GET',
        query: params
      })
    },

    async getBlockInfo(params: GetBlockInfoParams, data: GetBlockInfoRequest) {
      return await fetcher<ApiResponse<GetBlockInfoResponse>>('/block/info', {
        method: 'GET',
        query: params,
        body: data
      })
    },

    async purgeBlocks(params: PurgeBlocksParams, blockHashes: string[]) {
      return await fetcher<ApiResponse<PurgeBlocksResponse>>('/block/purge', {
        method: 'DELETE',
        query: params,
        body: blockHashes
      })
    },

    async retryBlockResync(params: RetryBlockResyncParams, data: RetryBlockResyncRequest) {
      return await fetcher<ApiResponse<RetryBlockResyncResponse>>('/block/resync', {
        method: 'POST',
        query: params,
        body: data
      })
    }
  }
}

const blockService = defineBlockService()

export default blockService
