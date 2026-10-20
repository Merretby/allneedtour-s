FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS dependencies
RUN npm ci

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
