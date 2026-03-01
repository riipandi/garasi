import { fetcher } from '~/app/fetcher'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateFolderParams } from '~/shared/schemas/objects.schema'
import type { CreateFolderRequest } from '~/shared/schemas/objects.schema'
import type { CreateFolderResponse } from '~/shared/schemas/objects.schema'
import type { DeleteObjectParams } from '~/shared/schemas/objects.schema'
import type { DeleteObjectResponse } from '~/shared/schemas/objects.schema'
import type { DeleteObjectsParams } from '~/shared/schemas/objects.schema'
import type { DeleteObjectsResponse } from '~/shared/schemas/objects.schema'
import type { GetObjectDetailParams } from '~/shared/schemas/objects.schema'
import type { GetObjectDetailResponse } from '~/shared/schemas/objects.schema'
import type { ListBucketObjectsParams } from '~/shared/schemas/objects.schema'
import type { ListBucketObjectsResponse } from '~/shared/schemas/objects.schema'
import type { PresignUrlParams } from '~/shared/schemas/objects.schema'
import type { PresignUrlResponse } from '~/shared/schemas/objects.schema'
import type { UploadFileParams } from '~/shared/schemas/objects.schema'
import type { UploadFileRequest } from '~/shared/schemas/objects.schema'
import type { UploadFileResponse } from '~/shared/schemas/objects.schema'

export interface ObjectsService {
  listBucketObjects: (
    params: ListBucketObjectsParams
  ) => Promise<ApiResponse<ListBucketObjectsResponse>>
  uploadFile: (
    params: UploadFileParams,
    data: UploadFileRequest
  ) => Promise<ApiResponse<UploadFileResponse>>
  createFolder: (
    params: CreateFolderParams,
    data: CreateFolderRequest
  ) => Promise<ApiResponse<CreateFolderResponse>>
  getObjectDetail: (
    params: GetObjectDetailParams
  ) => Promise<ApiResponse<GetObjectDetailResponse>>
  deleteObject: (
    params: Pick<DeleteObjectParams, 'bucket'>,
    data: Omit<DeleteObjectParams, 'bucket'>
  ) => Promise<ApiResponse<DeleteObjectResponse>>
  deleteObjects: (
    params: Pick<DeleteObjectsParams, 'bucket'>,
    data: Omit<DeleteObjectsParams, 'bucket'>
  ) => Promise<ApiResponse<DeleteObjectsResponse>>
  getPresignedUrl: (
    params: PresignUrlParams
  ) => Promise<ApiResponse<PresignUrlResponse>>
}

function defineObjectsService(): ObjectsService {
  return {
    async listBucketObjects(params: ListBucketObjectsParams) {
      return await fetcher<ApiResponse<ListBucketObjectsResponse>>('/objects', {
        method: 'GET',
        query: params
      })
    },

    async uploadFile(params: UploadFileParams, data: UploadFileRequest) {
      return await fetcher<ApiResponse<UploadFileResponse>>('/objects', {
        method: 'POST',
        query: params,
        body: data
      })
    },

    async createFolder(params: CreateFolderParams, data: CreateFolderRequest) {
      return await fetcher<ApiResponse<CreateFolderResponse>>('/objects/folder', {
        method: 'POST',
        query: params,
        body: data
      })
    },

    async getObjectDetail(params: GetObjectDetailParams) {
      return await fetcher<ApiResponse<GetObjectDetailResponse>>('/objects/info', {
        method: 'GET',
        query: params
      })
    },

    async deleteObject(
      params: Pick<DeleteObjectParams, 'bucket'>,
      data: Omit<DeleteObjectParams, 'bucket'>
    ) {
      return await fetcher<ApiResponse<DeleteObjectResponse>>('/objects', {
        method: 'DELETE',
        query: params,
        body: data
      })
    },

    async deleteObjects(
      params: Pick<DeleteObjectsParams, 'bucket'>,
      data: Omit<DeleteObjectsParams, 'bucket'>
    ) {
      return await fetcher<ApiResponse<DeleteObjectsResponse>>('/objects', {
        method: 'DELETE',
        query: params,
        body: data
      })
    },

    async getPresignedUrl(params: PresignUrlParams) {
      return await fetcher<ApiResponse<PresignUrlResponse>>('/objects/presign', {
        method: 'GET',
        query: params
      })
    }
  }
}

const objectsService = defineObjectsService()

export default objectsService
