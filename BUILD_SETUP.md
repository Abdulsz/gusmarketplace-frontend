# Frontend Build Setup for AWS CodeBuild

## Overview
This document explains how to configure the frontend build for AWS CodeBuild.

## Required Environment Variables

The frontend requires the following environment variables to be set in AWS CodeBuild:

### 1. Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
  - Example: `https://nvvudecaaseagbtumypq.supabase.co`
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### 2. API Base URL
- `VITE_API_BASE_URL` - Your backend API base URL
  - Example for production: `https://api.gusmarketplace.com/api/v1/gus`
  - Example for development: `http://localhost:8082/api/v1/gus`

## Setting Environment Variables in AWS CodeBuild

1. Go to AWS CodeBuild Console
2. Select your project: `gus-frontend-build`
3. Click "Edit" → "Environment"
4. Under "Environment variables", add:
   - `VITE_SUPABASE_URL` = `your_supabase_url`
   - `VITE_SUPABASE_ANON_KEY` = `your_supabase_anon_key`
   - `VITE_API_BASE_URL` = `your_backend_api_url`

## Build Configuration

The project uses:
- **Build tool**: Vite
- **Node.js**: Should be available in CodeBuild environment (typically Node 18+)
- **Build command**: `npm run build`
- **Output directory**: `dist/`

## Buildspec.yml

The `buildspec.yml` file is already configured and will:
1. Install dependencies with `npm ci`
2. Build the app with `npm run build`
3. Output artifacts from the `dist/` directory

## Common Build Issues

### Issue: Build fails with "dist directory not found"
- **Cause**: Build command failed or environment variables missing
- **Solution**: Check CodeBuild logs for specific errors, ensure all environment variables are set

### Issue: "Cannot find module" errors
- **Cause**: Dependencies not installed correctly
- **Solution**: Ensure `package.json` and `package-lock.json` are committed to the repository

### Issue: Environment variables not working
- **Cause**: Vite requires `VITE_` prefix for environment variables
- **Solution**: Ensure all environment variables start with `VITE_` prefix

## Local Development

For local development, create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8082/api/v1/gus
```

**Note**: The `.env` file should be in `.gitignore` and not committed to the repository.

