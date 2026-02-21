import { fetcher } from '~/app/fetcher'
import type { AddBucketAliasResponse } from '~/shared/schemas/bucket.schema'
import type { AddGlobalBucketAliasRequest } from '~/shared/schemas/bucket.schema'
import type { AddLocalBucketAliasRequest } from '~/shared/schemas/bucket.schema'
import type { AllowBucketKeyRequest, AllowBucketKeyResponse } from '~/shared/schemas/bucket.schema'
import type { CleanupUploadsRequest, CleanupUploadsResponse } from '~/shared/schemas/bucket.schema'
import type { CreateBucketRequest, CreateBucketResponse } from '~/shared/schemas/bucket.schema'
import type { DenyBucketKeyRequest, DenyBucketKeyResponse } from '~/shared/schemas/bucket.schema'
import type { GetBucketInfoParams, GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'
import type { InspectObjectParams, InspectObjectResponse } from '~/shared/schemas/bucket.schema'
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketGlobalAliasRequest } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketLocalAliasRequest } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketAliasResponse } from '~/shared/schemas/bucket.schema'
import type { UpdateBucketRequest, UpdateBucketParams } from '~/shared/schemas/bucket.schema'
import type { UpdateBucketResponse } from '~/shared/schemas/bucket.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'

export interface BucketService {
  listBuckets: () => Promise<ApiResponse<ListBucketsResponse[]>>
  getBucketInfo: (params: GetBucketInfoParams) => Promise<ApiResponse<GetBucketInfoResponse>>
  inspectObject: (
    id: UpdateBucketParams['id'],
    params: Omit<InspectObjectParams, 'bucketId'>
  ) => Promise<ApiResponse<InspectObjectResponse>>
  createBucket: (data: CreateBucketRequest) => Promise<ApiResponse<CreateBucketResponse>>
  updateBucket: (
    id: UpdateBucketParams['id'],
    data: UpdateBucketRequest
  ) => Promise<ApiResponse<UpdateBucketResponse>>
  deleteBucket: (id: UpdateBucketParams['id']) => Promise<ApiResponse<null>>
  cleanupUploads: (
    id: UpdateBucketParams['id'],
    data: Omit<CleanupUploadsRequest, 'bucketId'>
  ) => Promise<ApiResponse<CleanupUploadsResponse>>
  addBucketAlias: (
    id: UpdateBucketParams['id'],
    data: AddGlobalBucketAliasRequest | AddLocalBucketAliasRequest
  ) => Promise<ApiResponse<AddBucketAliasResponse>>
  removeBucketAlias: (
    id: UpdateBucketParams['id'],
    data:
      | Omit<RemoveBucketGlobalAliasRequest, 'bucketId'>
      | Omit<RemoveBucketLocalAliasRequest, 'bucketId'>
  ) => Promise<ApiResponse<RemoveBucketAliasResponse>>
  allowBucketKey: (
    id: UpdateBucketParams['id'],
    data: Omit<AllowBucketKeyRequest, 'bucketId'>
  ) => Promise<ApiResponse<AllowBucketKeyResponse>>
  denyBucketKey: (
    id: UpdateBucketParams['id'],
    data: Omit<DenyBucketKeyRequest, 'bucketId'>
  ) => Promise<ApiResponse<DenyBucketKeyResponse>>
}

function defineBucketService(): BucketService {
  return {
    async listBuckets() {
      return await fetcher<ApiResponse<ListBucketsResponse[]>>('/bucket', {
        method: 'GET'
      })
    },

    async getBucketInfo(params: GetBucketInfoParams) {
      if (params.id) {
        const { id, ...queryParams } = params
        return await fetcher<ApiResponse<GetBucketInfoResponse>>(`/bucket/${id}`, {
          method: 'GET',
          query: queryParams
        })
      }
      return await fetcher<ApiResponse<GetBucketInfoResponse>>('/bucket', {
        method: 'GET',
        query: params
      })
    },

    async inspectObject(
      id: UpdateBucketParams['id'],
      params: Omit<InspectObjectParams, 'bucketId'>
    ) {
      return await fetcher<ApiResponse<InspectObjectResponse>>(`/bucket/${id}/inspect-object`, {
        method: 'GET',
        query: params
      })
    },

    async createBucket(data: CreateBucketRequest) {
      return await fetcher<ApiResponse<CreateBucketResponse>>('/bucket', {
        method: 'POST',
        body: data
      })
    },

    async updateBucket(id: UpdateBucketParams['id'], data: UpdateBucketRequest) {
      return await fetcher<ApiResponse<UpdateBucketResponse>>(`/bucket/${id}`, {
        method: 'PUT',
        body: data
      })
    },

    async deleteBucket(id: UpdateBucketParams['id']) {
      return await fetcher<ApiResponse<null>>(`/bucket/${id}`, {
        method: 'DELETE'
      })
    },

    async cleanupUploads(
      id: UpdateBucketParams['id'],
      data: Omit<CleanupUploadsRequest, 'bucketId'>
    ) {
      return await fetcher<ApiResponse<CleanupUploadsResponse>>(`/bucket/${id}/cleanup`, {
        method: 'POST',
        body: data
      })
    },

    async addBucketAlias(
      id: UpdateBucketParams['id'],
      data: AddGlobalBucketAliasRequest | AddLocalBucketAliasRequest
    ) {
      return await fetcher<ApiResponse<AddBucketAliasResponse>>(`/bucket/${id}/aliases`, {
        method: 'POST',
        body: data
      })
    },

    async removeBucketAlias(
      id: UpdateBucketParams['id'],
      data:
        | Omit<RemoveBucketGlobalAliasRequest, 'bucketId'>
        | Omit<RemoveBucketLocalAliasRequest, 'bucketId'>
    ) {
      return await fetcher<ApiResponse<RemoveBucketAliasResponse>>(`/bucket/${id}/aliases`, {
        method: 'DELETE',
        body: data
      })
    },

    async allowBucketKey(
      id: UpdateBucketParams['id'],
      data: Omit<AllowBucketKeyRequest, 'bucketId'>
    ) {
      return await fetcher<ApiResponse<AllowBucketKeyResponse>>(`/bucket/${id}/allow-key`, {
        method: 'POST',
        body: data
      })
    },

    async denyBucketKey(
      id: UpdateBucketParams['id'],
      data: Omit<DenyBucketKeyRequest, 'bucketId'>
    ) {
      return await fetcher<ApiResponse<DenyBucketKeyResponse>>(`/bucket/${id}/deny-key`, {
        method: 'POST',
        body: data
      })
    }
  }
}

const bucketService = defineBucketService()

export default bucketService
