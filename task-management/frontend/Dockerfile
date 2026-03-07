# Build stage
FROM node:20-alpine AS builder

# Build argument for API URL
ARG VITE_API_URL=http://127.0.0.1:8000
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (need ALL deps including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
