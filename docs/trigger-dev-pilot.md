# Trigger.dev Pilot

This pilot adds Trigger.dev tasks without changing the existing
PostgreSQL-backed workers.

## Scope

- Existing `@mr/video-worker` and `@mr/social-worker` keep running as before.
- No database schema changes.
- No Backstage UI changes.
- Trigger.dev is used by `@mr/jobs` for `video.render`.

## Homelab Setup

1. Start or expose your self-hosted Trigger.dev webapp.
2. Create a Trigger.dev project from the dashboard.
3. Add these values to root `.env` or `.env.local`:

   ```sh
   TRIGGER_API_URL=https://trigger.teixe.es
   TRIGGER_SECRET_KEY=tr_dev_xxxxxxxxxx
   TRIGGER_PROJECT_REF=proj_glhthldaniregplmysfd
   ```

4. Log in the CLI against the same instance:

   ```sh
   npx trigger.dev@latest init -p proj_glhthldaniregplmysfd -a https://trigger.teixe.es
   ```

## GitHub Deployment

`.github/workflows/deploy-trigger.yml` deploys `@mr/jobs` on pushes to `main`
and from manual `workflow_dispatch`.

Required GitHub settings:

- Repository secret: `TRIGGER_ACCESS_TOKEN`
- Repository variable: `TRIGGER_API_URL`

## Run Video Render Task

The `video.render` task receives a template id and input props, renders with the
existing Remotion pipeline, uploads the result to S3/R2, deletes the temporary
local file, and returns the public URL. It does not create or update database
rows.

Trigger.dev infrastructure must have the same storage variables as the video
worker:

```sh
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=
S3_FORCE_PATH_STYLE=
S3_APPLY_PUBLIC_READ_POLICY=
```

Run locally through `jobs:dev`:

```sh
pnpm jobs:dev
pnpm jobs:video countdown '{}'
```

For deployed tasks:

```sh
pnpm jobs:deploy
pnpm jobs:video countdown '{}'
```

## Verification

- Trigger.dev dashboard shows a `video.render` run when using `jobs:video`.
- Run status is successful.
- Video output contains `publicPath` pointing at the uploaded S3/R2 object.
- Existing worker commands remain valid:

  ```sh
  pnpm video:worker
  pnpm social:worker
  ```
