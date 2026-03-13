# Quick Start Guide

## Development Mode (5 Terminals Required)

### Terminal 1 - API Gateway
```bash
cd api-gateway && npm run dev
```

### Terminal 2 - User Management
```bash
cd user-management && npm run dev
```

### Terminal 3 - Task Management
```bash
cd task-management && npm run dev
```

### Terminal 4 - Notifications Management
```bash
cd notifications-management && npm run dev
```

### Terminal 5 - User Frontend
```bash
cd user-management/frontend && npm run dev
```

### Terminal 6 - Task Frontend
```bash
cd task-management/frontend && npm run dev
```

### Terminal 7 - Notifications Frontend
```bash
cd notifications-management/frontend && npm run dev
```

---

## Docker Mode (One Command)

```bash
./start.sh
```

**Or:**
```bash
docker-compose up --build -d
docker-compose logs -f
```

---

## Access Points
- **Login**: http://localhost:3000
- **Dashboard**: http://localhost:3001 (auto-redirects after login)
- **Notifications**: http://localhost:3002
- **API Gateway**: http://localhost:8000

---

## Test User
- Email: `testuser@example.com`
- Password: `password123`
