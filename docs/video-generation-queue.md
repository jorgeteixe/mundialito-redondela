# Video Generation Queue

Backstage video generation uses a PostgreSQL-backed queue and a dedicated worker package.

## Architecture

- Jobs are stored in `video_generation_job` via `@mr/db`.
- Admin users enqueue jobs from `/videos` in `apps/backstage`.
- `@mr/video-worker` claims one queued job at a time, validates props with the Remotion template schema, renders the video, and updates status.
- Rendered files are written to `apps/backstage/public/generated/videos/` by default and exposed under `/generated/videos/`.

## Local Workflow

1. Start the database:

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

- `VIDEO_OUTPUT_DIR`: absolute or relative output directory. Defaults to `apps/backstage/public/generated/videos/` relative to the worker package.
- `VIDEO_PUBLIC_PATH_PREFIX`: public URL prefix stored on completed jobs. Defaults to `/generated/videos`.
- `VIDEO_WORKER_ID`: worker lock identifier. Defaults to host and process id.
- `VIDEO_WORKER_POLL_MS`: idle polling delay. Defaults to `5000`.
- `VIDEO_WORKER_ONCE=true`: process at most one job, useful for one-off checks.

## Notes

Local filesystem output is for the v1 admin workflow. Production deployments should use persistent shared storage or replace the output adapter with object storage before relying on generated files across deploys.
