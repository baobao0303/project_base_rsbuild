# Multi-stage Dockerfile for Angular 18 Enterprise MFE (Rsbuild)
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Environment build argument (default: staging)
ARG APP_ENV=staging
ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=production

# Compile Host Shell and all Remote MFEs with Rsbuild
RUN npm run build:${APP_ENV}

# Stage 2: Runtime Web Server
FROM nginx:1.27-alpine

# Clean default nginx files
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy Host Shell as root SPA
COPY --from=builder /app/dist/apps/app-shell /usr/share/nginx/html

# Copy Remote MFEs into sub-paths for unified single-host serving
COPY --from=builder /app/dist/apps/mfe-crm /usr/share/nginx/html/crm
COPY --from=builder /app/dist/apps/mfe-cdp /usr/share/nginx/html/cdp

# Copy NGINX configuration with Module Federation CORS & routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
