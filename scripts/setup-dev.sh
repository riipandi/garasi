#!/usr/bin/env sh
set -eu # Exit on error, treat unset variables as an error.

#------------------------------------------------------------------------------
# Garasi application secrets generator script (by Aris Ripandi <aris@duck.com>)
#------------------------------------------------------------------------------
# Description:
#   This script generates cryptographically secure random secrets for the
#   Garasi application using OpenSSL. It can either output the secrets to
#   the console or directly update the .env.local and .env.garage* files.
#
# Usage:
#   ./scripts/setup-dev.sh          - Generate and display secrets only
#   ./scripts/setup-dev.sh --apply  - Generate and apply to .env.* files
#   ./scripts/setup-dev.sh --certs  - Generate local SSL certificates with mkcert
#
# Generated Secrets:
#   - GARAGE_ADMIN_TOKEN    : Base64 encoded 32-byte random string
#   - GARAGE_METRICS_TOKEN  : Base64 encoded 32-byte random string
#   - GARAGE_RPC_SECRET     : Hex encoded 32-byte random string
#   - APP_SECRET_KEY        : Base64 encoded 48-byte random string
#
# Requirements:
#   - OpenSSL must be installed and available in PATH
#   - mkcert must be installed for --certs option
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
CERTS_DIR="$ROOT_DIR/storage/certs"

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

# Verify mkcert is installed when --certs flag is provided
check_mkcert() {
    if ! command -v mkcert > /dev/null 2>&1; then
        printf "${RED}Error: mkcert is not installed or not available in PATH${NC}\n"
        printf "${YELLOW}Please install mkcert to use --certs option${NC}\n"
        printf "${DIM}  macOS: brew install mkcert${NC}\n"
        printf "${DIM}  Linux: Follow instructions at https://github.com/FiloSottile/mkcert${NC}\n"
        printf "${DIM}  Windows: choco install mkcert${NC}\n"
        exit 1
    fi
}

# Install mkcert CA if not already installed
install_mkcert_ca() {
    printf "${YELLOW}Installing mkcert CA...${NC}\n"
    mkcert -install
    printf "${GREEN}mkcert CA installed successfully${NC}\n"
}

# Generate SSL certificates with mkcert
generate_certificates() {
    check_mkcert

    # Create certs directory if it doesn't exist
    mkdir -p "$CERTS_DIR"

    # Check if certificates already exist
    if [ -f "$CERTS_DIR/localhost_crt.pem" ] && [ -f "$CERTS_DIR/localhost_key.pem" ]; then
        printf "\n"
        printf "${GREEN}SSL certificates already exist!${NC}\n\n"
        printf "${CYAN}- Certificate: $CERTS_DIR/localhost_crt.pem${NC}\n"
        printf "${CYAN}- Private Key: $CERTS_DIR/localhost_key.pem${NC}\n"
        printf "\n"
        printf "${GREEN}Do you want to overwrite them? [y/N]: ${NC}"
        read -r response
        if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
            printf "${DIM}Certificate generation cancelled${NC}\n"
            return 0
        fi
        printf "${DIM}Overwriting existing certificates...${NC}\n"
    fi

    # Check if CA is installed, if not, install it
    if [ ! -d "$HOME/.local/share/mkcert" ] && [ ! -d "$(mkcert -CAROOT 2>/dev/null)" ]; then
        install_mkcert_ca
    fi

    # Generate certificates for localhost and local domains
    printf "${GREEN}Generating SSL certificates...${NC}\n"
    mkcert -cert-file "$CERTS_DIR/localhost_crt.pem" \
        -key-file "$CERTS_DIR/localhost_key.pem" \
        localhost "*.local" 127.0.0.1 ::1

    # Set proper permissions
    chmod 600 "$CERTS_DIR/localhost_key.pem"
    chmod 644 "$CERTS_DIR/localhost_crt.pem"

    printf "${GREEN}SSL certificates generated successfully!${NC}\n"
    printf "${CYAN}Certificate: $CERTS_DIR/localhost_crt.pem${NC}\n"
    printf "${CYAN}Private Key: $CERTS_DIR/localhost_key.pem${NC}\n"
    printf "\n"
    printf "${GREEN}Note: Install the local CA in the system trust store:${NC} ${DIM}mkcert -install${NC}\n"
    printf "\n"
}

#------------------------------------------------------------------------------
# Argument Parsing
#------------------------------------------------------------------------------

# Parse command-line arguments
# --apply: When provided, updates .env.local file instead of just printing
# --certs: When provided, generates SSL certificates with mkcert
APPLY_CHANGES=false
GENERATE_CERTS=false
for arg in "$@"; do
    case $arg in
        --apply)
            APPLY_CHANGES=true
            shift
            ;;
        --certs)
            GENERATE_CERTS=true
            shift
            ;;
        --help|-h)
            printf "${BOLD}${CYAN}Garasi Secrets Generator${NC}\n\n"
            printf "Usage:\n"
            printf "  ./scripts/setup-dev.sh          - Generate and display secrets\n"
            printf "  ./scripts/setup-dev.sh --apply  - Generate and apply to .env.local and .env.garage*\n"
            printf "  ./scripts/setup-dev.sh --certs  - Generate local SSL certificates with mkcert\n\n"
            printf "Options:\n"
            printf "  --apply     Update .env.local and .env.garage* files with new secrets\n"
            printf "  --certs     Generate SSL certificates for local development\n"
            printf "  --help, -h  Show this help message\n"
            exit 0
            ;;
        *)
            printf "${YELLOW}Warning: Unknown argument '$arg' ignored${NC}\n"
            ;;
    esac
done

# Validate .env.local exists when --apply is used
if [ "$APPLY_CHANGES" = true ] && [ ! -f "$ENV_FILE" ]; then
    printf "\n${RED}ERROR: .env.local file not found, the --apply flag requires .env.local to exist${NC}\n"
    printf "${DIM}Create the file first, or run without --apply to generate secrets only${NC}\n"
    printf "\n"
    exit 1
fi

# Handle --certs flag separately (generates certificates and exits)
if [ "$GENERATE_CERTS" = true ]; then
    generate_certificates
    exit 0
fi

#------------------------------------------------------------------------------
# Secret Generation
#------------------------------------------------------------------------------

# Generate cryptographically secure random secrets using OpenSSL
# Garage1 secrets
garage1_admin_token=$(openssl rand -base64 32)
garage1_metrics_token=$(openssl rand -base64 32)

# Garage2 secrets
garage2_admin_token=$(openssl rand -base64 32)
garage2_metrics_token=$(openssl rand -base64 32)

# Garage3 secrets
garage3_admin_token=$(openssl rand -base64 32)
garage3_metrics_token=$(openssl rand -base64 32)

# RPC secret (shared across all nodes)
garage_rpc_secret=$(openssl rand -hex 32)

# App secret key
secret_key=$(openssl rand -base64 48)

#------------------------------------------------------------------------------
# Helper Functions
#------------------------------------------------------------------------------

# Update a specific key-value pair in .env file
# Args:
#   $1 - Environment variable key (e.g., "GARAGE_ADMIN_TOKEN")
#   $2 - New value to set
#   $3 - File path to update
# Returns:
#   0 on success, non-zero on failure
update_env_file() {
    key="$1"
    value="$2"
    env_file="$3"
    tmp="$(mktemp)"
    # If key exists, replace the whole line; otherwise append at end.
    if grep -qE "^${key}=" "$env_file"; then
        # Use awk to safely replace without interpreting value
        awk -v k="$key" -v v="$value" '
            BEGIN{FS=OFS="="}
            $1==k{$0=k"="v; seen=1}
            {print}
            END{if(!seen) print k"="v}
        ' "$env_file" > "$tmp"
    else
        # append
        cp "$env_file" "$tmp"
        printf "%s=%s\n" "$key" "$value" >> "$tmp"
    fi
    mv "$tmp" "$env_file"
}

# Create or update garage env file
# Args:
#   $1 - File path to create/update
#   $2 - admin_token
#   $3 - metrics_token
#   $4 - rpc_secret
create_garage_file() {
    env_file="$1"
    admin_token="$2"
    metrics_token="$3"
    rpc_secret="$4"
    if [ ! -f "$env_file" ]; then
        printf "Creating %s...\n" "$env_file"
        cat > "$env_file" << EOF
GARAGE_ADMIN_TOKEN=$admin_token
GARAGE_METRICS_TOKEN=$metrics_token
GARAGE_RPC_SECRET=$rpc_secret
EOF
    else
        update_env_file "GARAGE_ADMIN_TOKEN" "$admin_token" "$env_file"
        update_env_file "GARAGE_METRICS_TOKEN" "$metrics_token" "$env_file"
        update_env_file "GARAGE_RPC_SECRET" "$rpc_secret" "$env_file"
    fi
}

# Apply changes or output environment variables
if [ "$APPLY_CHANGES" = true ]; then
    # File existence already validated in prerequisites check
    # Updating .env.local file, using .env.garage1 for GARAGE_* values
    update_env_file "GARAGE_ADMIN_TOKEN" "$garage1_admin_token" "$ENV_FILE"
    update_env_file "GARAGE_METRICS_TOKEN" "$garage1_metrics_token" "$ENV_FILE"
    update_env_file "GARAGE_RPC_SECRET" "$garage_rpc_secret" "$ENV_FILE"
    update_env_file "APP_SECRET_KEY" "$secret_key" "$ENV_FILE"

    # Updating .env.garage* files
    create_garage_file "$ROOT_DIR/.env.garage1" "$garage1_admin_token" "$garage1_metrics_token" "$garage_rpc_secret"
    create_garage_file "$ROOT_DIR/.env.garage2" "$garage2_admin_token" "$garage2_metrics_token" "$garage_rpc_secret"
    create_garage_file "$ROOT_DIR/.env.garage3" "$garage3_admin_token" "$garage3_metrics_token" "$garage_rpc_secret"

    printf "\n"
    printf "${BOLD}${CYAN}Generated Secrets for Garage1:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage1_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage1_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "\n"
    printf "${BOLD}${CYAN}Generated Secrets for Garage2:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage2_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage2_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "\n"
    printf "${BOLD}${CYAN}Generated Secrets for Garage3:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage3_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage3_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "\n"
    printf "${BOLD}${CYAN}Application Secrets:${NC}\n"
    printf "APP_SECRET_KEY=%s\n" "$secret_key"
    printf "\n"
else
    # Output environment variables
    printf "\n"
    printf "${BOLD}${CYAN}Generated Secrets for Garage1:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage1_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage1_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "\n"
    printf "${BOLD}${CYAN}Generated Secrets for Garage2:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage2_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage2_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "\n"
    printf "${BOLD}${CYAN}Generated Secrets for Garage3:${NC}\n"
    printf "GARAGE_ADMIN_TOKEN=%s\n" "$garage3_admin_token"
    printf "GARAGE_METRICS_TOKEN=%s\n" "$garage3_metrics_token"
    printf "GARAGE_RPC_SECRET=%s\n" "$garage_rpc_secret"
    printf "\n"
    printf "${BOLD}${CYAN}Application Secrets:${NC}\n"
    printf "APP_SECRET_KEY=%s\n" "$secret_key"
    printf "\n"
fi
