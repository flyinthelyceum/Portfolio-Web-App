# Portfolio Deployment TODO

**Project Status:** Ready for deployment with some setup tasks required
**Last Updated:** January 29, 2026

---

## 🚨 CRITICAL - Pre-Deployment

### 1. Create `.gitignore` File
**Priority:** HIGH  
**Status:** ❌ Missing

Create a `.gitignore` file to exclude unnecessary files from version control:

```
# OS Files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
Thumbs.db

# IDE
.vscode/
.idea/

# Node modules (if added later)
node_modules/

# Environment files
.env
.env.local

# Build outputs (if added later)
dist/
build/

# Netlify
.netlify/
```

**Why:** Prevents committing system files and IDE settings to your repository.

---

### 2. Initialize Git Repository & Make First Commit
**Priority:** HIGH  
**Status:** ⚠️ Git initialized but no commits made

```bash
git add .gitignore
git add README.md
git add settings.json
git add index.html
git add styles.css
git add app.js
git add admin/
git add posts/
git add projects/
git commit -m "Initial commit: Art & Technology Portfolio"
```

**Note:** You have untracked files. First commit must be made before pushing to remote.

---

### 3. Create GitHub/GitLab Repository
**Priority:** HIGH  
**Status:** ❌ No remote repository configured

**Steps:**
1. Go to [github.com](https://github.com) (or GitLab/Bitbucket)
2. Create new repository (e.g., `portfolio-webapp`)
3. Keep it public (required for free Netlify CMS)
4. DO NOT initialize with README (you already have one)
5. Copy the repository URL

**Then connect local repo to remote:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio-webapp.git
git branch -M main
git push -u origin main
```

**Why:** Netlify needs a Git repository to deploy from and enable the CMS.

---

### 4. Personalize Settings
**Priority:** HIGH  
**Status:** ⚠️ Using template data

Edit `settings.json` with actual information:

**Current placeholders to replace:**
- `studentName`: "Alex Rivera" → Your actual name
- `siteTitle`: Update to match your name
- `bio`: Update with your actual studio statement
- `accentColor`: Keep or customize
- `links.Instagram`: Update or remove if not using
- `links.GitHub`: Update with actual GitHub URL
- `links.Email`: Update with actual email (currently `student@brophyprep.org`)

**Also update in files:**
- Footer contact info in `index.html` (line 107-108)

---

## 🚀 DEPLOYMENT

### 5. Deploy to Netlify
**Priority:** HIGH  
**Status:** ❌ Not deployed

**Steps:**
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your portfolio repository
6. Configure build settings:
   - **Build command:** Leave blank
   - **Publish directory:** `.` or leave blank
   - **Branch to deploy:** `main`
7. Click "Deploy site"
8. Wait for initial deployment (1-2 minutes)

**Result:** You'll get a URL like `random-name-12345.netlify.app`

---

### 6. Configure Custom Site Name (Optional)
**Priority:** MEDIUM  
**Status:** ❌ Pending deployment

After deployment:
1. Go to Site settings → Site details
2. Click "Change site name"
3. Choose something like: `yourname-portfolio.netlify.app`
4. Update is instant

---

### 7. Enable Netlify Identity (Required for CMS)
**Priority:** HIGH  
**Status:** ❌ Pending deployment

**Steps:**
1. In Netlify dashboard → Site settings → Identity
2. Click "Enable Identity"
3. Under Registration preferences → Set to "Invite only"
4. Under External providers → Enable any you want (GitHub, Google, etc.)

**Why:** This allows you to log into `/admin` and manage content.

---

### 8. Enable Git Gateway (Required for CMS)
**Priority:** HIGH  
**Status:** ❌ Pending deployment

**Steps:**
1. In Identity settings → Services → Git Gateway
2. Click "Enable Git Gateway"
3. This allows the CMS to commit directly to your repository

**Why:** The CMS needs to write changes back to your Git repository.

---

### 9. Create Your Admin User
**Priority:** HIGH  
**Status:** ❌ Pending Identity setup

**Steps:**
1. In Netlify → Identity → Invite users
2. Enter your email address
3. Check your email for the invite
4. Click the confirmation link
5. Set your password

**Test:**
- Visit `yoursite.netlify.app/admin`
- Log in with your email and password
- You should see the Decap CMS interface

---

### 10. Set Up Custom Domain (Optional)
**Priority:** LOW  
**Status:** ❌ Optional

If you own a domain:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `yourname.com`)
4. Follow instructions to update DNS records at your registrar
5. Netlify will handle SSL/HTTPS automatically

**Cost:** Domain registration costs money (~$10-15/year)

---

## 📁 CONTENT

### 11. Review Sample Content
**Priority:** MEDIUM  
**Status:** ⚠️ Template content included

**Current sample files:**
- 6 sample logs in `posts/`
- 4 sample projects in `projects/`

**Decision needed:**
- Keep samples for testing → Leave as-is temporarily
- Start fresh → Delete samples, add your own via CMS

**To delete samples via CMS:**
1. Go to `/admin`
2. Click on Posts/Projects
3. Delete individual items

---

### 12. Create Missing Directory
**Priority:** MEDIUM  
**Status:** ❌ Assets folder not created

Create the uploads directory:
```bash
mkdir -p assets/uploads
```

**Why:** Decap CMS will upload images here. Without it, image uploads may fail.

**Important:** Add a `.gitkeep` file so Git tracks the empty folder:
```bash
touch assets/uploads/.gitkeep
git add assets/uploads/.gitkeep
git commit -m "Add assets/uploads directory"
git push
```

---

### 13. Add Your First Real Content
**Priority:** MEDIUM  
**Status:** ❌ Pending CMS setup

**After CMS is working:**
1. Create your first log entry
2. Add at least 1-2 project overviews
3. Test the filtering and modal functionality

---

## 🎨 CUSTOMIZATION

### 14. Customize Visual Theme (Optional)
**Priority:** LOW  
**Status:** ✅ Default theme applied

**If desired, edit CSS variables in `styles.css`:**
- Line 6-22: Color palette
- Line 24-26: Font families
- Line 28-34: Spacing scale
- Line 36-40: Border widths

**Or use `settings.json`** for quick theme changes:
- `accentColor`
- `cardRadius`
- `spacing`

---

### 15. Test on Mobile Devices
**Priority:** MEDIUM  
**Status:** ❌ Pending deployment

After deployment:
- Test on iPhone/Android
- Check responsive layout
- Verify touch interactions work
- Test modal scrolling on mobile

---

## 🧪 TESTING

### 16. Verify Local Development
**Priority:** MEDIUM  
**Status:** ⚠️ Needs verification

**Test locally before deploying changes:**
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

**Check:**
- ✅ Settings load correctly
- ✅ Posts display in feed
- ✅ Projects grid renders
- ✅ Filtering works
- ✅ Modal opens/closes
- ✅ Links work

---

### 17. Browser Compatibility Check
**Priority:** LOW  
**Status:** ❌ Pending deployment

Test in:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari (desktop & iOS)
- ✅ Mobile browsers

---

### 18. CMS Content Test
**Priority:** HIGH  
**Status:** ❌ Pending CMS setup

**After setting up CMS:**
1. Create a new log via `/admin`
2. Upload an image
3. Publish the post
4. Verify it appears on the main site (may take 1-2 min for rebuild)
5. Edit the post
6. Delete a test post

**Why:** Confirms the entire CMS → Git → Deploy pipeline works.

---

## 🛡️ SECURITY & BEST PRACTICES

### 19. Review Security Settings
**Priority:** MEDIUM  
**Status:** ❌ Pending deployment

**In Netlify settings:**
- Enable HTTPS (automatic)
- Set Identity registration to "Invite only" (prevents spam accounts)
- Review allowed email domains if needed

---

### 20. Set Up Deployment Notifications (Optional)
**Priority:** LOW  
**Status:** ❌ Optional

**Options:**
- Email notifications on deploy success/failure
- Slack integration
- GitHub status checks

**Configure in:** Netlify → Site settings → Build & deploy → Deploy notifications

---

## 📊 POST-DEPLOYMENT

### 21. Monitor First Deployment
**Priority:** HIGH  
**Status:** ❌ Pending deployment

**Check after going live:**
- ✅ Site loads without errors
- ✅ All links work
- ✅ Images display correctly
- ✅ CMS login works
- ✅ Content updates deploy automatically

**Where to check for errors:**
- Netlify deploy logs
- Browser console (F12)
- Network tab for failed requests

---

### 22. Share Portfolio URL
**Priority:** MEDIUM  
**Status:** ❌ Pending deployment

**Once everything works:**
- Update your GitHub profile with portfolio link
- Add to resume/CV
- Share on social media
- Add to email signature

---

### 23. Set Up Analytics (Optional)
**Priority:** LOW  
**Status:** ❌ Optional, not configured

**Options:**
- Netlify Analytics (paid, privacy-friendly)
- Google Analytics (free, more detailed)
- Plausible (privacy-focused, paid)

**Implementation:** Add tracking script to `index.html` `<head>`

---

### 24. Create Backup Strategy
**Priority:** LOW  
**Status:** ⚠️ Git provides version control

**Current backup:** All content is in Git repository (automatic backup)

**Optional enhanced backup:**
- Clone repository to second location
- Export content periodically
- Keep local copies of images

---

## 🔄 MAINTENANCE

### 25. Content Update Workflow
**Priority:** MEDIUM  
**Status:** ❌ Document after deployment

**Establish routine:**
1. Log work regularly (aim for weekly logs)
2. Update project pages when milestones hit
3. Keep portfolio current

**Two methods:**
- **Via CMS:** Easy, non-technical, at `/admin`
- **Via Code:** Edit markdown files, commit, push

---

### 26. Keep Dependencies Updated
**Priority:** LOW  
**Status:** ⚠️ Currently using CDN links

**Current external dependencies:**
- Google Fonts (CDN)
- Netlify Identity Widget (CDN)
- Netlify CMS (CDN)

**Action:** Check for updates every 6-12 months
- CMS: Update version in `/admin/index.html` (line 15)
- Identity: Usually auto-updates

---

## 📝 DOCUMENTATION

### 27. Create Personal Documentation (Optional)
**Priority:** LOW  
**Status:** ❌ Optional

**Consider adding:**
- `CHANGELOG.md` - Track major changes over time
- `CONTRIBUTING.md` - If others will add content
- `DEPLOYMENT.md` - Your specific deployment notes

---

## ✅ FINAL CHECKLIST

**Before announcing your portfolio is live:**

- [ ] `.gitignore` created
- [ ] Git repository initialized with first commit
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Settings personalized (name, bio, email, links)
- [ ] Deployed to Netlify successfully
- [ ] Custom site name set (optional but recommended)
- [ ] Netlify Identity enabled
- [ ] Git Gateway enabled
- [ ] Admin user created and tested
- [ ] CMS access confirmed at `/admin`
- [ ] `assets/uploads/` directory created
- [ ] Test post created via CMS
- [ ] Test post appears on live site
- [ ] Mobile responsive checked
- [ ] All links work (social, email, etc.)
- [ ] Browser console shows no errors
- [ ] Sample content reviewed (keep or delete)

---

## 🚧 KNOWN ISSUES / NOTES

1. **Google Drive Sync:** Your project is in Google Drive. Consider moving to a regular folder before pushing to Git to avoid sync conflicts.

2. **CMS Image Uploads:** First image upload via CMS might be slow as it creates the `assets/uploads` branch structure.

3. **Build Version:** Code has build version tracking (v9) in comments. Consider removing or updating these for production.

4. **Hardcoded Text:** Some placeholder text exists in `index.html` (footer contact) that should be updated.

---

## 🎯 ESTIMATED TIME TO DEPLOY

| Task Group | Time Estimate |
|------------|---------------|
| Git & GitHub setup | 15 minutes |
| Personalize settings | 10 minutes |
| Netlify deployment | 10 minutes |
| Enable Identity & Gateway | 5 minutes |
| Create admin user & test | 10 minutes |
| Create assets folder | 2 minutes |
| Test full workflow | 10 minutes |
| **TOTAL** | **~60 minutes** |

---

## 🆘 IF SOMETHING GOES WRONG

### CMS not loading
- Check browser console for errors
- Verify Identity is enabled
- Try logging out and back in
- Clear browser cache

### Images not uploading
- Check `assets/uploads/` exists
- Verify Git Gateway is enabled
- Check Netlify deploy logs

### Changes not appearing
- Wait 1-2 minutes for Netlify rebuild
- Check deploy status in Netlify
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Site not building on Netlify
- Check Netlify deploy logs
- Verify all files pushed to Git
- Check for JavaScript console errors

---

## 📚 HELPFUL RESOURCES

- [Netlify Docs](https://docs.netlify.com/)
- [Decap CMS Docs](https://decapcms.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

---

**Good luck with your deployment! 🚀**

*Remember: Start with the Critical section, then Deployment, then everything else can be done over time.*
