# Media Generation Jobs

Backstage media generation uses `video_generation_job` as app state/history and
Trigger.dev as the executor.

## Architecture

- Jobs are stored in `video_generation_job` via `@mr/db`.
- Admin users create jobs from `/videos` and `/images` in `apps/backstage`.
- Backstage triggers `media.render` in `@mr/jobs` immediately after creating or
  retrying a job.
- `media.render` validates props with the Remotion template schema, renders the
  video/image, uploads it to S3-compatible storage, deletes the local temp file,
  and updates status.
- `@mr/video-worker` remains as shared rendering/storage library code used by
  Trigger tasks; it no longer has a polling worker entrypoint.
- Local development uses remote S3-compatible storage too, so Trigger.dev dev
  runs and Backstage use reachable media URLs.

## Local Workflow

1. Copy `.env.example` to `.env` and set remote `DATABASE_URL`, Trigger, and S3
   variables.

2. Run migrations against the configured database:

   ```sh
   pnpm --filter @mr/db db:migrate
   ```

3. Start Backstage:

   ```sh
   pnpm --filter @mr/backstage dev
   ```

4. Start the local Trigger dev worker in another shell:

   ```sh
   pnpm jobs:dev
   ```

5. Open `http://localhost:3001/videos`, enqueue a job, and wait for the status to become `Completado`.

## Configuration

- `TRIGGER_API_URL`: self-hosted Trigger.dev URL used by Backstage and jobs.
- `TRIGGER_SECRET_KEY`: Trigger.dev environment secret key used by Backstage.
- `S3_ENDPOINT`: S3-compatible API endpoint. Required.
- `S3_REGION`: storage region. Required.
- `S3_BUCKET`: bucket for generated videos. Required.
- `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`: storage credentials. Required.
- `S3_PUBLIC_BASE_URL`: browser-facing object base URL. Required and must be
  publicly reachable by Postiz.
- `S3_FORCE_PATH_STYLE`: use path-style URLs and requests. Local default: `true`; Cloudflare R2 usually needs `true` for API calls and `false` only when `S3_PUBLIC_BASE_URL` is a custom public domain.
- `S3_APPLY_PUBLIC_READ_POLICY`: applies public-read object policy. Defaults to
  false; use bucket/domain policy for remote storage when possible.

## Notes

The render helper creates the bucket if missing. For Cloudflare R2, create the
bucket and public/custom domain in Cloudflare, then set the same S3 env vars in
Backstage, local Trigger dev, and deployed Trigger runtime.
