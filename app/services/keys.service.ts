import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateAccessKeyResponse, CreateAccessKeyRequest } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationParams } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'
import type { ImportKeyRequest, ImportKeyResponse } from '~/shared/schemas/keys.schema'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyResponse, UpdateAccessKeyParams } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyRequest, DeleteAccessKeyParams } from '~/shared/schemas/keys.schema'
import fetcher from '../fetcher'

export async function listAccessKeys() {
  return await fetcher<ApiResponse<ListAccessKeysResponse[]>>('/keys', {
    method: 'GET'
  })
}

export async function getKeyInformation(
  id: GetKeyInformationParams['id'],
  params: Omit<GetKeyInformationParams, 'id'>
) {
  return await fetcher<ApiResponse<GetKeyInformationResponse>>(`/keys/${id}`, {
    method: 'GET',
    query: params
  })
}

export async function createAccessKey(data: CreateAccessKeyRequest) {
  return await fetcher<ApiResponse<CreateAccessKeyResponse>>('/keys', {
    method: 'POST',
    body: data
  })
}

export async function updateAccessKey(
  id: UpdateAccessKeyParams['id'],
  data: UpdateAccessKeyRequest
) {
  return await fetcher<ApiResponse<UpdateAccessKeyResponse>>(`/keys/${id}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteAccessKey(id: DeleteAccessKeyParams['id']) {
  return await fetcher<ApiResponse>(`/keys/${id}`, { method: 'DELETE' })
}

export async function importKey(data: ImportKeyRequest) {
  return await fetcher<ApiResponse<ImportKeyResponse>>('/keys/import', {
    method: 'POST',
    body: data
  })
}
