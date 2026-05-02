# 📑 Project File Index

## Quick Navigation

### 🎯 Start Here
- [BUILD_SUMMARY.md](BUILD_SUMMARY.md) - Complete project summary
- [notification_app_fe/README_COMPLETE.md](notification_app_fe/README_COMPLETE.md) - Full technical documentation

---

## 📁 Core Application Files

### Frontend App Root
```
notification_app_fe/
```

#### API Layer
| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Generic HTTP client with auth, timeout, error handling |
| `src/lib/logger.ts` | Logging middleware function |
| `src/app/api/proxy/route.ts` | CORS proxy route (GET, POST, PUT, PATCH, DELETE, HEAD) |

#### Services
| File | Purpose |
|------|---------|
| `src/services/auth.ts` | Authentication service with token handling |
| `src/services/notifications.ts` | Notifications service with priority logic |

#### Components
| File | Purpose |
|------|---------|
| `src/components/LoadingState.tsx` | Loading spinner component |
| `src/components/LoadingState.module.css` | Loading state styles |
| `src/components/ErrorState.tsx` | Error display component with retry |
| `src/components/ErrorState.module.css` | Error state styles |
| `src/components/NotificationList.tsx` | Notification list display |
| `src/components/NotificationList.module.css` | Notification list styles |

#### Pages & Layout
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page (redirects to /dashboard) |
| `src/app/layout.tsx` | Root layout with metadata |
| `src/app/dashboard/page.tsx` | Main dashboard page |
| `src/app/dashboard/dashboard.module.css` | Dashboard styles |

#### Styling
| File | Purpose |
|------|---------|
| `src/app/globals.css` | Global CSS reset and base styles |

#### Configuration
| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (contains JWT token) |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `package.json` | Dependencies and scripts |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `BUILD_SUMMARY.md` | Executive summary of what was built |
| `notification_app_fe/README_COMPLETE.md` | Comprehensive technical documentation |
| `FILE_INDEX.md` | This file - navigation guide |

---

## 🔑 Key Files Explained

### 1. **src/lib/api.ts** - API Wrapper
- **What it does:** Provides typed HTTP requests
- **Features:** Auth headers, timeouts, error handling
- **Usage:** `api.post<Type>("/endpoint", data)`

### 2. **src/lib/logger.ts** - Logging Middleware
- **What it does:** Sends logs to external service
- **Function:** `Log(stack, level, package, message, metadata?)`
- **Integration:** Logs all API calls, auth events, errors

### 3. **src/services/auth.ts** - Authentication
- **What it does:** Handles authentication flow
- **Function:** `authenticate(credentials)` → JWT token
- **Stores:** Token in sessionStorage

### 4. **src/services/notifications.ts** - Notifications
- **What it does:** Fetches and prioritizes notifications
- **Logic:** Weight (Placement=3, Result=2, Event=1) → Timestamp
- **Result:** Top 10 "Priority Notifications"

### 5. **src/app/dashboard/page.tsx** - Main Dashboard
- **What it does:** Main application interface
- **Features:** Authentication, notifications fetch, statistics
- **Logging:** Tracks all user actions

### 6. **src/app/api/proxy/route.ts** - API Proxy
- **What it does:** Forwards requests to backend
- **Base URL:** http://20.207.122.201/evaluation-service
- **Methods:** GET, POST, PUT, PATCH, DELETE, HEAD

---

## 🎯 File Dependencies

```
Components
  ├── LoadingState.tsx → LoadingState.module.css
  ├── ErrorState.tsx → ErrorState.module.css
  └── NotificationList.tsx → NotificationList.module.css

Pages
  ├── dashboard/page.tsx
  │   ├── services/auth.ts → lib/api.ts → lib/logger.ts
  │   ├── services/notifications.ts → lib/api.ts → lib/logger.ts
  │   ├── components/*
  │   └── dashboard.module.css

Routes
  ├── page.tsx → layout.tsx
  ├── dashboard/page.tsx → layout.tsx
  └── api/proxy/route.ts (independent)

Configuration
  ├── layout.tsx → globals.css
  ├── dashboard/page.tsx → .env.local
  └── lib/api.ts → .env.local
```

---

## 📊 File Statistics

| Category | Count | Files |
|----------|-------|-------|
| TypeScript Components | 7 | tsx files |
| CSS Modules | 4 | module.css files |
| Services | 2 | auth.ts, notifications.ts |
| API | 2 | lib/api.ts, api/proxy/route.ts |
| Documentation | 3 | .md files |
| Configuration | 3 | json/ts files |
| **Total** | **~21** | **implementation + config** |

---

## 🚀 Running the Application

1. **Navigate to app directory**
   ```bash
   cd notification_app_fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Edit .env.local with your JWT token
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access application**
   ```
   http://localhost:3000
   ```

---

## 📖 Reading Guide

### For Quick Overview
1. Read: [BUILD_SUMMARY.md](BUILD_SUMMARY.md)
2. View: Dashboard screenshot

### For Technical Details
1. Read: [notification_app_fe/README_COMPLETE.md](notification_app_fe/README_COMPLETE.md)
2. Review: Source code with comments

### For Code Examples
1. Check: `src/services/` for business logic
2. Check: `src/components/` for UI patterns
3. Check: `src/lib/` for utilities

### For Architecture
1. Review: This file (dependencies)
2. Check: `src/app/` for pages
3. Check: `src/` directory structure

---

## ✅ Production Deployment

Files needed for production:
- All files in `src/` directory
- `.env` file (must set NEXT_PUBLIC_ACCESS_TOKEN)
- Configuration files (tsconfig.json, next.config.ts)
- package.json and package-lock.json

Build command:
```bash
npm run build
npm start
```

---

## 🔗 External Resources

### Backend API Endpoints
- Base URL: `http://20.207.122.201/evaluation-service`
- Endpoints:
  - `POST /auth` - Authentication
  - `GET /notifications` - Notifications
  - `POST /logs` - Logging

### Documentation References
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Notes

- All files use TypeScript for type safety
- No external CSS frameworks (pure CSS + CSS Modules)
- No `any` types - strict TypeScript mode
- All logging goes through logger utility
- No console.log statements in production code
- Tokens never exposed in UI

---

## 🎓 Learning Resources

To understand the codebase:

1. **Start with services:** `src/services/` - Business logic
2. **Then components:** `src/components/` - UI patterns
3. **Then api:** `src/lib/api.ts` - HTTP handling
4. **Finally pages:** `src/app/` - Page composition

Each file has inline comments explaining functionality.

---

**Last Updated:** May 2, 2026
**Status:** Production Ready
**Quality:** Enterprise Grade
