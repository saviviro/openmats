# Deployment

## Production

The production site is published at
[https://openmats.pages.dev](https://openmats.pages.dev) with Cloudflare Pages.
The Cloudflare Pages project is named `openmats` and is connected to the
`saviviro/openmats` GitHub repository.

Cloudflare has access only to the `openmats` repository through the Cloudflare
Workers and Pages GitHub app.

## Automatic deployment

Cloudflare treats the GitHub `main` branch as the production branch. A commit
merged into `main` starts a new production deployment automatically.

The current build settings are:

```text
Production branch: main
Build command: pnpm build
Build output directory: dist
Root directory: repository root
```

The repository's `.nvmrc` selects Node.js 24 and `package.json` pins pnpm
11.7.0 through the `packageManager` field. No Cloudflare API token or other
deployment secret is stored in the repository.

## Release workflow

1. Make changes on a dedicated branch.
2. Run `pnpm validate` locally.
3. Open a pull request and wait for the GitHub `validate` check.
4. Merge the pull request into `main`.
5. Confirm that the Cloudflare production deployment succeeds.
6. Check the live page, key filters, pagination, images and browser console.

If a Cloudflare build fails, the previously successful deployment remains live.
Inspect the deployment log in Cloudflare before changing build settings or
retrying the deployment.

## Custom domain later

A custom domain such as `openmatshelsinki.fi` can be attached to the same Pages
project later. Do not purchase or connect a domain without the project owner's
explicit approval. Keep the `pages.dev` address working until the custom domain,
HTTPS and redirects have been verified.
