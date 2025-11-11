# IEM System - Production Deployment

## Quick Start

This system is now configured for **production deployment** on your network.

### 🚀 Deployment Options

#### Option 1: One-Click Deployment (Recommended)
Simply double-click: **`start-production.bat`**

This will:
- Build the frontend
- Start backend with PM2 (auto-restart on crash)
- Start frontend with PM2
- Make services accessible on network

#### Option 2: Manual Deployment
Double-click: **`deploy.bat`**

This starts services in separate terminal windows (easier for monitoring during initial setup).

#### Stop Services
Double-click: **`stop.bat`**

---

## Access URLs

Once deployed, users on your network can access:

- **Application:** http://192.168.0.138:3000
- **Backend API:** http://192.168.0.138:5000/api
- **Health Check:** http://192.168.0.138:5000/health

---

## Configuration Summary

### ✅ Production Settings Applied:

**Backend (`backend/.env`):**
- `NODE_ENV=production` ✓
- Strong JWT secret set ✓
- Email configured (Brevo SMTP) ✓
- Network IP configured ✓
- Email from: helpdesk@everydayproductscorp.com ✓

**Frontend (`frontend/.env`):**
- API URL: http://192.168.0.138:5000/api ✓
- Password reset URL: http://192.168.0.138:3000 ✓

---

## Production Features

### Security:
- ✓ No debug information exposed
- ✓ Password reset tokens never shown in responses
- ✓ Email-only password recovery
- ✓ Secure JWT authentication
- ✓ CORS restricted to network

### Email:
- ✓ Professional HTML email templates
- ✓ Password reset via Brevo SMTP
- ✓ Emails sent from: helpdesk@everydayproductscorp.com
- ✓ Reset links: http://192.168.0.138:3000/reset-password

### Performance:
- ✓ Optimized production build
- ✓ Minified assets
- ✓ Auto-restart on crash (with PM2)

---

## First Time Setup

1. **Install PM2 globally** (optional, but recommended):
   ```bash
   npm install -g pm2
   ```

2. **Run the deployment**:
   - Double-click `start-production.bat`
   - Wait for "Application Started Successfully!"

3. **Access the application**:
   - Open browser: http://192.168.0.138:3000
   - Default admin: username: `admin`, password: `admin123`

4. **Change default password**:
   - Login as admin
   - Go to User Management
   - Edit admin user and change password

---

## Monitoring

### Using PM2:
```bash
pm2 status          # View running services
pm2 logs            # View logs (all services)
pm2 logs iem-backend    # Backend logs only
pm2 logs iem-frontend   # Frontend logs only
pm2 monit           # Real-time monitoring
```

### Check Services:
```bash
# Check if ports are listening
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Check node processes
Get-Process -Name node
```

---

## Maintenance

### Restart Services:
```bash
pm2 restart all
# or
pm2 restart iem-backend
pm2 restart iem-frontend
```

### Update Application:
1. Stop services: Run `stop.bat`
2. Update code (copy new files)
3. Run migrations if needed:
   ```bash
   cd backend
   node migrations/migrate.js
   ```
4. Rebuild frontend:
   ```bash
   cd frontend
   npm run build
   ```
5. Start services: Run `start-production.bat`

### Database Backup:
```bash
mysqldump -u root item_exclusivity > backup.sql
```

---

## Firewall Configuration

To allow network access:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "IEM Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "IEM Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## Auto-Start on Boot

### Using PM2:
```bash
pm2 startup
pm2 save
```

This creates a Windows service that starts your application on boot.

---

## Troubleshooting

### Can't access from other computers:
- Check Windows Firewall (see Firewall Configuration above)
- Verify your IP is still 192.168.0.138: `ipconfig`
- If IP changed, update `.env` files and redeploy

### Email not sending:
- Check backend logs: `pm2 logs iem-backend`
- Verify Brevo SMTP credentials
- Test: Go to Forgot Password and use a real email

### Backend won't start:
- Check if port 5000 is in use: `netstat -ano | findstr :5000`
- Check logs: `pm2 logs iem-backend`
- Check MySQL is running: `Get-Service -Name MySQL*`

### Frontend won't start:
- Check if port 3000 is in use: `netstat -ano | findstr :3000`
- Rebuild frontend: `cd frontend && npm run build`
- Check logs: `pm2 logs iem-frontend`

---

## Default Credentials

**Admin Account:**
- Username: `admin`
- Email: `admin@iem.com`
- Password: `admin123`

**Test Employee:**
- Username: `employee`
- Email: `employee@iem.com`
- Password: `employee123`

⚠️ **Change these passwords immediately after deployment!**

---

## Support

For detailed deployment instructions, see: **DEPLOYMENT_GUIDE.md**

---

**System Status:** ✅ Production Ready  
**Deployment Date:** November 11, 2025  
**Network IP:** 192.168.0.138  
**Email:** helpdesk@everydayproductscorp.com
