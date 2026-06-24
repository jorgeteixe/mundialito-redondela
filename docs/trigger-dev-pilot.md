# Trigger.dev Jobs

Trigger.dev is now the runtime for media rendering and social publishing.
Postgres still stores app state, history, retries, and Backstage list data.

## Scope

- Backstage creates DB rows, then triggers `@mr/jobs`.
- `media.render` renders video or image media and updates `video_generation_job`
  when a `jobId` is provided.
- `publication.publish` optionally renders media first, then fans out to
  `social.publish` per target.
- `social.reconcile-permalinks` runs on a Trigger schedule every 5 minutes.
- Old polling worker entrypoints have been removed; shared render/provider
  modules remain as libraries used by Trigger tasks.

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

## Run Media Render Task

The `media.render` task receives a template id and input props, derives the media
kind from the template registry, renders with the existing Remotion pipeline,
uploads the result to S3/R2, deletes the temporary local file, and returns the
public URL. When called with `jobId`, it moves the DB job through
`running`/`succeeded`/`failed` so Backstage reflects Trigger progress.

Trigger.dev infrastructure must have the same storage variables:

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
pnpm jobs:media countdown '{"daysLeft":7}'
pnpm jobs:media countdown-post '{"daysLeft":7}'
```

For deployed tasks:

```sh
pnpm jobs:deploy
pnpm jobs:media countdown '{"daysLeft":7}'
pnpm jobs:media countdown-post '{"daysLeft":7}'
```

## Verification

- Trigger.dev dashboard shows a `media.render` run when using `jobs:media`.
- Run status is successful.
- Media output contains `kind` and `publicPath` pointing at the uploaded S3/R2
  object.

## Run Social Publishing Tasks

`social.publish` publishes one `social_post_target` through Postiz. It loads the
target, resolves media from the publication, hands scheduling to Postiz, and
updates the target status/provider fields in the database.

```sh
pnpm jobs:social <targetId>
```

`publication.publish` is the orchestrator. It optionally renders media first,
stores the rendered public URL on the publication, then triggers `social.publish`
for each target of the post.

```sh
pnpm jobs:publication <postId>
pnpm jobs:publication <postId> '{"templateId":"countdown-post","inputProps":{"daysLeft":7}}'
```

`social.reconcile-permalinks` runs every 5 minutes and backfills Postiz
permalinks for already-published targets.

Trigger.dev infrastructure must also have:

```sh
DATABASE_URL=
POSTIZ_API_KEY=
POSTIZ_API_URL=
POSTIZ_INSTAGRAM_INTEGRATION_ID=
POSTIZ_FACEBOOK_INTEGRATION_ID=
```

Backstage server actions also need `TRIGGER_API_URL` and `TRIGGER_SECRET_KEY` so
they can trigger tasks from form submissions.
