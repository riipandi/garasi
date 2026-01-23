import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'
import fetcher from '../fetcher'

export async function listAccessKeys(): Promise<ApiResponse<ListAccessKeysResponse>> {
  return await fetcher<ApiResponse<ListAccessKeysResponse>>('/keys')
}

// export async function getKeyInformation(): Promise<GetKeyInformationResponse> {}

// export async function createAccessKey(): Promise<CreateAccessKeyResponse> {}

// export async function updateAccessKey(): Promise<UpdateAccessKeyResponse> {}

// export async function deleteAccessKey(): Promise<DeleteAccessKeyResponse> {}

// export async function importKey(): Promise<ImportKeyResponse> {
