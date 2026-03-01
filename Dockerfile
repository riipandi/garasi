# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG BUN_VERSION=1.3

# ------------------------------------------------------------------------------
# Base image with Bun and system dependencies.
# ------------------------------------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-debian13-dev AS base
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
FROM dhi.io/bun:${BUN_VERSION} AS runner
LABEL org.opencontainers.image.source="https://github.com/riipandi/garasi"
LABEL org.opencontainers.image.documentation="https://github.com/riipandi/garasi"
LABEL org.opencontainers.image.description="Graphical User Interface for Garage S3"
LABEL org.opencontainers.image.authors="Aris Ripandi"
LABEL org.opencontainers.image.licenses="Apache-2.0"

# Read application environment variables
ARG APP_BASE_URL=http://localhost:3990
ARG APP_LOG_EXPANDED=false
ARG APP_LOG_LEVEL=info
ARG APP_LOG_TRANSPORT=console
ARG APP_MODE=production
ARG APP_SECRET_KEY
ARG GARAGE_ADMIN_API
ARG GARAGE_ADMIN_TOKEN
ARG GARAGE_METRICS_TOKEN
ARG GARAGE_RPC_SECRET
ARG GARAGE_S3_ENDPOINT
ARG MAILER_FROM_EMAIL
ARG MAILER_FROM_NAME
ARG MAILER_SMTP_HOST
ARG MAILER_SMTP_PORT
ARG MAILER_SMTP_USERNAME
ARG MAILER_SMTP_PASSWORD
ARG MAILER_SMTP_SECURE
ARG PUBLIC_TOKEN_EXPIRY
ARG S3_MAX_UPLOAD_SIZE

# Copy the build output files and some necessary system utilities from previous stage.
# To enhance security, consider avoiding the copying of sysutils.
COPY --chown=nonroot:nonroot --from=pruner /srv /srv
COPY --from=base /usr/bin/tini /usr/bin/tini

# Define the host and port to listen on.
ARG HOST=0.0.0.0 PORT=3990
ENV PATH="/usr/bin:/usr/local/bin:$PATH"
ENV HOST=$HOST PORT=$PORT TINI_SUBREAPER=true

WORKDIR /srv
USER nonroot:nonroot
EXPOSE $PORT/tcp

# Healthcheck to monitor application status
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD bun run server/healthcheck.mjs

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bun", "run", "server/index.mjs"]
