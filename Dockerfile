# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG PLATFORM=linux/amd64
ARG BUN_VERSION=1

# ------------------------------------------------------------------------------
# Base image with Bun and system dependencies.
# ------------------------------------------------------------------------------
FROM --platform=${PLATFORM} dhi.io/bun:${BUN_VERSION}-debian13-dev AS base
ENV CI=true DO_NOT_TRACK=1 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true

# Install system dependencies (optional tools for building and debugging)
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN --mount=target=/var/lib/apt/lists,type=cache,sharing=locked \
    --mount=target=/var/cache/apt,type=cache,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean && apt-get update -y \
    && apt-get -yqq --no-install-recommends install build-essential curl \
       inotify-tools pkg-config libssl-dev git unzip ca-certificates jq \
    && update-ca-certificates

# Add tini for signal handling and zombie reaping
RUN set -eux; \
    TINI_DOWNLOAD_URL="https://github.com/krallin/tini/releases/download/v0.19.0" \
    ARCH="$(dpkg --print-architecture)"; \
    case "${ARCH}" in \
      amd64|x86_64) TINI_BIN_URL="${TINI_DOWNLOAD_URL}/tini" ;; \
      arm64|aarch64) TINI_BIN_URL="${TINI_DOWNLOAD_URL}/tini-arm64" ;; \
      *) echo "unsupported architecture: ${ARCH}"; exit 1 ;; \
    esac; \
    curl -fsSL "${TINI_BIN_URL}" -o /usr/bin/tini; \
    chmod +x /usr/bin/tini

WORKDIR /srv

# ------------------------------------------------------------------------------
# Install dependencies and build the application.
# ------------------------------------------------------------------------------
FROM base AS builder

# Copy the source files
COPY --chown=bun:bun . .

# Install dependencies and build the application.
RUN --mount=type=cache,id=bunstore,target=/bun/store bun install --no-summary \
    --cache-dir=/bun/store  --ignore-scripts --frozen-lockfile \
    && bun run typecheck && NODE_ENV=production NITRO_PRESET=bun bun run vite build

# ------------------------------------------------------------------------------
# Cleanup the builder stage and create necessary directories.
# ------------------------------------------------------------------------------
FROM base AS pruner

# Copy only necessary files from builder stage
COPY --from=builder /srv/.output /srv
COPY --from=builder /srv/scripts/healthcheck.mjs /srv/server/healthcheck.mjs

# Create necessary data directories and set permissions
RUN mkdir -p /srv/storage/{backup,logs} && chmod -R 0775 /srv/storage
RUN chmod -R 0775 /srv/public && chmod +x /srv/server/index.mjs

# ------------------------------------------------------------------------------
# Production image, copy build output files and run the application.
# ------------------------------------------------------------------------------
FROM --platform=${PLATFORM} dhi.io/bun:${BUN_VERSION} AS runner

# Read application environment variables
ARG APP_BASE_URL=http://localhost:3980
ARG APP_LOG_LEVEL=info
ARG APP_MODE=production
ARG GARAGE_ADMIN_API
ARG GARAGE_ADMIN_TOKEN
ARG GARAGE_METRICS_TOKEN
ARG GARAGE_RPC_SECRET
ARG MAILER_FROM_EMAIL
ARG MAILER_FROM_NAME
ARG MAILER_SMTP_HOST
ARG MAILER_SMTP_PORT
ARG MAILER_SMTP_USERNAME
ARG MAILER_SMTP_PASSWORD
ARG MAILER_SMTP_SECURE
ARG SECRET_KEY
ARG PUBLIC_JWT_ACCESS_TOKEN_EXPIRY
ARG PUBLIC_JWT_REFRESH_TOKEN_EXPIRY

# Copy the build output files and some necessary system utilities from previous stage.
# To enhance security, consider avoiding the copying of sysutils.
COPY --chown=nonroot:nonroot --from=pruner /srv /srv
COPY --from=base /usr/bin/tini /usr/bin/tini

# Define the host and port to listen on.
ARG HOST=0.0.0.0 PORT=3980 APP_LOG_TIMESTAMP=true
ARG APP_LOG_TO_CONSOLE=true APP_LOG_TO_FILE=true APP_LOG_EXPANDED=false
ENV PATH="/usr/bin:/usr/local/bin:$PATH" TINI_SUBREAPER=true
ENV DO_NOT_TRACK=1 HOST=$HOST PORT=$PORT

WORKDIR /srv
USER nonroot:nonroot
EXPOSE $PORT/tcp

# Healthcheck to monitor application status
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD bun run server/healthcheck.mjs

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bun", "run", "server/index.mjs"]
