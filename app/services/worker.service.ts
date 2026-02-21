import { fetcher } from '~/app/fetcher'
import type { ApiResponse } from '~/shared/schemas/common.schema'
import type { GetWorkerInfoParams } from '~/shared/schemas/worker.schema'
import type { GetWorkerInfoRequest } from '~/shared/schemas/worker.schema'
import type { GetWorkerInfoResponse } from '~/shared/schemas/worker.schema'
import type { GetWorkerVariableParams } from '~/shared/schemas/worker.schema'
import type { GetWorkerVariableRequest } from '~/shared/schemas/worker.schema'
import type { GetWorkerVariableResponse } from '~/shared/schemas/worker.schema'
import type { ListWorkersParams } from '~/shared/schemas/worker.schema'
import type { ListWorkersRequest } from '~/shared/schemas/worker.schema'
import type { ListWorkersResponse } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableParams } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableRequest } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableResponse } from '~/shared/schemas/worker.schema'

export interface WorkerService {
  listWorkers: (
    params: ListWorkersParams,
    data: ListWorkersRequest
  ) => Promise<ApiResponse<ListWorkersResponse>>
  getWorkerInfo: (
    params: GetWorkerInfoParams & GetWorkerInfoRequest
  ) => Promise<ApiResponse<GetWorkerInfoResponse>>
  getWorkerVariable: (
    params: GetWorkerVariableParams & GetWorkerVariableRequest
  ) => Promise<ApiResponse<GetWorkerVariableResponse>>
  setWorkerVariable: (
    params: SetWorkerVariableParams,
    data: SetWorkerVariableRequest
  ) => Promise<ApiResponse<SetWorkerVariableResponse>>
}

function defineWorkerService(): WorkerService {
  return {
    async listWorkers(params: ListWorkersParams, data: ListWorkersRequest) {
      return await fetcher<ApiResponse<ListWorkersResponse>>('/worker', {
        method: 'GET',
        query: params,
        body: data
      })
    },

    async getWorkerInfo(params: GetWorkerInfoParams & GetWorkerInfoRequest) {
      return await fetcher<ApiResponse<GetWorkerInfoResponse>>('/worker/info', {
        method: 'GET',
        query: params
      })
    },

    async getWorkerVariable(params: GetWorkerVariableParams & GetWorkerVariableRequest) {
      const { variable, ...query } = params
      return await fetcher<ApiResponse<GetWorkerVariableResponse>>('/worker/variable', {
        method: 'GET',
        query: query,
        body: { variable }
      })
    },

    async setWorkerVariable(params: SetWorkerVariableParams, data: SetWorkerVariableRequest) {
      return await fetcher<ApiResponse<SetWorkerVariableResponse>>('/worker/variable', {
        method: 'POST',
        query: params,
        body: data
      })
    }
  }
}

const workerService = defineWorkerService()

export default workerService
