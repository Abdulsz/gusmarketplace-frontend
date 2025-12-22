# Migration from Vite to Next.js - Complete

## What Changed

### 1. Framework Migration
- ✅ Migrated from Vite + React to Next.js 14
- ✅ Converted from client-side routing (react-router-dom) to Next.js App Router
- ✅ Added server-side API routes with Google Secret Manager integration

### 2. File Structure Changes
- ✅ Created `app/` directory for Next.js App Router
- ✅ Moved routing to file-based routing (`app/page.jsx`, `app/login/page.jsx`, etc.)
- ✅ Created API routes in `app/api/gus/` with Secret Manager integration
- ✅ Removed Vite-specific files (`vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`)

### 3. API Integration
- ✅ Created server-side API routes that:
  - Fetch API key from Google Secret Manager
  - Cache API key for 5 minutes to reduce API calls
  - Forward requests to your GCP backend with authentication
  - Forward user authentication tokens from Supabase

### 4. Component Updates
- ✅ Added `'use client'` directives to all client components
- ✅ Updated navigation from `react-router-dom` to `next/navigation`
- ✅ Updated environment variable access (VITE_* → NEXT_PUBLIC_*)
- ✅ Updated Supabase redirect URLs to use dynamic origin

## Environment Variables

Create a `.env.local` file with:

```env
# GCP Configuration
GCP_SERVICE_ACCOUNT_KEY={"client_email":"...","private_key":"..."}
GCP_PROJECT_ID=your-project-id
GCP_SECRET_ID=MY_API_KEY_SECRET_ID
BACKEND_URL=https://your-backend-url.run.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** 
- Server-side variables (GCP_*) should NOT have `NEXT_PUBLIC_` prefix
- Client-side variables (Supabase) MUST have `NEXT_PUBLIC_` prefix

## Next Steps

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   - Copy the example above to `.env.local`
   - Fill in your actual values

3. **Update Backend URL:**
   - Update `BACKEND_URL` in `.env.local` with your actual GCP backend URL
   - Update `BACKEND_URL` in all API route files if needed

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Test the Migration:**
   - Verify all routes work (`/`, `/login`, `/auth/callback`, `/auth/reset-password`)
   - Test API calls (fetching listings, creating listings, etc.)
   - Verify authentication flow

## API Routes Created

- `GET /api/gus` - Fetch all listings
- `POST /api/gus/create` - Create a listing (with file upload support)
- `POST /api/gus/delete/[id]` - Delete a listing
- `POST /api/gus/contact-seller/[id]` - Contact seller via email

All API routes:
- Fetch API key from Google Secret Manager (cached for 5 minutes)
- Forward requests to your GCP backend
- Forward user authentication tokens via `X-User-Authorization` header

## Notes

- The API key is cached server-side for 5 minutes to reduce Secret Manager API calls
- User authentication tokens are forwarded to your backend so it can still identify users
- All client components have `'use client'` directive
- The app uses Next.js App Router (not Pages Router)

