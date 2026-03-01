# Garasi

<p align="left">
    <a href="https://github.com/riipandi/garasi/releases">
        <img src="https://img.shields.io/github/v/release/riipandi/garasi?logo=docker&logoColor=white&color=orange" alt="Release">
    </a>
    <a href="https://github.com/riipandi/garasi">
        <img src="https://img.shields.io/github/repo-size/riipandi/garasi?color=red" alt="Repo Size">
    </a>
    <a href="https://github.com/riipandi/garasi/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/riipandi/garasi?color=blue" alt="License">
    </a>
    <a href="https://github.com/riipandi/garasi/graphs/contributors">
        <img src="https://img.shields.io/badge/Contributions-welcome-gray.svg?labelColor=green" alt="Contributions welcome">
    </a>
</p>

---

A modern web-based management interface for [Garage S3](https://garagehq.deuxfleurs.fr/), a distributed
object storage system. Garasi provides an intuitive GUI to manage your Garage cluster, buckets, access keys,
and objects with full-stack type-safe operations.

## Features

### Bucket Management

Create, delete, and configure S3 buckets with comprehensive settings:

- **Bucket Operations:** Create, delete, and inspect buckets
- **Alias Management:** Manage local and global bucket aliases for easy access
- **Configuration:** Set website access, quotas, versioning, and other bucket parameters
- **Object Browser:** Browse, upload, and delete objects within buckets
- **Folder Management:** Create folders to organize objects
- **Object Inspection:** View detailed object metadata and properties

### Access Key Management

Control S3 API access with comprehensive key management:

- **Key Creation:** Generate new access keys with custom permissions
- **Key Import:** Import existing access keys from external sources
- **Permission Management:** Configure read/write permissions per bucket
- **Key Information:** View detailed key metadata and usage information
- **Key Revocation:** Delete or disable access keys when no longer needed

### Cluster Operations

Monitor and manage your Garage cluster:

- **Cluster Status:** Real-time cluster health and status monitoring
- **Node Management:** View detailed information about each cluster node
- **Cluster Statistics:** Monitor storage usage, object counts, and cluster metrics
- **Node Connectivity:** Manage connections between cluster nodes
- **Cluster Layout:** Apply, preview, and revert cluster layout changes
- **Repair Operations:** Trigger repair operations to maintain data integrity
- **Automatic Setup:** Automatic cluster layout initialization for fresh Garage installations

### Monitoring & Diagnostics

Advanced cluster monitoring and maintenance tools:

- **Health Monitoring:** Real-time cluster and node health checks
- **Node Statistics:** Per-node storage, memory, and network statistics
- **Metadata Snapshots:** Capture and analyze node metadata states
- **Block Operations:** Resync blocks, purge orphaned data, check errors
- **Worker Management:** View and configure worker variables

## Quick Start

### Using Docker

Pull and run the latest Docker image:

```sh
docker pull ghcr.io/riipandi/garasi:latest
docker run -d --name garasi -p 3990:3990 --env-file .env ghcr.io/riipandi/garasi:latest
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
services:
  garasi:
    image: ghcr.io/riipandi/garasi:latest
    restart: unless-stopped
    ports: ['3990:3990']
    env_file: .env
```

Then start the service:

```sh
docker compose up -d
```

Access the application at: [`http://localhost:3990`](http://localhost:3990)

- Default user: `admin@example.com`
- Default pass: `P@ssw0rd!`

For detailed documentation how to setup Garage, check out [Garage Quick Start](https://garagehq.deuxfleurs.fr/documentation/quick-start).

## Configuration

Generate required secrets using the built-in script:

```sh
bun run genkey
```

This will generate secure values for:
- `GARAGE_RPC_SECRET` - Secret for Garage RPC communication
- `GARAGE_ADMIN_TOKEN` - Admin API token for Garage management
- `GARAGE_METRICS_TOKEN` - Token for accessing Garage metrics
- `APP_SECRET_KEY` - Encryption key for the application

See [`.env.example`](./.env.example) for all available configuration options.

**Auto-Setup:** On first run, Garasi automatically configures your Garage cluster layout if it's not already initialized (layout version < 1). This includes:

- Creating required directories
- Setting up cluster layout with default capacity and zone redundancy
- Applying the initial cluster configuration

Customize auto-setup behavior with these environment variables:
- `GARAGE_DEFAULT_CAPACITY` - Default storage capacity per node (default: 10GB)
- `GARAGE_DEFAULT_ZONE_REDUNDANCY` - Zone redundancy level (default: 1)

## Development

### Prerequisites

- [Bun](https://bun.sh/) runtime `>=1.3.6`
- [Garage S3](https://garagehq.deuxfleurs.fr/) cluster (will be auto-configured if not initialized)

### Setup

```sh
bun install                  # Install required dependencies
bun run genkey               # Generate application keys
cp .env.example .env.local   # Create environment variable file
```

### Development Commands

```sh
bun run dev           # Start development server
bun run build         # Build for production
bun run typecheck     # Run TypeScript checks
bun run lint          # Fix linting issues
bun run format        # Format code with oxfmt
bun run check         # Final check before commit
bun run storybook     # Start Storybook for components
```

### Docker Development

```sh
bun run docker:build      # Build Docker image
bun run compose:up        # Start with Docker Compose
bun run compose:down      # Stop Docker Compose
bun run compose:cleanup   # Cleanup volumes
```

## Tech Stack

- **Frontend:** React 19, TanStack (Router, Query, Form, Table), Tailwind CSS v4
- **Backend:** Nitro 3 server with Bun runtime
- **Database:** SQLite with Kysely query builder
- **Validation:** Zod schema validation
- **Styling:** Tailwind CSS v4 with Base UI components

## Garage Features

### Supported features
- Signature v4
- URL path-style
- URL vhost-style
- Presigned URLs
- SSE-C encryption

### Unsupported Features
- Signature v2 (deprecated)
- Bucket versioning

### Implemented Endpoints
```
CreateBucket, DeleteBucket, GetBucketLocation, HeadBucket, ListBuckets, HeadObject, CopyObject, DeleteObject,
DeleteObjects, GetObject, ListObjects, ListObjectsV2, PostObject, PutObject, AbortMultipartUpload,
CompleteMultipartUpload, CreateMultipartUpload, ListMultipartUpload, ListParts, UploadPart, UploadPartCopy,
DeleteBucketWebsite, GetBucketWebsite, PutBucketWebsite (partially implemented), DeleteBucketCors, GetBucketCors, PutBucketCors, DeleteBucketLifecycle,
GetBucketLifecycleConfiguration, PutBucketLifecycleConfiguration (partially implemented)
```

### Unimplemented Endpoints
```
DeleteBucketPolicy, GetBucketPolicy, GetBucketPolicyStatus, PutBucketPolicy, GetBucketAcl, PutBucketAcl,
GetObjectAcl, PutObjectAcl, GetBucketVersioning, ListObjectVersions, PutBucketVersioning, DeleteBucketReplication,
GetBucketReplication, PutBucketReplication, GetObjectLegalHold, PutObjectLegalHold, GetObjectRetention,
PutObjectRetention, GetObjectLockConfiguration, PutObjectLockConfiguration, DeleteBucketEncryption,
GetBucketEncryption, PutBucketEncryption, GetBucketNotificationConfiguration, PutBucketNotificationConfiguration,
DeleteBucketTagging, GetBucketTagging, PutBucketTagging, DeleteObjectTagging, GetObjectTagging, PutObjectTagging,
GetObjectTorrent
```

For more detailed information read the [Garage S3 Compatibility status documentation](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility).

## API Endpoints
| Endpoint         | Description                                    |
|------------------|------------------------------------------------|
| `/api/bucket/*`  | Bucket CRUD operations, aliases, configuration |
| `/api/keys/*`    | Access key management and permissions          |
| `/api/cluster/*` | Cluster status, health, and statistics         |
| `/api/node/*`    | Node operations, repair, and metadata          |
| `/api/layout/*`  | Cluster layout management                      |
| `/api/block/*`   | Block operations (resync, purge)               |
| `/api/admin/*`   | Admin token management                         |
| `/api/worker/*`  | Worker variables and information               |
| `/api/objects/*` | Object and folder operations                   |
| `/api/metrics/*` | Cluster metrics endpoint                       |

Read the [Garage Admin API docs](https://garagehq.deuxfleurs.fr/documentation/reference-manual/admin-api) for more
detailed information about Garage API Reference.

## License

Garasi is licensed under the [Apache License 2.0](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0).
See the [LICENSE](./LICENSE) file for more information.

> Unless you explicitly state otherwise, any contribution intentionally submitted
> for inclusion in this project by you shall be licensed under the Apache License 2.0,
> without any additional terms or conditions.

Copyrights in this project are retained by their contributors.

---

<sub>🤫 If you like my work, consider [sponsoring](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Aris%20Ripandi?label=Made+by&color=black&labelColor=black)][riipandi-x]

[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
