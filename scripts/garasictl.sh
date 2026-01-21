#!/usr/bin/env sh
set -eu # Exit on error, treat unset variables as an error.

# Colors (raw escape sequences)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Disable colors when not running in a TTY
if [ ! -t 1 ]; then
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BLUE=''; BOLD=''; DIM=''; NC=''
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_ENV_FILE=".env.local"
IMAGE="ghcr.io/riipandi/garasi:0.0.0-dev"
CONTAINER_NAME="garasi"
PLATFORM="linux/amd64"

# Logging helpers
log()  { printf "${CYAN}==>${NC} $*\n"; }
info() { printf "${BLUE}INFO:${NC} $*\n"; }
ok()   { printf "${GREEN}OK:${NC} $*\n"; }
warn() { printf "${YELLOW}WARN:${NC} $*\n"; }
err()  { printf "${RED}ERROR:${NC} $*\n" >&2; }

# Resolve env file:
# - if arg missing -> use ROOT_DIR/DEFAULT_ENV_FILE
# - if arg absolute (starts with /) -> use as-is
# - if arg starts with ./ or ../ -> interpret relative to current working dir
# - otherwise interpret relative to ROOT_DIR
env_file_for() {
  arg="${1-}"
  if [ -z "$arg" ]; then
    printf '%s' "$ROOT_DIR/$DEFAULT_ENV_FILE"
    return
  fi

  case "$arg" in
    /*) printf '%s' "$arg" ;;                  # absolute
    ./*|../*) printf '%s' "$(cd "$(dirname "$arg")" 2>/dev/null && pwd)/$(basename "$arg")" ;; # relative to cwd
    *) printf '%s' "$ROOT_DIR/$arg" ;;         # relative to project root
  esac
}

# Convert absolute path to relative path from ROOT_DIR
relative_path() {
  path="$1"
  if [ "${path#"$ROOT_DIR/"}" != "$path" ]; then
    printf '%s' "${path#"$ROOT_DIR/"}"
  elif [ "$path" = "$ROOT_DIR" ]; then
    printf '.'
  else
    printf '%s' "$path"
  fi
}

trim_val() {
  printf '%s' "$1" | sed 's/^"//; s/"$//; s/\r$//'
}

get_env_from() {
  file="$1"; key="$2"
  if [ ! -f "$file" ]; then
    return 1
  fi
  val=$(grep -m1 "^${key}=" "$file" 2>/dev/null || true)
  [ -n "$val" ] || { printf '' ; return 0; }
  val=$(printf '%s' "$val" | cut -d'=' -f2-)
  trim_val "$val"
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    err "docker not found in PATH"
    exit 3
  fi
}

remove_existing() {
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    info "Removing existing container ${CONTAINER_NAME}..."
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    ok "Removed ${CONTAINER_NAME}"
  fi
}

start() {
  ENV_FILE="$(env_file_for "$1")"
  [ -f "$ENV_FILE" ] || { err "Env file not found: $ENV_FILE"; exit 1; }

  check_docker

  app_log_to_console="$(get_env_from "$ENV_FILE" APP_LOG_TO_CONSOLE)"
  garage_admin_api="$(get_env_from "$ENV_FILE" GARAGE_ADMIN_API)"

  [ -n "$garage_admin_api" ] || garage_admin_api="http://localhost:3903"
  [ -n "$app_log_to_console" ] || app_log_to_console="true"

  remove_existing
  mkdir -p "$ROOT_DIR/storage"

  ENV_FILE_RELATIVE="$(relative_path "$ENV_FILE")"
  info "Starting ${CONTAINER_NAME} (detached, ephemeral) using ${DIM}$ENV_FILE_RELATIVE${NC} ..."
  CONTAINER_ID="$(docker run \
    --platform="$PLATFORM" \
    --network=host --rm -d \
    --env-file "$ENV_FILE" \
    --env="APP_LOG_TO_CONSOLE=$app_log_to_console" \
    --env="GARAGE_ADMIN_API=$garage_admin_api" \
    -v "$ROOT_DIR/storage:/srv/storage:rw" \
    --name "$CONTAINER_NAME" "$IMAGE")"
  if [ -n "$CONTAINER_ID" ]; then
    SHORT_ID="$(printf '%s' "$CONTAINER_ID" | cut -c1-12)"
    printf "${BOLD}ID:${NC} %s\n" "$SHORT_ID"
    ok "Started ${CONTAINER_NAME}"
  else
    err "Failed to start container"
    exit 4
  fi
}

stop() {
  check_docker
  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    info "Stopping ${CONTAINER_NAME}..."
    docker stop "$CONTAINER_NAME"
    ok "Stopped ${CONTAINER_NAME}"
  else
    warn "Container ${CONTAINER_NAME} is not running."
  fi
}

status() {
  check_docker
  CONTAINER_ID=$(docker ps -a --filter "name=${CONTAINER_NAME}" --format '{{.ID}}' 2>/dev/null | head -n1)

  printf "${BOLD}Container:${NC} ${CYAN}%s${NC}\n" "$CONTAINER_NAME"

  if [ -n "$CONTAINER_ID" ]; then
    SHORT_ID=$(printf '%s' "$CONTAINER_ID" | cut -c1-12)
    printf "${BOLD}ID:${NC} %s\n" "$SHORT_ID"
  fi

  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    printf "${BOLD}Status:${NC} ${GREEN}running${NC}\n"
  else
    printf "${BOLD}Status:${NC} ${RED}stopped${NC}\n"
  fi
}

logs() {
  check_docker
  if docker ps -a --filter "name=${CONTAINER_NAME}" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    info "Streaming logs for ${CONTAINER_NAME}..."
    docker logs -f "$CONTAINER_NAME"
  else
    err "Container ${CONTAINER_NAME} does not exist."
    exit 1
  fi
}

usage() {
  cat <<EOF

Usage: $0 {start|stop|restart|status|logs} [env-file]

env-file: Path to environment variable file (optional).
If omitted uses $DEFAULT_ENV_FILE relative to project root.

Examples:
  $0 start                 # start using default .env.local in project root
  $0 start .env.prod       # start using PWD/.env.prod
  $0 start ./ci/.env.ci    # start using env file relative to current working dir
  $0 stop                  # stop the running container
  $0 restart .env.staging  # restart using a specific env file
  $0 logs                  # stream container logs (follow mode)

EOF
  exit 2
}

case "${1-}" in
  start) start "${2-}" ;;
  stop) stop ;;
  restart) stop; start "${2-}" ;;
  status) status ;;
  logs) logs ;;
  *) usage ;;
esac
