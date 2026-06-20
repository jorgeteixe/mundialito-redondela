# Social Publishing Queue

Backstage publishes images, reels, and stories to Instagram and Facebook through
a PostgreSQL-backed queue and a dedicated worker, mirroring the video pipeline.

## Architecture

- A publication is stored as a `social_post` (content/intent) plus one
  `social_post_target` per platform (the queue item) via `@mr/db`.
- Admins create publications from `/publicaciones` in `apps/backstage`, choosing
  platforms, post type, media, caption, and a scheduled time.
- Media is either a direct public URL, an already-rendered `video_generation_job`,
  or a newly enqueued render. When a render is referenced, the target waits until
  that job succeeds before it becomes claimable (shown as "Esperando render").
- `@mr/social-worker` claims due, media-ready targets, resolves the public media
  URL, publishes through a provider, and records the provider post id.
- Publishing goes directly to the **Meta Graph API** (free). The provider layer is
  pluggable (`providers/`), so Buffer/TikTok/etc. can be added later without
  touching the queue or worker loop.

## State machine (`social_post_target`)

`scheduled` → `publishing` → `published`. A failure re-queues to `scheduled`
until `max_attempts`, then becomes `failed` (retryable from the UI).

## Meta setup (one-time)

1. Create a Meta **Business** app; add the **Instagram** product (Facebook-Login
   variant) so `instagram_content_publish` is "Ready for testing".
2. Ensure the Instagram **Business/Creator** account is linked to a Facebook Page.
3. In Graph API Explorer, generate a token with `instagram_basic`,
   `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, and
   — **for Facebook Page publishing** — `pages_manage_posts`. Without
   `pages_manage_posts`, Instagram works but Facebook returns
   `(#200) pages_manage_posts are not available` / `(#100) No permission to publish`.
4. `GET /me/accounts` → your Page id and Page token; then
   `GET /{page-id}?fields=instagram_business_account` → your IG Business id.
5. Exchange for a long-lived token (`grant_type=fb_exchange_token`), then fetch the
   long-lived Page token via `GET /me/accounts`. Tokens last ~60 days; refresh
   manually for now.

## Configuration

- `META_GRAPH_API_VERSION`: Graph API version. Default `v21.0`.
- `META_IG_USER_ID`: Instagram Business account id (publish target).
- `META_PAGE_ID`: Facebook Page id.
- `META_PAGE_ACCESS_TOKEN`: long-lived Page access token.
- `META_CONTAINER_POLL_MS` / `META_CONTAINER_POLL_MAX_ATTEMPTS`: async Instagram
  video container poll cadence. Defaults `3000` / `20`.
- `SOCIAL_WORKER_ID` / `SOCIAL_WORKER_POLL_MS` / `SOCIAL_WORKER_ONCE`: worker
  identity, idle poll delay (default `5000`), single-cycle mode.
- `S3_PUBLIC_BASE_URL`: **must be publicly reachable by Meta.** Media on
  `localhost` (local MinIO) is rejected with a clear error — Meta fetches media
  server-side.

## Public media requirement

Meta downloads `image_url`/`video_url` from its own servers, so the media URL must
be public:

- **Production**: R2 (or any S3-compatible store) behind a public domain. No change.
- **Local**: expose MinIO with a tunnel
  (`cloudflared tunnel --url http://localhost:9000`) and set `S3_PUBLIC_BASE_URL`
  to the tunnel URL, or point the worker at the R2 dev bucket.
- **Quick smoke test**: create a publication with the "URL pública" option and any
  public image URL — bypasses storage entirely.

## Platform support

| Post type       | Instagram                        | Facebook            |
| --------------- | -------------------------------- | ------------------- |
| Feed image      | ✅ `/media` (image)              | ✅ `/photos`        |
| Feed/Reel video | ✅ `/media` `REELS` + async poll | ✅ `/videos`        |
| Story image     | ✅ `/media` `STORIES`            | ✅ `/photo_stories` |
| Story video     | ✅ `/media` `STORIES` + poll     | ✅ `/video_stories` |

## Verification command (publishes real posts)

`pnpm --filter @mr/tools verify-social-publish` runs the full chain end to end —
renders a real image + video with the video worker, uploads to R2, creates one
publication per post type, and publishes through the social worker to Meta. It
**publishes real posts** and is intentionally excluded from `pnpm test`.

It prompts for confirmation; in non-interactive shells set `CONFIRM_PUBLISH=PUBLISH`.
Requires the DB, R2, and Meta env vars set in root `.env`.

## Local workflow

1. `docker compose up -d` (Postgres + MinIO).
2. `pnpm --filter @mr/db db:migrate`.
3. Set the Meta env vars and a public `S3_PUBLIC_BASE_URL` (tunnel) in root
   `.env`.
4. `pnpm --filter @mr/backstage dev`.
5. `pnpm social:worker` (and `pnpm video:worker` if using the generate-new flow).
6. Open `http://localhost:3001/publicaciones`, schedule a publication, and watch
   the per-platform badge move to `Publicado`.
