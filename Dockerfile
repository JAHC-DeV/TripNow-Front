# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build production
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar http-server para servir la aplicación
RUN npm install -g http-server

# Copiar dist del builder
COPY --from=builder /app/dist/TripNow-Front/browser ./dist

# Exponer puerto
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4200 || exit 1

# Comando de inicio
CMD ["http-server", "dist", "-p", "4200", "--cors"]
