# --- Estágio 1: Dependências de produção ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./

# Instala apenas dependências de runtime de forma determinística.
RUN npm ci --omit=dev

COPY . .

# --- Estágio 2: Produção ---
FROM node:22-alpine

WORKDIR /app

COPY --from=build /app .

ENV NODE_ENV=production

EXPOSE 3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# A API serve uploads a partir de /app/uploads (ver src/routes/index.js).
RUN mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app/uploads /app

USER appuser

CMD ["npm", "start"]