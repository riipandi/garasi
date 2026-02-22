#!/usr/bin/env sh
# set -eu # Exit on error, treat unset variables as an error.

#------------------------------------------------------------------------------
# Garage S3 Cluster Setup & Management Script (by Aris Ripandi <aris@duck.com>)
#------------------------------------------------------------------------------

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MASTER_KEY_NAME="masterkey"
BUCKET_NAMES="devbucket testbucket dbarchive"

# # Load .env.local if exists
# if [ -f "$ROOT_DIR/.env.local" ]; then
#   # shellcheck disable=SC1091
#   . "$ROOT_DIR/.env.local"
# fi

usage() {
  printf "${BOLD}${CYAN}Garage S3 Setup Script${NC}\n\n"
  printf "${BOLD}Usage:${NC} %s ${CYAN}<command>${NC} [args]\n\n" "$0"
  printf "${BOLD}Commands:${NC}\n"
  printf "  ${GREEN}init${NC}                  Setup cluster, buckets, and master key\n"
  printf "  ${GREEN}nodes${NC}                 List available Garage nodes (node_id@addr:port)\n"
  printf "  ${GREEN}status${NC}                Show cluster, buckets, and keys status\n"
  printf "  ${GREEN}create-bucket${NC} <name>  Create a new bucket and assign master key\n"
  printf "  ${GREEN}bucket-web${NC} <name>     Enable or disable website access for a bucket\n"
  printf "  ${GREEN}bucket-info${NC} <name>    Display information about a bucket\n"
  printf "  ${GREEN}envars${NC} [bucket]       Display S3 environment variables (default: devbucket)\n"
  printf "  ${GREEN}help${NC}                  Show this help\n\n"
}

# Garage API helper
garage_api() {
  if [ -n "$2" ]; then
    docker-compose exec --env RUST_LOG=garage=warn -T garage-1 /garage json-api "$1" "$2"
  else
    docker-compose exec --env RUST_LOG=garage=warn -T garage-1 /garage json-api "$1"
  fi
}

# Get or create master key
get_or_create_master_key() {
  keys_json=$(garage_api ListKeys 2>&1) || {
    printf "${RED}Failed to list keys${NC}\n" >&2
    return 1
  }

  master_key_data=$(echo "$keys_json" | jq -r --arg name "$MASTER_KEY_NAME" '.[] | select(.name == $name)')

  if [ -z "$master_key_data" ]; then
    json_payload=$(jq -nc --arg name "$MASTER_KEY_NAME" '{name: $name, allow: {createBucket: true}}')
    create_result=$(garage_api CreateKey "$json_payload" 2>&1)
    create_exit=$?

    if [ $create_exit -ne 0 ]; then
      printf "${RED}Failed to create master key${NC}\n" >&2
      printf "${DIM}%s${NC}\n" "$create_result" >&2
      return 1
    fi

    master_access_key=$(echo "$create_result" | jq -r '.accessKeyId // .id // empty')
    master_secret_key=$(echo "$create_result" | jq -r '.secretAccessKey // .secretKey // empty')

    # Check if access key is valid (not empty or "null")
    if [ -z "$master_access_key" ] || [ "$master_access_key" = "null" ]; then
      printf "${RED}Invalid key response${NC}\n" >&2
      printf "${DIM}Response: %s${NC}\n" "$create_result" >&2
      return 1
    fi

    printf "${GREEN}[OK]${NC} Created key '${BOLD}%s${NC}'\n" "$MASTER_KEY_NAME" >&2
    if [ -n "$master_secret_key" ] && [ "$master_secret_key" != "null" ]; then
      printf "     ${DIM}Access: %s${NC}\n     ${DIM}Secret: %s${NC}\n" "$master_access_key" "$master_secret_key" >&2
    else
      printf "     ${DIM}Access: %s${NC}\n" "$master_access_key" >&2
    fi
  else
    master_access_key=$(echo "$master_key_data" | jq -r '.id // empty')
    printf "${BLUE}[OK]${NC} Using existing key '${BOLD}%s${NC}'\n" "$MASTER_KEY_NAME" >&2
    printf "     ${DIM}Access: %s${NC}\n" "$master_access_key" >&2
  fi

  echo "$master_access_key"
  return 0
}

# Create bucket if not exists
create_bucket_if_not_exists() {
  bucket_name=$1

  buckets_json=$(garage_api ListBuckets 2>&1) || {
    printf "     ${RED}[FAIL]${NC} Failed to list buckets\n" >&2
    return 1
  }

  bucket_data=$(echo "$buckets_json" | jq -r --arg name "$bucket_name" '.[] | select(.globalAliases[]? == $name)')

  if [ -z "$bucket_data" ]; then
    json_payload=$(jq -nc --arg alias "$bucket_name" '{globalAlias: $alias}')
    bucket_result=$(garage_api CreateBucket "$json_payload" 2>&1) || {
      printf "     ${RED}[FAIL]${NC} Failed to create bucket\n" >&2
      return 1
    }

    bucket_id=$(echo "$bucket_result" | jq -r '.id // empty')
    printf "     ${GREEN}[OK]${NC} Created bucket\n" >&2
  else
    bucket_id=$(echo "$bucket_data" | jq -r '.id // empty')
    printf "     ${BLUE}[OK]${NC} Bucket already exists\n" >&2
  fi

  echo "$bucket_id"
  return 0
}

# Assign key to bucket
assign_key_to_bucket() {
  key_id=$1
  bucket_id=$2

  [ -z "$key_id" ] || [ -z "$bucket_id" ] && return 1

  json_payload=$(jq -nc \
    --arg keyId "$key_id" \
    --arg bucketId "$bucket_id" \
    '{accessKeyId: $keyId, bucketId: $bucketId, permissions: {owner: true, read: true, write: true}}')

  garage_api AllowBucketKey "$json_payload" >/dev/null 2>&1

  if [ $? -eq 0 ]; then
    printf "     ${GREEN}[OK]${NC} Assigned master key\n" >&2
    return 0
  else
    printf "     ${RED}[FAIL]${NC} Failed to assign key\n" >&2
    return 1
  fi
}

# Parse arguments
[ $# -eq 0 ] || [ "$1" = "help" ] && { usage; exit 0; }

CMD="$1"
shift

case "$CMD" in
  init)
    printf "${BOLD}${CYAN}Garage S3 Setup${NC}\n\n"

    # Step 1: Check cluster status
    printf "${CYAN}Checking cluster status...${NC}\n"
    status_json=$(garage_api GetClusterStatus 2>&1) || {
      printf "${RED}[FAIL] Failed to connect. Is Garage running?${NC}\n"
      exit 1
    }

    layout_version=$(echo "$status_json" | jq -r '.layoutVersion')
    node_count=$(echo "$status_json" | jq '.nodes | length')
    printf "${GREEN}[OK]${NC} Cluster ready (layout v%s, %d node(s))\n\n" "$layout_version" "$node_count"

    # Step 2: Apply layout if needed
    if [ -z "$layout_version" ] || [ "$layout_version" = "null" ] || [ "$layout_version" -le 0 ]; then
      printf "${CYAN}Applying initial layout...${NC}\n"
      first_node_id=$(echo "$status_json" | jq -r '.nodes[0].id')
      docker-compose exec --env RUST_LOG=garage=warn -T garage-1 /garage layout assign -z dc1 -c 1G "$first_node_id" >/dev/null 2>&1
      docker-compose exec --env RUST_LOG=garage=warn -T garage-1 /garage layout apply --version 1 >/dev/null 2>&1
      printf "${GREEN}[OK]${NC} Layout applied\n"
      printf "\n${DIM}Waiting for cluster to stabilize...${NC}\n"
      sleep 3
      printf "\n"
    fi

    # Step 3: Get or create master key
    printf "${CYAN}Setting up master key...${NC}\n"
    master_key_id=$(get_or_create_master_key)
    get_key_exit=$?

    if [ $get_key_exit -ne 0 ] || [ -z "$master_key_id" ] || [ "$master_key_id" = "null" ]; then
      printf "${RED}[FAIL] Setup failed${NC}\n"
      exit 1
    fi
    printf "\n"

    # Step 4: Create buckets and assign key
    printf "${CYAN}Configuring buckets...${NC}\n"
    success=0
    total=0

    for bucket_name in $BUCKET_NAMES; do
      total=$((total + 1))
      printf "  ${BOLD}%s${NC}\n" "$bucket_name"

      bucket_id=$(create_bucket_if_not_exists "$bucket_name") && \
      assign_key_to_bucket "$master_key_id" "$bucket_id" && \
      success=$((success + 1))
    done

    # Summary
    printf "\n${BOLD}${GREEN}Setup Complete${NC}\n"
    printf "${DIM}Configured %d/%d buckets${NC}\n" "$success" "$total"
    printf "\n" && "$0" envars devbucket
    printf "${DIM}Run ${CYAN}%s status${DIM} to view details${NC}\n\n" "$0"

    exit 0
    ;;

  status)
    printf "${BOLD}${CYAN}Garage S3 Status${NC}\n\n"

    # Cluster info
    printf "${BOLD}Cluster Information:${NC}\n"
    status_json=$(garage_api GetClusterStatus 2>&1) || {
      printf "  ${RED}[FAIL] Failed to connect${NC}\n\n"
      exit 1
    }

    layout_version=$(echo "$status_json" | jq -r '.layoutVersion')
    printf "  Layout Version: ${BOLD}%s${NC}\n\n" "$layout_version"

    # Node details
    printf "${BOLD}Nodes:${NC}\n"
    echo "$status_json" | jq -c '.nodes[]' | while read -r node; do
      node_name=$(echo "$node" | jq -r '.hostname')
      node_id=$(echo "$node" | jq -r '.id')
      addr=$(echo "$node" | jq -r '.addr')
      is_up=$(echo "$node" | jq -r '.isUp')
      garage_version=$(echo "$node" | jq -r '.garageVersion')
      draining=$(echo "$node" | jq -r '.draining')

      # Storage info
      data_avail=$(echo "$node" | jq -r '.dataPartition.available')
      data_total=$(echo "$node" | jq -r '.dataPartition.total')
      meta_avail=$(echo "$node" | jq -r '.metadataPartition.available')
      meta_total=$(echo "$node" | jq -r '.metadataPartition.total')

      # Convert to GB
      data_avail_gb=$(awk "BEGIN {printf \"%.2f\", $data_avail/1024/1024/1024}")
      data_total_gb=$(awk "BEGIN {printf \"%.2f\", $data_total/1024/1024/1024}")
      data_used_gb=$(awk "BEGIN {printf \"%.2f\", ($data_total-$data_avail)/1024/1024/1024}")
      meta_avail_gb=$(awk "BEGIN {printf \"%.2f\", $meta_avail/1024/1024/1024}")
      meta_total_gb=$(awk "BEGIN {printf \"%.2f\", $meta_total/1024/1024/1024}")

      # Usage percentage
      data_usage=$(awk "BEGIN {printf \"%.1f\", (($data_total-$data_avail)/$data_total)*100}")

      # Status indicator
      if [ "$is_up" = "true" ]; then
        status="${GREEN}UP${NC}"
      else
        status="${RED}DOWN${NC}"
      fi

      printf "  ${CYAN}%s${NC} (${status})\n" "$node_name"
      printf "    ${DIM}ID:${NC} %s\n" "$node_id"
      printf "    ${DIM}Address:${NC} %s\n" "$addr"
      printf "    ${DIM}Version:${NC} %s\n" "$garage_version"
      printf "    ${DIM}Draining:${NC} %s\n" "$draining"
      printf "    ${DIM}Data Storage:${NC} %.2f GB used / %.2f GB total (${BOLD}%s%%${NC})\n" "$data_used_gb" "$data_total_gb" "$data_usage"
      printf "    ${DIM}Metadata:${NC} %.2f GB free / %.2f GB total\n" "$meta_avail_gb" "$meta_total_gb"
      printf "\n"
    done

    # List buckets
    printf "${BOLD}Buckets:${NC}\n"
    buckets=$(garage_api ListBuckets 2>&1) || {
      printf "  ${RED}[FAIL] Failed to list buckets${NC}\n\n"
      exit 1
    }

    bucket_count=$(echo "$buckets" | jq 'length')
    if [ "$bucket_count" -eq 0 ]; then
      printf "  ${DIM}No buckets found${NC}\n\n"
    else
      echo "$buckets" | jq -r '.[] | "\(.globalAliases[0])|\(.id)"' | sort | while IFS='|' read -r name id; do
        printf "  ${GREEN}%-15s${NC}: ${DIM}%s${NC}\n" "$name" "$id"
      done
      printf "\n"
    fi

    # List keys
    printf "${BOLD}Access Keys:${NC}\n"
    keys_json=$(garage_api ListKeys 2>&1) || {
      printf "  ${RED}[FAIL] Failed to list keys${NC}\n\n"
      exit 1
    }

    key_count=$(echo "$keys_json" | jq 'length')
    if [ "$key_count" -eq 0 ]; then
      printf "  ${DIM}No keys found${NC}\n\n"
    else
      echo "$keys_json" | jq -c '.[]' | while read -r key_obj; do
        key_id=$(echo "$key_obj" | jq -r '.id')
        name=$(echo "$key_obj" | jq -r '.name // "unnamed"')

        json_payload=$(jq -nc --arg id "$key_id" '{id: $id, showSecretKey: true}')
        key_info=$(garage_api GetKeyInfo "$json_payload" 2>/dev/null || echo "{}")
        secret=$(echo "$key_info" | jq -r '.secretAccessKey // "(hidden)"')

        printf "  ${GREEN}%-15s${NC}: ${DIM}%s${NC} ${DIM}::${NC} ${DIM}%s${NC}\n" "$name" "$key_id" "$secret"
      done | sort
      printf "\n"
    fi
    ;;

  create-bucket)
    # Check if bucket name is provided
    if [ $# -eq 0 ]; then
      printf "${RED}[FAIL] Bucket name required${NC}\n"
      printf "${DIM}Usage: %s create-bucket <name>${NC}\n\n" "$0"
      exit 1
    fi

    NEW_BUCKET_NAME="$1"

    # Validate bucket name (basic validation)
    if ! echo "$NEW_BUCKET_NAME" | grep -Eq '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'; then
      printf "${RED}[FAIL] Invalid bucket name${NC}\n"
      printf "${DIM}Bucket names must be 3-63 characters, lowercase, alphanumeric or hyphens${NC}\n\n"
      exit 1
    fi

    printf "${BOLD}${CYAN}Creating Bucket: %s${NC}\n\n" "$NEW_BUCKET_NAME"

    # Check if bucket already exists
    printf "${CYAN}Checking if bucket exists...${NC}\n"
    buckets=$(garage_api ListBuckets 2>&1) || {
      printf "${RED}[FAIL] Failed to list buckets${NC}\n"
      exit 1
    }

    bucket_exists=$(echo "$buckets" | jq -r --arg name "$NEW_BUCKET_NAME" '.[] | select(.globalAliases[]? == $name) | .id')

    if [ -n "$bucket_exists" ]; then
      printf "${YELLOW}[WARN] Bucket '%s' already exists${NC}\n" "$NEW_BUCKET_NAME"
      printf "${DIM}Bucket ID: %s${NC}\n\n" "$bucket_exists"
      exit 0
    fi

    # Create bucket
    printf "${CYAN}Creating bucket...${NC}\n"
    json_payload=$(jq -nc --arg alias "$NEW_BUCKET_NAME" '{globalAlias: $alias}')
    bucket_result=$(garage_api CreateBucket "$json_payload" 2>&1) || {
      printf "${RED}[FAIL] Failed to create bucket${NC}\n"
      exit 1
    }

    bucket_id=$(echo "$bucket_result" | jq -r '.id // empty')

    if [ -z "$bucket_id" ]; then
      printf "${RED}[FAIL] Invalid bucket creation response${NC}\n"
      exit 1
    fi

    printf "${GREEN}[OK]${NC} Bucket created\n"
    printf "${DIM}Bucket ID: %s${NC}\n\n" "$bucket_id"

    # Get master key
    printf "${CYAN}Getting master key...${NC}\n"
    keys_json=$(garage_api ListKeys 2>&1) || {
      printf "${RED}[FAIL] Failed to list keys${NC}\n"
      exit 1
    }

    master_key_id=$(echo "$keys_json" | jq -r --arg name "$MASTER_KEY_NAME" '.[] | select(.name == $name) | .id')

    if [ -z "$master_key_id" ]; then
      printf "${YELLOW}[WARN] Master key '%s' not found${NC}\n" "$MASTER_KEY_NAME"
      printf "${DIM}Run '%s init' first to create master key${NC}\n\n" "$0"
      exit 0
    fi

    printf "${GREEN}[OK]${NC} Found master key\n\n"

    # Assign key to bucket
    printf "${CYAN}Assigning master key to bucket...${NC}\n"
    json_payload=$(jq -nc \
      --arg keyId "$master_key_id" \
      --arg bucketId "$bucket_id" \
      '{accessKeyId: $keyId, bucketId: $bucketId, permissions: {owner: true, read: true, write: true}}')

    garage_api AllowBucketKey "$json_payload" >/dev/null 2>&1

    if [ $? -eq 0 ]; then
      printf "${GREEN}[OK]${NC} Master key assigned\n\n"
      printf "${BOLD}${GREEN}Bucket '%s' created successfully!${NC}\n\n" "$NEW_BUCKET_NAME"
    else
      printf "${RED}[FAIL] Failed to assign key to bucket${NC}\n"
      exit 1
    fi
    ;;

  bucket-web)
    # Check if bucket name and status are provided
    if [ $# -lt 2 ]; then
      printf "${RED}[FAIL] Bucket name and status (true/false) required${NC}\n"
      printf "${DIM}Usage: %s bucket-web <bucket> <true|false>${NC}\n\n" "$0"
      exit 1
    fi

    BUCKET_NAME="$1"
    ENABLE="$2"

    if [ "$ENABLE" != "true" ] && [ "$ENABLE" != "false" ]; then
      printf "${RED}[FAIL] Status must be 'true' or 'false'${NC}\n"
      exit 1
    fi

    # Get bucket ID
    buckets_json=$(garage_api ListBuckets 2>&1) || {
      printf "  ${RED}[FAIL] Failed to list buckets${NC}\n"
      exit 1
    }

    bucket_id=$(echo "$buckets_json" | jq -r --arg name "$BUCKET_NAME" '.[] | select(.globalAliases[]? == $name) | .id')

    if [ -z "$bucket_id" ]; then
      printf "  ${RED}[FAIL] Bucket '%s' not found${NC}\n" "$BUCKET_NAME"
      exit 1
    fi

    printf "${CYAN}Setting website access for bucket '${BOLD}%s${NC}${CYAN}' to '${BOLD}%s${NC}${CYAN}'...${NC}\n" "$BUCKET_NAME" "$ENABLE"

    # Prepare payload with "body" field
    if [ "$ENABLE" = "true" ]; then
      json_payload=$(jq -nc \
        --arg id "$bucket_id" \
        '{id: $id, body: {quotas: null, websiteAccess: {enabled: true, indexDocument: "index.html", errorDocument: "error.html"}}}')
    else
      json_payload=$(jq -nc \
        --arg id "$bucket_id" \
        '{id: $id, body: {quotas: null, websiteAccess: {enabled: false}}}')
    fi

    # Update bucket
    result=$(garage_api UpdateBucket "$json_payload" 2>&1)
    if [ $? -eq 0 ]; then
      if [ "$ENABLE" = "true" ]; then
        printf "  ${GREEN}[OK]${NC} Website access ENABLED for bucket '${BOLD}%s${NC}'\n" "$BUCKET_NAME"
      else
        printf "  ${YELLOW}[OK]${NC} Website access DISABLED for bucket '${BOLD}%s${NC}'\n" "$BUCKET_NAME"
      fi
      printf "\n"
      # Show bucket info after update
      "$0" bucket-info "$BUCKET_NAME"
    else
      printf "  ${RED}[FAIL] Failed to update website access${NC}\n"
      printf "  ${DIM}%s${NC}\n" "$result"
      printf "\n"
      exit 1
    fi
    ;;

  bucket-info)
    # Check if bucket name is provided
    if [ $# -eq 0 ]; then
      printf "${RED}[FAIL] Bucket name required${NC}\n"
      printf "${DIM}Usage: %s bucket-info <bucket>${NC}\n\n" "$0"
      exit 1
    fi

    BUCKET_NAME="$1"

    # Get bucket ID
    buckets_json=$(garage_api ListBuckets 2>&1) || {
      printf "  ${RED}[FAIL] Failed to list buckets${NC}\n"
      exit 1
    }

    bucket_id=$(echo "$buckets_json" | jq -r --arg name "$BUCKET_NAME" '.[] | select(.globalAliases[]? == $name) | .id')

    if [ -z "$bucket_id" ]; then
      printf "  ${RED}[FAIL] Bucket '%s' not found${NC}\n" "$BUCKET_NAME"
      exit 1
    fi

    printf "${CYAN}Fetching info for bucket '${BOLD}%s${NC}${CYAN}'...${NC}\n" "$BUCKET_NAME"

    # Get bucket info
    json_payload=$(jq -nc --arg id "$bucket_id" '{id: $id}')
    bucket_info=$(garage_api GetBucketInfo "$json_payload" 2>&1)
    if [ $? -eq 0 ]; then
      # Parse and print bucket info in a consistent, colored format
      name=$(echo "$bucket_info" | jq -r '.globalAliases[0]')
      id=$(echo "$bucket_info" | jq -r '.id')
      created=$(echo "$bucket_info" | jq -r '.created')
      bytes=$(echo "$bucket_info" | jq -r '.bytes')
      objects=$(echo "$bucket_info" | jq -r '.objects')
      website=$(echo "$bucket_info" | jq -r '.websiteAccess')
      index_doc=$(echo "$bucket_info" | jq -r '.websiteConfig.indexDocument // "-"')
      error_doc=$(echo "$bucket_info" | jq -r '.websiteConfig.errorDocument // "-"')
      max_size=$(echo "$bucket_info" | jq -r '.quotas.maxSize // "-"')
      max_objects=$(echo "$bucket_info" | jq -r '.quotas.maxObjects // "-"')

      printf "\n${BOLD}${CYAN}Bucket Information:${NC}\n"
      printf "  ${BOLD}Name:${NC}           %s\n" "$name"
      printf "  ${BOLD}ID:${NC}             %s\n" "$id"
      printf "  ${BOLD}Created:${NC}        %s\n" "$created"
      printf "  ${BOLD}Objects:${NC}        %s\n" "$objects"
      printf "  ${BOLD}Bytes Used:${NC}     %s\n" "$bytes"
      printf "  ${BOLD}Quota Size:${NC}     %s\n" "$max_size"
      printf "  ${BOLD}Quota Objects:${NC}  %s\n" "$max_objects"
      printf "  ${BOLD}Website Access:${NC} %s\n" "$( [ "$website" = "true" ] && printf "${GREEN}ENABLED${NC}" || printf "${RED}DISABLED${NC}" )"
      printf "  ${BOLD}Index Document:${NC} %s\n" "$index_doc"
      printf "  ${BOLD}Error Document:${NC} %s\n" "$error_doc"
      printf "\n"

      # List keys with access to this bucket
      printf "${BOLD}Access Keys:${NC}\n"
      keys=$(echo "$bucket_info" | jq -c '.keys[]?')
      if [ -z "$keys" ]; then
        printf "  ${DIM}No keys assigned${NC}\n"
      else
        echo "$keys" | while read -r key; do
          key_name=$(echo "$key" | jq -r '.name')
          key_id=$(echo "$key" | jq -r '.accessKeyId')
          perms=$(echo "$key" | jq -r '.permissions | to_entries[] | select(.value==true) | .key' | paste -sd "," -)
          printf "  ${GREEN}%-15s${NC}: ${DIM}%s${NC} ${CYAN}[%s]${NC}\n" "$key_name" "$key_id" "$perms"
        done
      fi
      printf "\n"
    else
      printf "  ${RED}[FAIL] Failed to get bucket info${NC}\n"
      printf "  ${DIM}%s${NC}\n" "$bucket_info"
      printf "\n"
      exit 1
    fi
    ;;

  envars)
    # Get bucket name (default to devbucket)
    BUCKET_NAME="${1:-devbucket}"

    # Get master key info
    keys_json=$(garage_api ListKeys 2>&1) || {
      printf "${RED}[FAIL] Failed to list keys${NC}\n" >&2
      exit 1
    }

    master_key_data=$(echo "$keys_json" | jq -r --arg name "$MASTER_KEY_NAME" '.[] | select(.name == $name)')

    if [ -z "$master_key_data" ]; then
      printf "${RED}[FAIL] Master key '%s' not found${NC}\n" "$MASTER_KEY_NAME" >&2
      printf "${DIM}Run '%s init' first${NC}\n\n" "$0" >&2
      exit 1
    fi

    master_key_id=$(echo "$master_key_data" | jq -r '.id // empty')

    # Get secret key
    json_payload=$(jq -nc --arg id "$master_key_id" '{id: $id, showSecretKey: true}')
    key_info=$(garage_api GetKeyInfo "$json_payload" 2>&1) || {
      printf "${RED}[FAIL] Failed to get key info${NC}\n" >&2
      exit 1
    }

    access_key=$(echo "$key_info" | jq -r '.accessKeyId // .id // empty')
    secret_key=$(echo "$key_info" | jq -r '.secretAccessKey // empty')

    if [ -z "$access_key" ] || [ "$access_key" = "null" ]; then
      printf "${RED}[FAIL] Could not retrieve access key${NC}\n" >&2
      exit 1
    fi

    if [ -z "$secret_key" ] || [ "$secret_key" = "null" ]; then
      printf "${RED}[FAIL] Could not retrieve secret key${NC}\n" >&2
      exit 1
    fi

    # Output environment variables
    printf "${BOLD}${CYAN}S3 Environment Variables:${NC}\n"
    printf "STORAGE_S3_ACCESS_KEY_ID=%s\n" "$access_key"
    printf "STORAGE_S3_SECRET_ACCESS_KEY=%s\n" "$secret_key"
    printf "STORAGE_S3_BUCKET_DEFAULT=%s\n" "$BUCKET_NAME"
    printf "STORAGE_S3_FORCE_PATH_STYLE=true\n"
    printf "STORAGE_S3_PATH_PREFIX=null\n"
    printf "STORAGE_S3_ENDPOINT_URL=http://localhost:3900\n"
    printf "STORAGE_S3_PUBLIC_URL=http://localhost:3902\n"
    printf "STORAGE_S3_REGION=auto\n"
    printf "\n"
    ;;

  nodes)
    # List available Garage nodes (node_id@addr:port)
    garage1_status=$(docker-compose exec --env RUST_LOG=garage=warn -T garage-1 /garage json-api GetClusterStatus)
    garage2_status=$(docker-compose exec --env RUST_LOG=garage=warn -T garage-2 /garage json-api GetClusterStatus)
    garage3_status=$(docker-compose exec --env RUST_LOG=garage=warn -T garage-3 /garage json-api GetClusterStatus)

    garage1_node_id=$(echo "$garage1_status" | jq -r '.nodes[0].id // empty')
    garage1_addr=$(echo "$garage1_status" | jq -r '.nodes[0].addr // empty')
    garage1_hostname=$(echo "$garage1_status" | jq -r '.nodes[0].hostname // empty')

    garage2_node_id=$(echo "$garage2_status" | jq -r '.nodes[0].id // empty')
    garage2_addr=$(echo "$garage2_status" | jq -r '.nodes[0].addr // empty')
    garage2_hostname=$(echo "$garage2_status" | jq -r '.nodes[0].hostname // empty')

    garage3_node_id=$(echo "$garage3_status" | jq -r '.nodes[0].id // empty')
    garage3_addr=$(echo "$garage3_status" | jq -r '.nodes[0].addr // empty')
    garage3_hostname=$(echo "$garage3_status" | jq -r '.nodes[0].hostname // empty')

    printf "\n"
    printf "${BOLD}${CYAN}List available nodes:${NC}\n"
    printf "${NC}- $garage1_hostname: ${DIM}${garage1_node_id}@${garage1_addr}${NC}\n"
    printf "${NC}- $garage2_hostname: ${DIM}${garage2_node_id}@${garage2_addr}${NC}\n"
    printf "${NC}- $garage3_hostname: ${DIM}${garage3_node_id}@${garage3_addr}${NC}\n"
    printf "\n"
    ;;

  *)
    printf "${RED}[FAIL] Unknown command: %s${NC}\n" "$CMD"
    usage
    exit 1
    ;;
esac
