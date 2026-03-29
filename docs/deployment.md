# Deployment Guide

## Scope

This project is deployed as a static website. It does not require an application server, DBMS, cache service, or data migration layer.

## Hardware requirements

For a small academic static site, the requirements are minimal:

- CPU: any x86_64 or ARM64 processor suitable for running a static web server
- RAM: 512 MB minimum, 1 GB recommended
- Disk: 200 MB free space for repository checkout, `node_modules`, build output, and archived docs
- Architecture: x86_64 or ARM64

GitHub Pages hosting does not require project-managed hardware.

## Required software

- `Git`
- `Node.js 22 LTS` or newer with `npm`
- optional static web server for self-hosting: `nginx`, `Caddy`, or `Apache`

## Network requirements

- outbound HTTPS access to GitHub for cloning and dependency installation
- inbound HTTP/HTTPS access to the static host for end users
- no database port, cache port, or application API port is required

## Server and hosting configuration

### GitHub Pages

- Publish from the repository root on `main` if the root is the chosen Pages source.
- Keep repository-relative paths compatible with `/zero-secret-auth-landing/`.
- Ensure `robots.txt`, `sitemap.xml`, and static assets remain in published output.

### Generic static hosting

- Build the site with `npm run build`
- Configure the web server root to serve files from `dist/`
- Enable ordinary static file handling for `.html`, `.css`, `.js`, images, and `.xml`

## Database setup

Not applicable. The project has no DBMS and no persistent runtime data.

## Deployment steps

1. Clone or update the repository.
2. Install dependencies with `npm ci`.
3. Run `npm run check`.
4. Run `npm run build`.
5. If using GitHub Pages from repository root, push the validated changes to `main`.
6. If using a generic static host, copy the contents of `dist/` to the configured web root.
7. If JSDoc reference output is required on the host, generate it with `npm run docs:generate` and publish `reference/` as a static directory.

Helper scripts:

- `docs/scripts/prepare-release.ps1`
- `docs/scripts/prepare-release.sh`
- `docs/scripts/deploy-static.ps1`
- `docs/scripts/deploy-static.sh`

## Verification

After deployment, verify:

- the Ukrainian home page loads correctly
- `/en/` and `/materials/` open without broken assets
- CSS and JavaScript load from repository-safe relative paths
- `robots.txt` and `sitemap.xml` are reachable
- browser console shows no obvious runtime errors
- optional `reference/` pages open if they were published
