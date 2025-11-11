# Production Deployment Guide - IEM System

## Overview
This guide will help you deploy the IEM System for production use on your network.

---

## Pre-Deployment Checklist

### ✅ Configuration Updates Made:
- [x] `NODE_ENV=production` set in backend `.env`
- [x] Strong JWT secret generated
- [x] Frontend API URL set to network IP: `http://192.168.0.138:5000/api`
- [x] Email configured with Brevo SMTP
- [x] Frontend URL for password reset: `http://192.168.0.138:3000`

---

## Deployment Steps

### Step 1: Build Frontend for Production

```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\frontend"
npm run build
```

This creates an optimized production build in the `build/` folder.

### Step 2: Install Production Dependencies (Backend)

```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
npm install --production
```

### Step 3: Ensure Database is Ready

```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
node migrations/migrate.js
```

### Step 4: Start Backend Server

**Option A: Using Node (Simple)**
```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
node server.js
```

**Option B: Using PM2 (Recommended - Auto-restart)**
```bash
npm install -g pm2
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
pm2 start server.js --name iem-backend
pm2 save
pm2 startup
```

### Step 5: Serve Frontend

**Option A: Using serve package (Recommended)**
```bash
npm install -g serve
cd "c:\Users\roland\Documents\Web System\IEM\IEM\frontend"
serve -s build -l 3000
```

**Option B: Using PM2**
```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\frontend"
pm2 serve build 3000 --name iem-frontend --spa
pm2 save
```

---

## Access URLs

After deployment, users can access:

- **Frontend:** http://192.168.0.138:3000
- **Backend API:** http://192.168.0.138:5000/api
- **Health Check:** http://192.168.0.138:5000/health

---

## Production Features Enabled

### ✅ Security:
- Production mode error handling (no stack traces exposed)
- CORS restricted to network IP
- Secure JWT tokens
- Password reset tokens never exposed in responses

### ✅ Email:
- Password reset emails sent via Brevo SMTP
- Professional HTML email templates
- No debug information in responses

### ✅ Performance:
- Optimized React production build
- Minified JavaScript and CSS
- Compressed assets

---

## Running as Windows Service (Optional)

### Using NSSM (Non-Sucking Service Manager)

1. **Download NSSM:** https://nssm.cc/download

2. **Install Backend Service:**
```bash
nssm install IEM-Backend "C:\Program Files\nodejs\node.exe"
nssm set IEM-Backend AppDirectory "C:\Users\roland\Documents\Web System\IEM\IEM\backend"
nssm set IEM-Backend AppParameters "server.js"
nssm start IEM-Backend
```

3. **Install Frontend Service:**
```bash
npm install -g serve
nssm install IEM-Frontend "C:\Program Files\nodejs\node.exe"
nssm set IEM-Frontend AppDirectory "C:\Users\roland\Documents\Web System\IEM\IEM\frontend"
nssm set IEM-Frontend AppParameters "C:\Users\roland\AppData\Roaming\npm\node_modules\serve\bin\serve.js -s build -l 3000"
nssm start IEM-Frontend
```

---

## Monitoring

### Check Backend Status (PM2)
```bash
pm2 status
pm2 logs iem-backend
pm2 monit
```

### Check Process Status (Windows)
```bash
Get-Process -Name node
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

---

## Firewall Configuration

Allow network access to the application:

```powershell
# Allow Backend Port
New-NetFirewallRule -DisplayName "IEM Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Allow Frontend Port
New-NetFirewallRule -DisplayName "IEM Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## Auto-Start on Windows Boot

### Using PM2 Startup:
```bash
pm2 startup
pm2 save
```

### Using Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
5. Program: `C:\Program Files\nodejs\node.exe`
6. Arguments: `server.js`
7. Start in: `C:\Users\roland\Documents\Web System\IEM\IEM\backend`

---

## Database Backup (Recommended)

### Manual Backup:
```bash
mysqldump -u root item_exclusivity > backup_$(date +%Y%m%d).sql
```

### Scheduled Backup (Windows Task Scheduler):
Create a batch file `backup.bat`:
```batch
@echo off
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump" -u root item_exclusivity > "C:\Backups\IEM\backup_%timestamp%.sql"
```

Schedule it daily in Task Scheduler.

---

## Updating the Application

### Update Backend Code:
```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
git pull  # if using git
pm2 restart iem-backend
```

### Update Frontend Code:
```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\frontend"
git pull  # if using git
npm run build
pm2 restart iem-frontend
```

### Run New Migrations:
```bash
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
node migrations/migrate.js
pm2 restart iem-backend
```

---

## Troubleshooting

### Backend Not Starting:
```bash
# Check logs
pm2 logs iem-backend

# Check if port is in use
netstat -ano | findstr :5000

# Restart manually
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
node server.js
```

### Frontend Not Accessible:
```bash
# Check if build exists
dir "c:\Users\roland\Documents\Web System\IEM\IEM\frontend\build"

# Rebuild if needed
cd "c:\Users\roland\Documents\Web System\IEM\IEM\frontend"
npm run build

# Restart serve
pm2 restart iem-frontend
```

### Email Not Sending:
- Check backend logs: `pm2 logs iem-backend`
- Verify `.env` email settings
- Test SMTP connection: Visit Brevo dashboard

### Database Connection Issues:
- Verify MySQL is running: `Get-Service -Name MySQL*`
- Check `.env` database credentials
- Test connection: `mysql -u root -p item_exclusivity`

---

## Performance Optimization

### Enable Compression (Backend):
Already enabled in production mode via Express.js

### Database Indexing:
Migrations already include proper indexes on:
- Users: username, email, is_active, reset_token
- Items: itemcode, branch, category
- Audit logs: entity_type, action, user_id, created_at

### Caching (Optional):
Consider implementing Redis for session storage and API caching for better performance.

---

## Security Recommendations

1. **Change Default Admin Password:**
   - Login as admin
   - Go to User Management
   - Edit admin user and change password

2. **Regular Security Updates:**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Database Security:**
   - Set a MySQL root password
   - Create a dedicated database user with limited privileges
   - Update `.env` with new credentials

4. **HTTPS (Optional but Recommended):**
   - Use reverse proxy (nginx, IIS)
   - Install SSL certificate
   - Update FRONTEND_URL to https://

---

## Quick Start Commands (Production)

### Start Everything:
```bash
# Terminal 1 - Backend
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
pm2 start server.js --name iem-backend

# Terminal 2 - Frontend
cd "c:\Users\roland\Documents\Web System\IEM\IEM\frontend"
pm2 serve build 3000 --name iem-frontend --spa

# Save PM2 configuration
pm2 save
```

### Stop Everything:
```bash
pm2 stop all
```

### View Status:
```bash
pm2 status
pm2 logs
```

---

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Check health endpoint: http://192.168.0.138:5000/health
3. Review audit logs in the application
4. Contact system administrator

---

**Deployment Date:** November 11, 2025  
**Version:** 1.0.0  
**Network IP:** 192.168.0.138  
**Status:** Production Ready ✅
