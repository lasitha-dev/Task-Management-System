# 🚀 API Gateway Integration - Quick Start Guide

## ✅ What Was Configured

### 1. **API Gateway Proxy Routes** (`api-gateway/src/config/proxyConfig.js`)
Added routing for all microservices:
- `/api/users` → User Management Service (Port 5001)
- `/api/tasks` → Task Management Service (Port 5002)
- `/api/boards` → Task Management Service (Port 5002) ✨ NEW
- `/api/notifications` → Notifications Service (Port 5003)
- `/api/reports` → Reporting Service (Port 5004)

### 2. **Frontend Vite Proxy** (`task-management/frontend/vite.config.js`)
Changed from direct connection to API Gateway:
- ❌ OLD: `http://localhost:5002` (direct to task-management)
- ✅ NEW: `http://localhost:5000` (through API Gateway)

### 3. **Environment Files**
Created configuration files:
- `api-gateway/.env` - Microservice URLs
- `task-management/frontend/.env` - API Gateway reference

---

## 🏗️ Architecture Flow

```
┌─────────────┐         ┌─────────────┐         ┌──────────────────┐
│   Frontend  │         │ API Gateway │         │  Microservices   │
│  (Port 3000)│  ────>  │ (Port 5000) │  ────>  │  (Port 5001-5004)│
└─────────────┘         └─────────────┘         └──────────────────┘
     React/Vite          Rate Limiting           - User Management
                         Request Routing         - Task Management
                         Centralized Entry       - Notifications
                                                  - Reporting
```

---

## 🚀 How to Run

### **Step 1: Start MongoDB** (if not running)
```bash
# Option A: Local MongoDB
brew services start mongodb-community

# Option B: Docker MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Option C: MongoDB Atlas (already configured in .env)
```

### **Step 2: Start API Gateway**
```bash
cd api-gateway
npm install  # if first time
npm start    # or npm run dev for auto-reload
```
✅ API Gateway running at: http://localhost:5000

### **Step 3: Start Task Management Service**
```bash
cd task-management
npm start    # or npm run dev
```
✅ Task Management running at: http://localhost:5002

### **Step 4: Start Frontend**
```bash
cd task-management/frontend
npm install  # if first time
npm run dev
```
✅ Frontend running at: http://localhost:3000

---

## 🧪 Testing the Integration

### **Test 1: API Gateway Health Check**
```bash
curl http://localhost:5000/health
```
Expected response:
```json
{"status":"OK","service":"api-gateway"}
```

### **Test 2: Task Management via Gateway**
```bash
# Get all tasks through API Gateway
curl http://localhost:5000/api/tasks

# Get all boards through API Gateway
curl http://localhost:5000/api/boards
```

### **Test 3: Direct Service Access (for comparison)**
```bash
# Direct to task-management (bypassing gateway)
curl http://localhost:5002/api/tasks
```

### **Test 4: Frontend Integration**
1. Open browser: http://localhost:3000
2. Open browser DevTools (F12) → Network tab
3. Create or interact with tasks
4. Verify requests go to `/api/tasks` and `/api/boards`
5. Check Vite proxy forwards them to port 5000 (API Gateway)

---

## 🔍 Verification Checklist

- [ ] API Gateway running on port 5000
- [ ] Task Management Service running on port 5002
- [ ] Frontend running on port 3000
- [ ] MongoDB accessible (local or Atlas)
- [ ] Frontend can load tasks/boards
- [ ] Browser DevTools shows requests to `/api/*`
- [ ] No CORS errors in console
- [ ] API Gateway logs show incoming requests

---

## 📊 Request Flow Example

When you create a task in the frontend:

1. **Frontend** (`localhost:3000`)
   ```javascript
   POST /api/tasks
   Body: { title: "New Task", status: "todo" }
   ```

2. **Vite Proxy** (automatically forwards to `localhost:5000`)
   ```
   POST http://localhost:5000/api/tasks
   ```

3. **API Gateway** (`localhost:5000`)
   - Applies rate limiting
   - Logs request
   - Routes to task-management service
   ```
   POST http://localhost:5002/api/tasks
   ```

4. **Task Management Service** (`localhost:5002`)
   - Validates request
   - Saves to MongoDB
   - Returns response

5. **Response flows back** through gateway to frontend

---

## 🐛 Troubleshooting

### **Frontend shows "Network Error"**
- ✅ Check if API Gateway is running on port 5000
- ✅ Check if Task Management is running on port 5002
- ✅ Check browser DevTools for CORS errors

### **API Gateway can't connect to services**
- ✅ Verify `api-gateway/.env` has correct service URLs
- ✅ Ensure all services are running on expected ports
- ✅ Check API Gateway logs for connection errors

### **Port already in use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5002
lsof -ti:5002 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 🎯 Next Steps

1. **Start all three services** (Gateway, Task Service, Frontend)
2. **Test task creation** through the frontend
3. **Monitor API Gateway logs** to see proxied requests
4. **Add other microservices** (User Management, Notifications, Reporting)
5. **Update their frontends** to use the API Gateway

---

## 📝 Notes

- **Development Mode**: Services communicate via `localhost`
- **Production Mode**: Docker Compose handles service discovery
- **Authentication**: JWT tokens are passed through the gateway
- **Rate Limiting**: Configured in API Gateway middleware
- **Logging**: All requests are logged by the gateway

---

## 🔐 Security Features in API Gateway

- ✅ CORS enabled for frontend origin
- ✅ Rate limiting (prevents abuse)
- ✅ Request logging (audit trail)
- ✅ Centralized authentication point
- ✅ Service isolation (frontend doesn't know backend structure)

---

**Ready to scale!** 🚀 All microservices now communicate through a unified entry point.
