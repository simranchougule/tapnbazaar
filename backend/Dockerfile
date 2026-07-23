# syntax=docker/dockerfile:1

##### Stage 1: install deps + compile TypeScript #####
FROM node:20-slim AS build
WORKDIR /app

# OpenSSL is required by Prisma's query engine on Debian-based images
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

##### Stage 2: slim runtime image #####
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Prisma client + engine binaries + the CLI itself (needed at runtime for
# `migrate deploy`). Copying it from the build stage guarantees the pinned
# 5.13.0 CLI is used instead of npx silently fetching the latest major
# version from the registry, which uses an incompatible schema format.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 5000

# Applies any pending migrations, then starts the server.
# `migrate deploy` is safe to run on every boot: it's a no-op if there's
# nothing new to apply, and never generates/prompts like `migrate dev` does.
# Invoking the CLI's JS entry point directly (instead of `npx prisma`)
# avoids relying on a node_modules/.bin symlink surviving the multi-stage
# copy, and guarantees the pinned 5.13.0 CLI runs instead of npx silently
# fetching the latest major version from the registry.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node dist/server.js"]
