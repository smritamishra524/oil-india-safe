# Multi-stage Dockerfile for OIL India Safe-X Unified Service
# Stage 1: Build the Vite frontend application
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Python runtime serving both ML API & Built Frontend
FROM python:3.11-slim AS runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ml_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, models, and data
COPY ml_service /app/ml_service
COPY src/data /app/src/data

# Copy built frontend assets from Stage 1 into /app/dist
COPY --from=frontend-builder /build/dist /app/dist

ENV PYTHONPATH=/app
ENV PORT=10000

EXPOSE 10000

CMD ["sh", "-c", "uvicorn ml_service.app:app --host 0.0.0.0 --port ${PORT:-10000}"]
