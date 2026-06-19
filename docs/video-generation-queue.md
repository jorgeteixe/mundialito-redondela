# Video Generation Queue

Backstage video generation uses a PostgreSQL-backed queue and a dedicated worker package.

## Architecture

- Jobs are stored in `video_generation_job` via `@mr/db`.
- Admin users enqueue jobs from `/videos` in `apps/backstage`.
- `@mr/video-worker` claims one queued job at a time, validates props with the Remotion template schema, renders the video, uploads it to S3-compatible storage, and updates status.
- Local development uses MinIO from `docker-compose.yml`; production can use Cloudflare R2 or another S3-compatible endpoint.

## Local Workflow

1. Start Postgres and MinIO:

   ```sh
   docker compose up -d
   ```

2. Run migrations:

   ```sh
   pnpm --filter @mr/db db:migrate
   ```

3. Start Backstage:

   ```sh
   pnpm --filter @mr/backstage dev
   ```

4. Start the video worker in another shell:

   ```sh
   pnpm video:worker
   ```

5. Open `http://localhost:3001/videos`, enqueue a job, and wait for the status to become `Completado`.

## Configuration

- `VIDEO_OUTPUT_DIR`: temporary render directory before upload. Defaults to `apps/backstage/public/generated/videos/` relative to the worker package.
- `VIDEO_WORKER_ID`: worker lock identifier. Defaults to host and process id.
- `VIDEO_WORKER_POLL_MS`: idle polling delay. Defaults to `5000`.
- `VIDEO_WORKER_ONCE=true`: process at most one job, useful for one-off checks.
- `S3_ENDPOINT`: S3-compatible API endpoint. Local default: `http://localhost:9000`.
- `S3_REGION`: storage region. Local default: `auto`.
- `S3_BUCKET`: bucket for generated videos. Local default: `mundialito-videos`.
- `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`: storage credentials. Local defaults match the MinIO service.
- `S3_PUBLIC_BASE_URL`: browser-facing object base URL. Local default: `http://localhost:9000`.
- `S3_FORCE_PATH_STYLE`: use path-style URLs and requests. Local default: `true`; Cloudflare R2 usually needs `true` for API calls and `false` only when `S3_PUBLIC_BASE_URL` is a custom public domain.
- `S3_APPLY_PUBLIC_READ_POLICY`: applies public-read object policy. Defaults to true for local MinIO, false for non-local endpoints unless explicitly set.

## Notes

The worker creates the bucket if missing and applies a public-read object policy for local MinIO. For production Cloudflare R2, create the bucket and public/custom domain in Cloudflare, then set the S3 env vars in the worker runtime.
