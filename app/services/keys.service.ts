import { fetcher } from '~/app/fetcher'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateAccessKeyResponse, CreateAccessKeyRequest } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationParams } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'
import type { ImportKeyRequest, ImportKeyResponse } from '~/shared/schemas/keys.schema'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyResponse, UpdateAccessKeyParams } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyRequest, DeleteAccessKeyParams } from '~/shared/schemas/keys.schema'

export interface KeysService {
  listAccessKeys: () => Promise<ApiResponse<ListAccessKeysResponse[]>>
  getKeyInformation: (
    id: GetKeyInformationParams['id'],
    params: Omit<GetKeyInformationParams, 'id'>
  ) => Promise<ApiResponse<GetKeyInformationResponse>>
  createAccessKey: (data: CreateAccessKeyRequest) => Promise<ApiResponse<CreateAccessKeyResponse>>
  updateAccessKey: (
    id: UpdateAccessKeyParams['id'],
    data: UpdateAccessKeyRequest
  ) => Promise<ApiResponse<UpdateAccessKeyResponse>>
  deleteAccessKey: (id: DeleteAccessKeyParams['id']) => Promise<ApiResponse<null>>
  importKey: (data: ImportKeyRequest) => Promise<ApiResponse<ImportKeyResponse>>
}

function defineKeysService(): KeysService {
  return {
    async listAccessKeys() {
      return await fetcher<ApiResponse<ListAccessKeysResponse[]>>('/keys', {
        method: 'GET'
      })
    },

    async getKeyInformation(
      id: GetKeyInformationParams['id'],
      params: Omit<GetKeyInformationParams, 'id'>
    ) {
      return await fetcher<ApiResponse<GetKeyInformationResponse>>(`/keys/${id}`, {
        method: 'GET',
        query: params
      })
    },

    async createAccessKey(data: CreateAccessKeyRequest) {
      return await fetcher<ApiResponse<CreateAccessKeyResponse>>('/keys', {
        method: 'POST',
        body: data
      })
    },

    async updateAccessKey(id: UpdateAccessKeyParams['id'], data: UpdateAccessKeyRequest) {
      return await fetcher<ApiResponse<UpdateAccessKeyResponse>>(`/keys/${id}`, {
        method: 'PUT',
        body: data
      })
    },

    async deleteAccessKey(id: DeleteAccessKeyParams['id']) {
      return await fetcher<ApiResponse<null>>(`/keys/${id}`, {
        method: 'DELETE'
      })
    },

    async importKey(data: ImportKeyRequest) {
      return await fetcher<ApiResponse<ImportKeyResponse>>('/keys/import', {
        method: 'POST',
        body: data
      })
    }
  }
}

const keysService = defineKeysService()

export default keysService
