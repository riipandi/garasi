/**
 * Static website domain name check. Checks whether a bucket
 * is configured to serve a static website for the requested
 * domain. This is used by reverse proxies such as Caddy or
 * Tricot, to avoid requesting TLS certificates for domain
 * names that do not correspond to an actual website.
 */
export interface CheckDomainParams {
  domain: string // The domain name to check for
}

// export interface CheckDomainResponse {}

/**
 * Check cluster health. The status code returned by this function
 * indicates whether this Garage daemon can answer API requests.
 * Garage will return 200 OK even if some storage nodes are
 * disconnected, as long as it is able to have a quorum of nodes
 * for read and write operations.
 */
// export interface CheckClusterHealthResponse {}
