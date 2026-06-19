# Etapa 1: instala dependências em camada separada para aproveitar cache.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm install --omit=dev

# Etapa 2: imagem final leve, sem ferramentas extras de build.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libstdc++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["sh", "-c", "node command.js migrate && node command.js seed && node web.js"]
