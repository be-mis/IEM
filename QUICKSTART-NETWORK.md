# 🚀 QUICK START - IEM System Deployment

## For First-Time Setup (15 minutes)

### 1️⃣ Check System (2 min)
```
Double-click: CHECK-SYSTEM.bat
```
Fix any ✗ errors shown.

### 2️⃣ Deploy System (3 min)
```
Double-click: START-SYSTEM.bat
```
This will:
- Build frontend
- Start backend server (port 3001)
- Start frontend server (port 3020)

### 3️⃣ Access System
**From this machine:**
- http://localhost:3020

**From other machines on network:**
- http://192.168.1.197:3020

---

## For Daily Use

### Start Servers
```
Double-click: START-SYSTEM.bat
```

### Stop Servers
Close the two terminal windows or press Ctrl+C in each.

---

## Network Access URL

**Share this with testers:**
```
http://192.168.1.197:3020
```

### Default Credentials
- Username: `admin`
- Password: `admin123`

### Create Test Accounts
1. Go to http://192.168.1.197:3020
2. Click "Sign Up"
3. Fill in details (email domain determines business unit)
4. Login and test features

---

## What Users Can Test

### EPC Users (email: *@everydayproductscorp.com)
✅ Dashboard
✅ Item Maintenance (Add/Edit/Delete items)
✅ Store Maintenance (Add/Edit stores, Mass upload)
✅ Exclusivity Form (Submit matrix)
✅ Audit Logs
✅ User Management (Admin only)

### NBFI Users (email: *@barbizonfashion.com)
✅ Dashboard  
✅ Item Maintenance (Add/Edit items with brands)
✅ Store Maintenance (Manage stores by chain)
✅ Exclusivity Form (Per-chain matrix)
✅ Audit Logs
✅ User Management (Admin only)

---

## Troubleshooting

### "Cannot access from network"
1. Check Windows Firewall
2. Run as Administrator:
```powershell
New-NetFirewallRule -DisplayName "IEM Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "IEM Frontend" -Direction Inbound -LocalPort 3020 -Protocol TCP -Action Allow
```

### "Registration failed"
1. Check both server windows are running
2. Check backend window for errors
3. Verify URL in browser DevTools → Network tab

### IP Address Changed
1. Run: `ipconfig | findstr "IPv4"`
2. Update `frontend\.env` line: `REACT_APP_API_BASE=http://NEW_IP:3001/api`
3. Update `backend\.env` lines: `SERVER_IP=NEW_IP` and `FRONTEND_URL=http://NEW_IP:3020`
4. Rebuild: `cd frontend && npm run build`
5. Restart servers

---

## Files Overview

| File | Purpose |
|------|---------|
| `CHECK-SYSTEM.bat` | Verify setup before deployment |
| `START-SYSTEM.bat` | Start everything (one-click) |
| `start-backend.bat` | Start only backend |
| `start-frontend.bat` | Start only frontend |
| `NETWORK_DEPLOYMENT_GUIDE.md` | Complete documentation |

---

## System URLs

| Service | Local | Network |
|---------|-------|---------|
| Frontend | http://localhost:3020 | http://192.168.1.197:3020 |
| Backend | http://localhost:3001 | http://192.168.1.197:3001 |
| Health Check | http://localhost:3001/health | http://192.168.1.197:3001/health |

---

**Status**: ✅ READY TO DEPLOY
**Last Updated**: December 5, 2025
