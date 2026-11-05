# ---- build stage ----
FROM node:26-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runtime ----
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Container sengaja berjalan sebagai UID 1000 (pemilik file di host),
# supaya bisa menulis gambar hasil upload admin ke folder aset
# yang di-mount dari host tanpa chmod 777 dan tanpa mengubah kepemilikan file.
RUN mkdir -p /app/.next/cache && chown -R 1000:1000 /app

USER 1000:1000
EXPOSE 3000
CMD ["node", "server.js"]
