# 🚀 Task Management System - Complete Setup Guide

## 📋 Table of Contents
- [Current Development Setup](#current-development-setup)
- [Docker Production Setup](#docker-production-setup)
- [Microservices Integration](#microservices-integration)
- [API Gateway Configuration](#api-gateway-configuration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Current Development Setup

### Prerequisites
```bash
- Node.js v18+ 
- MongoDB v6+ (local or Atlas)
- npm or yarn
```

### 1️⃣ Start MongoDB
```bash
# Option A: Local MongoDB
brew services start mongodb-community

# Option B: Docker MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option C: MongoDB Atlas (use connection string)
```

### 2️⃣ Setup Task Management Service

```bash
# Navigate to task-management folder
cd task-management

# Create .env file
cat > .env << 'EOF'
PORT=5002
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
EOF

# Install dependencies
npm install

# Start backend server
npm start
```

✅ **Backend running at**: http://localhost:5002

### 3️⃣ Setup Frontend

```bash
# Open new terminal
cd task-management/frontend

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5002
EOF

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ **Frontend running at**: http://localhost:3000

### 4️⃣ Verify Setup
```bash
# Check backend health
curl http://localhost:5002/health

# Expected response:
# {"status":"OK","service":"task-management"}
```

---

## 🐳 Docker Production Setup

> **Use this when all 4 microservices are complete**

### Prerequisites
```bash
- Docker 20+
- Docker Compose 2+
```

### 1️⃣ Project Structure
Ensure your project structure looks like this:

```
Task-Management-System/
├── api-gateway/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── user-management/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── task-management/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── frontend/
│       ├── Dockerfile
│       ├── nginx.conf
│       └── src/
├── notifications-management/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── reporting-analytics/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── docker-compose.yml
├── .env
└── README.md
```

### 2️⃣ Create Root .env File

```bash
# Navigate to project root
cd Task-Management-System

# Create .env file
cat > .env << 'EOF'
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRE=7d

# Email Configuration (for notifications)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Environment
NODE_ENV=production
EOF
```

### 3️⃣ Build and Start All Services

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f task-management
```

### 4️⃣ Verify All Services

```bash
# Check all containers are running
docker-compose ps

# Health checks
curl http://localhost:5000/health  # API Gateway
curl http://localhost:5001/health  # User Management
curl http://localhost:5002/health  # Task Management
curl http://localhost:5003/health  # Notifications
curl http://localhost:5004/health  # Reporting

# Access frontend
open http://localhost:3000
```

### 5️⃣ Service Ports

| Service                  | Port | URL                        |
|--------------------------|------|----------------------------|
| Frontend                 | 3000 | http://localhost:3000      |
| API Gateway              | 5000 | http://localhost:5000      |
| User Management          | 5001 | http://localhost:5001      |
| Task Management          | 5002 | http://localhost:5002      |
| Notifications Management | 5003 | http://localhost:5003      |
| Reporting Analytics      | 5004 | http://localhost:5004      |
| MongoDB                  | 27017| mongodb://localhost:27017  |

### 6️⃣ Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v

# Restart a specific service
docker-compose restart task-management

# Rebuild a specific service
docker-compose build task-management
docker-compose up -d task-management

# View resource usage
docker stats

# Enter a container shell
docker exec -it task-management sh

# Clear everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔗 Microservices Integration

### Communication Flow

```
User Browser
    ↓
Frontend (React) :3000
    ↓
API Gateway :5000  ←── Single entry point
    ↓
    ├──→ User Management :5001      (Auth, Users)
    ├──→ Task Management :5002      (Tasks, Boards)
    ├──→ Notifications :5003        (Emails, Alerts)  
    └──→ Reporting Analytics :5004  (Reports, Stats)
         ↓
    MongoDB :27017  ←── Shared database
```

### API Gateway Routes Configuration

Create this file: `api-gateway/src/config/proxyConfig.js`

```javascript
module.exports = {
  routes: [
    {
      path: '/api/auth',
      target: process.env.USER_SERVICE_URL || 'http://localhost:5001',
      changeOrigin: true,
      description: 'Authentication routes'
    },
    {
      path: '/api/users',
      target: process.env.USER_SERVICE_URL || 'http://localhost:5001',
      changeOrigin: true,
      description: 'User management routes'
    },
    {
      path: '/api/tasks',
      target: process.env.TASK_SERVICE_URL || 'http://localhost:5002',
      changeOrigin: true,
      description: 'Task management routes'
    },
    {
      path: '/api/boards',
      target: process.env.TASK_SERVICE_URL || 'http://localhost:5002',
      changeOrigin: true,
      description: 'Board management routes'
    },
    {
      path: '/api/notifications',
      target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003',
      changeOrigin: true,
      description: 'Notification routes'
    },
    {
      path: '/api/reports',
      target: process.env.REPORTING_SERVICE_URL || 'http://localhost:5004',
      changeOrigin: true,
      description: 'Reporting and analytics routes'
    }
  ]
}
```

### Update Frontend API Configuration

Update `task-management/frontend/src/api/axios.js`:

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',  // API Gateway
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
```

---

## 📝 Environment Variables

### Development (.env files per service)

**user-management/.env**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/user-management
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

**task-management/.env**
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-secret-key
NODE_ENV=development
USER_SERVICE_URL=http://localhost:5001
```

**notifications-management/.env**
```env
PORT=5003
MONGODB_URI=mongodb://localhost:27017/notifications-management
JWT_SECRET=your-secret-key
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**reporting-analytics/.env**
```env
PORT=5004
MONGODB_URI=mongodb://localhost:27017/reporting-analytics
JWT_SECRET=your-secret-key
NODE_ENV=development
TASK_SERVICE_URL=http://localhost:5002
```

### Production (docker-compose.yml)
All environment variables are centralized in the root `.env` file and injected via docker-compose.

---

## 🔍 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Test connection
mongosh mongodb://admin:admin123@localhost:27017 --authenticationDatabase admin

# View MongoDB logs
docker logs mongodb
```

### Service Not Starting

```bash
# Check service logs
docker-compose logs service-name

# Common issues:
# 1. Port already in use
lsof -ti:5002 | xargs kill -9

# 2. Permission issues
sudo chown -R $USER:$USER .

# 3. Rebuild without cache
docker-compose build --no-cache service-name
```

### Frontend Not Connecting to Backend

```bash
# 1. Check API URL in frontend .env
cat task-management/frontend/.env

# 2. Check network connectivity
docker network inspect task-management-system_mern-network

# 3. Test API endpoint
curl http://localhost:5000/api/tasks
```

### Clear All Docker Data

```bash
# ⚠️ Warning: This deletes everything!
docker-compose down -v
docker system prune -a --volumes
docker volume prune
```

---

## 🎯 Quick Commands

### Development Mode
```bash
# Terminal 1: MongoDB
brew services start mongodb-community

# Terminal 2: Backend
cd task-management && npm start

# Terminal 3: Frontend  
cd task-management/frontend && npm run dev
```

### Production Mode (Docker)
```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart task-management
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🤝 Support

For issues or questions:
1. Check logs: `docker-compose logs -f service-name`
2. Verify environment variables
3. Ensure all ports are available
4. Check MongoDB connection

---

**Happy Coding! 🚀**
