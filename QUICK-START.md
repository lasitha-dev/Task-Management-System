# 🚀 Quick Start - One Command Setup

## ✨ Run Everything with ONE Command

### **Option 1: Using the startup script**
```bash
./start.sh
```

### **Option 2: Using npm**
```bash
npm start
```

That's it! The script will automatically:
- ✅ Install all dependencies for all services
- ✅ Start API Gateway
- ✅ Start User Management backend
- ✅ Start Task Management backend
- ✅ Start User Management frontend
- ✅ Start Task Management frontend

---

## 🎯 What Happens Automatically?

1. **Checks Node.js** - Ensures you have Node.js v18+
2. **Installs Dependencies** - Runs `npm install` in all service directories (only if needed)
3. **Starts Services** - Launches all 5 services in the background
4. **Health Checks** - Verifies all services are running
5. **Shows URLs** - Displays access points

---

## 🌐 Access the Application

After starting (wait ~15 seconds for initialization):

| Service | URL |
|---------|-----|
| **Login Page** | http://localhost:3000 |
| **Task Dashboard** | http://localhost:3001 |
| **API Gateway** | http://localhost:8000 |

### Test Credentials:
- **Email:** `pramod@gmail.com`
- **Password:** `password123`

---

## 🛑 Stop All Services

```bash
./dev-stop.sh
```

Or:
```bash
npm stop
```

---

## 📊 View Logs

All service logs are saved in the `logs/` directory:

```bash
# View specific service logs
tail -f logs/api-gateway.log
tail -f logs/user-management.log
tail -f logs/task-management.log
tail -f logs/user-management-frontend.log
tail -f logs/task-management-frontend.log

# View all logs
tail -f logs/*.log
```

---

## 🔄 Restart Services

```bash
./dev-stop.sh && ./start.sh
```

Or:
```bash
npm stop && npm start
```

---

## 🐳 Docker Mode (Alternative)

If you prefer to use Docker and it's running:

```bash
# Start with Docker
npm run docker:start

# View Docker logs
npm run docker:logs

# Stop Docker services
npm run docker:stop
```

---

## 🔧 Manual Installation (if needed)

If you want to install dependencies manually first:

```bash
npm run install:all
```

Then start:
```bash
npm start
```

---

## ❓ Troubleshooting

### Services not starting?
```bash
# Stop everything first
./dev-stop.sh

# Check if ports are in use
lsof -i :3000 -i :3001 -i :5001 -i :5002 -i :8000

# Restart
./start.sh
```

### Dependencies not installing?
```bash
# Clear all node_modules and reinstall
npm run install:all
```

### Still having issues?
Check the logs:
```bash
ls -la logs/
cat logs/[service-name].log
```

---

## 🎉 That's It!

**One command. All services running. Start building!**

```bash
./start.sh
```
