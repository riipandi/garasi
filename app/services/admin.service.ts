import { fetcher } from '~/app/fetcher'
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

export interface AdminService {
  listAdminTokens: () => Promise<ApiResponse<ListAdminTokensResponse[]>>
  createAdminToken: (
    data: CreateAdminTokenRequest
  ) => Promise<ApiResponse<CreateAdminTokenResponse>>
  getAdminTokenInfo: (
    id: DeleteAdminTokenParams['id'],
    params?: Omit<GetAdminTokenInfoParams, 'id'>
  ) => Promise<ApiResponse<GetAdminTokenInfoResponse>>
  getCurrentTokenInfo: () => Promise<ApiResponse<GetCurrentTokenInfoResponse>>
  updateAdminToken: (
    id: UpdateAdminTokenParams['id'],
    data: UpdateAdminTokenRequest
  ) => Promise<ApiResponse<UpdateAdminTokenResponse>>
  deleteAdminToken: (id: DeleteAdminTokenParams['id']) => Promise<ApiResponse<null>>
}

function defineAdminService(): AdminService {
  return {
    async listAdminTokens() {
      return await fetcher<ApiResponse<ListAdminTokensResponse[]>>('/admin/token', {
        method: 'GET'
      })
    },

    async createAdminToken(data: CreateAdminTokenRequest) {
      return await fetcher<ApiResponse<CreateAdminTokenResponse>>('/admin/token', {
        method: 'POST',
        body: data
      })
    },

    async getAdminTokenInfo(
      id: DeleteAdminTokenParams['id'],
      params?: Omit<GetAdminTokenInfoParams, 'id'>
    ) {
      return await fetcher<ApiResponse<GetAdminTokenInfoResponse>>(`/admin/token/${id}`, {
        method: 'GET',
        query: params
      })
    },

    async getCurrentTokenInfo() {
      return await fetcher<ApiResponse<GetCurrentTokenInfoResponse>>('/admin/token/current', {
        method: 'GET'
      })
    },

    async updateAdminToken(id: UpdateAdminTokenParams['id'], data: UpdateAdminTokenRequest) {
      return await fetcher<ApiResponse<UpdateAdminTokenResponse>>(`/admin/token/${id}`, {
        method: 'PUT',
        body: data
      })
    },

    async deleteAdminToken(id: DeleteAdminTokenParams['id']) {
      return await fetcher<ApiResponse<null>>(`/admin/token/${id}`, {
        method: 'DELETE'
      })
    }
  }
}

const adminService = defineAdminService()

export default adminService
