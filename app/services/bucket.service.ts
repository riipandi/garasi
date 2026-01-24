import { queryOptions } from '@tanstack/react-query'
import type { AllowBucketKeyResponse, GetBucketInfoParams } from '~/shared/schemas/bucket.schema'
import type { DeleteBucketParams } from '~/shared/schemas/bucket.schema'
import type { CleanupUploadsResponse } from '~/shared/schemas/bucket.schema'
import type { CreateBucketResponse } from '~/shared/schemas/bucket.schema'
import type { DenyBucketKeyResponse } from '~/shared/schemas/bucket.schema'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'
import type { InspectObjectResponse, InspectObjectParams } from '~/shared/schemas/bucket.schema'
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'
import type { UpdateBucketResponse } from '~/shared/schemas/bucket.schema'
import type { AddBucketAliasResponse } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketAliasResponse } from '~/shared/schemas/bucket.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import fetcher from '../fetcher'

export function listBuckets() {
  const queryKey = ['buckets']
  const queryFn = fetcher<ApiResponse<ListBucketsResponse[]>>('/bucket')
  const queryOpts = queryOptions({ queryKey, queryFn: () => queryFn })

  return { queryKey, queryFn, queryOpts }
}

export async function getBucketInfo(params: GetBucketInfoParams) {
  const queryFn = fetcher<ApiResponse<GetBucketInfoResponse>>('/bucket', {
    method: 'GET',
    query: params
  })

  return { queryFn }
}

export async function inspectObject(params: InspectObjectParams) {
  const queryFn = fetcher<ApiResponse<InspectObjectResponse>>('/bucket', {
    method: 'GET',
    query: params
  })

  return { queryFn }
}

export async function createBucket() {
  const queryFn = fetcher<ApiResponse<CreateBucketResponse>>('/bucket', {
    method: 'POST'
  })

  return { queryFn }
}

export async function deleteBucket(id: DeleteBucketParams['id']) {
  const queryFn = fetcher<ApiResponse>(`/bucket/${id}`, { method: 'DELETE' })

  return { queryFn }
}

export async function updateBucket() {
  const queryFn = fetcher<ApiResponse<UpdateBucketResponse>>('/bucket', {
    method: 'PUT'
  })

  return { queryFn }
}

export async function cleanupUploads() {
  const queryFn = fetcher<ApiResponse<CleanupUploadsResponse>>('/bucket', {
    method: 'POST'
  })

  return { queryFn }
}

export async function addBucketAlias() {
  const queryFn = fetcher<ApiResponse<AddBucketAliasResponse>>('/bucket', {
    method: 'POST'
  })

  return { queryFn }
}

export async function removeBucketAlias() {
  const queryFn = fetcher<ApiResponse<RemoveBucketAliasResponse>>('/bucket', {
    method: 'DELETE'
  })

  return { queryFn }
}

export async function allowBucketKey() {
  const queryFn = fetcher<ApiResponse<AllowBucketKeyResponse>>('/bucket', {
    method: 'POST'
  })

  return { queryFn }
}

export async function denyBucketKey() {
  const queryFn = fetcher<ApiResponse<DenyBucketKeyResponse>>('/bucket', {
    method: 'POST'
  })

  return { queryFn }
}
