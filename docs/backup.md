# Backup Guide

## Backup strategy

This project is a static site, so backup is centered on source control, generated build output, generated documentation, and deployment packages.

Protected items:

- repository state and git tags
- `dist/` build output
- `reference/` generated JSDoc site
- `artifacts/` archives
- configuration files such as `package.json`, `eslint.config.mjs`, `tsconfig.json`, and `jsdoc.config.json`

## Backup types in this project

- Full backup: complete copy of the repository and selected generated outputs
- Incremental backup: copy only files changed since the previous backup
- Differential backup: copy files changed since the most recent full backup

For a small static site, a periodic full backup plus git-based history is usually sufficient.

## Backup frequency

- source repository: after each stable milestone and before deployment
- generated build output: before each production update
- generated docs archive: whenever JSDoc output is regenerated for submission or publication

## Storage and rotation

- keep local backup archives outside the repository working tree
- keep at least the latest three deployment-ready backups
- retain milestone tags in Git for logical rollback points

## Project-specific backup procedure

### Repository state

- push commits and tags to the remote repository
- optionally create a local git bundle or zip archive for offline retention

### Generated build artifacts

- preserve the current `dist/` directory before replacing it on a self-hosted server

### Documentation

- archive `reference/` and `docs/` when preparing a submission package

### Configuration files

- include `package.json`, lockfiles, lint/type/doc configs, and workflow files

### Logs

The project itself does not generate application logs. If an external web server writes access logs, they belong to the hosting environment and should be backed up according to host policy.

### User data

Not applicable. The site does not store user accounts, form submissions, or database records.

## Integrity verification

- confirm that backup archives can be opened
- compare file counts or checksums for critical deliverables
- test that `dist/` and `reference/` can be extracted successfully

## Restore procedure

### Full restore

1. Restore the repository working tree or reclone the desired commit or tag.
2. Run `npm ci`.
3. Regenerate or restore `dist/` and `reference/` if needed.
4. Redeploy the restored static files.

### Selective restore

- restore only `dist/` to recover a previous published site version
- restore only `reference/` or `artifacts/` for documentation submission needs
- restore only configuration files if the problem is tooling-related

## Restore testing

At each major milestone:

- perform one test extraction of the backup archive
- confirm that `npm run check` still succeeds from the restored state
- confirm that the main static pages render correctly after redeployment
