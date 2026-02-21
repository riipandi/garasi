import { fetcher } from '~/app/fetcher'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { CheckDomainParams } from '~/shared/schemas/special.schema'

export interface SystemService {
  checkDomain: (params: CheckDomainParams) => Promise<ApiResponse<null>>
  checkClusterHealth: () => Promise<ApiResponse<null>>
}

function defineSystemService(): SystemService {
  return {
    async checkDomain(params: CheckDomainParams) {
      return await fetcher<ApiResponse<null>>('/check-domain', {
        method: 'GET',
        query: params
      })
    },

    async checkClusterHealth() {
      return await fetcher<ApiResponse<null>>('/health', {
        method: 'GET'
      })
    }
  }
}

const specialService = defineSystemService()

export default specialService
