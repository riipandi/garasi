import { definePlugin } from 'nitro'
import { ofetch } from 'ofetch'
import { protectedEnv } from '~/shared/envars'

interface GarageClusterStatusResp {
  layoutVersion: number
  nodes: Array<{
    id: string
    garageVersion: string
    addr: string
    hostname: string
    isUp: boolean
    lastSeenSecsAgo: number | null
    role: object
    draining: false
    dataPartition: object
    metadataPartition: object
  }>
}

interface UpdateClusterLayoutResp {
  version: number
  roles: unknown[]
  parameters?: {
    zoneRedundancy?: 'maximum' | string | Record<string, unknown>
    [key: string]: unknown
  }
  partitionSize: number
  stagedRoleChanges: {
    id: string
    zone: string
    tags: string[]
    capacity: number
  }[]
  stagedParameters?: {
    zoneRedundancy?: {
      atLeast: number
    }
  }
}

interface ApplyClusterLayoutResp {
  message: string[]
  layout: {
    version: number
    roles: Array<{
      id: string
      zone: string
      tags: string[]
      capacity: number
      storedPartitions: number
      usableCapacity: number
    }>
    parameters: {
      zoneRedundancy: {
        atLeast: number
      }
    }
    partitionSize: number
    stagedRoleChanges: Array<{
      remove: boolean
      id: string
    }>
    stagedParameters: null | Record<string, unknown>
  }
}

// Run Garage S3 initial setup (cluster layout)
export default definePlugin(async (_nitro) => {
  // Create fetcher instance for Garage S3
  const gfetch = ofetch.create({
    baseURL: protectedEnv.GARAGE_ADMIN_API,
    headers: { Authorization: `Bearer ${protectedEnv.GARAGE_ADMIN_TOKEN}` }
  })

  try {
    // Step 1: Check cluster status
    const clusterStatus = await gfetch<GarageClusterStatusResp>('/v2/GetClusterStatus')
    const garageVersion = clusterStatus.nodes[0]?.garageVersion
    const layoutVersion = clusterStatus.layoutVersion
    const nodeId = clusterStatus.nodes[0]?.id

    // Skip if current layout version >= 1
    if (layoutVersion >= 1) return

    // Step 2: Prepare new cluster layout (default: 10GB)
    console.info(`Preparing cluster layout for Garage ${garageVersion}`)
    const defaultCapacity = protectedEnv.GARAGE_DEFAULT_CAPACITY
    const defaultZoneRedudancy = protectedEnv.GARAGE_DEFAULT_ZONE_REDUNDANCY
    await gfetch<UpdateClusterLayoutResp>('/v2/UpdateClusterLayout', {
      method: 'POST',
      body: {
        parameters: { zoneRedundancy: { atLeast: defaultZoneRedudancy } },
        roles: [{ id: nodeId, capacity: defaultCapacity, tags: ['local'], zone: 'dc1' }]
      }
    })

    // Step 3: Apply prepared layout
    const applyClusterLayout = await gfetch<ApplyClusterLayoutResp>('/v2/ApplyClusterLayout', {
      method: 'POST',
      body: { version: layoutVersion + 1 }
    })
    const newLayoutVersion = applyClusterLayout.layout.version
    console.info('\n', applyClusterLayout.message.join('\n'))

    console.info(`Garage S3 cluster layout ready with version ${newLayoutVersion}`)
  } catch (error) {
    console.error('Garage S3 cluster layout setup failed', error)
    process.exit(1)
  }
})
