# Zoho Catalyst Deployment Guide

This document provides step-by-step instructions to deploy the Optical Shop Order Management system to Zoho Catalyst.

## Prerequisites

1. **Zoho Catalyst Account** - You already have this
2. **GitHub Repository** - Your project must be pushed to GitHub
3. **PostgreSQL Database** - Set up a PostgreSQL database (you can use:
   - Zoho Catalyst Managed PostgreSQL
   - Supabase (current setup)
   - Any other PostgreSQL provider
4. **Zoho Catalyst CLI** (optional but recommended)

## Step-by-Step Deployment

### 1. Prepare Your GitHub Repository

- Ensure all code is committed and pushed to GitHub
- Create a `.catalyst-env` file with your environment variables (see `.catalyst-env.example`)
- Verify `catalyst.json` is in the root directory

### 2. Set Up Your Database

Choose one option:

#### Option A: Use Supabase (Current Setup - Recommended)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. In Settings → Database, copy your PostgreSQL connection string
4. Note your JWT secret or create one in Settings → API

#### Option B: Use Zoho Catalyst PostgreSQL
1. In Zoho Catalyst console, create a new PostgreSQL service
2. Copy the connection details provided

### 3. Configure Environment Variables in Zoho Catalyst Console

1. Log in to [Zoho Catalyst Console](https://catalyst.zoho.com)
2. Create a new project or select your project
3. Navigate to **Settings → Environment Variables**
4. Add the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong random string (min 32 characters)
   - `NODE_ENV`: `production`
   - `DATABASE_SSL`: `true`

### 4. Connect GitHub Repository

1. In Zoho Catalyst Console:
   - Go to **Deployments** or **Source Control**
   - Click **Connect Repository**
   - Authenticate with GitHub
   - Select your `Zoho Catalyst Order` repository
   - Choose the branch (typically `main` or `master`)

### 5. Configure Build Settings

In the Catalyst console deployment settings:

- **Frontend Build Command**: `npm install && npm run build`
- **Frontend Output Directory**: `dist`
- **Backend Build Command**: `npm install && npm run build`
- **Backend Start Command**: `npm start`
- **Node Runtime**: Node 18 or later

### 6. Deploy

In Zoho Catalyst Console:
1. Click **Deploy** or **Build & Deploy**
2. Monitor the build logs to ensure both frontend and backend compile successfully
3. Once complete, you'll receive a Catalyst domain URL

### 7. Verify Deployment

Test your deployment:

```bash
# Test health endpoint
curl https://your-catalyst-app.com/api/health

# Test frontend
Visit https://your-catalyst-app.com in your browser
```

## Troubleshooting

### Build Fails
- Check the build logs in Catalyst console
- Ensure all dependencies in `package.json` files are correctly specified
- Verify TypeScript compilation: `npm run build` locally

### Database Connection Issues
- Verify DATABASE_URL format: `postgresql://user:password@host:port/dbname`
- Ensure database is accessible from Catalyst servers
- If using Supabase, check that SSL is enabled
- Test connection locally with the same DATABASE_URL

### Frontend Not Loading
- Check that Vite builds correctly: `npm run build` in the frontend directory
- Verify the frontend is configured to call the backend at the correct URL
- Check browser console for API errors

### API Calls Failing
- Verify JWT_SECRET is the same in environment variables
- Check that CORS is properly configured in backend
- Ensure authentication tokens are being sent correctly in requests

## Post-Deployment

1. **Update Frontend API Base URL** (if needed):
   - The frontend proxy in `vite.config.ts` forwards API calls to localhost:5000
   - In production, Catalyst's gateway should route them appropriately
   - If issues occur, update `src/main.tsx` or create an API configuration file

2. **Monitor Logs**:
   - Access Catalyst console logs to monitor application health
   - Set up error tracking/alerting

3. **Database Migrations**:
   - The application auto-creates tables on first run
   - For schema changes, connect to your database directly

4. **Updates & Redeployment**:
   - Push changes to GitHub
   - Catalyst will auto-redeploy (if auto-deploy is enabled) or manually trigger deployment

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Secret key for JWT tokens | A long random string |
| `DATABASE_SSL` | No | Enable SSL for database | `true` |
| `NODE_ENV` | No | Environment (production/development) | `production` |
| `PORT` | No | Backend port | `5000` |

## Support

For Zoho Catalyst-specific issues:
- [Zoho Catalyst Documentation](https://www.zoho.com/catalyst/docs/)
- [Zoho Catalyst Community](https://www.zoho.com/catalyst/community/)

For application-specific issues:
- Check the source code
- Review build logs
- Test locally with `npm run dev`
