import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateFolderParams } from '~/shared/schemas/objects.schema'
import type { CreateFolderRequest } from '~/shared/schemas/objects.schema'
import type { CreateFolderResponse } from '~/shared/schemas/objects.schema'
import type { ListBucketObjectsParams } from '~/shared/schemas/objects.schema'
import type { ListBucketObjectsResponse } from '~/shared/schemas/objects.schema'
import type { UploadFileParams } from '~/shared/schemas/objects.schema'
import type { UploadFileRequest } from '~/shared/schemas/objects.schema'
import type { UploadFileResponse } from '~/shared/schemas/objects.schema'
import { fetcher } from '../fetcher'

export async function listBucketObjects(params: ListBucketObjectsParams) {
  return await fetcher<ApiResponse<ListBucketObjectsResponse>>('/objects', {
    method: 'GET',
    query: params
  })
}

export async function uploadFile(params: UploadFileParams, data: UploadFileRequest) {
  return await fetcher<ApiResponse<UploadFileResponse>>('/objects', {
    method: 'POST',
    query: params,
    body: data
  })
}

export async function createFolder(params: CreateFolderParams, data: CreateFolderRequest) {
  return await fetcher<ApiResponse<CreateFolderResponse>>('/objects/folder', {
    method: 'POST',
    query: params,
    body: data
  })
}
