# Zoho Catalyst Quick Start

This is your quick start guide for deploying to Zoho Catalyst. For detailed instructions, see [CATALYST_DEPLOYMENT.md](./CATALYST_DEPLOYMENT.md).

## 1. Minimal Setup (5 minutes)

```bash
# Make setup script executable
chmod +x catalyst-setup.sh

# Run setup
./catalyst-setup.sh
```

This will:
✓ Install all dependencies
✓ Create `.catalyst-env` file
✓ Build the application

## 2. Configure Environment

Edit `.catalyst-env` with your values:

```plaintext
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-secret-key-here
```

**Where to get these:**
- **DATABASE_URL**: From Supabase, Atlas, or your PostgreSQL provider
- **JWT_SECRET**: Generate a random 32+ character string

## 3. Push to GitHub

```bash
git add .
git commit -m "Configure for Zoho Catalyst deployment"
git push origin main
```

## 4. Deploy in Zoho Catalyst Console

1. Log in to [Zoho Catalyst](https://catalyst.zoho.com)
2. Create a new project
3. Go to **Deployments** → **Connect Repository**
4. Select your GitHub repo: `Zoho Catalyst Order`
5. Go to **Settings** → **Environment Variables**
6. Add:
   - `DATABASE_URL` = (your PostgreSQL connection string)
   - `JWT_SECRET` = (your JWT secret)
   - `NODE_ENV` = `production`
7. Click **Deploy**

## 5. Verify

Once deployment is complete:

```bash
# Test the API
curl https://your-app-name.catalystapp.io/api/health

# Visit your app
https://your-app-name.catalystapp.io
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Catalyst build logs. Run `npm run build` locally first. |
| Database error | Verify DATABASE_URL format and that DB is accessible |
| Frontend not loading | Ensure frontend builds: `cd frontend && npm run build` |
| API 404 errors | Check routes in `backend/src/routes/` and CORS config |

## 📚 Full Documentation

See [CATALYST_DEPLOYMENT.md](./CATALYST_DEPLOYMENT.md) for complete deployment guide, troubleshooting, and post-deployment steps.

## 📂 Key Files

- `catalyst.json` - Catalyst configuration
- `.catalyst-env.example` - Environment variables template
- `CATALYST_DEPLOYMENT.md` - Full deployment guide
- `catalyst-setup.sh` - Automated setup script

---

**Need help?** Check [Zoho Catalyst Docs](https://www.zoho.com/catalyst/docs/)
