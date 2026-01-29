# Deployment Guide: GitHub and Vercel Setup

## ✅ Phase 1: Git Repository - COMPLETED
- Git repository initialized
- All files committed
- Branch renamed to `main`

## 📋 Phase 2: Create GitHub Repository

### Step 1: Create New Repository on GitHub

1. Go to **https://github.com/new**
2. Fill in the repository details:
   - **Repository name**: `pastebin-lite` (or your preferred name)
   - **Description**: "A simple pastebin-like application built with Next.js and Vercel KV"
   - **Visibility**: Choose **Public** (recommended) or **Private**
   - **⚠️ IMPORTANT**: 
     - ❌ **DO NOT** check "Add a README file"
     - ❌ **DO NOT** check "Add .gitignore"
     - ❌ **DO NOT** check "Choose a license"
     - (We already have these files)
3. Click **"Create repository"**

### Step 2: Push Code to GitHub

After creating the repository, GitHub will show you setup instructions. Use these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/pastebin-lite.git
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

If you see authentication prompts:
- Use a **Personal Access Token** (not your password)
- Or use GitHub CLI: `gh auth login`

---

## 📋 Phase 3: Import to Vercel

### Step 1: Import Project

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. If prompted, authorize Vercel to access your GitHub account
4. Select your repository: `pastebin-lite` (or whatever you named it)
5. Vercel will auto-detect it's a Next.js project
6. Click **"Deploy"** (use default settings)

### Step 2: Wait for Initial Build

- Vercel will build and deploy your app
- ⚠️ **Note**: The first deployment will likely **fail** because database environment variables aren't set yet
- This is **expected** - we'll fix it in the next phase

---

## 📋 Phase 4: Connect Database

### Step 1: Connect Redis Database to Vercel Project

You have two options:

**Option A: From Redis Database Page**
1. Go to your Redis database page in Vercel dashboard
2. Click **"Connect Project"** button
3. Select your `pastebin-lite` project (it should now appear in the list!)
4. Click **"Connect"** or **"Link"**

**Option B: From Vercel Project Page**
1. Go to your Vercel project dashboard
2. Click on the **"Storage"** tab
3. Find your Redis database (`pastebin-lite-kv`)
4. Click **"Link"** or **"Connect"**

### Step 2: Configure Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. You should see variables that were auto-added (likely `UPSTASH_REDIS_*`):
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - Possibly `UPSTASH_REDIS_URL`

3. **Add these additional variables** (copy the values from the `UPSTASH_*` ones):
   - **Name**: `KV_REDIS_URL` → **Value**: (copy from `UPSTASH_REDIS_URL` if it exists, otherwise leave empty)
   - **Name**: `KV_REDIS_REST_URL` → **Value**: (copy from `UPSTASH_REDIS_REST_URL`)
   - **Name**: `KV_REDIS_REST_TOKEN` → **Value**: (copy from `UPSTASH_REDIS_REST_TOKEN`)

4. For each variable, select:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

5. Click **"Save"** after adding each variable

### Step 3: Redeploy Application

1. Go to the **"Deployments"** tab in your Vercel project
2. Click the **"⋯"** (three dots) menu on the latest deployment
3. Click **"Redeploy"**
4. Or simply push a new commit to trigger auto-deployment

---

## 📋 Phase 5: Verify Deployment

### Test Your Application

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Test the health check endpoint:
   - Visit: `https://your-project-name.vercel.app/api/healthz`
   - Should return: `{"ok": true}`
3. Test creating a paste:
   - Go to the home page
   - Enter some text
   - Click "Create Paste"
   - Copy the URL and test viewing it

### Troubleshooting

- **Health check returns `{"ok": false}`**: 
  - Check that environment variables are set correctly
  - Verify database is connected to the project
  
- **Build fails**: 
  - Check build logs in Vercel dashboard
  - Ensure all dependencies are in `package.json`
  
- **Database connection fails**: 
  - Verify env vars match what your code expects (`KV_REDIS_*`)
  - Check that database is linked to the project

---

## 🎉 Success!

Once everything is working:
- Your app is live at: `https://your-project-name.vercel.app`
- Share this URL for testing
- All API endpoints should be functional
- Database is connected and working

---

## Next Steps

1. Test all functionality:
   - Create pastes
   - View pastes
   - Test TTL expiry
   - Test view limits
2. Share your deployed URL
3. Monitor usage in Vercel dashboard
