# Portfolio Deployment TODO

**Project Purpose:** Student-facing portfolio template for Art & Technology course
**Canonical Reference:** See [PROJECT_CHARTER.md](PROJECT_CHARTER.md)
**Last Updated:** January 29, 2026

> **Important:** This is a template repository for students. Placeholders (names, bios, sample content) are intentional examples and should NOT be replaced with instructor information.

---

## 🚨 CRITICAL - Template Setup

### 1. Create `.gitignore` File
**Priority:** HIGH  
**Status:** ✅ COMPLETED

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

```

**Why:** Prevents committing system files and IDE settings to your repository.

---

### 2. Initialize Git Repository & Make First Commit
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Commit Details:**
- Commit hash: `b1b2865`
- Files committed: 21 files, 3838 insertions
- Date: January 29, 2026

✅ Initial commit completed successfully!

---

### 3. Create GitHub/GitLab Repository
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Repository Details:**
- Owner: `flyinthelyceum`
- Repo: `Portfolio-Web-App`
- URL: https://github.com/flyinthelyceum/Portfolio-Web-App
- Branch: `main`

✅ Remote configured and initial commit pushed successfully!

**Why:** GitHub Pages and Decap CMS require a Git repository.

---

### 4. Create Assets Directory
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Charter Alignment:** Section 6.2 - Students must not edit code; Section 7 - Content model requires image uploads

**Completion Details:**
- Directory created: `assets/uploads/`
- `.gitkeep` file added to track empty directory
- Commit hash: `3bde2bd`
- Pushed to GitHub: ✅

**Why:** Decap CMS needs this directory to store student-uploaded images. Without it, image uploads will fail.

---

## 🚀 TEMPLATE DEPLOYMENT (GitHub Pages)

### 5. Deploy Template to GitHub Pages
**Priority:** HIGH  
**Status:** ❌ Pending migration

**Charter Alignment:** Section 4 - Static web application on static hosting; Section 10 - Student publishes shareable URL

**Steps:**
1. Go to GitHub repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` and **/ (root)**
4. Save. Your demo URL becomes:
	`https://flyinthelyceum.github.io/Portfolio-Web-App/`

---

### 6. Configure Custom Domain (Optional)
**Priority:** MEDIUM  
**Status:** ❌ Optional

**Charter Alignment:** Section 10 - Professional, shareable URL

**Steps:**
1. In GitHub Pages settings, add your custom domain
2. Create a `CNAME` file with the domain name
3. Update DNS records at your registrar to point to GitHub Pages
4. GitHub will provision HTTPS automatically

---

### 7. Create GitHub OAuth App (Required for CMS)
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Charter Alignment:** Section 6.2 - Students must not edit code; Section 10 - Change name/bio without opening VS Code

**Steps:**
1. GitHub → Settings → Developer settings → OAuth Apps
2. New OAuth App
3. Homepage URL: your GitHub Pages site
4. Authorization callback URL: `https://YOUR-USERNAME.github.io/YOUR-REPO/admin/`
5. Copy **Client ID**

---

### 8. Update CMS Config for GitHub
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Charter Alignment:** Section 6.2 - Students manage content without editing code (one-time setup required)

**Update `admin/config.yml`:**
- `repo: flyinthelyceum/Portfolio-Web-App` ✅
- `app_id: Ov23li020gRLyf588iGF` ✅

---

### 9. Test CMS as Student User (GitHub Pages)
**Priority:** HIGH  
**Status:** ⏳ Ready for testing

**Charter Alignment:** Section 10 - Definition of Done; Section 6.2 - No code editing required after setup

**Test Workflow:**
1. Log into `/admin` with GitHub
2. Create Working Portfolio log entries with images
3. Create a Project entry with statement
4. Verify changes appear on live site after Pages publishes

---

### 10. Set Up Custom Domain (Optional)
**Priority:** LOW  
**Status:** ❌ Optional

If you own a domain:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `yourname.com`)
4. Follow instructions to update DNS records at your registrar
5. GitHub Pages will handle SSL/HTTPS automatically

**Cost:** Domain registration costs money (~$10-15/year)

---

## � STUDENT DOCUMENTATION

### 10. Create Student Onboarding Guide
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Charter Alignment:** Section 2 - Little/no web dev experience; Section 6.2 - Students must not edit code

**Create:** `STUDENT_GUIDE.md` with:
1. How to fork this repository to their own GitHub account
2. How to deploy their fork to GitHub Pages (with screenshots)
3. How to log into `/admin` 
4. How to customize their name, bio, and links
5. How to add Working Portfolio logs (3 images, 2 sentences, 1 next step)
6. How to add Project entries
7. Troubleshooting common issues

**Success Criteria:** A student can follow the guide independently with minimal instructor help.

---

### 11. Document Instructor Workflow
**Priority:** MEDIUM  
**Status:** ❌ Not created

**Charter Alignment:** Section 9 - Instructor workflow; Section 7 - Content maps to Canvas assignments

**Create:** `INSTRUCTOR_NOTES.md` with:
1. How to view all student portfolios (list of URLs)
2. How to assess Working Portfolio frequency/quality
3. How to reference entries during critique
4. Integration with Canvas assignments
5. Semester timeline (when students should post)

---

## 🎨 TEMPLATE VALIDATION

### 12. Review Sample Content Quality
**Priority:** MEDIUM  
**Status:** ⚠️ Template content included

**Charter Alignment:** Section 6.3 - Placeholders are intentional examples; Section 7 - Working Portfolio vs Projects

**Current sample files:**
- 6 sample logs in `posts/` (demonstrate Working Portfolio format)
- 4 sample projects in `projects/` (demonstrate Project format)

**Action:** Review samples to ensure they:
- Model the "3 images, 2 sentences, 1 next step" format for logs
- Show appropriate level of incompleteness/process
- Demonstrate project statement structure
- Use language appropriate for high school students
- Avoid being too polished (remember: process is visible, failure is documented)

**Do NOT delete samples** - they teach by example.

---

### 13. Verify No Build System Required
**Priority:** HIGH  
**Status:** ⚠️ Needs verification

**Charter Alignment:** Section 6.1 - No npm, no bundlers, no frameworks

**Test:**
1. Clone repository fresh to new location
2. Open `index.html` directly in browser (double-click)
3. Or use: `python -m http.server 8000`
4. Verify everything works without any `npm install` or build step

**Success Criteria:** Works immediately with just static files.

---

### 14. Create GitHub Template Repository
**Priority:** HIGH  
**Status:** ❌ Not configured

**Charter Alignment:** Section 4 - Template that students fork; Section 10 - Student workflow

**Steps:**
1. Go to repository settings on GitHub
2. Check the box "Template repository"
3. This allows students to click "Use this template" instead of forking

**Why:** Template repositories create clean copies without fork history, which is cleaner for student portfolios.

---

### 15. Test Mobile Responsiveness
**Priority:** MEDIUM  
**Status:** ❌ Pending deployment

**Charter Alignment:** Section 8 - Aesthetic direction; Section 2 - Visual intuition

After deployment, test on actual devices:
- iPhone/Android phones
- Tablets  
- Different screen sizes

**Check:**
- Working Portfolio cards are readable
- Images display properly
- Modal scrolling works on touch devices
- Navigation menu accessible
- Filter chips work on mobile

---

## 🔧 OPTIONAL ENHANCEMENTS

### 16. Add Settings to CMS
**Priority:** LOW  
**Status:** ✅ COMPLETED

**Charter Alignment:** Section 6.2 - No code editing; Section 10 - Change name/bio via web

**Current:** Students can edit `settings.json` via Decap CMS (no code editor)
**Result:** Settings collection added to `/admin` for student personalization

**Benefit:** Fully removes need for students to edit any code files.

---

## 🛡️ SECURITY & ACCESS

### 17. Configure Repository Visibility
**Priority:** MEDIUM  
**Status:** ⚠️ Needs review

**Charter Alignment:** Section 4 - Students fork template; Section 10 - Shareable URL

**Current:** Repository public (required for GitHub Pages and CMS access)
**Student repos:** Should also be public (so portfolios are shareable)

**Action:** Document in student guide that their repos must stay public for GitHub Pages + CMS access.

---

### 18. Review GitHub OAuth Settings
**Priority:** MEDIUM  
**Status:** ❌ Pending

**Charter Alignment:** Section 6.2 - Students manage content; Section 2 - Appropriate for high school

**Configure:**
- OAuth App Homepage URL matches Pages site
- OAuth callback URL matches `/admin/` on Pages
- App Client ID is saved in `admin/config.yml`

---

## 📊 POST-DEPLOYMENT

### 19. Test Complete Student Workflow
**Priority:** HIGH  
**Status:** ❌ Pending deployment

**Charter Alignment:** Section 10 - Definition of Done

**Full simulation:**
1. Fork/use template as if you're a student
2. Deploy to GitHub Pages following student guide
3. Configure GitHub OAuth App
4. Log into `/admin`
5. Customize name/bio via CMS
6. Add 2-3 Working Portfolio logs with images
7. Add 1 Project with statement
8. Share portfolio URL

**Success:** Complete workflow without opening code editor.

---

### 20. Create Example Portfolio URLs List
**Priority:** LOW  
**Status:** ❌ Not created

**Charter Alignment:** Section 9 - Instructor quickly browses student work

**Create:** Simple tracking system for student portfolio URLs
- Could be a spreadsheet
- Could be a markdown file
- Could integrate with Canvas

**Why:** Easier to visit all student portfolios for assessment/critique.

---

## ✅ DEPLOYMENT CHECKLIST

**Phase 1: Template Infrastructure** (Do first)
- [x] `.gitignore` created
- [x] Git repository initialized with first commit
- [x] Code pushed to GitHub
- [x] `assets/uploads/` directory created
- [ ] Template deployed to GitHub Pages (demo site)
- [ ] GitHub OAuth App configured
- [ ] CMS tested with demo user
- [ ] GitHub repository marked as template

**Phase 2: Documentation** (Before students use)
- [x] STUDENT_GUIDE.md created
- [ ] INSTRUCTOR_NOTES.md created  
- [ ] Sample content reviewed for quality
- [x] README updated with student-facing language

**Phase 3: Validation** (Final checks)
- [ ] No build system required (verify)
- [ ] Complete student workflow tested
- [ ] Mobile responsiveness checked
- [ ] Browser compatibility verified
- [ ] All links functional

**Phase 4: Semester Rollout** (When ready)
- [ ] Demo site URL shared with students
- [ ] Student guide distributed
- [ ] First cohort guided through setup
- [ ] Portfolio URLs collected
- [ ] Integration with Canvas assignments confirmed

---

## 🚧 KNOWN ISSUES / NOTES

1. **Google Drive Sync:** Project currently in Google Drive. For production, consider if this affects Git operations.

2. **CMS Settings:** Settings are editable in `/admin` → Settings. Verify this on GitHub Pages after OAuth is configured.

3. **First Image Upload:** First image upload via CMS might be slow as it creates the `assets/uploads` branch structure.

4. **Placeholders:** All placeholder content (Alex Rivera, sample logs/projects) is intentional and should remain as examples.

5. **Build Comments:** Code contains build version markers (v9). These are fine to keep for debugging but not critical.

---

## 🎯 ESTIMATED TIME

| Phase | Time Estimate |
|-------|---------------|
| Assets directory & push | 5 minutes |
| GitHub Pages deployment | 10 minutes |
| Enable Identity & Gateway | 5 minutes |
| Test CMS workflow | 15 minutes |
| Create student guide | 60 minutes |
| Review & test complete workflow | 30 minutes |
| **TOTAL TO DEPLOYMENT** | **~2 hours** |

---

## 🆘 TROUBLESHOOTING

### CMS not loading
- Check GitHub OAuth App settings
- Verify `app_id` and `repo` in `admin/config.yml`
- Check browser console for errors
- Try incognito/private window

### Images not uploading
- Verify `assets/uploads/` directory exists in repo
- Check GitHub Pages publish status
- Check browser console for errors

### Student can't log in
- Verify invitation email sent
- Check spam folder
- Verify Identity is enabled for their site (not just template)

### Changes not appearing  
- Wait 1-2 minutes for GitHub Pages publish
- Check Pages status in repository settings
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

---

## 📚 RESOURCES FOR STUDENTS

- [GitHub Pages Docs](https://docs.github.com/pages)
- [Decap CMS Docs](https://decapcms.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 📚 RESOURCES FOR INSTRUCTOR

- [Canvas Integration Ideas](https://docs.github.com/pages)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [Assessment Rubric Ideas] (To be created)

---

**Remember:** This is a student template, not a personal portfolio. All decisions should support Section 10 of the charter: students who never open VS Code can maintain their portfolio throughout the semester.
