# Garasi

<p align="left">
    <a href="https://github.com/riipandi/garasi/releases">
        <img src="https://img.shields.io/github/v/release/riipandi/garasi?logo=docker&logoColor=white&color=orange" alt="Release">
    </a>
    <a href="https://github.com/riipandi/garasi">
        <img src="https://img.shields.io/github/repo-size/riipandi/garasi?color=teal" alt="Repo Size">
    </a>
    <a href="https://github.com/riipandi/garasi/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/riipandi/garasi?color=green" alt="License">
    </a>
    <a href="https://github.com/riipandi/garasi/graphs/contributors">
        <img src="https://img.shields.io/badge/Contributions-welcome-gray.svg?labelColor=blue" alt="Contributions welcome">
    </a>
    <!-- <a href="https://github.com/riipandi/garasi/actions/workflows/build.yaml">
        <img src="https://github.com/riipandi/garasi/actions/workflows/build.yaml/badge.svg?event=workflow_dispatch" alt="CI Build">
    </a> -->
</p>

---

A modern web-based GUI for [Garage S3](https://garagehq.deuxfleurs.fr/), a distributed object
storage system. Built with React, TanStack Router/Query/Form/Table, Tailwind CSS, and Bun,
Garasi provides a full-stack management interface featuring Nitro 3 server with SQLite/Kysely
persistence and type-safe operations with Zod schema validation. Designed for simplicity and
developer experience, it includes Docker-ready multi-stage builds with healthcheck monitoring,
making deployment seamless across environments.

## Features

- **Modern Stack**: React, TanStack (Router, Query, Form, Table), Tailwind CSS, Bun.
- **Full-Stack**: Nitro 3 server with SQLite database via Kysely.
- **Docker Ready**: Multi-stage builds with healthcheck monitoring.
- **Type-Safe**: TypeScript with Zod schema validation.

## Quick Start

### Using Docker Compose

```sh
docker compose up --detach --remove-orphans
```

### Development

```sh
cp .env.example .env.local
bun install
bun run dev
```

## Configuration

Generate required secrets:

```sh
openssl rand -hex 32      # For GARAGE_RPC_SECRET
openssl rand -base64 32   # For GARAGE_ADMIN_TOKEN, GARAGE_METRICS_TOKEN, SECRET_KEY
```

See [`.env.example`](./.env.example) for all available options.

## Documentation

- [Garage Quick Start](https://garagehq.deuxfleurs.fr/documentation/quick-start)
- [Garage Admin API](https://garagehq.deuxfleurs.fr/documentation/reference-manual/admin-api)
- [S3 Compatibility](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility)

## License

Licensed under the [Apache 2.0 license](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0).
See the [LICENSE](./LICENSE) file for more information.

---

<sub>🤫 If you like my work, consider [sponsoring](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Aris%20Ripandi?label=Made+by&color=black&labelColor=black)][riipandi-x]

[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
