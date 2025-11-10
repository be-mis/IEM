# Authentication System

This document describes the login and sign-up functionality added to the IEM System.

## Features

### 1. **Login Page** (`/login`)
- Username or email authentication
- Password visibility toggle
- Form validation
- Error handling with user-friendly messages
- Beautiful gradient UI design
- Automatic redirect to dashboard after successful login
- Link to sign-up page

### 2. **Sign Up Page** (`/signup`)
- User registration with username, email, and password
- Password confirmation validation
- Role selection (Employee, Admin, Manager)
- Email format validation
- Password strength requirement (minimum 6 characters)
- Username length requirement (minimum 3 characters)
- Success message with automatic redirect to login
- Link to login page

### 3. **Protected Routes**
- All main application routes are protected
- Users must be logged in to access:
  - Dashboard
  - Item Maintenance
  - Store Maintenance
  - Exclusivity Form
  - Audit Logs
  - Reports
- Automatic redirect to login page if not authenticated

### 4. **Authentication Context**
- Centralized authentication state management
- Token and user data stored in localStorage
- Automatic token verification on app load
- Axios interceptor for API authentication

### 5. **Logout Functionality**
- Logout button in Dashboard toolbar
- User info display (username and role)
- Clears authentication token and user data
- Redirects to login page

## File Structure

```
frontend/src/
├── components/
│   ├── Login.js              # Login page component
│   ├── SignUp.js             # Sign-up page component
│   ├── ProtectedRoute.js     # Route protection wrapper
│   └── Dashboard.js          # Updated with logout button
├── context/
│   └── AuthContext.js        # Authentication state management
└── App.js                    # Updated with routes and AuthProvider
```

## API Endpoints

### Backend Routes (Already Implemented)

1. **POST `/api/auth/login`**
   - Body: `{ username, password }`
   - Returns: `{ token, user: { id, username, email, role } }`

2. **POST `/api/auth/register`**
   - Body: `{ username, email, password, role }`
   - Returns: `{ message, userId }`

3. **GET `/api/auth/profile`** (requires authentication)
   - Returns user profile data

4. **GET `/api/auth/verify`** (requires authentication)
   - Verifies JWT token validity

## Usage

### For Users

1. **New Users:**
   - Navigate to `/signup`
   - Fill in username, email, password, and select role
   - Click "Create Account"
   - Will be redirected to login page

2. **Existing Users:**
   - Navigate to `/login`
   - Enter username/email and password
   - Click "Sign In"
   - Will be redirected to dashboard

3. **Logout:**
   - Click the logout icon in the top-right corner of the dashboard
   - Will be redirected to login page

### For Developers

#### Using the Auth Context

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (isAuthenticated()) {
    // User is logged in
  }

  // Get current user info
  const username = user?.username;
  const role = user?.role;

  return <div>Hello, {username}!</div>;
}
```

#### Protecting a New Route

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/my-protected-route" 
  element={
    <ProtectedRoute>
      <MyComponent />
    </ProtectedRoute>
  } 
/>
```

#### Making Authenticated API Calls

The authentication token is automatically added to all Axios requests after login:

```javascript
// No need to manually add headers
const response = await axios.get('/api/protected-endpoint');
```

## Security Features

1. **JWT Token Authentication**: Secure token-based authentication
2. **Password Hashing**: Passwords are hashed with bcrypt (backend)
3. **Token Expiration**: Tokens expire after 24 hours
4. **Protected Routes**: Unauthorized users are redirected to login
5. **Input Validation**: Client-side and server-side validation
6. **Error Handling**: Secure error messages without exposing sensitive data

## Styling

- **Design**: Modern gradient design with purple/blue theme
- **Responsive**: Works on mobile, tablet, and desktop
- **Icons**: Material-UI icons for better UX
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper labels and ARIA attributes

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Frontend (.env in frontend folder)
REACT_APP_API_BASE=http://localhost:5000/api

# Backend (.env in backend folder)
JWT_SECRET=your-secret-key-here
```

## Testing

1. **Test Sign Up:**
   - Go to `http://localhost:3000/signup`
   - Create a new account
   - Verify redirect to login

2. **Test Login:**
   - Go to `http://localhost:3000/login`
   - Use created credentials
   - Verify redirect to dashboard

3. **Test Protected Routes:**
   - Try accessing `/dashboard` without logging in
   - Should redirect to `/login`

4. **Test Logout:**
   - Click logout button
   - Verify redirect to login
   - Try accessing protected route again

## Future Enhancements

- [ ] Password reset functionality
- [ ] Remember me checkbox
- [ ] Session timeout warning
- [ ] Multi-factor authentication
- [ ] Social login (Google, Facebook, etc.)
- [ ] User profile page
- [ ] Change password functionality
- [ ] Email verification
- [ ] Rate limiting for login attempts
- [ ] Activity log for user sessions

## Troubleshooting

### Issue: "Token is invalid" error
- **Solution**: Logout and login again. Token may have expired.

### Issue: Can't access protected routes
- **Solution**: Check if you're logged in. Check browser console for errors.

### Issue: Registration fails
- **Solution**: Check if username/email already exists. Verify all fields are filled correctly.

### Issue: CORS errors
- **Solution**: Verify backend is running and CORS is configured properly.

## Support

For issues or questions, please contact the development team or create an issue in the repository.
