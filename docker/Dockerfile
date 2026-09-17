# syntax=docker/dockerfile:1

# Production image: build the Next.js static export, serve it with nginx.
# next.config.js sets `output: 'export'`, so `next build` emits ./out and there
# is no Node server to run at runtime.

# ---- dependencies -----------------------------------------------------------
FROM node:24-alpine AS deps
WORKDIR /app
RUN command -v yarn >/dev/null 2>&1 || npm i -g yarn@1.22.22
COPY package.json yarn.lock .yarnrc ./
RUN yarn install --frozen-lockfile

# ---- build ------------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
RUN command -v yarn >/dev/null 2>&1 || npm i -g yarn@1.22.22
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# ---- runtime ----------------------------------------------------------------
FROM nginx:1.29-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
