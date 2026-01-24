export interface ZoneRedundancy {
  atLeast: number // Partitions must be replicated in at least this number of distinct zones.
}

export interface LayoutNodeRole {
  capacity: number // Capacity (in bytes) assigned by the cluster administrator, absent for gateway nodes
  id: string // Identifier of the node
  storedPartitions?: number | null // Number of partitions stored on this node (a result of the layout computation)
  tags: string[] // List of tags assigned by the cluster administrator
  usableCapacity?: number | null // Capacity (in bytes) that is actually usable on this node in the current layout, which is equal to `stored_partitions` × `partition_size`
  zone: string // Zone name assigned by the cluster administrator
}

export interface NodeRoleChange {
  remove: boolean // Set true to remove the node from the layout
  id: string // ID of the node for which this change applies
}

export interface NodeAssignedRole {
  capacity?: number | null // Capacity (in bytes) assigned by the cluster administrator, absent for gateway nodes
  tags: string[] // List of tags assigned by the cluster administrator
  zone: string // Zone name assigned by the cluster administrator
  id: string // ID of the node for which this change applies
}

export interface LayoutParameters {
  zoneRedundancy: ZoneRedundancy | 'maximum'
}

export interface GetClusterLayoutResponse {
  parameters: LayoutParameters // Layout parameters used when the current layout was computed
  partitionSize: number // The size, in bytes, of one Garage partition (= a shard)
  roles: LayoutNodeRole[] // List of nodes that currently have a role in the cluster layout
  stagedParameters: LayoutParameters | null
  stagedRoleChanges: NodeRoleChange[] | NodeAssignedRole | NodeRoleChange // List of nodes that will have a new role or whose role will be removed in the next version of the cluster layout
  version: number // The current version number of the cluster layout
}

/**
 * Applies to the cluster the layout changes currently registered
 * as staged layout changes. Note: do not try to parse the `message`
 * field of the response, it is given as an array of string specifically
 * because its format is not stable.
 */
export interface ApplyClusterLayoutRequest {
  version: number // As a safety measure, the new version number of the layout must be specified here
}

export interface ApplyClusterLayoutResponse {
  layout: GetClusterLayoutResponse // Details about the new cluster layout
  message: string[] // Plain-text information about the layout computation (do not try to parse this)
}

/**
 * Returns the cluster's current layout, including:
 * - Currently configured cluster layout
 * - Staged changes to the cluster layout
 */
export interface GetClusterLayoutResponse {
  parameters: LayoutParameters // Layout parameters used when the current layout was computed
  partitionSize: number // The size, in bytes, of one Garage partition (= a shard)
  roles: LayoutNodeRole[] // List of nodes that currently have a role in the cluster layout
  stagedParameters: LayoutParameters | null
  stagedRoleChanges: NodeRoleChange[] | NodeAssignedRole | NodeRoleChange // List of nodes that will have a new role or whose role will be removed in the next version of the cluster layout
  version: number // The current version number of the cluster layout
}

/**
 * Send modifications to the cluster layout. These modifications will
 * be included in the staged role changes, visible in subsequent calls
 * of `GET /GetClusterHealth`. Once the set of staged changes is satisfactory,
 * the user may call `POST /ApplyClusterLayout` to apply the changed changes,
 * or `POST /RevertClusterLayout` to clear all of the staged changes in the layout.
 *
 * Setting the capacity to `null` will configure the node as a gateway.
 * Otherwise, capacity must be now set in bytes (before Garage 0.9 it was
 * arbitrary weights). For example to declare 100GB, you must set
 * `capacity: 100000000000`.
 *
 * Garage uses internally the International System of Units (SI), it
 * assumes that 1kB = 1000 bytes, and displays storage as kB, MB, GB
 * (and not KiB, MiB, GiB that assume 1KiB = 1024 bytes).
 */
export interface UpdateClusterLayoutRequest {
  parameters: LayoutParameters | null
  roles: NodeRoleChange[] | NodeAssignedRole | NodeRoleChange // New node roles to assign or remove in the cluster layout
}

export interface UpdateClusterLayoutResponse {
  parameters: LayoutParameters // Layout parameters used when the current layout was computed
  partitionSize: number // The size, in bytes, of one Garage partition (= a shard)
  roles: LayoutNodeRole[] // List of nodes that currently have a role in the cluster layout
  stagedParameters: LayoutParameters | null
  stagedRoleChanges: NodeRoleChange[] | NodeAssignedRole | NodeRoleChange // List of nodes that will have a new role or whose role will be removed in the next version of the cluster layout
  version: number // The current version number of the cluster layout
}

export interface NodeUpdateTrackers {
  ack: number
  sync: number
  syncAck: number
}

export type ClusterLayoutVersionStatus = 'Current' | 'Draining' | 'Historical'

export interface ClusterLayoutVersion {
  gatewayNodes: number // Number of nodes with a gateway role in this layout version
  status: ClusterLayoutVersionStatus // Status of this layout version
  version: number // Version number of this layout version
}

/**
 * Returns the history of layouts in the cluster.
 */
export interface GetLayoutHistoryResponse {
  currentVersion: number // The current version number of the cluster layout
  minAck: number // All nodes in the cluster are aware of layout versions up to this version number (at least)
  updateTrackers: {
    [key: string]: NodeUpdateTrackers
  } | null // Detailed update trackers for nodes (see https://garagehq.deuxfleurs.fr/blog/2023-12-preserving-read-after-write-consistency/)
  versions: ClusterLayoutVersion[]
}

export interface PreviewLayoutChangesResponseError {
  error: string // Error message indicating that the layout could not be computed with the provided configuration
}
/**
 * Computes a new layout taking into account the staged parameters,
 * and returns it with detailed statistics. The new layout is not
 * applied in the cluster. Note: do not try to parse the `message`
 * field of the response, it is given as an array of string specifically
 * because its format is not stable.
 */
export interface PreviewLayoutChangesResponse {
  message: string // Plain-text information about the layout computation (do not try to parse this)
  newLayout: GetClusterLayoutResponse // Details about the new cluster layout
  error?: string | null
}

/**
 * Clear staged layout changes.
 */
export interface RevertClusterLayoutResponse {
  parameters: LayoutParameters // Layout parameters used when the current layout was computed
  partitionSize: number // The size, in bytes, of one Garage partition (= a shard)
  roles: LayoutNodeRole[] // List of nodes that currently have a role in the cluster layout
  stagedParameters: LayoutParameters | null
  stagedRoleChanges: NodeRoleChange[] | NodeAssignedRole | NodeRoleChange // List of nodes that will have a new role or whose role will be removed in the next version of the cluster layout
  version: number // The current version number of the cluster layout
}

/**
 * Force progress in layout update trackers.
 */
export interface SkipDeadNodesRequest {
  allowMissingData: boolean // Allow the skip even if a quorum of nodes could not be found for the data among the remaining nodes
  version: number // Version number of the layout to assume is currently up-to-date. This will generally be the current layout version.
}

export interface SkipDeadNodesResponse {
  ackUpdated: string[] // Nodes for which the ACK update tracker has been updated to `version`
  syncUpdated: string[] // If `allow_missing_data` is set, nodes for which the SYNC update tracker has been updated to `version`
}
