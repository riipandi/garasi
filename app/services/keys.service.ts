import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CreateAccessKeyResponse } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationParams } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'
import type { ImportKeyResponse } from '~/shared/schemas/keys.schema'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyResponse } from '~/shared/schemas/keys.schema'
import fetcher from '../fetcher'

export async function listAccessKeys() {
  return await fetcher<ApiResponse<ListAccessKeysResponse>>('/keys', {
    method: 'GET'
  })
}

export async function getKeyInformation(params: GetKeyInformationParams) {
  return await fetcher<ApiResponse<GetKeyInformationResponse>>(`/keys/${params.id}`, {
    method: 'GET',
    query: params
  })
}

export async function createAccessKey() {
  return await fetcher<ApiResponse<CreateAccessKeyResponse>>('/keys', {
    method: 'POST'
  })
}

export async function updateAccessKey(id: string, data: any) {
  return await fetcher<ApiResponse<UpdateAccessKeyResponse>>(`/keys/${id}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteAccessKey(id: string) {
  return await fetcher<ApiResponse<CreateAccessKeyResponse>>(`/keys/${id}`, {
    method: 'DELETE'
  })
}

export async function importKey(data: any) {
  return await fetcher<ApiResponse<ImportKeyResponse>>('/keys/import', {
    method: 'POST',
    body: data
  })
}
