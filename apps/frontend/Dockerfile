# Build context is the monorepo root (see docker-compose.yml), since npm
# workspaces need the root package.json/lockfile to resolve correctly.
#
# VITE_GRAPHQL_URI is a *build* ARG, not a runtime env var — Vite inlines
# import.meta.env.* into the static JS bundle at build time, so it has to be
# known before `vite build` runs, not when the container starts.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --workspace=frontend
COPY apps/frontend apps/frontend

ARG VITE_GRAPHQL_URI=http://localhost:3000/graphql
ENV VITE_GRAPHQL_URI=$VITE_GRAPHQL_URI
RUN npm run build --workspace=frontend

FROM nginx:alpine AS production
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
