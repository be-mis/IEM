# IEM System - Network Deployment Guide

## System Status Check ✅

### Configuration Summary
- **Machine IP**: `192.168.1.197`
- **Backend Port**: `3001`
- **Frontend Port**: `3020`
- **Backend API**: `http://192.168.1.197:3001/api`
- **Frontend URL**: `http://192.168.1.197:3020`

### Files Configured ✅
- ✅ `frontend/.env` - API base set to network IP
- ✅ `backend/.env` - Server IP and ports configured
- ✅ `backend/server.js` - CORS allows all network origins
- ✅ `backend/server.js` - Listens on `0.0.0.0` (all interfaces)

---

## Pre-Deployment Checklist

### 1. Verify Database is Running
```powershell
# Check if MySQL/MariaDB is running
Get-Service | Where-Object {$_.Name -like "*mysql*" -or $_.Name -like "*maria*"}

# If not running, start it
# Start-Service MySQL80  # or your MySQL service name
```

### 2. Verify Your Network IP
```powershell
ipconfig | Select-String "IPv4"
```
**Current IP**: `192.168.1.197`

If your IP changed, update these files:
- `frontend/.env` - Line with `REACT_APP_API_BASE`
- `backend/.env` - Lines with `SERVER_IP` and `FRONTEND_URL`

---

## Deployment Steps

### Step 1: Install Dependencies (First Time Only)

#### Backend Dependencies
```powershell
cd "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
npm install
```

#### Frontend Dependencies
```powershell
cd "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
npm install
```

### Step 2: Initialize Database (First Time or After Reset)

```powershell
cd "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
npm run migrate
```

**Expected Output:**
```
🚀 Starting migration process...
📋 Found X pending migration(s)
✅ Completed: 000_restore_item_exclusivity_from_sql.js
🎉 All migrations completed successfully!
```

### Step 3: Build Frontend for Production

```powershell
cd "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
npm run build
```

**Expected Output:**
```
Creating an optimized production build...
Compiled successfully.
The build folder is ready to be deployed.
```

### Step 4: Start Backend Server

**Option A - Production Mode (Recommended):**
```powershell
cd "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
npm start
```

**Option B - Development Mode (Auto-restart on changes):**
```powershell
cd "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://0.0.0.0:3001
📊 Environment: production
✅ Backend is ready to accept requests
```

**Keep this terminal open - backend must stay running!**

### Step 5: Serve Frontend

**Option A - Using serve package (Recommended for Testing):**
```powershell
# Install serve globally (first time only)
npm install -g serve

# Serve the built frontend
cd "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
serve -s build -l 3020
```

**Option B - Using http-server:**
```powershell
# Install http-server globally (first time only)
npm install -g http-server

# Serve the built frontend
cd "C:\Users\roland\Documents\Web System\IEM\IEM\frontend\build"
http-server -p 3020
```

**Expected Output:**
```
Serving!
- Local:            http://localhost:3020
- On Your Network:  http://192.168.1.197:3020
```

**Keep this terminal open - frontend server must stay running!**

---

## Access Instructions

### For You (On This Machine)
- **Frontend**: http://localhost:3020
- **Backend Health**: http://localhost:3001/health

### For Network Users (Other Machines on Same Network)
- **Frontend**: http://192.168.1.197:3020
- **Backend Health**: http://192.168.1.197:3001/health

---

## Quick Start Scripts

Save these for easy deployment:

### `start-backend.bat`
```batch
@echo off
echo Starting IEM Backend Server...
cd /d "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
npm start
pause
```

### `start-frontend.bat`
```batch
@echo off
echo Starting IEM Frontend Server...
cd /d "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
serve -s build -l 3020
pause
```

### `rebuild-and-start.bat`
```batch
@echo off
echo Rebuilding Frontend...
cd /d "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
call npm run build

echo Starting Frontend Server...
start "IEM Frontend" serve -s build -l 3020

echo Starting Backend Server...
cd /d "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
start "IEM Backend" npm start

echo.
echo ========================================
echo IEM System Started!
echo ========================================
echo Frontend: http://192.168.1.197:3020
echo Backend:  http://192.168.1.197:3001
echo ========================================
pause
```

---

## Testing Checklist

### 1. Backend Health Check
```powershell
# From this machine
curl http://localhost:3001/health

# From network (or browser)
# Visit: http://192.168.1.197:3001/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-12-05T...",
  "host": "192.168.1.197:3001"
}
```

### 2. Frontend Access Test
**From network machine browser:**
1. Go to: `http://192.168.1.197:3020`
2. Should see IEM login page

### 3. Registration Test
**From network machine:**
1. Click "Sign Up"
2. Fill form:
   - Username: `testuser`
   - Email: `test@everydayproductscorp.com`
   - Business Unit: Auto-selects EPC
   - Password: `test123`
   - Confirm Password: `test123`
   - Role: Employee
3. Click "Create Account"
4. Should redirect to login

**Check Browser DevTools Network Tab:**
- POST request should go to: `http://192.168.1.197:3001/api/auth/register`
- Status: `201 Created`

### 4. Login Test
**From network machine:**
1. Login with created credentials
2. Should see dashboard

### 5. Full Function Test

#### EPC Business Unit Functions:
- ✅ Dashboard - View stats
- ✅ Item Maintenance - Add/Edit/Delete items
- ✅ Store Maintenance - Add/Edit/Delete stores, Mass upload
- ✅ Exclusivity Form - Submit exclusivity matrix
- ✅ Audit Logs - View history
- ✅ User Management - (Admin only) Manage users

#### NBFI Business Unit Functions:
- ✅ Dashboard - View stats
- ✅ Item Maintenance - Add/Edit/Delete items with brands
- ✅ Store Maintenance - Add/Edit/Delete stores by chain
- ✅ Exclusivity Form - Per-chain exclusivity
- ✅ Audit Logs - View history
- ✅ User Management - (Admin only) Manage users

---

## Troubleshooting

### Issue: "Network Error" or "ERR_CONNECTION_REFUSED"

**Solution:**
1. Check if backend is running:
   ```powershell
   curl http://localhost:3001/health
   ```
2. Check Windows Firewall:
   ```powershell
   # Allow Node.js through firewall
   New-NetFirewallRule -DisplayName "IEM Backend" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
   ```

### Issue: "CORS Error" in Browser Console

**Solution:**
- Backend `server.js` already allows all `192.168.x.x` origins
- Verify frontend is accessing correct API URL in DevTools Network tab

### Issue: Frontend shows blank page

**Solution:**
1. Check browser console for errors
2. Rebuild frontend:
   ```powershell
   cd "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
   npm run build
   ```
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Database connection failed

**Solution:**
1. Check MySQL service is running
2. Verify `backend/.env` database credentials:
   - DB_HOST=localhost
   - DB_USER=root
   - DB_PASSWORD=(your password)
   - DB_NAME=item_exclusivity

### Issue: IP Address Changed

**When your machine IP changes:**
1. Find new IP:
   ```powershell
   ipconfig | Select-String "IPv4"
   ```
2. Update these files with new IP:
   - `frontend/.env` → `REACT_APP_API_BASE`
   - `backend/.env` → `SERVER_IP` and `FRONTEND_URL`
3. Rebuild frontend:
   ```powershell
   cd frontend
   npm run build
   ```
4. Restart both servers

---

## Default Admin Account

**For first-time access:**
- Username: `admin`
- Password: `admin123` (Change immediately after login)
- Business Unit: NBFI or EPC (check database)

If admin doesn't exist, create via SQL:
```sql
INSERT INTO users (username, email, password, role, business_unit, is_active)
VALUES ('admin', 'admin@iem.com', '$2a$10$U95EQBbkwSkFsZn66oGLdeSYEUWlXph5ma/NGtqaDPt6RCYb7BvIS', 'admin', 'EPC', TRUE);
```

---

## Firewall Configuration

### Windows Firewall Rules (Run as Administrator)

```powershell
# Allow Backend Port 3001
New-NetFirewallRule -DisplayName "IEM Backend API" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow

# Allow Frontend Port 3020
New-NetFirewallRule -DisplayName "IEM Frontend Web" -Direction Inbound -LocalPort 3020 -Protocol TCP -Action Allow
```

---

## Production Deployment Notes

### Security Checklist Before Production:
- [ ] Change `JWT_SECRET` in `backend/.env`
- [ ] Set strong database password
- [ ] Disable MySQL remote access (keep localhost only)
- [ ] Create non-root database user
- [ ] Change default admin password
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Review and limit CORS origins in `server.js`

### Performance Optimization:
- [ ] Use PM2 to manage backend process
- [ ] Use Nginx to serve frontend static files
- [ ] Enable gzip compression
- [ ] Configure database connection pooling
- [ ] Set up database backups

---

## Support & Maintenance

### View Backend Logs
```powershell
# If using PM2
pm2 logs IEM-backend

# If running directly
# Check the terminal where backend is running
```

### Database Backup
```powershell
# Backup database
mysqldump -u root -p item_exclusivity > backup_$(Get-Date -Format "yyyy-MM-dd_HHmmss").sql

# Restore database
mysql -u root -p item_exclusivity < backup_2025-12-05_120000.sql
```

### Update Application
```powershell
# Pull latest code
git pull origin main

# Update dependencies
cd backend
npm install
cd ../frontend
npm install

# Run migrations (if any new)
cd ../backend
npm run migrate

# Rebuild frontend
cd ../frontend
npm run build

# Restart servers
```

---

## Quick Reference

| Component | Port | URL |
|-----------|------|-----|
| Backend API | 3001 | http://192.168.1.197:3001 |
| Frontend Web | 3020 | http://192.168.1.197:3020 |
| Backend Health | 3001 | http://192.168.1.197:3001/health |
| API Auth | 3001 | http://192.168.1.197:3001/api/auth/* |
| API Inventory | 3001 | http://192.168.1.197:3001/api/inventory/* |

---

**System Status**: ✅ READY FOR DEPLOYMENT

**Last Updated**: December 5, 2025
