import type { GetBlockInfoRequest, GetBlockInfoParams } from '~/shared/schemas/block.schema'
import type { GetBlockInfoResponse } from '~/shared/schemas/block.schema'
import type { ListBlockErrorsParams, ListBlockErrorsResponse } from '~/shared/schemas/block.schema'
import type { PurgeBlocksParams, PurgeBlocksResponse } from '~/shared/schemas/block.schema'
import type { RetryBlockResyncParams, RetryBlockResyncRequest } from '~/shared/schemas/block.schema'
import type { RetryBlockResyncResponse } from '~/shared/schemas/block.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import fetcher from '../fetcher'

export async function listBlockErrors(params: ListBlockErrorsParams) {
  return await fetcher<ApiResponse<ListBlockErrorsResponse>>('/block/errors', {
    method: 'GET',
    query: params
  })
}

export async function getBlockInfo(params: GetBlockInfoParams, data: GetBlockInfoRequest) {
  return await fetcher<ApiResponse<GetBlockInfoResponse>>('/block/info', {
    method: 'GET',
    query: params,
    body: data
  })
}

export async function purgeBlocks(params: PurgeBlocksParams, blockHashes: string[]) {
  return await fetcher<ApiResponse<PurgeBlocksResponse>>('/block/purge', {
    method: 'DELETE',
    query: params,
    body: blockHashes
  })
}

export async function retryBlockResync(
  params: RetryBlockResyncParams,
  data: RetryBlockResyncRequest
) {
  return await fetcher<ApiResponse<RetryBlockResyncResponse>>('/block/resync', {
    method: 'POST',
    query: params,
    body: data
  })
}
