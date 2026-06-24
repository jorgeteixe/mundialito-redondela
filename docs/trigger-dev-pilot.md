# Trigger.dev Pilot

This pilot adds one dummy Trigger.dev task without changing the existing
PostgreSQL-backed workers.

## Scope

- Existing `@mr/video-worker` and `@mr/social-worker` keep running as before.
- No database schema changes.
- No Backstage UI changes.
- Trigger.dev is only used by `@mr/jobs` for `dummy.health-check`.

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

## Run Dummy Task

During local development:

```sh
pnpm jobs:dev
```

From another shell:

```sh
pnpm jobs:dummy "hello from mundialito"
```

For deployed tasks:

```sh
pnpm jobs:deploy
pnpm jobs:dummy "hello from deployed trigger"
```

## Verification

- Trigger.dev dashboard shows a `dummy.health-check` run.
- Run status is successful.
- Logs include `Dummy Trigger.dev health check ran`.
- Output contains `ok: true`, the received message, and an ISO timestamp.
- Existing worker commands remain valid:

  ```sh
  pnpm video:worker
  pnpm social:worker
  ```
