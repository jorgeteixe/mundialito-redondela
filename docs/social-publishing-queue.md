# Social Publishing Jobs

Backstage publishes images, reels, and stories to Instagram and Facebook through
Postiz. `social_post` and `social_post_target` store app state/history;
Trigger.dev runs the publish tasks.

## Architecture

- A publication is stored as a `social_post` (content/intent) plus one
  `social_post_target` per platform via `@mr/db`.
- Admins create publications from `/publicaciones` in `apps/backstage`, choosing
  platforms, post type, media, caption, and **when**: "Publicar ahora" or
  "Programar" (a date at least 5 minutes out).
- Media is either a direct public URL, an already-rendered `video_generation_job`,
  or a render requested by `publication.publish`.
- `publication.publish` optionally triggers `media.render`, stores the rendered
  media URL, then fans out to `social.publish` for each target.
- `social.publish` marks one target as publishing and hands it to **Postiz**.
  Timing is **delegated to Postiz**, not our queue: a future `scheduledAt` is sent
  as a Postiz `schedule` post; a due one as a `now` post. The task records the
  Postiz post id and later backfills the permalink (see below).
- Publishing goes through **Postiz** (`providers/postiz.ts`) — a hosted scheduler
  that owns the Meta app, so no own Meta app/app-review is needed. The provider
  abstraction (`providers/`) keeps the publish step swappable.
- `@mr/social-worker` remains as shared media/provider library code used by
  Trigger tasks; it no longer has a polling worker entrypoint.

## State machine (`social_post_target`)

`scheduled` → `publishing` → `published`. A failure re-queues to `scheduled`
until `max_attempts`, then becomes `failed` (retryable from the UI). Note: the
task publishes targets as soon as their media is ready (no scheduledAt gate), so a
future-scheduled post reaches `published` once handed to Postiz — Postiz then
releases it at the scheduled time.

## Postiz setup (default provider)

1. In Postiz, connect the **Instagram** and **Facebook** channels for the brand.
2. Create a Public API key (Settings → Public API) and set `POSTIZ_API_KEY`.
3. Channel ids resolve automatically from `GET /integrations` by matching the
   channel `identifier` to the platform. Override with
   `POSTIZ_INSTAGRAM_INTEGRATION_ID` / `POSTIZ_FACEBOOK_INTEGRATION_ID` if needed.

The task downloads the resolved public media URL and uploads the bytes to Postiz
(`POST /upload`), then creates the post: `type: "schedule"` with the post's
`scheduledAt` when it's more than a minute out, otherwise `type: "now"`. Post type
maps to Postiz `settings.post_type`: feed→`post`, reel→`reel`, story→`story`
(Facebook only sets `post_type` for stories).

Postiz publishes asynchronously, so the post permalink isn't known at hand-off.
The scheduled Trigger task reconciles it on a timer: it lists
published targets missing a permalink and fills `providerPermalink` from the
post's `releaseURL` via `GET /posts` once Postiz releases it.

## Configuration

- `POSTIZ_API_KEY`: Postiz Public API key. **Required** for `social.publish`.
- `POSTIZ_API_URL`: Postiz API base. Default `https://api.postiz.com/public/v1`
  (set to your `{BACKEND_URL}/public/v1` when self-hosting Postiz).
- `POSTIZ_INSTAGRAM_INTEGRATION_ID` / `POSTIZ_FACEBOOK_INTEGRATION_ID`: optional
  explicit channel ids; auto-resolved from `GET /integrations` when unset.
- `TRIGGER_API_URL` / `TRIGGER_SECRET_KEY`: needed by Backstage to start
  publication and retry tasks.
- `S3_PUBLIC_BASE_URL`: **must be publicly reachable.** Private/localhost media
  URLs are rejected with a clear error — the task fetches media over the network
  before uploading it to Postiz.

## Public media requirement

The Trigger task fetches the media URL to upload it to Postiz, so the media URL must be
public:

- **Production**: R2 (or any S3-compatible store) behind a public domain. No change.
- **Local**: use the same remote/R2 dev bucket; localhost media URLs are rejected.
- **Quick smoke test**: create a publication with the "URL pública" option and any
  public image URL — bypasses storage entirely.

## Platform support

Postiz publishes asynchronously: `POST /posts` accepts the post and returns a
Postiz post id; the channel goes out shortly after. `post_type` per platform:

| Post type       | Instagram (`post_type`) | Facebook (`post_type`) |
| --------------- | ----------------------- | ---------------------- |
| Feed image      | ✅ `post`               | ✅ (none)              |
| Feed/Reel video | ✅ `reel`               | ✅ (none)              |
| Story image     | ✅ `story`              | ✅ `story`             |
| Story video     | ✅ `story`              | ✅ `story`             |

## Verification command (publishes real posts)

`pnpm --filter @mr/tools verify-social-publish` runs the full chain end to end —
renders a real image + video, uploads to R2, creates one publication per post
type, and publishes through Postiz. It
**publishes real posts** and is intentionally excluded from `pnpm test`.

It prompts for confirmation; in non-interactive shells set `CONFIRM_PUBLISH=PUBLISH`.
Requires the DB, R2, and `POSTIZ_API_KEY` set in root `.env`.

## Local workflow

1. Copy `.env.example` to `.env` and set remote `DATABASE_URL`, Trigger, Postiz,
   and S3 variables.
2. `pnpm --filter @mr/db db:migrate`.
3. Set the same variables in your Trigger.dev environment.
4. `pnpm --filter @mr/backstage dev`.
5. `pnpm jobs:dev`.
6. Open `http://localhost:3001/publicaciones`, schedule a publication, and watch
   the per-platform badge move to `Publicado`.
