# Video worker image.
#
# Build from the repo root so the whole pnpm workspace is in context:
#   docker build -f packages/video-worker/Dockerfile -t mr-video-worker .
#
# Run (env supplies DB + S3 config):
#   docker run --rm --env-file packages/db/.env -e S3_ENDPOINT=... mr-video-worker
#
# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# System libraries required by Remotion's headless Chrome.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnss3 \
    libpango-1.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
  && rm -rf /var/lib/apt/lists/*

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
COPY packages/video-worker/package.json ./packages/video-worker/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- source ---------------------------------------------------------------
# The worker runs via tsx and bundles Remotion at runtime, so it needs the
# source of @mr/video-worker plus the @mr/remotion / @mr/ui / @mr/db packages.
COPY packages/db ./packages/db
COPY packages/ui ./packages/ui
COPY packages/remotion ./packages/remotion
COPY packages/video-worker ./packages/video-worker

# Pre-download the headless Chrome shell so the container runs offline.
RUN pnpm --filter @mr/video-worker exec node --input-type=module \
    -e "import { ensureBrowser } from '@remotion/renderer'; await ensureBrowser();"

ENV NODE_ENV=production
# Render scratch space; the final artifact is uploaded to S3.
ENV VIDEO_OUTPUT_DIR=/tmp/mr-video-worker

CMD ["pnpm", "--filter", "@mr/video-worker", "worker"]
