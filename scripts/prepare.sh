#!/usr/bin/env sh
set -eu # Exit on error, treat unset variables as an error.

#------------------------------------------------------------------------------
# Garasi application secrets generator script (by Aris Ripandi <aris@duck.com>)
#------------------------------------------------------------------------------
# Description:
#   This script generates cryptographically secure random secrets for the
#   Garasi application using OpenSSL. It can either output the secrets to
#   the console or directly update the .env.local file.
#
# Usage:
#   ./scripts/prepare.sh          - Generate and display secrets only
#   ./scripts/prepare.sh --apply  - Generate and apply to .env.local file
#
# Generated Secrets:
#   - GARAGE_ADMIN_TOKEN    : Base64 encoded 32-byte random string
#   - GARAGE_METRICS_TOKEN  : Base64 encoded 32-byte random string
#   - GARAGE_RPC_SECRET     : Hex encoded 32-byte random string
#   - SECRET_KEY            : Base64 encoded 48-byte random string
#
# Requirements:
#   - OpenSSL must be installed and available in PATH
#   - .env.local file must exist when using --apply flag
#
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
ENV_FILE="$ROOT_DIR/.env.local"

#------------------------------------------------------------------------------
# Prerequisites Check
#------------------------------------------------------------------------------

# Verify OpenSSL is installed and available
if ! command -v openssl > /dev/null 2>&1; then
    printf "${RED}Error: OpenSSL is not installed or not available in PATH${NC}\n"
    printf "${YELLOW}Please install OpenSSL to run this script${NC}\n"
    printf "${DIM}  macOS: brew install openssl${NC}\n"
    printf "${DIM}  Ubuntu/Debian: sudo apt-get install openssl${NC}\n"
    printf "${DIM}  Fedora/RHEL: sudo dnf install openssl${NC}\n"
    exit 1
fi

# Quick check if --apply flag is provided for early validation
for arg in "$@"; do
    if [ "$arg" = "--apply" ]; then
        if [ ! -f "$ENV_FILE" ]; then
            printf "\n${RED}ERROR: .env.local file not found, the --apply flag requires .env.local to exist${NC}\n"
            printf "${DIM}Create the file first, or run without --apply to generate secrets only${NC}\n"
            printf "\n"
            exit 0
        fi
        break
    fi
done

#------------------------------------------------------------------------------
# Argument Parsing
#------------------------------------------------------------------------------

# Parse command-line arguments
# --apply: When provided, updates .env.local file instead of just printing
APPLY_CHANGES=false
for arg in "$@"; do
    case $arg in
        --apply)
            APPLY_CHANGES=true
            shift
            ;;
        --help|-h)
            printf "${BOLD}${CYAN}Garasi Secrets Generator${NC}\n\n"
            printf "Usage:\n"
            printf "  ./scripts/prepare.sh          - Generate and display secrets\n"
            printf "  ./scripts/prepare.sh --apply  - Generate and apply to .env.local\n\n"
            printf "Options:\n"
            printf "  --apply     Update .env.local file with new secrets\n"
            printf "  --help, -h  Show this help message\n"
            exit 0
            ;;
        *)
            printf "${YELLOW}Warning: Unknown argument '$arg' ignored${NC}\n"
            ;;
    esac
done

#------------------------------------------------------------------------------
# Secret Generation
#------------------------------------------------------------------------------

# Generate cryptographically secure random secrets using OpenSSL
garage_admin_token=$(openssl rand -base64 32)   # 32 bytes → 44 chars base64
garage_metrics_token=$(openssl rand -base64 32) # 32 bytes → 44 chars base64
garage_rpc_secret=$(openssl rand -hex 32)       # 32 bytes → 64 chars hex
secret_key=$(openssl rand -base64 48)           # 48 bytes → 64 chars base64

#------------------------------------------------------------------------------
# Helper Functions
#------------------------------------------------------------------------------

# Update a specific key-value pair in .env.local file
# Args:
#   $1 - Environment variable key (e.g., "GARAGE_ADMIN_TOKEN")
#   $2 - New value to set
# Returns:
#   0 on success, non-zero on failure
update_env_file() {
    key="$1"
    value="$2"
    tmp="$(mktemp)"
    # If key exists, replace the whole line; otherwise append at end.
    if grep -qE "^${key}=" "$ENV_FILE"; then
        # Use awk to safely replace without interpreting value
        awk -v k="$key" -v v="$value" '
            BEGIN{FS=OFS="="}
            $1==k{$0=k"="v; seen=1}
            {print}
            END{if(!seen) print k"="v}
        ' "$ENV_FILE" > "$tmp"
    else
        # append
        cp "$ENV_FILE" "$tmp"
        printf "%s=%s\n" "$key" "$value" >> "$tmp"
    fi
    mv "$tmp" "$ENV_FILE"
}

# Apply changes or output environment variables
if [ "$APPLY_CHANGES" = true ]; then
    # File existence already validated in prerequisites check
    printf "\n"
    printf "${BOLD}${CYAN}Updating .env.local file...${NC}\n"
    update_env_file "GARAGE_ADMIN_TOKEN" "$garage_admin_token"
    update_env_file "GARAGE_METRICS_TOKEN" "$garage_metrics_token"
    update_env_file "GARAGE_RPC_SECRET" "$garage_rpc_secret"
    update_env_file "SECRET_KEY" "$secret_key"
    printf "\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "SECRET_KEY=%s\n" "$secret_key"
    printf "\n${GREEN}Environment secrets updated successfully${NC}\n"
    printf "\n"
else
    # Output environment variables
    printf "\n"
    printf "${BOLD}${CYAN}Application Secrets:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "SECRET_KEY=%s\n" "$secret_key"
    printf "\n"
fi
