import type { CreateAdminTokenRequest } from '~/shared/schemas/admin-token.schema'
import type { CreateAdminTokenResponse } from '~/shared/schemas/admin-token.schema'
import type { DeleteAdminTokenParams } from '~/shared/schemas/admin-token.schema'
import type { GetAdminTokenInfoParams } from '~/shared/schemas/admin-token.schema'
import type { GetAdminTokenInfoResponse } from '~/shared/schemas/admin-token.schema'
import type { GetCurrentTokenInfoResponse } from '~/shared/schemas/admin-token.schema'
import type { ListAdminTokensResponse } from '~/shared/schemas/admin-token.schema'
import type { UpdateAdminTokenParams } from '~/shared/schemas/admin-token.schema'
import type { UpdateAdminTokenRequest } from '~/shared/schemas/admin-token.schema'
import type { UpdateAdminTokenResponse } from '~/shared/schemas/admin-token.schema'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import fetcher from '../fetcher'

export async function listAdminTokens() {
  return await fetcher<ApiResponse<ListAdminTokensResponse[]>>('/admin/token', {
    method: 'GET'
  })
}

export async function createAdminToken(data: CreateAdminTokenRequest) {
  return await fetcher<ApiResponse<CreateAdminTokenResponse>>('/admin/token', {
    method: 'POST',
    body: data
  })
}

export async function getAdminTokenInfo(
  id: DeleteAdminTokenParams['id'],
  params?: Omit<GetAdminTokenInfoParams, 'id'>
) {
  return await fetcher<ApiResponse<GetAdminTokenInfoResponse>>(`/admin/token/${id}`, {
    method: 'GET',
    query: params
  })
}

export async function getCurrentTokenInfo() {
  return await fetcher<ApiResponse<GetCurrentTokenInfoResponse>>('/admin/token/current', {
    method: 'GET'
  })
}

export async function updateAdminToken(
  id: UpdateAdminTokenParams['id'],
  data: UpdateAdminTokenRequest
) {
  return await fetcher<ApiResponse<UpdateAdminTokenResponse>>(`/admin/token/${id}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteAdminToken(id: DeleteAdminTokenParams['id']) {
  return await fetcher<ApiResponse>(`/admin/token/${id}`, { method: 'DELETE' })
}
