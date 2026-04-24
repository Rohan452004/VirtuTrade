FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches

# Install dev deps so patch-package exists for postinstall,
# then prune dev deps to keep the runtime image smaller.
RUN npm ci && npm prune --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

# Remove npm/npx toolchain from runtime image surface area.
RUN rm -rf /usr/local/lib/node_modules/npm && rm -f /usr/local/bin/npm /usr/local/bin/npx

EXPOSE 4000

CMD ["node", "index.js"]

