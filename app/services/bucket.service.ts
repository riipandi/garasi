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
import { fetcher } from '../fetcher'

export async function listBuckets() {
  return await fetcher<ApiResponse<ListBucketsResponse[]>>('/bucket', {
    method: 'GET'
  })
}

export async function getBucketInfo(params: GetBucketInfoParams) {
  if (params.id) {
    const { id, ...queryParams } = params // Use route parameter for bucket ID
    return await fetcher<ApiResponse<GetBucketInfoResponse>>(`/bucket/${id}`, {
      method: 'GET',
      query: queryParams
    })
  }
  // Use query params for search or globalAlias
  return await fetcher<ApiResponse<GetBucketInfoResponse>>('/bucket', {
    method: 'GET',
    query: params
  })
}

// ID is route params (bucketId), key is query param
export async function inspectObject(
  id: UpdateBucketParams['id'],
  params: Omit<InspectObjectParams, 'bucketId'>
) {
  return await fetcher<ApiResponse<InspectObjectResponse>>(`/bucket/${id}/inspect-object`, {
    method: 'GET',
    query: params
  })
}

export async function createBucket(data: CreateBucketRequest) {
  return await fetcher<ApiResponse<CreateBucketResponse>>('/bucket', {
    method: 'POST',
    body: data
  })
}

export async function updateBucket(id: UpdateBucketParams['id'], data: UpdateBucketRequest) {
  return await fetcher<ApiResponse<UpdateBucketResponse>>(`/bucket/${id}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteBucket(id: UpdateBucketParams['id']) {
  return await fetcher<ApiResponse>(`/bucket/${id}`, { method: 'DELETE' })
}

export async function cleanupUploads(
  id: UpdateBucketParams['id'],
  data: Omit<CleanupUploadsRequest, 'bucketId'>
) {
  return await fetcher<ApiResponse<CleanupUploadsResponse>>(`/bucket/${id}/cleanup`, {
    method: 'POST',
    body: data
  })
}

export async function addBucketAlias(
  id: UpdateBucketParams['id'],
  data: AddGlobalBucketAliasRequest | AddLocalBucketAliasRequest
) {
  return await fetcher<ApiResponse<AddBucketAliasResponse>>(`/bucket/${id}/aliases`, {
    method: 'POST',
    body: data
  })
}

export async function removeBucketAlias(
  id: UpdateBucketParams['id'],
  data:
    | Omit<RemoveBucketGlobalAliasRequest, 'bucketId'>
    | Omit<RemoveBucketLocalAliasRequest, 'bucketId'>
) {
  return await fetcher<ApiResponse<RemoveBucketAliasResponse>>(`/bucket/${id}/aliases`, {
    method: 'DELETE',
    body: data
  })
}

export async function allowBucketKey(
  id: UpdateBucketParams['id'],
  data: Omit<AllowBucketKeyRequest, 'bucketId'>
) {
  return await fetcher<ApiResponse<AllowBucketKeyResponse>>(`/bucket/${id}/allow-key`, {
    method: 'POST',
    body: data
  })
}

export async function denyBucketKey(
  id: UpdateBucketParams['id'],
  data: Omit<DenyBucketKeyRequest, 'bucketId'>
) {
  return await fetcher<ApiResponse<DenyBucketKeyResponse>>(`/bucket/${id}/deny-key`, {
    method: 'POST',
    body: data
  })
}
