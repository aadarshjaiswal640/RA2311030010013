# Notification System - Frontend Application

## 📋 Overview

This is a **production-ready Next.js frontend application** that implements a complete notification management system with:

- ✅ **Authentication Flow** - Secure JWT-based authentication
- ✅ **Logging Middleware** - Comprehensive logging to external service
- ✅ **Notifications System** - Fetch and display notifications
- ✅ **Priority Logic** - Smart sorting by type weight and timestamp
- ✅ **Clean Architecture** - Modular, reusable, TypeScript-first code
- ✅ **Professional UI** - Modern dashboard with error handling
- ✅ **Security** - No tokens exposed, environment-based configuration
- ✅ **Error Handling** - Graceful error display and retry logic

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   └── proxy/route.ts           # Proxy for CORS-free API calls
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard component
│   │   └── dashboard.module.css     # Dashboard styling
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Redirects to /dashboard
│   ├── globals.css                  # Global styles
│   └── favicon.ico
├── components/
│   ├── ErrorState.tsx               # Error display component
│   ├── ErrorState.module.css
│   ├── LoadingState.tsx             # Loading indicator component
│   ├── LoadingState.module.css
│   ├── NotificationList.tsx         # Notification list component
│   └── NotificationList.module.css
├── lib/
│   ├── api.ts                       # API wrapper with auth & timeout
│   └── logger.ts                    # Logging utility middleware
├── services/
│   ├── auth.ts                      # Authentication service
│   └── notifications.ts             # Notifications service with priority logic
└── types/
    └── (TypeScript types throughout)
```

---

## 🔐 Authentication Flow

### 1. **Authenticate**
```typescript
// Call authenticate() with user credentials
const response = await authenticate({
  email: "user@example.com",
  name: "User Name",
  rollNo: "abc123",
  accessCode: "code",
  clientID: "uuid",
  clientSecret: "secret"
});
// Returns: { token_type: "Bearer", access_token: "jwt...", expires_in: 123456 }
```

### 2. **Token Storage**
- Tokens stored in `sessionStorage` (not localStorage for security)
- Not exposed in browser UI
- Auto-included in all API requests

### 3. **Logging Events**
- "Authentication started"
- "Authentication success"
- "Authentication failed"

---

## 📬 Notifications System

### 1. **Fetch Notifications**
```typescript
const notifications = await fetchNotifications("notifications");
```

### 2. **Priority Logic**
**Weight Assignment:**
- Placement = 3
- Result = 2
- Event = 1

**Sorting:**
1. By weight (descending)
2. By timestamp (latest first)

**Result:**
- Top 10 → Priority Notifications
- All → All Notifications (sorted)

### 3. **Display**
- Priority section shows top 10 by weight/timestamp
- Full list shows all notifications
- Metadata display: type, timestamp, message, weight

---

## 📝 Logging Middleware

### Function Signature
```typescript
Log(stack, level, package, message, metadata?)
```

### Parameters
- **stack**: `"frontend"` (only value)
- **level**: `"debug" | "info" | "warn" | "error" | "fatal"`
- **package**: `"api" | "component" | "hook" | "page" | "state" | "style"`
- **message**: String message
- **metadata**: Optional object with additional data

### Usage
```typescript
import { logger } from "@/lib/logger";

// Simple logging
logger.info("page", "User authenticated");

// With metadata
logger.error("api", "Failed to fetch", { status: 500, endpoint: "/users" });

// Direct Log function
Log("frontend", "warn", "component", "Warning message");
```

### Logging Events
- All API requests/responses
- Authentication events
- Notification fetches
- Errors and warnings

---

## 🔌 API Wrapper

### Features
- ✅ Generic response types (`<T>`)
- ✅ Bearer token authentication
- ✅ 10s timeout with AbortController
- ✅ Safe JSON parsing
- ✅ All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ Error handling with custom ApiError class
- ✅ Query parameter support
- ✅ Request/response logging

### Usage
```typescript
import { api } from "@/lib/api";

// GET
const data = await api.get<UserType>("/users");

// POST
const result = await api.post<ResponseType>("/users", { name: "John" });

// With options
const data = await api.get<Type>("/endpoint", {
  timeoutMs: 5000,
  query: { page: 1, limit: 10 }
});

// Error handling
try {
  const data = await api.post("/endpoint", payload);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message, error.status, error.body);
  }
}
```

---

## 🔄 Proxy Route

### Purpose
Bypass CORS issues and forward requests to backend service

### Configuration
```typescript
// /src/app/api/proxy/route.ts
const BASE_URL = "http://20.207.122.201/evaluation-service";
```

### Supported Methods
- GET, POST, PUT, PATCH, DELETE, HEAD

### Routing
```
Client Request: POST /api/proxy/logs
↓
Proxy Route: Extracts "logs" endpoint
↓
Backend Call: POST http://20.207.122.201/evaluation-service/logs
↓
Response: Returns to client
```

---

## 🎨 UI Components

### ErrorState
Displays error with retry button
```typescript
<ErrorState 
  error="Failed to load" 
  onRetry={() => retry()}
/>
```

### LoadingState
Spinner with loading message
```typescript
<LoadingState message="Loading data..." />
```

### NotificationList
Displays list of notifications with metadata
```typescript
<NotificationList
  notifications={notifications}
  title="My Notifications"
  maxHeight="600px"
/>
```

---

## 🎯 Dashboard Features

### Authentication Section
- Authenticate button
- Token status display
- User information
- Token expiry check
- Full response viewer

### Notifications Section
- Fetch button (disabled until authenticated)
- Error handling with retry
- Loading state
- Priority notifications (top 10)
- All notifications (sorted)
- Empty state message

### Statistics
- Total notifications
- Top priority count
- Breakdown by type (Placement, Result, Event)

---

## 🛡️ Security Features

1. **No Token Exposure**
   - Tokens in sessionStorage, not visible in UI
   - Never logged to console (except in debug logs to server)

2. **CORS Handling**
   - All requests through proxy
   - No direct browser-backend communication

3. **Authorization**
   - Bearer token auto-included in all requests
   - Token validation on backend

4. **Environment Variables**
   - `NEXT_PUBLIC_ACCESS_TOKEN` loaded from `.env.local`
   - Not exposed in production

---

## 📊 State Management

### Dashboard State
```typescript
interface DashboardState {
  authLoading: boolean;
  authError: string | null;
  authResponse: AuthResponse | null;
  notificationsLoading: boolean;
  notificationsError: string | null;
  allNotifications: PriorityNotification[];
  priorityNotifications: PriorityNotification[];
}
```

**Managed with:**
- `useState` for state
- `useEffect` for side effects
- No external state library needed

---

## 🧪 Testing the Application

### 1. **Authentication**
- Click "Authenticate" button
- Should show "✓ Authenticated" with token details
- Token type should be "Bearer"

### 2. **Notifications**
- Click "Fetch Notifications" button
- Should load and display notifications
- Sorted by priority (weight, then timestamp)

### 3. **Error Handling**
- If endpoint doesn't exist → Shows error card with retry
- If network fails → Shows error with retry button
- Graceful degradation throughout

### 4. **Logging**
- All actions logged to server
- Check browser console for logs
- Verify in server logs if available

---

## 📦 Environment Setup

### `.env.local`
```env
NEXT_PUBLIC_ACCESS_TOKEN=your_jwt_token_here
```

### Running Locally
```bash
cd notification_app_fe

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
npm start
```

### Access
- Open `http://localhost:3000`
- Redirects to `/dashboard` automatically

---

## 📝 File Dependencies

### Core Files
| File | Purpose | Dependencies |
|------|---------|--------------|
| `lib/api.ts` | HTTP client | logger |
| `lib/logger.ts` | Logging utility | - |
| `services/auth.ts` | Authentication | api, logger |
| `services/notifications.ts` | Notifications | api, logger |
| `components/*` | UI Components | CSS Modules |
| `app/dashboard/page.tsx` | Main page | All above |

---

## 🔍 Code Quality

### TypeScript
- ✅ No `any` types
- ✅ Strict mode enabled
- ✅ Full type coverage

### Modularity
- ✅ Reusable components
- ✅ Separate concerns (API, services, UI)
- ✅ Clean interfaces

### Error Handling
- ✅ Try-catch blocks
- ✅ Custom error classes
- ✅ User-friendly error messages

### Logging
- ✅ Structured logs with metadata
- ✅ Log levels (debug, info, warn, error, fatal)
- ✅ Request/response tracking

---

## 🚀 Ready for Production

This application is **fully production-ready** and includes:

✅ Clean architecture  
✅ Security best practices  
✅ Error handling and recovery  
✅ Comprehensive logging  
✅ TypeScript strict mode  
✅ Professional UI/UX  
✅ Responsive design  
✅ CORS-free API calls  
✅ JWT authentication  
✅ Token management  

---

## 📚 Additional Notes

### API Endpoints Used
- `POST /auth` - Authentication (via proxy)
- `GET /notifications` - Fetch notifications (via proxy)
- `POST /logs` - Logging (via proxy)

### CSS Framework
- ✅ Pure CSS (No Tailwind)
- ✅ CSS Modules for component scoping
- ✅ Responsive design
- ✅ Clean, maintainable styles

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript support required

---

## 🤝 Contributing

To extend this application:

1. **Add new components** in `src/components/`
2. **Add new services** in `src/services/`
3. **Add logging** using `logger` utility
4. **Use API wrapper** for HTTP calls
5. **Maintain TypeScript types**

---

**Built with ❤️ using Next.js, TypeScript, and modern React patterns**
