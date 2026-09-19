#!/bin/sh
# Vercel build: generate client, apply committed Prisma migrations, then Next.js build.
set -eu

# Neon’s Vercel integration injects DATABASE_URL_UNPOOLED (direct) and DATABASE_URL (pooled).
# Prisma schema reads DIRECT_URL for migrate; accept either name.
if [ -z "${DIRECT_URL:-}" ]; then
  if [ -n "${DATABASE_URL_UNPOOLED:-}" ]; then
    export DIRECT_URL="$DATABASE_URL_UNPOOLED"
  elif [ -n "${DATABASE_URL:-}" ]; then
    export DIRECT_URL="$DATABASE_URL"
  fi
fi

if [ -z "${DATABASE_URL:-}" ] || [ -z "${DIRECT_URL:-}" ]; then
  echo "DATABASE_URL and DIRECT_URL (or DATABASE_URL_UNPOOLED) must be set for production builds." >&2
  exit 1
fi

npx prisma generate
npx prisma migrate deploy
npx next build
