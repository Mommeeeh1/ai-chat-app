# AI Personal Trainer - Frontend Project Structure

## 📁 Directory Organization

```
ai-trainer-frontend/
├── app/                        # Next.js 14+ App Router
│   ├── layout.tsx             # Root layout (wraps entire app)
│   ├── page.tsx               # Landing page (/)
│   ├── globals.css            # Global styles
│   │
│   ├── login/                 # Login page
│   │   └── page.tsx           # /login route
│   │
│   ├── signup/                # Signup page
│   │   └── page.tsx           # /signup route
│   │
│   └── dashboard/             # Protected dashboard area
│       ├── layout.tsx         # Dashboard layout (with navigation)
│       ├── page.tsx           # Chat interface (/dashboard)
│       └── profile/
│           └── page.tsx       # Profile management (/dashboard/profile)
│
├── components/                # Reusable React components
│   ├── protected-route.tsx    # HOC for authentication protection
│   └── providers.tsx          # Root providers (Auth, Theme, etc.)
│
├── contexts/                  # React Context providers
│   └── auth-context.tsx       # Authentication state management
│
├── lib/                       # Utilities and services
│   ├── api.ts                 # Centralized API service layer
│   └── constants.ts           # Application constants & config
│
├── types/                     # TypeScript type definitions
│   └── index.ts               # Shared types across the app
│
├── public/                    # Static assets
│   └── *.svg                  # Icons and images
│
└── Configuration files
    ├── package.json           # Dependencies and scripts
    ├── tsconfig.json          # TypeScript configuration
    ├── next.config.ts         # Next.js configuration
    └── tailwind.config.ts     # Tailwind CSS configuration
```

---

## 🎯 Design Principles

### **1. Separation of Concerns**
- **UI Components** → `components/`
- **Business Logic** → `contexts/`, `lib/`
- **Type Definitions** → `types/`
- **Configuration** → `lib/constants.ts`

### **2. Single Source of Truth**
- All API endpoints defined in `lib/constants.ts`
- All types defined in `types/index.ts`
- All API calls go through `lib/api.ts`

### **3. Conventional Naming**
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Contexts**: `*-context.tsx` (e.g., `auth-context.tsx`)
- **API Services**: `api.ts`, `*-api.ts`
- **Types**: PascalCase (e.g., `User`, `Profile`)
- **Functions**: camelCase (e.g., `fetchData`, `handleSubmit`)

---

## 📖 Key Files Explained

### **`app/layout.tsx`** - Root Layout
- Wraps the entire application
- Sets up global providers (Auth, Theme, etc.)
- Applies global styles

### **`contexts/auth-context.tsx`** - Authentication
- Manages user authentication state
- Provides `useAuth()` hook
- Handles login, logout, token persistence

### **`lib/api.ts`** - API Service Layer
- Centralized API calls
- Handles authentication headers
- Type-safe request/response
- Error handling

### **`lib/constants.ts`** - Configuration
- API endpoints
- Storage keys
- UI constants
- Makes configuration changes easy

### **`types/index.ts`** - Type Definitions
- All shared TypeScript interfaces
- Ensures type consistency
- Single source of truth for data shapes

### **`components/protected-route.tsx`** - Auth Guard
- Wraps protected pages
- Redirects unauthenticated users
- Shows loading state while checking auth

---

## 🔄 Data Flow

### **Authentication Flow**
```
1. User logs in → app/login/page.tsx
2. Calls → lib/api.ts (authApi.login)
3. Stores token → contexts/auth-context.tsx
4. Saves to → localStorage
5. Redirects → /dashboard
```

### **Protected Page Flow**
```
1. User visits /dashboard
2. ProtectedRoute checks → useAuth()
3. If no token → Redirect to /login
4. If token exists → Show page
```

### **API Request Flow**
```
1. Component needs data
2. Gets token from → useAuth()
3. Calls API service → lib/api.ts
4. Service adds auth header
5. Returns typed response
6. Component updates UI
```

---

## 🛠️ How to Add New Features

### **Adding a New Page**
1. Create `app/new-page/page.tsx`
2. Add types to `types/index.ts` (if needed)
3. Add API endpoint to `lib/constants.ts` (if needed)
4. Add API service to `lib/api.ts` (if needed)

### **Adding a New API Endpoint**
1. Add endpoint to `lib/constants.ts`:
   ```ts
   export const API_ENDPOINTS = {
     // ... existing endpoints
     NEW_FEATURE: `${API_BASE_URL}/api/new-feature`,
   };
   ```

2. Add service to `lib/api.ts`:
   ```ts
   export const newFeatureApi = {
     get: async (token: string): Promise<Data> => {
       return apiRequest(API_ENDPOINTS.NEW_FEATURE, { token });
     },
   };
   ```

3. Add types to `types/index.ts`:
   ```ts
   export interface NewFeatureData {
     id: string;
     // ... other fields
   }
   ```

### **Adding a New Context**
1. Create `contexts/new-context.tsx`
2. Follow the pattern from `auth-context.tsx`
3. Add to `components/providers.tsx`

---

## 📦 Import Aliases

Using TypeScript path aliases for clean imports:

```typescript
// ❌ Bad: Relative imports
import { User } from '../../../types';
import { authApi } from '../../../lib/api';

// ✅ Good: Absolute imports with aliases
import { User } from '@/types';
import { authApi } from '@/lib/api';
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 🎨 Styling Conventions

- **Utility-First CSS**: Using Tailwind CSS
- **Component-Scoped**: Styles defined inline with className
- **Global Styles**: Only in `app/globals.css`
- **Responsive**: Mobile-first approach

---

## ✅ Best Practices

### **DO:**
- ✅ Use TypeScript for type safety
- ✅ Keep components small and focused
- ✅ Use the API service layer (`lib/api.ts`)
- ✅ Define types in `types/index.ts`
- ✅ Use constants from `lib/constants.ts`
- ✅ Use `useAuth()` hook for authentication
- ✅ Handle errors gracefully
- ✅ Show loading states

### **DON'T:**
- ❌ Hardcode API URLs in components
- ❌ Duplicate type definitions
- ❌ Make direct fetch calls (use API service)
- ❌ Store sensitive data in localStorage (only tokens)
- ❌ Forget to add `'use client'` for interactive components
- ❌ Nest components too deeply

---

## 🚀 Development Workflow

1. **Run the dev server**: `npm run dev`
2. **Open browser**: http://localhost:3001
3. **Make changes**: Code hot-reloads automatically
4. **Check types**: `npm run type-check`
5. **Lint code**: `npm run lint`

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)


