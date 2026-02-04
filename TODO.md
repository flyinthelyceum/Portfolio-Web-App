# Portfolio Deployment TODO

**Project Purpose:** Multi-tenant portfolio platform for Art & Technology course
**Canonical Reference:** See [PROJECT_CHARTER.md](PROJECT_CHARTER.md)
**Last Updated:** February 4, 2026

---

## ⚠️ ARCHITECTURE CHANGE

This repository has completed its pivot to a **single multi-tenant Firebase architecture**. 

**Status: Phase 1 & 2 Complete ✅**

The original GitHub-based static site approach has been replaced with:
- Firebase Authentication (email/password)
- Firestore Database (multi-tenant with security rules)
- Firebase Storage (image uploads)
- Single web app serving all student portfolios via URL routing

---

## 📋 CURRENT STATE

### ✅ Completed (Phases 1-2 + Profile Editor)
- Firebase project created (portfolio-web-app-26)
- Authentication, Firestore, and Storage configured
- Security rules deployed (public read, owner write, admin access)
- firebase-config.js created with CDN imports (v12.8.0)
- login.html built with brutalist design system
- editor.html + editor.js built for content creation (+ Log, + Project buttons)
- index.html converted from GitHub API to Firestore queries
- app.js converted to Firebase (getDoc, getDocs, where, orderBy)
- Firestore composite index created (userId + createdAt)
- UI redesigned for consistency (login/editor match index.html brutalist design)
- **Profile editor built** (profile.html + profile.js) with username support
- **Cleaner URLs enabled** (?user=username lookup in addition to ?user=userId)

### ⚠️ Remaining Work (Phases 3-7)
- Instructor dashboard (view all students from single interface)
- Bulk student import script (Node.js + Admin SDK)
- Documentation updates (README, STUDENT_GUIDE, INSTRUCTOR_GUIDE)
- Remove old code (admin/, posts/, projects/ markdown folders)
- Deploy to live hosting (Firebase Hosting, GitHub Pages, or Netlify)
- End-to-end testing with multiple students

---

## 📖 FOR DETAILED TASKS

**See:** [TODO-FIREBASE.md](TODO-FIREBASE.md)

That file contains the complete roadmap with:
- All Firebase setup steps (completed)
- Frontend implementation tasks (Phase 2 complete)
- Student management features (pending)
- Documentation requirements
- Deployment instructions
- Testing checklist
- Troubleshooting guide

---

## 🎯 NEXT PRIORITIES

**Option A: Deploy to Production** ⭐ Recommended
- Get a live URL to test with real shareable links (e.g., ?user=alexrivera)
- Validate Firebase works in production environment
- Share with test students for feedback

**Option B: Build Instructor Dashboard**
- View all student portfolios from single interface
- Export data for assessment
- Add/remove students

**Option C: Bulk Student Import Script**
- Create Node.js script for CSV import
- Auto-generate student credentials
- Email delivery template

---

## 💾 FILES TO KEEP

These files are actively used in the Firebase architecture:

- **index.html** - Public portfolio viewer (converted to Firebase)
- **app.js** - Portfolio rendering logic (converted to Firebase)
- **styles.css** - Brutalist design system (CSS variables, typography)
- **login.html** - Authentication UI
- **editor.html** - Content creation interface
- **editor.js** - CRUD operations for logs/projects
- **firebase-config.js** - Firebase initialization
- **PROJECT_CHARTER.md** - Project vision and constraints
- **STUDENT_GUIDE.md** - Student documentation
- **README.md** - Repository overview
- **TODO-FIREBASE.md** - Detailed task tracking

## 🗑️ FILES TO REMOVE (When Ready)

These files are no longer used:

- **admin/** folder - Decap CMS (replaced by Firebase)
- **posts/** folder - Markdown logs (now in Firestore)
- **projects/** folder - Markdown projects (now in Firestore)
- **manifest.json** - Manual content list (replaced by Firestore queries)

---

**For all implementation details, see [TODO-FIREBASE.md](TODO-FIREBASE.md)**
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

### 5. Build Authentication System
**Priority:** HIGH  
**Status:** ❌ Not started

**Charter Alignment:** Section 6.2 - No code editing, web interface only

**Features:**
- Login page with email/password
- Password reset flow
- Session persistence
- Redirect to editor after login

---

### 6. Build Content Editor Interface
**Priority:** HIGH  
**Status:** ❌ Not started

**Charter Alignment:** Section 10 - Never open VS Code; Section 7 - Logs vs Projects

**Features:**
- + button to add log/project
- Image upload with drag-drop
- Rich text editor (simple markdown)
- Save to Firestore
- Real-time preview

---

### 7. Build Public Portfolio Viewer
**Priority:** HIGH  
**Status:** ❌ Not started

**Features:**
- Route: `/student/username`
- Fetch user's posts from Firestore
- Display in existing card layout
- Filter by logs/projects
- Modal for full view

---

### 8. Build Instructor Dashboard
**Priority:** MEDIUM  
**Status:** ❌ Not started

**Charter Alignment:** Section 9 - Browse all student work from one interface

**Features:**
- Grid view of all students
- Click student → see their portfolio
- Filter by date, post count
- Export data as JSON/CSV

---

## PHASE 3: Migration & Cleanup

### 9. Remove Old CMS Code
**Priority:** MEDIUM  
**Status:** ❌ Not started

**Delete:**
- `admin/` folder (Decap CMS)

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
