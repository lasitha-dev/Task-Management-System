# User Management & Task Management Testing Guide

## 🔧 Fixed Issues (March 8, 2026)

### Issue 1: Login Redirect Using localhost
The frontend redirect URLs were using `localhost:3001` which caused IPv6 connection hangs on macOS.

**Solution**: Updated `LoginPage.jsx` and `RegisterPage.jsx` to use `http://127.0.0.1:3001`

### Issue 2: Task Frontend API Calls Failing  
The task-management frontend had `baseURL: '/'` which tried to call APIs on its own domain (127.0.0.1:3001) instead of the API Gateway (127.0.0.1:8000).

**Solution**: 
- ✅ Updated `axios.js` to use `VITE_API_URL` environment variable
- ✅ Modified `Dockerfile` to accept and use `VITE_API_URL` build arg
- ✅ Fixed `docker-compose.yml` to pass correct API Gateway URL
- ✅ Rebuilt and restarted both frontend containers

### Issue 3: Task Management Showing Mock User "Alex Morgan"
The task management frontend was displaying a hardcoded mock user instead of the actual logged-in user, and JWT tokens were missing user details.

**Problems**:
- JWT token only had `{id, role}` without name/email
- Task frontend used hardcoded "Alex Morgan" mock user
- Failed to load boards due to incorrect user context

**Solution**:
- ✅ Updated `generateToken()` to include name and email in JWT payload
- ✅ Updated all JWT token generation calls in `userService.js`
- ✅ Created `auth.js` utility to decode JWT on frontend
- ✅ Removed mock user code from task management frontend
- ✅ Frontend now reads real user from JWT token
- ✅ Added auto-redirect to login if no valid token found
- ✅ Rebuilt both user-management and task-frontend containers

**JWT Token Now Contains:**
```json
{
  "id": "user_id_here",
  "role": "User",
  "name": "Your Name",
  "email": "your@email.com",
  "iat": 1772910821,
  "exp": 1775502821  
}
```

---

## 🚀 How to Access the System

### **IMPORTANT: Always use 127.0.0.1, NOT localhost**

1. **User Management (Login/Register)**: http://127.0.0.1:3000
2. **Task Management Dashboard**: http://127.0.0.1:3001

---

## 👤 Test Accounts

### Existing Users in Database:

| Email | Password | Notes |
|-------|----------|-------|
| `pramod@gmail.com` | `password123` | Your account |
| `test@example.com` | `test123` | Test account |
| `gg@gmail.com` | Unknown | Created from frontend |
| `testnew@example.com` | `test123` | Just created |

---

## 🧪 Testing Steps

### 1. Test Login Flow

1. Open browser to: **http://127.0.0.1:3000**
2. Click "Log In" (or you'll be on login page by default)
3. Enter credentials:
   - Email: `pramod@gmail.com`
   - Password: `password123`
4. Click "Sign In"
5. **Expected**: You should be redirected to **http://127.0.0.1:3001** (Task Dashboard)

### 2. Test Registration Flow

1. Open browser to: **http://127.0.0.1:3000**
2. Click "Sign Up" or navigate to register page
3. Fill in the form:
   - Name: `Your Name`
   - Email: `yournew@email.com`
   - Password: `yourpassword`
   - Confirm Password: `yourpassword`
   - Check "I agree to Terms"
4. Click "Create Account"
5. **Expected**: Account created and redirected to **http://127.0.0.1:3001**

### 3. Check Browser Console (If Issues)

If login/register doesn't work:
1. Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools
2. Go to "Console" tab
3. Look for any red error messages
4. Check "Network" tab to see if API calls are failing

---

## 🔍 Verify Services Are Running

```bash
# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Should see:
# - user-frontend: Up, 127.0.0.1:3000->80/tcp
# - task-frontend: Up, 127.0.0.1:3001->80/tcp  
# - api-gateway: Up, 127.0.0.1:8000->8000/tcp
# - user-management: Up, 127.0.0.1:5001->5001/tcp
# - task-management: Up, 127.0.0.1:5002->5002/tcp
# - mern-mongodb: Up (healthy), 127.0.0.1:27017->27017/tcp
```

---

## 🛠️ Troubleshooting

### Issue: "Can't reach the page" or connection timeout

**Solution**: Make sure you're using `127.0.0.1` not `localhost`
- ❌ Wrong: `http://localhost:3000`
- ✅ Correct: `http://127.0.0.1:3000`

### Issue: "Invalid email or password"

**Solutions**:
1. Double-check you're using the correct credentials from the table above
2. Try creating a new account with the registration flow
3. Check database to see what users exist:
   ```bash
   docker exec -i mern-mongodb mongosh 'mongodb://admin:admin123@localhost:27017/user-management?authSource=admin' --quiet --eval 'db.users.find({}, {name: 1, email: 1})'
   ```

### Issue: Login works but no redirect

**Solution**: Clear browser cache and hard reload:
- Chrome/Safari: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (PC)
- Or use Incognito/Private window

### Issue: Frontend shows old version

**Solution**: Rebuild and restart frontend:
```bash
docker-compose build --no-cache user-frontend
docker-compose up -d user-frontend
```

---

## 📊 Service URLs Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| User Frontend | 3000 | http://127.0.0.1:3000 | Login/Register UI |
| Task Frontend | 3001 | http://127.0.0.1:3001 | Task Dashboard |
| API Gateway | 8000 | http://127.0.0.1:8000 | Routes all API requests |
| User Management | 5001 | http://127.0.0.1:5001 | User service (backend) |
| Task Management | 5002 | http://127.0.0.1:5002 | Task service (backend) |
| MongoDB | 27017 | mongodb://127.0.0.1:27017 | Database |

---

## 🔐 API Testing with curl

### Test Login
```bash
curl -X POST http://127.0.0.1:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pramod@gmail.com","password":"password123"}'
```

### Test Registration  
```bash
curl -X POST http://127.0.0.1:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"newuser@example.com","password":"test123"}'
```

### Check Health
```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:5001/health
curl http://127.0.0.1:5002/health
```

---

## ✅ Success Criteria

After successful login:
1. Browser redirects from `http://127.0.0.1:3000` → `http://127.0.0.1:3001`
2. Task Management Dashboard loads
3. JWT token stored in browser localStorage
4. User can see their tasks and boards

---

## 📝 Notes

- All services communicate through API Gateway (port 8000)
- JWT tokens expire after 30 days
- Database data persists in Docker volume `mongodb_data`
- Frontend is served by Nginx in production Docker containers
