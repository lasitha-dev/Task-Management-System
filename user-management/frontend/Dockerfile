# Build stage
FROM node:20-alpine AS builder

WORKDIR /workspace/user-management/frontend

# Accept build argument for API URL
ARG VITE_API_URL=http://127.0.0.1:8000/api/users
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy package files
COPY user-management/frontend/package*.json ./
COPY shared-ui /workspace/shared-ui

# Install dependencies
RUN npm ci

# Copy source code
COPY user-management/frontend ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /workspace/user-management/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY user-management/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
