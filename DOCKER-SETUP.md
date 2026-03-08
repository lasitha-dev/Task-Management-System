# 🚀 TaskMaster - Integrated Microservices System

Complete microservices-based Task Management System with User Authentication, Task Management, Notifications, and Analytics.

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌────────────────────┐
│  User Frontend  │         │              │         │   Microservices    │
│   (Port 3000)   │────────▶│ API Gateway  │────────▶│                    │
└─────────────────┘         │  (Port 8000) │         │  • User Mgmt 5001  │
                            │              │         │  • Task Mgmt 5002  │
┌─────────────────┐         │   Rate       │         │  • Notification    │
│  Task Frontend  │────────▶│   Limiting   │         │    5003            │
│   (Port 3001)   │         │   Routing    │         │  • Reporting 5004  │
└─────────────────┘         │   Logging    │         └────────────────────┘
                            └──────────────┘                    │
                                                                ▼
                                                    ┌────────────────────┐
                                                    │  MongoDB Atlas     │
                                                    │  (Cloud Database)  │
                                                    └────────────────────┘
```

## ✨ Features

### 🔐 User Management
- User registration and login
- Google OAuth integration
- JWT authentication
- Role-based access control (Admin/User)
- Profile management

### 📋 Task Management
- Kanban board with drag-and-drop
- Multiple boards support
- Task CRUD operations
- Multi-assignee support
- Comments and activity tracking
- Time logging
- Priority levels (Low, Medium, High, Urgent)

### 🔔 Notifications (Coming Soon)
- Email alerts for task changes
- In-app notifications
- Deadline reminders

### 📊 Reporting & Analytics (Coming Soon)
- Task completion metrics
- User productivity insights
- Team performance analytics

---

## 🚀 Quick Start (One Command)

### Prerequisites
- Docker Desktop installed and running
- 8GB RAM minimum
- 10GB free disk space

### Start Everything

```bash
./start.sh
```

That's it! The script will:
1. ✅ Check Docker is running
2. 🏗️  Build all services
3. 🚀 Start all containers
4. 🔍 Verify health checks
5. 📱 Show access URLs

### Access the Applications

- **User Login**: http://localhost:3000
- **Task Dashboard**: http://localhost:3001
- **API Gateway**: http://localhost:8000

---

## 📦 Manual Docker Commands

### Start all services
```bash
docker-compose up --build -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-management
docker-compose logs -f task-management
docker-compose logs -f api-gateway
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove all data
```bash
docker-compose down -v
```

### Rebuild specific service
```bash
docker-compose build user-management
docker-compose up -d user-management
```

---

## 🔧 Development Setup (Without Docker)

### 1. Install Dependencies
```bash
# API Gateway
cd api-gateway && npm install

# User Management
cd user-management && npm install
cd user-management/frontend && npm install

# Task Management
cd task-management && npm install
cd task-management/frontend && npm install
```

### 2. Configure Environment Variables

Create `.env` files in each service directory (see `.env.example` files).

**Important**: JWT_SECRET must be the same across all services!

### 3. Start Services

```bash
# Terminal 1 - API Gateway
cd api-gateway && npm run dev

# Terminal 2 - User Management Backend
cd user-management && npm run dev

# Terminal 3 - Task Management Backend
cd task-management && npm run dev

# Terminal 4 - User Management Frontend
cd user-management/frontend && npm run dev

# Terminal 5 - Task Management Frontend
cd task-management/frontend && npm run dev
```

### Services will be available at:
- API Gateway: http://localhost:8000
- User Management: http://localhost:5001
- Task Management: http://localhost:5002
- User Frontend: http://localhost:3000
- Task Frontend: http://localhost:3001

---

## 🔑 Key Configuration

### Shared JWT Secret
All services MUST use the same JWT_SECRET for authentication to work across microservices.

**File**: `.env` (root directory)
```env
JWT_SECRET=4a071af79eaf92a78d3ab48a3f7b0770624e462a5e6c59440ad0630828b1eac9
JWT_EXPIRE=30d
```

### API Gateway Routing
- `/api/users/*` → User Management Service
- `/api/tasks/*` → Task Management Service
- `/api/boards/*` → Task Management Service
- `/api/notifications/*` → Notifications Service
- `/api/reports/*` → Reporting Service

---

## 🔄 User Flow

1. User opens http://localhost:3000 (User Management Frontend)
2. User registers/logs in
3. **Automatically redirected** to http://localhost:3001 (Task Management Dashboard)
4. JWT token is shared between applications
5. All API calls go through API Gateway (port 8000)

---

## 🗄️ Database

### MongoDB Databases (Separate per service)
- `user-management` - User accounts and authentication
- `task-management` - Tasks, boards, comments, activity
- `notifications-management` - Notification queue and history
- `reporting-analytics` - Analytics and reports cache

### Docker MongoDB
- Host: `localhost:27017`
- Username: `admin`
- Password: `admin123`

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Endpoint
```bash
TOKEN="your-jwt-token-here"
curl http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| User Management Frontend | 3000 | HTTP |
| Task Management Frontend | 3001 | HTTP |
| User Management Backend | 5001 | HTTP |
| Task Management Backend | 5002 | HTTP |
| Notifications Backend | 5003 | HTTP |
| Reporting Backend | 5004 | HTTP |
| API Gateway | 8000 | HTTP |
| MongoDB | 27017 | TCP |

---

## 🐛 Troubleshooting

### Port 5000 Conflict (macOS AirPlay)
macOS uses port 5000 for AirPlay Receiver. That's why we use port 8000 for the API Gateway.

To disable AirPlay Receiver:
```
System Settings → General → AirDrop & Handoff → Uncheck "AirPlay Receiver"
```

### Services Won't Start
```bash
# Check if ports are in use
lsof -ti:8000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:5002 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Clean Docker system
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### Can't Login After Restart
JWT tokens are valid for 30 days. If services use different JWT_SECRET values, authentication will fail. Verify all `.env` files use the same JWT_SECRET.

---

## 📁 Project Structure

```
Task-Management-System/
├── api-gateway/              # API Gateway (Port 8000)
├── user-management/          # User Service (Port 5001)
│   └── frontend/            # User Frontend (Port 3000)
├── task-management/          # Task Service (Port 5002)
│   └── frontend/            # Task Frontend (Port 3001)
├── notifications-management/ # Notifications (Port 5003)
├── reporting-analytics/      # Reporting (Port 5004)
├── docker-compose.yml       # Docker orchestration
├── start.sh                 # One-command startup
└── .env                     # Shared environment variables
```

---

## 🎯 Roadmap

- [x] User Authentication & Management
- [x] Task Management with Kanban Board
- [x] API Gateway with Rate Limiting
- [x] Docker Compose Setup
- [x] Integrated Authentication Flow
- [ ] Email Notifications
- [ ] In-app Notifications
- [ ] Reporting & Analytics Dashboard
- [ ] CI/CD Pipeline
- [ ] Cloud Deployment (AWS/Azure/GCP)

---

## 👥 Team

**SLIIT - SE4010 Assignment**
Faculty of Computing

---

## 📄 License

This project is for educational purposes as part of the CTSE module at SLIIT.

---

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs -f service-name`
2. Verify environment variables
3. Ensure all ports are available
4. Check MongoDB connection

---

**Happy Coding! 🚀**
