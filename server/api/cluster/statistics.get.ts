import { getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { parseBoolean } from '~/server/utils/parser'
import type { GetClusterStatisticsResponse } from '~/shared/schemas/cluster.schema'
import type { ClusterStatistics, StorageNode } from '~/shared/schemas/dashboard.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetClusterStatistics')

  const { raw } = getQuery<{ raw: string | null }>(event)
  const printRaw = parseBoolean(raw ?? null) || false

  log.debug('Getting cluster statistics')
  const resp = await gfetch<GetClusterStatisticsResponse>('/v2/GetClusterStatistics')
  const data = !printRaw ? parseClusterStatistics(resp.freeform) : resp

  return createResponse<ClusterStatistics | GetClusterStatisticsResponse>(
    event,
    'Get Cluster Statistics',
    { data }
  )
})

function parseStorageCapacity(capacityStr: string): StorageNode['dataAvailable'] {
  const match = capacityStr.match(/([\d.]+\s+\w+)\s*\/\s*([\d.]+\s+\w+)\s*\(([\d.]+)%\)/)
  if (!match || !match[1] || !match[2] || !match[3]) {
    return { used: '0 GB', total: '0 GB', percentage: 0 }
  }
  return {
    used: match[1],
    total: match[2],
    percentage: parseFloat(match[3])
  }
}

function parseClusterStatistics(freeform: string): ClusterStatistics {
  const nodes: StorageNode[] = []
  let clusterWide: ClusterStatistics['clusterWide'] = { data: '0 GB', metadata: '0 GB' }

  const lines = freeform.split('\n')
  let inNodesSection = false
  let inClusterWideSection = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === 'Storage nodes:') {
      inNodesSection = true
      inClusterWideSection = false
      continue
    }

    if (trimmedLine.startsWith('Estimated available storage space cluster-wide')) {
      inNodesSection = false
      inClusterWideSection = true
      continue
    }

    if (inNodesSection && trimmedLine && !trimmedLine.startsWith('ID')) {
      const parts = trimmedLine
        .split(/\s{2,}/)
        .map((p) => p.trim())
        .filter((p) => p)
      if (parts.length >= 6) {
        const node: StorageNode = {
          id: parts[0] ?? '',
          hostname: parts[1] ?? '',
          zone: parts[2] ?? '',
          capacity: parts[3] ?? '',
          partitions: parts[4] ? parseInt(parts[4], 10) : 0,
          dataAvailable: parseStorageCapacity(parts[5] ?? ''),
          metaAvailable: parseStorageCapacity(parts[6] ?? '')
        }
        nodes.push(node)
      }
    }

    if (inClusterWideSection) {
      if (trimmedLine.startsWith('data:')) {
        clusterWide.data = trimmedLine.replace('data:', '').trim()
      } else if (trimmedLine.startsWith('metadata:')) {
        clusterWide.metadata = trimmedLine.replace('metadata:', '').trim()
      }
    }
  }

  return { nodes, clusterWide }
}
