# Authentication Feature Documentation

## 📋 Overview

Sistem autentikasi lengkap untuk Worksy ERP dengan fitur:
- ✅ Login dengan email & password
- ✅ Register user baru
- ✅ Token-based authentication (JWT)
- ✅ Auto token refresh
- ✅ Protected routes
- ✅ Device location tracking saat register
- ✅ Remember me functionality

---

## 🔌 Backend API Endpoints

### Base URL
```
Production: https://worksy-production.up.railway.app
Development: http://localhost:15320
```

### Public Routes (No Auth Required)

#### 1. Register
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+628123456789",        // Optional
  "inviteCode": "ABC123",          // Optional
  "deviceId": "device-uuid",       // Optional
  "latitude": -6.2088,             // Optional
  "longitude": 106.8456            // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "TECHNICIAN",
      "isActive": true,
      "emailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### 2. Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "deviceId": "device-uuid"    // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "TECHNICIAN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Private Routes (Require Authentication)

All private routes require `Authorization: Bearer <access-token>` header.

#### 3. Refresh Token
```http
POST /api/auth/token/refresh
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

#### 4. Revoke Token
```http
POST /api/auth/token/revoke
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

---

#### 5. Get Current User Profile
```http
GET /api/profile
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "TECHNICIAN",
    "phone": "+628123456789",
    "companyId": "company-uuid",
    "officeId": "office-uuid",
    "isActive": true,
    "emailVerified": true
  }
}
```

---

## 📁 Frontend Implementation

### File Structure

```
src/
├── shared/
│   ├── types/
│   │   └── auth.ts                    # TypeScript types
│   └── AuthContext.tsx                # Auth context & provider
├── services/
│   └── authApi.ts                     # API service layer
├── components/
│   └── ProtectedRoute.tsx             # Route protection wrapper
├── pages/
│   ├── Login.tsx                      # Login page
│   └── Register.tsx                   # Register page
└── routes/
│   ├── login.tsx                      # Login route
│   ├── register.tsx                   # Register route
│   └── __root.tsx                     # Root with protection
```

---

## 🔧 Usage Examples

### 1. Login

```tsx
import { useAuth } from '@/shared/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // User is now logged in
      // Redirect happens automatically
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### 2. Register

```tsx
import { useAuth } from '@/shared/AuthContext';

function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    inviteCode: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        inviteCode: formData.inviteCode,
      });
      // User is now registered and logged in
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Full Name"
      />
      {/* Other fields... */}
      <button type="submit">Register</button>
    </form>
  );
}
```

---

### 3. Logout

```tsx
import { useAuth } from '@/shared/AuthContext';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    // User is now logged out
    // Redirect to login happens automatically
  };

  return (
    <header>
      {isAuthenticated ? (
        <div>
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

---

### 4. Check Authentication Status

```tsx
import { useAuth } from '@/shared/AuthContext';

function Dashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

---

## 🔐 Token Management

### Storage

Tokens are stored in `localStorage`:

```javascript
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

### Auto Refresh

Access token is automatically refreshed when it expires:

```typescript
// In authApi.ts
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const response = await publicApi.post('/auth/token/refresh', {
          refreshToken: localStorage.getItem('refreshToken'),
        });

        const { accessToken, refreshToken } = response.data.data;

        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return privateApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 🛡️ Protected Routes

All routes except `/login` and `/register` are protected.

### Implementation

```tsx
// routes/__root.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

function RootRoute() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );
}
```

### How It Works

1. User tries to access protected route
2. `ProtectedRoute` checks `isAuthenticated` from `AuthContext`
3. If not authenticated → redirect to `/login`
4. If authenticated → render children

---

## 📱 Device Location

During registration, device location is automatically captured:

```typescript
// In AuthContext.tsx
const register = useCallback(async (data: RegisterInput) => {
  let latitude: number | undefined;
  let longitude: number | undefined;

  try {
    if ('geolocation' in navigator) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000,
        });
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    }
  } catch (error) {
    console.warn('Could not get device location:', error);
  }

  await authApi.register({
    ...data,
    latitude,
    longitude,
  });
}, []);
```

---

## 🎨 UI Components

### Login Page Features

- ✅ Email & password validation
- ✅ Error handling with user-friendly messages
- ✅ Loading state with spinner
- ✅ Remember me checkbox
- ✅ Forgot password link (placeholder)
- ✅ Link to register page
- ✅ Responsive design

### Register Page Features

- ✅ Name, email, password validation
- ✅ Password confirmation
- ✅ Phone number (optional)
- ✅ Invite code (optional)
- ✅ Terms & conditions checkbox
- ✅ Error handling
- ✅ Loading state
- ✅ Link to login page

---

## 🔒 Security Best Practices

### 1. Password Requirements

```typescript
// Minimum 6 characters
if (formData.password.length < 6) {
  errors.password = 'Password minimal 6 karakter';
}
```

### 2. Token Security

- ✅ Tokens stored in localStorage
- ✅ Auto refresh on expiration
- ✅ Tokens revoked on logout
- ✅ All private API calls include token

### 3. Session Management

```typescript
// Clear all auth data on logout
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Login
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Login with wrong password
- [ ] Login with non-existent email
- [ ] Form validation (empty fields)
- [ ] Remember me functionality
- [ ] Redirect to dashboard after login
- [ ] Token stored in localStorage

#### Register
- [ ] Register with valid data
- [ ] Register with existing email
- [ ] Password confirmation mismatch
- [ ] Invalid email format
- [ ] Password too short
- [ ] Optional fields (phone, inviteCode)
- [ ] Auto-login after registration
- [ ] Device location captured

#### Protected Routes
- [ ] Access protected route without login → Redirect to login
- [ ] Access protected route with login → Allow access
- [ ] Logout → Redirect to login
- [ ] Token expiration → Auto refresh
- [ ] Refresh token failure → Logout

---

## 🐛 Troubleshooting

### Issue: Login Fails with 401

**Solution:**
- Check email and password are correct
- Verify backend is running
- Check CORS configuration

---

### Issue: Token Not Refreshing

**Solution:**
```typescript
// Check if refresh token exists
const refreshToken = localStorage.getItem('refreshToken');
console.log('Refresh token:', refreshToken);

// Check if token refresh endpoint is correct
// POST /api/auth/token/refresh
```

---

### Issue: Protected Route Not Redirecting

**Solution:**
```typescript
// Check AuthContext is properly wrapped
// In main.tsx:
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>

// Check useAuth hook usage
const { isAuthenticated } = useAuth();
```

---

## 📊 State Management

### AuthContext State

```typescript
interface AuthContextType {
  user: User | null;              // Current user data
  accessToken: string | null;     // Current access token
  isAuthenticated: boolean;       // Is user logged in
  isLoading: boolean;             // Is auth state loading
  login: (email, password) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => void;
  updateUser: (user) => void;
}
```

---

## 🚀 Next Steps

### Phase 1 (Completed)
- ✅ Login/Register
- ✅ Token management
- ✅ Protected routes

### Phase 2 (Future)
- [ ] Forgot password flow
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Password reset
- [ ] Session management (view active sessions)

---

**Last Updated:** 2026-02-27  
**Version:** 1.0.0  
**Build Status:** ✅ Passing  
**Features:** ✅ Complete
