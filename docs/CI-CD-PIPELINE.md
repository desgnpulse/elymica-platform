# Elymica CI/CD Pipeline

This document outlines the GitHub Actions workflow that deploys the three portals
to Cloudflare Workers and documents the required repository secrets/variables.

> **Heads‑up:** The repository is currently mounted with permissions that block
> the creation of new directories (including `.github`). The workflow YAML has
> been committed as `docs/deploy-portals.workflow.yml`. Once you create the
> `.github/workflows` directory, move this file to
> `.github/workflows/deploy-portals.yml` so that GitHub Actions can pick it up.

## Workflow summary

The workflow is named **Deploy Elymica Portals** and runs on:

- Pushes to `main`
- Manual `workflow_dispatch`

Each job:

1. Checks out the repository.
2. Installs pnpm `8.15.0` and Node.js `18`.
3. Runs `pnpm install --frozen-lockfile`.
4. Builds each portal by running `pnpm run build:cloudflare` inside the app
   directory.
5. Deploys each portal with `pnpm wrangler deploy --env=production`, which uses
   the existing `wrangler.jsonc` files (custom domain + vars already defined).

Deployments run in a matrix (`student-portal`, `parent-portal`,
`teacher-portal`) so they succeed or fail independently while sharing the same
pipeline definition. A concurrency group prevents overlapping deploy runs.

## Required repository secrets / variables

| Name                     | Type    | Description                                                                  |
| ------------------------ | ------- | ---------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | Secret  | API token with **Account.Workers Scripts = Edit** and **Zone.DNS = Read**.   |
| `CLOUDFLARE_ACCOUNT_ID`  | Secret† | Cloudflare account ID used by `wrangler deploy`. Store as a secret or var.   |

†You can also store `CLOUDFLARE_ACCOUNT_ID` as an org/repo variable if you
prefer to keep API tokens separate from static identifiers.

All other runtime secrets (e.g. `NEXTAUTH_SECRET`, API base URLs) are already
configured inside Cloudflare Workers and are not required in GitHub Actions.

## Enabling the workflow

1. Create `.github/workflows` in the repository root.
2. Move `docs/deploy-portals.workflow.yml` into that directory and rename it to
   `deploy-portals.yml`.
3. Add the secrets listed above (`Settings → Secrets and variables → Actions`).
4. Push the change to `main` or trigger the workflow manually from the Actions
   tab.

Once enabled, every push to `main` will rebuild all three portals with OpenNext
and publish them to Cloudflare Workers automatically.
