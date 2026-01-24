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
import fetcher from '../fetcher'

export async function listWorkers(params: ListWorkersParams, data: ListWorkersRequest) {
  return await fetcher<ApiResponse<ListWorkersResponse>>('/worker', {
    method: 'GET',
    query: params,
    body: data
  })
}

export async function getWorkerInfo(params: GetWorkerInfoParams & GetWorkerInfoRequest) {
  return await fetcher<ApiResponse<GetWorkerInfoResponse>>('/worker/info', {
    method: 'GET',
    query: params
  })
}

export async function getWorkerVariable(
  params: GetWorkerVariableParams & GetWorkerVariableRequest
) {
  const { variable, ...query } = params
  return await fetcher<ApiResponse<GetWorkerVariableResponse>>('/worker/variable', {
    method: 'GET',
    query: query,
    body: { variable }
  })
}

export async function setWorkerVariable(
  params: SetWorkerVariableParams,
  data: SetWorkerVariableRequest
) {
  return await fetcher<ApiResponse<SetWorkerVariableResponse>>('/worker/variable', {
    method: 'POST',
    query: params,
    body: data
  })
}
