FROM node:22-alpine AS pruner

WORKDIR /repo
RUN corepack enable

COPY . .
RUN HUSKY=0 pnpm install --frozen-lockfile
RUN pnpm --filter @mr/telegram-agent deploy --prod --legacy /app

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=pruner /app /app

CMD ["node", "--import", "tsx", "src/index.ts"]
