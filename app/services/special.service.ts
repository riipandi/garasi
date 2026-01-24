import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CheckDomainParams } from '~/shared/schemas/special.schema'
import fetcher from '../fetcher'

export async function checkDomain(params: CheckDomainParams) {
  return await fetcher<ApiResponse>('/check-domain', {
    method: 'GET',
    query: params
  })
}

export async function checkClusterHealth() {
  return await fetcher<ApiResponse>('/health', {
    method: 'GET'
  })
}
