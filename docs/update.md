# Update Guide

## Scope

Updates for this project consist of validating a new static build and replacing previously published static files. There is no application server restart, database migration, or cache invalidation workflow.

## Preparation for update

1. Review the target commit or tag.
2. Read `README.md` and `docs/deployment.md` for the expected workflow.
3. Confirm that the host still serves the same site path and static file structure.

## Backup before update

Before replacing published files:

- create a repository backup or note the exact git tag/commit to which rollback is possible
- back up the current deployed static files
- keep the latest documentation archive if generated docs are published

See `docs/backup.md` for the full backup procedure.

## Compatibility checks

Run locally before deployment:

- `npm ci`
- `npm run check`
- `npm run build`

Confirm that:

- relative asset paths still work under `/zero-secret-auth-landing/`
- `dist/` contains the expected pages and assets
- no hosting-specific configuration needs to change

## Downtime planning

- GitHub Pages updates usually require no planned downtime beyond normal propagation delay.
- Generic static hosting can usually be updated with near-zero downtime by copying a prepared `dist/` directory into place.

## Update process

### GitHub Pages

1. Pull the latest validated code on `main`.
2. Run `npm ci`.
3. Run `npm run check`.
4. Push the updated repository state.
5. Wait for Pages publication to complete.

### Generic static hosting

1. Pull the latest validated code.
2. Run `npm ci`.
3. Run `npm run build`.
4. Back up the currently deployed files.
5. Replace the static web root contents with the new `dist/` output.

## Stopping services

- GitHub Pages: not applicable
- Generic static web server: a full stop is usually not required; an atomic directory switch or fast file replacement is sufficient

## Data migration

Not applicable. The project has no database and no persistent user records.

## Configuration update

Usually not required. Update host configuration only if the deployment path, TLS settings, or static root location changes.

## Post-update verification

Check:

- home page, English page, and materials page
- image, stylesheet, and script loading
- `robots.txt` and `sitemap.xml`
- generated documentation pages if they are hosted

## Rollback procedure

Rollback is file-based:

1. Restore the previous deployed static files from backup, or redeploy the previous git-tagged state.
2. For GitHub Pages, revert to the previous known-good commit or tag and publish that state.
3. Verify the same URLs again after rollback.

Helper scripts:

- `docs/scripts/update-static.ps1`
- `docs/scripts/update-static.sh`
