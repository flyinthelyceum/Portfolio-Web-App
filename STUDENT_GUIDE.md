# Student Guide — Art & Technology Portfolio

**Purpose:** This is your working portfolio. It should show process, experiments, and iteration — not just finished work.

**Goal:** You should be able to publish and update your portfolio from the web.

---

## 1) Make Your Own Copy (Template)
1. Go to the main template repository on GitHub.
2. Click **Use this template**.
3. Name your new repository (for example: `yourname-portfolio`).
4. Keep it **Public** so GitHub Pages and the CMS can work for free.

---

## 2) Deploy Your Site to GitHub Pages
1. In your repository, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Select **main** and **/(root)**.
4. Click **Save**.

Your site will appear at:
`https://YOUR-USERNAME.github.io/YOUR-REPO/`

---

## 3) Enable the CMS (GitHub OAuth)
Decap CMS on GitHub Pages requires a GitHub OAuth App.

1. Go to GitHub → **Settings → Developer settings → OAuth Apps**.
2. Click **New OAuth App**.
3. **Homepage URL:** your GitHub Pages URL
4. **Authorization callback URL:**
   `https://YOUR-USERNAME.github.io/YOUR-REPO/admin/`
5. Copy your **Client ID**.
6. In your repo, open `admin/config.yml` and set:
   - `repo: YOUR-USERNAME/YOUR-REPO`
   - `app_id: YOUR_CLIENT_ID`

Now you can log in at:
- `https://YOUR-USERNAME.github.io/YOUR-REPO/admin/`

---

## 4) Set Your Name, Bio, and Links
1. Go to `/admin`.
2. Open **Settings** → **Site Settings**.
3. Update:
   - Student Name
   - Site Title
   - Bio
   - Links (Instagram, GitHub, Email)
   - GitHub Repo (owner/name of your repo)
4. Click **Save**.

After the site rebuilds, your new name and bio will appear.

---

## 5) Add Working Portfolio Logs (Most Frequent)
1. Go to `/admin` → **Posts** → **New Post**.
2. Choose **Type: log**.
3. Add:
   - Title
   - Publish Date
   - 1–3 images
   - 1–2 short sentences
   - Optional: next step
4. Click **Publish**.

**Log rule:** 3 images · 2 sentences · 1 next step.

---

## 6) Add Projects (Fewer, Deeper)
1. Go to `/admin` → **Projects** → **New Project**.
2. Add:
   - Title
   - Order (1–4)
   - Summary
   - Hero Image
   - Full description
3. Click **Publish**.

---

## 7) If Something Doesn’t Show Up
- Wait 1–2 minutes for GitHub Pages to publish.
- Refresh the site (hard refresh).
- Make sure your post is **Published**, not **Draft**.
- Check that your OAuth app settings match your Pages URL.

---

## 8) Your Portfolio Is a Studio Practice
- Post often.
- Include failed experiments and unfinished work.
- Show what changed, not just what worked.

This is a **Working Portfolio**, not a highlight reel.

---

## Need Help?
Ask your instructor or check the README for troubleshooting tips.
