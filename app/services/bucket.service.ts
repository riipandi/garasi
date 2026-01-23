import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import fetcher from '../fetcher'

export async function listBuckets(): Promise<ApiResponse<ListBucketsResponse>> {
  return await fetcher<ApiResponse<ListBucketsResponse>>('/bucket')
}

// export async function getBucketInfo(): Promise<GetBucketInfoResponse> {}

// export async function inspectObject(): Promise<InspectObjectResponse> {}

// export async function createBucket(): Promise<CreateBucketResponse> {}

// export async function deleteBucket(): Promise<DeleteBucketResponse> {}

// export async function updateBucket(): Promise<UpdateBucketResponse> {}

// export async function cleanupUploads(): Promise<CleanupUploadsResponse> {}

// export async function addBucketAlias(): Promise<AddBucketAliasResponse> {}

// export async function removeBucketAlias(): Promise<RemoveBucketAliasResponse> {}

// export async function allowBucketKey(): Promise<AllowBucketKeyResponse> {}

// export async function denyBucketKey(): Promise<DenyBucketKeyResponse> {}
