# Social worker image.
#
# Build from the repo root so the whole pnpm workspace is in context:
#   docker build -f apps/social-worker/Dockerfile -t mr-social-worker .
#
# Run (env supplies DB + Postiz config):
#   docker run --rm --env-file .env \
#     -e POSTIZ_API_KEY=... \
#     -e S3_PUBLIC_BASE_URL=https://media.example.com mr-social-worker
#
# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# ---- dependencies ---------------------------------------------------------
# Copy every workspace manifest first so the install layer is cached until a
# package.json or the lockfile changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/backstage/package.json ./apps/backstage/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/remotion/package.json ./packages/remotion/package.json
COPY packages/tools/package.json ./packages/tools/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/social-worker/package.json ./apps/social-worker/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- source ---------------------------------------------------------------
# The worker runs via tsx, so it needs the source of @mr/social-worker and @mr/db.
COPY packages/db ./packages/db
COPY apps/social-worker ./apps/social-worker

ENV NODE_ENV=production

CMD ["pnpm", "--filter", "@mr/social-worker", "worker"]
