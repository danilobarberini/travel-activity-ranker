# Build context is the monorepo root (see docker-compose.yml), since npm
# workspaces need the root package.json/lockfile to resolve correctly.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --workspace=backend
COPY apps/backend apps/backend
RUN npm run build --workspace=backend

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --workspace=backend --omit=dev
COPY --from=build /app/apps/backend/dist apps/backend/dist

EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
