# Install production dependencies. npm itself never lands in the runtime image.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Fresh Alpine plus the node binary. The official node image also carries npm,
# yarn, and headers, and on this machine that image is 241MB. None of that is
# needed to run the server. Alpine still has a shell for the preStop hook.
FROM alpine:3.24 AS runtime
RUN apk add --no-cache libstdc++ \
  && addgroup -g 1000 -S node \
  && adduser -u 1000 -S node -G node
WORKDIR /app
COPY --from=deps /usr/local/bin/node /usr/local/bin/node
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
ENV NODE_ENV=production
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "src/server.js"]
