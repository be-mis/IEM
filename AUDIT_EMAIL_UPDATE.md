# Audit Logs Email Enhancement

## Summary
Updated the audit logging system to display user email addresses instead of numeric user IDs throughout the application.

## Changes Made

### 1. JWT Token Enhancement
**File:** `backend/routes/auth.js` (Line 71)
- Added `email: user.email` to JWT token payload
- New JWT tokens now include user email for all authenticated requests
- **Action Required:** Users must log out and log back in to get the new JWT with email

### 2. Middleware Enhancement
**File:** `backend/middleware/auth.js`
- Added `req.email` extraction from JWT token
- Added `req.user` object with complete user context:
  ```javascript
  req.user = {
    id: decoded.userId,
    userId: decoded.userId,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role
  };
  ```
- All protected routes now have access to user email via `req.user.email` or `req.email`

### 3. Audit Logger Function
**File:** `backend/utils/auditLogger.js`
- Updated `logAudit()` function signature to accept `userEmail` parameter
- Modified database INSERT to prioritize email: `VALUES ... userEmail || userId ...`
- Updated JSDoc comments with `@param {string} [p.userEmail]`
- When userEmail is provided, it's stored in the `user_id` column (will contain email instead of numeric ID)

### 4. Frontend Display
**File:** `frontend/src/components/AuditLogs.js` (Line 340)
- Changed label from "User ID" to "User Email"
- UI now correctly represents that the field contains email addresses

### 5. All logAudit Calls Updated
Updated all `logAudit()` calls across the backend to include the `userEmail` parameter:

#### auth.js (9 logAudit calls)
- Login failed (user not found)
- Login failed (invalid password)
- Login successful
- Register
- Forgot password
- Reset password
- Create user
- Update user
- Delete user

**Pattern used:**
```javascript
await logAudit({
  entityType: 'auth',
  entityId: user.id,
  action: 'login',
  entityName: user.username,
  userId: user.id,
  userName: user.username,
  userEmail: user.email,  // ADDED
  ip: getIp(req),
  details: { ... }
});
```

#### inventory.js (8 logAudit calls)
- Item disposal
- Item checkout/assignment
- Bulk item exclusivity create
- Bulk item exclusivity update
- Remove item exclusivity
- Mass upload items
- Bulk assign branches
- Mass upload branches

**Pattern used:**
```javascript
await logAudit({
  entityType: 'item',
  entityId: id,
  action: 'dispose',
  entityName: 'Item Name',
  userId: req.user?.id || null,
  userName: req.user?.username || 'System',
  userEmail: req.user?.email || req.email || null,  // ADDED
  ip: getIp(req),
  details: { ... }
});
```

## Database Impact
- **Column:** `epc_audit_logs.user_id` (VARCHAR(255))
- **Before:** Stored numeric user IDs (e.g., "1", "5", "12")
- **After:** Stores user email addresses (e.g., "admin@everydayproductscorp.com")
- **Historical Data:** Old audit logs still contain numeric IDs; new logs will contain emails

## Testing Checklist
- [x] Backend server restarted successfully
- [ ] Users log out completely
- [ ] Users log back in (receive new JWT with email)
- [ ] Perform auditable action (create item, edit user, etc.)
- [ ] Navigate to Audit Logs page
- [ ] Verify "User Email" column displays email addresses instead of numeric IDs
- [ ] Verify historical logs still display (may show old numeric IDs)

## Rollback Plan
If issues occur:
1. Revert changes to `backend/utils/auditLogger.js` (remove userEmail parameter)
2. Revert JWT token changes in `backend/routes/auth.js` (remove email from payload)
3. Revert frontend label in `frontend/src/components/AuditLogs.js` (change back to "User ID")
4. Restart backend server
5. Users logout/login to clear JWT tokens

## Notes
- Email is optional in logAudit calls (uses fallback: `req.user?.email || req.email || null`)
- System actions without a user context will have `null` for userEmail
- The database column `user_id` is reused to store emails (VARCHAR supports both)
- Frontend AuthContext already stores full user object including email from login response

## Deployment Date
**Date:** _(To be filled after deployment)_
**Backend Version:** _(To be filled)_
**Frontend Version:** _(To be filled)_
