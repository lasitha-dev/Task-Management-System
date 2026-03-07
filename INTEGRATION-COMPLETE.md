# 🎯 TaskMaster - Complete Integration Guide

## ✅ What Has Been Configured

### 1. **Unified JWT Authentication** ✅
- **Same JWT_SECRET** across all services: `4a071af79eaf92a78d3ab48a3f7b0770624e462a5e6c59440ad0630828b1eac9`
- JWT tokens work seamlessly between User Management and Task Management
- 30-day token validity

### 2. **Automatic Login Redirect** ✅
- After successful login → **Automatically redirected to Task Management Dashboard (port 3001)**
- After registration → **Automatically redirected to Task Management Dashboard (port 3001)**
- Google OAuth login → **Also redirects to Task Management Dashboard**

### 3. **API Gateway Integration** ✅
- **Port 8000** (avoiding macOS AirPlay conflict on port 5000)
- All frontend API calls route through API Gateway
- Rate limiting: 100 requests per 15 minutes per IP
- Request logging enabled

### 4. **Docker Compose Setup** ✅
- **One-command deployment**: `./start.sh` or `docker-compose up --build -d`
- All 5 backend services
- Both frontends (User Management & Task Management)
- MongoDB with health checks
- Automatic service dependencies
- Shared environment variables

---

## 🚀 Quick Start Options

### Option 1: Development Mode (5 Terminals)

#### Terminal 1 - API Gateway
```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System/api-gateway
npm run dev
```

#### Terminal 2 - User Management Backend
```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System/user-management
npm run dev
```

#### Terminal 3 - Task Management Backend
```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System/task-management
npm run dev
```

#### Terminal 4 - User Management Frontend
```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System/user-management/frontend
npm run dev
```

#### Terminal 5 - Task Management Frontend
```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System/task-management/frontend
npm run dev
```

---

### Option 2: Docker (One Command) 🐳

```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System
./start.sh
```

**Or manually:**
```bash
docker-compose up --build -d
docker-compose logs -f  # View logs
```

---

## 🔄 Complete User Flow

1. **User opens**: http://localhost:3000 (User Management)
2. **User registers** or **logs in**
3. **✨ Automatically redirected** to: http://localhost:3001 (Task Management Dashboard)
4. **JWT token shared** - User is authenticated in Task Management
5. **All API calls** go through API Gateway (port 8000)

---

## 📊 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER EXPERIENCE                               │
│                                                                   │
│  1. Login at http://localhost:3000                               │
│  2. Auto-redirect to http://localhost:3001                       │
│  3. JWT token persists across both apps                          │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                                 │
│  ┌──────────────────────┐       ┌──────────────────────┐        │
│  │  User Management UI  │       │  Task Management UI  │        │
│  │    (Port 3000)       │       │    (Port 3001)       │        │
│  │   React + Vite       │       │   React + Vite       │        │
│  └──────────┬───────────┘       └──────────┬───────────┘        │
└─────────────┼──────────────────────────────┼────────────────────┘
              │                              │
              │  /api/users/*               │  /api/tasks/*
              │  /api/boards/*              │
              └──────────┬───────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Port 8000)                        │
│  • Rate Limiting (100 req/15min)                                 │
│  • Request Logging                                               │
│  • Route Management                                              │
│  • CORS Handling                                                 │
└───────┬────────────────────┬────────────────────┬────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Mgmt    │    │ Task Mgmt    │    │ Notifications│
│ (Port 5001)  │    │ (Port 5002)  │    │ (Port 5003)  │
│              │    │              │    │              │
│ JWT_SECRET ──┼────┤ JWT_SECRET   │    │ JWT_SECRET   │
│  (SAME KEY)  │    │  (SAME KEY)  │    │  (SAME KEY)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                ┌────────────────────┐
                │   MongoDB Atlas    │
                │  (Cloud Database)  │
                └────────────────────┘
```

---

## 🔑 Key Configuration Files

### All Services Use Same JWT Secret

**user-management/.env**
```env
JWT_SECRET=4a071af79eaf92a78d3ab48a3f7b0770624e462a5e6c59440ad0630828b1eac9
JWT_EXPIRE=30d
```

**task-management/.env** ✅ **UPDATED**
```env
JWT_SECRET=4a071af79eaf92a78d3ab48a3f7b0770624e462a5e6c59440ad0630828b1eac9
JWT_EXPIRE=30d
```

### Login Redirects to Task Dashboard

**user-management/frontend/src/pages/LoginPage.jsx** ✅ **UPDATED**
```javascript
// After successful login
window.location.href = 'http://localhost:3001';
```

**user-management/frontend/src/pages/RegisterPage.jsx** ✅ **UPDATED**
```javascript
// After successful registration
window.location.href = 'http://localhost:3001';
```

---

## 🧪 Testing the Integration

### 1. Start All Services (Development)

Open 5 terminals and run each service as shown in "Quick Start Option 1" above.

### 2. Test Login Flow

1. **Open browser**: http://localhost:3000
2. **Register** a new account or **Login** with:
   - Email: `testuser@example.com`
   - Password: `password123`
3. **You should be automatically redirected** to: http://localhost:3001
4. **You should see the Task Management Dashboard** with your boards

### 3. Verify API Gateway

All API calls should go through port 8000:
```bash
# Check API Gateway health
curl http://localhost:8000/health

# Test registration through gateway
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'

# Test task creation through gateway (with JWT token)
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"todo"}'
```

---

## 🐳 Docker Deployment

### Build and Start
```bash
cd /Users/pramodwijenayake/Desktop/Task-Management-System
docker-compose up --build -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-management
docker-compose logs -f task-management
docker-compose logs -f api-gateway
```

### Check Status
```bash
docker-compose ps
```

### Stop All
```bash
docker-compose down
```

### Complete Reset (Remove all data)
```bash
docker-compose down -v
```

---

## 📝 Port Reference

| Service | Port | URL |
|---------|------|-----|
| **User Frontend** | 3000 | http://localhost:3000 |
| **Task Frontend** | 3001 | http://localhost:3001 |
| **API Gateway** | 8000 | http://localhost:8000 |
| User Management | 5001 | http://localhost:5001 |
| Task Management | 5002 | http://localhost:5002 |
| Notifications | 5003 | http://localhost:5003 |
| Reporting | 5004 | http://localhost:5004 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## ✨ What's Integrated

- ✅ **User Authentication** - Register, Login, Google OAuth
- ✅ **JWT Token Sharing** - Same secret across services
- ✅ **Automatic Redirect** - Login → Task Dashboard
- ✅ **API Gateway** - All requests route through port 8000
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Request Logging** - All API calls logged
- ✅ **Docker Setup** - One-command deployment
- ✅ **Health Checks** - All services monitored
- ✅ **CORS Enabled** - Cross-origin requests work
- ✅ **MongoDB Atlas** - Cloud database configured

---

## 🎯 Next Steps

1. **Start all 5 services** (see Quick Start options above)
2. **Open** http://localhost:3000
3. **Login** and watch the automatic redirect to Task Dashboard
4. **Create boards and tasks** in the integrated system
5. **Deploy with Docker** using `./start.sh`

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Kill all processes on required ports
lsof -ti:8000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:5002 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### JWT authentication fails
- Verify JWT_SECRET is the same in both `.env` files
- Check console for 401 errors
- Verify token is being sent in Authorization header

### Docker issues
```bash
# Clean everything
docker-compose down -v
docker system prune -a
docker-compose up --build --force-recreate
```

---

## 🎉 Success Criteria

You know integration is working when:
- ✅ You can login at port 3000
- ✅ You're automatically redirected to port 3001
- ✅ You see the Task Management Dashboard
- ✅ You can create boards and tasks
- ✅ All API calls go through port 8000
- ✅ JWT token works across both applications

---

**Integration Complete! 🚀**

Ready for Docker deployment with one command: `./start.sh`
