import { defineHandler, getQuery, HTTPError } from 'nitro/h3'
import { parseBoolean } from '~/server/utils/parser'

interface GetClusterStatisticsResp {
  freeform: string
}

interface StorageNode {
  id: string
  hostname: string
  zone: string
  capacity: string
  partitions: number
  dataAvailable: {
    used: string
    total: string
    percentage: number
  }
  metaAvailable: {
    used: string
    total: string
    percentage: number
  }
}

interface ClusterStatistics {
  nodes: StorageNode[]
  clusterWide: {
    data: string
    metadata: string
  }
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { raw } = getQuery<{ raw: string | null }>(event)
    const printRaw = parseBoolean(raw ?? null) || false

    logger.info('Getting cluster statistics')
    const resp = await gfetch<GetClusterStatisticsResp>('/v2/GetClusterStatistics')
    const data = !printRaw ? parseClusterStatistics(resp.freeform) : resp

    return { status: 'success', message: 'Get Cluster Statistics', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})

function parseStorageCapacity(capacityStr: string): {
  used: string
  total: string
  percentage: number
} {
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
  let clusterWide: { data: string; metadata: string } = { data: '0 GB', metadata: '0 GB' }

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
