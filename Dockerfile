# Builds the examples/react-app site (connectors.fuel.network) and serves it with nginx.
FROM node:20-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ git \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9.15.9

WORKDIR /app
COPY . .

ENV HUSKY=0
ENV CI=true
ENV DO_NOT_TRACK=1
ENV TURBO_TELEMETRY_DISABLED=1

RUN pnpm install --frozen-lockfile

ARG VITE_APP_WC_PROJECT_ID
ARG VITE_CHAIN_ID_NAME
ARG VITE_FUEL_PROVIDER_URL
ENV VITE_APP_WC_PROJECT_ID=$VITE_APP_WC_PROJECT_ID
ENV VITE_CHAIN_ID_NAME=$VITE_CHAIN_ID_NAME
ENV VITE_FUEL_PROVIDER_URL=$VITE_FUEL_PROVIDER_URL
ENV NODE_ENV=production

# Builds the connector packages first (turbo ^build), then the example app.
RUN pnpm exec turbo run build --filter=react-app

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/examples/react-app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
