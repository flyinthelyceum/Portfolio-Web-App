# Portfolio Deployment TODO - Multi-Tenant Architecture

**Project Purpose:** Multi-tenant portfolio platform for Art & Technology course
**Canonical Reference:** See [PROJECT_CHARTER.md](PROJECT_CHARTER.md)
**Architecture:** Single Firebase app hosting all student portfolios
**Last Updated:** February 4, 2026

---

## PHASE 1: Firebase Backend Setup ✅ COMPLETE

### 1. Create Firebase Project ✅
**Priority:** CRITICAL  
**Status:** Complete

1. ✅ Firebase Console project created
2. ✅ Project name: "portfolio-web-app-26"
3. ✅ Web app configured with credentials
4. ✅ Authentication enabled → Email/Password
5. ✅ Firestore Database created
6. ✅ Firebase Storage enabled

---

### 2. Configure Firestore Security Rules ✅
**Priority:** CRITICAL  
**Status:** Deployed to Firebase Console

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if true; // Public portfolios
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts (logs and projects)
    match /posts/{postId} {
      allow read: if true; // Public portfolios
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Admin access for instructors
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

**Note:** Composite index created for query (userId ASC, createdAt DESC).

---

### 3. Configure Storage Rules ✅
**Priority:** CRITICAL  
**Status:** Deployed to Firebase Console

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true; // Public images
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## PHASE 2: Frontend Implementation ✅ COMPLETE

### 4. Create firebase-config.js ✅
**Priority:** CRITICAL  
**Status:** Complete - Using Firebase v12.8.0

**File:** firebase-config.js exports auth, db, storage services via ES6 modules.

---

### 5. Build login.html (Authentication UI) ✅
**Priority:** HIGH  
**Status:** Complete - Redesigned with brutalist design system

**Features:**
- ✅ Email/password login form with Firebase Auth
- ✅ Google Sign-In button (OAuth popup)
- ✅ Password reset link
- ✅ Error messaging
- ✅ Redirect to editor.html after successful login
- ✅ Auto-creates Firestore profile on first Google login
- ✅ Styled with CSS variables from styles.css (sharp borders, box shadows, uppercase labels)

---

### 5.5. Build signup.html (Email/Password Registration) ✅
**Priority:** HIGH  
**Status:** Complete - Commit 3d3e5d4

**Features:**
- ✅ Email input with validation
- ✅ Password strength requirements (8+ chars, letters, numbers, symbols)
- ✅ Confirm password field
- ✅ Real-time password validation feedback
- ✅ Google Sign-Up button (OAuth popup)
- ✅ Creates Firebase Auth account
- ✅ Creates Firestore profile with initial data
- ✅ Auto-redirects to profile.html for username/bio/avatar setup
- ✅ Link to login.html for existing users
- ✅ Error handling (duplicate emails, weak passwords, popup closure)
- ✅ Styled to match login.html design system

---

### 5.6. Add Google SSO to Both Pages ✅
**Priority:** HIGH  
**Status:** Complete - Commit 343a178

**Implementation (login.html + signup.html):**
- ✅ Google OAuth button with official logo SVG
- ✅ Uses signInWithPopup with GoogleAuthProvider
- ✅ First-time: Creates profile, redirects to profile.html
- ✅ Returning: Skips to editor.html
- ✅ Auto-imports user's Google profile picture (avatarUrl)
- ✅ Divider styling ("Or" between email and Google)
- ✅ Loading state during popup
- ✅ Error handling with user-friendly messages

**Advantages:**
- Perfect for school Google accounts
- Single-click login/signup
- No password to remember
- Profile picture auto-imported
- Falls back to email/password if preferred

---

### 6. Build editor.html + editor.js (Content Creation) ✅
**Priority:** CRITICAL  
**Status:** Complete - Redesigned with brutalist design system

**Charter Alignment:** Section 10 - Never open VS Code; add content via + button

**Features:**
- ✅ Header: User displayName, logout button, edit profile button (placeholder)
- ✅ Main area: Grid of user's posts (cards)
- ✅ **+ Log** button: Opens modal for quick log entry
- ✅ **+ Project** button: Opens modal for project entry
- ✅ Each card: Edit/Delete buttons
- ✅ Filter: All / Logs / Projects
- ✅ Image upload with preview grid (Firebase Storage, up to 5MB per image)
- ✅ Save to Firestore (addDoc, updateDoc, deleteDoc in editor.js)
- ✅ Styled with CSS variables matching index.html design system
- ✅ Composite Firestore index created: (userId ASC, createdAt DESC)

**Note:** Edit Profile button shows alert - profile editor UI not yet built.

---

### 7. Build index.html (Public Portfolio Viewer) ✅
**Priority:** CRITICAL  
**Status:** Complete - Converted from GitHub API to Firebase

**Charter Alignment:** Section 10 - Shareable URL students are proud of

**URL Structure:** `/?user=userId` (username field not yet implemented in user profiles)

**Features:**
- ✅ Fetch user by userId from Firestore (/users/{userId})
- ✅ Display user profile (displayName from Firebase Auth)
- ✅ Display all user's posts in card grid
- ✅ Filter: All / Logs / Projects (preserved from original)
- ✅ Modal viewer for full post
- ✅ Reuses existing CSS card styles and brutalist design system
- ✅ Markdown parsing with marked.js preserved
- ✅ Query: where('userId', '==', userId), orderBy('createdAt', 'desc')

**Note:** URL currently uses userId, not username. Profile editor needed to add username field for cleaner URLs.

---

### 8. Build dashboard.html (Instructor View) ⚠️
**Priority:** MEDIUM  
**Status:** Not started

**Charter Alignment:** Section 9 - Browse all student work from single interface

**Features:**
- Grid of all students (name, photo, post count)
- Click student → view their portfolio in modal/iframe
- Filter: by date range, post count
- Export button: Download all data as JSON/CSV
- Add student button (if not using bulk import)

**Requires:**
- Instructor authentication check (query /admins/{uid})
- Query all users from Firestore
- Aggregate post counts per user

---

### 9. Convert app.js for Firebase ✅
**Priority:** HIGH  
**Status:** Complete

**Replaced:**
- ✅ GitHub API fetch → Firestore queries (getDoc, getDocs)
- ✅ Markdown file parsing → Firebase data rendering
- ✅ Manual manifest.json → Real-time Firestore queries

**Kept:**
- ✅ Card rendering logic
- ✅ Modal viewer
- ✅ Filter functionality (logs/projects)
- ✅ CSS variable theming
- ✅ Markdown parser (marked.js)

---

## PHASE 3: Data Migration & Cleanup

### 10. Remove Old Code ✅
**Priority:** MEDIUM  
**Status:** Complete - Commit 790f6d0

**Deleted:**
- ✅ `admin/` folder (Decap CMS - no longer used)
- ✅ `posts/` markdown folder (now in Firestore)
- ✅ `projects/` markdown folder (now in Firestore)
- ✅ Old `manifest.json` files (replaced by Firestore queries)

**Kept:**
- styles.css (actively used)
- index.html (converted to Firebase)
- app.js (converted to Firebase)
- Documentation files (PROJECT_CHARTER.md, STUDENT_GUIDE.md, etc.)
- v2 Plan/ folder (for future planning)

---
### 11. Migrate Sample Content to Firestore ⚠️
**Priority:** LOW  
**Status:** Not started

**Optional:** Import sample logs/projects from markdown files into Firestore to demonstrate:
- Create sample user profile
- Import existing logs from posts/ folder
- Import existing projects from projects/ folder
- Provides examples for students

**Script needed:** Node.js + Firebase Admin SDK to parse markdown and write to Firestore.

---

## PHASE 6: Student Management ✅ COMPLETE

### 12. Create Bulk Student Import Script ✅
**Priority:** MEDIUM  
**Status:** Complete - Commit 10b83e5

**Features:**
- ✅ Reads students from CSV file (firstName, lastName, email)
- ✅ Creates Firebase Auth accounts with temporary passwords
- ✅ Creates Firestore profiles for each student
- ✅ Generates random 12-character passwords (no ambiguous chars)
- ✅ Generates credentials-email.html with all student data
- ✅ Clear console output showing success/error for each student
- ✅ Validates CSV format and service account credentials

**Files Created:**
- `scripts/import-students.js` - Main import script
- `scripts/package.json` - Node.js dependencies (firebase-admin)
- `scripts/README.md` - Complete setup and usage guide
- `scripts/students-sample.csv` - Example CSV format
- `scripts/.gitignore` - Protects serviceAccountKey.json

**Usage:**
```bash
cd scripts
npm install
node import-students.js students.csv https://yourapp.com
```

**Setup Required:**
1. Get Firebase Admin credentials from Google Cloud Console
2. Save as `scripts/serviceAccountKey.json` (never commit!)
3. Prepare CSV with student data
4. Run import script

---

## PHASE 5: Profile Editor ✅ COMPLETE

### 14. Build Profile Editor UI ✅
**Priority:** HIGH  
**Status:** Complete - Functional profile editor built

**Features:**
- ✅ Separate profile.html page with brutalist design
- ✅ Fields: displayName, username, bio, avatar upload
- ✅ Save to Firestore /users/{uid}
- ✅ Update Firebase Auth displayName and photoURL
- ✅ Username uniqueness validation (prevents duplicates)
- ✅ Avatar upload to Storage with 2MB limit
- ✅ Username generation suggestion from email
- ✅ Auto-redirect to editor after save

**Implementation:**
- profile.html: Form UI matching editor/login design system
- profile.js: Full CRUD logic with validation
- editor.js: Edit Profile button now navigates to profile.html
- app.js: Support for username lookup (?user=username) in addition to ?user=userId

**Impact:** 
- ✅ Enables cleaner URLs: `/?user=alexrivera` instead of `/?user=abc123uid`
- ✅ Students can now set their display information
- ✅ Complete student onboarding workflow

---

## PHASE 6: Documentation

### 15. Update STUDENT_GUIDE.md ⚠️
**Priority:** HIGH  
**Status:** Needs update for Firebase workflow

**New workflow:**
1. Receive login credentials from instructor
2. Visit login.html and authenticate
3. Complete profile (name, username, bio)
4. Add content via + Log or + Project buttons
5. Share portfolio: `app.com/?user=username`

---

### 16. Create INSTRUCTOR_GUIDE.md ⚠️
**Priority:** HIGH  
**Status:** Not created

**Contents:**
1. Firebase setup walkthrough
2. How to bulk import students
3. How to send credentials
4. How to use the dashboard (when built)
5. How to export data at semester end
6. How to assess portfolios
7. Troubleshooting common issues

---

### 17. Update README.md ⚠️
**Priority:** HIGH  
**Status:** Needs update

**Sections:**
- Architecture overview (multi-tenant Firebase)
- Firebase setup instructions
- Deployment instructions
- Student workflow summary
- Instructor workflow summary
- Development/customization guide

---

## PHASE 7: Deployment & Testing

### 18. Deploy to Live Hosting ⚠️
**Priority:** CRITICAL  
**Status:** Not deployed

**Option A: Firebase Hosting (Recommended)**
- Integrated with Firebase backend
- `firebase init hosting` → `firebase deploy`
- URL: `https://portfolio-web-app-26.web.app`
- Free tier, custom domains supported

**Option B: GitHub Pages**
- Push code → Settings → Pages → main branch
- URL: `https://flyinthelyceum.github.io/Portfolio-Web-App/`
- Free, simple, but separate from Firebase

**Option C: Netlify**
- Connect repo → Deploy
- URL: `https://sitename.netlify.app`
- Free, custom domains easy

---

### 19. Test Multi-Tenant Workflow ⚠️
**Priority:** CRITICAL  
**Status:** Partially tested locally

**As student:**
1. ✅ Create test account
2. ✅ Log in
3. ⚠️ Complete profile (edit profile UI not built)
4. ✅ Add 2 logs with images
5. ✅ Add 1 project
6. ✅ View public portfolio URL
7. ✅ Log out and verify portfolio is public

**As instructor:**
1. ⚠️ Log in to dashboard (not built)
2. ⚠️ View all test students
3. ⚠️ Click student → see their work
4. ⚠️ Export data
5. ⚠️ Verify instructor-only access

**As anonymous visitor:**
1. ✅ Visit student public URL
2. ✅ Verify portfolio loads
3. ✅ Verify can't edit (authentication required)
4. ✅ Verify images load from Storage

---

## ✅ FINAL CHECKLIST

**Backend:**
- [x] Firebase project created
- [x] Authentication enabled (Email/Password)
- [x] Firestore created with security rules
- [x] Storage enabled with security rules
- [x] firebase-config.js created with credentials
- [x] Composite index created (userId + createdAt)

**Frontend:**
- [x] login.html built and styled (brutalist design)
- [x] editor.html built with + buttons (brutalist design)
- [x] editor.js with full CRUD operations
- [x] index.html (portfolio viewer) converted to Firebase
- [x] app.js converted to Firebase queries
- [x] Profile editor (profile.html + profile.js) built with username support
- [ ] dashboard.html (instructor) built
- [ ] Old CMS code removed

**Student Management:**
- [ ] Bulk import script created
- [ ] Test students imported
- [ ] Credential email template created

**Documentation:**
- [x] PROJECT_CHARTER.md (existing)
- [ ] README.md updated for Firebase architecture
- [ ] STUDENT_GUIDE.md updated
- [ ] INSTRUCTOR_GUIDE.md created
- [x] TODO-FIREBASE.md updated (this file)

**Deployment:**
- [ ] App deployed to live hosting
- [ ] Firebase connected in production
- [ ] Public URLs tested
- [x] Authentication working (tested locally)
- [x] Content creation tested (tested locally)
- [ ] Instructor dashboard tested

---

## 🎯 TIME ESTIMATE (Remaining Work)

| Task | Time |
|------|------|
| Instructor dashboard | 3 hours |
| Remove old code | 30 min |
| Bulk import script | 1 hour |
| Update documentation | 2 hours |
| Deploy to hosting | 30 min |
| End-to-end testing | 2 hours |
| **TOTAL** | **~11 hours** |

**Completed so far:** ~22 hours (Phases 1-7 complete)

---

## PHASE 7: Documentation ✅ COMPLETE

### README.md ✅
**Status:** Complete - Commit 45ac134

Comprehensive technical overview covering:
- Architecture overview (Firebase, multi-tenant design)
- Feature list (authentication, content creation, sharing)
- Tech stack (HTML/CSS/JS + Firebase + GitHub Pages)
- Project structure (all files documented)
- Getting started (for both students and instructors)
- Design system customization (CSS variables)
- Security (Firestore rules, Storage rules, API security)
- Troubleshooting (common issues and solutions)
- Development (local testing, deployment)
- Roadmap (Phase 1-8)

---

### STUDENT_GUIDE.md ✅
**Status:** Complete - Commit 45ac134

Student-friendly guide covering:
- Getting started (5-minute setup)
- Creating account (Google SSO, email/password)
- Setting profile (displayName, username, bio, avatar)
- Adding logs (frequent updates, 3 images · 2 sentences · 1 next step)
- Adding projects (deep dives with artist statements)
- Editing profile
- Sharing portfolio (with clean URL)
- Viewing portfolio (test before sharing)
- Best practices (documentation over perfection, visual, specific, public)
- Troubleshooting (password reset, sign-in issues, uploads, etc.)

**Tone:** Encouraging, concrete examples, empowers student independence

---

### INSTRUCTOR_GUIDE.md ✅
**Status:** Complete - Commit 45ac134

Comprehensive instructor resource covering:
- Overview (what you're deploying, time required)
- Initial setup (Firebase verification, sharing app URL)
- Adding students (Option A: self-registration, Option B: bulk import with CSV)
- Managing students (monitor activity, reset password, archive, export)
- Support & troubleshooting (common issues, solutions)
- Semester workflow (Week 1 setup, weekly teaching, Week 15 wrap-up)
- Customization (theme colors, fonts, custom domain)
- Security & privacy (FERPA compliance, data ownership, backup)
- Scaling to multiple classes (single app vs separate apps)
- Extending the app (optional future enhancements)
- Getting help (links to additional resources)

**Tone:** Professional, practical, comprehensive, action-oriented

---

## PHASE 8: Instructor Dashboard & Moderation Tools ✅ IN PROGRESS

### Instructor Dashboard ✅
**Status:** Complete - Commit 0a24bba
- ✅ admin.html + admin.js (view all students, stats, activity feed)
- ✅ Real-time stats (students, total posts, logs, projects, last 7 days)
- ✅ Student list with post count and last activity
- ✅ Recent activity feed (type, title, student, date)
- ✅ JSON export (all students + posts)
- ✅ Admin role check (hides Admin button unless /admins/{uid} exists in Firestore)
- ✅ Firestore rules updated (admins can read their own admin doc)

### Moderation Tools ✅
**Status:** Complete - Commit 3dcad96
- ✅ moderation.html + moderation.js (delete posts, restore posts)
- ✅ Ban/unban students interface
- ✅ Confirmation dialogs for destructive actions
- ✅ Post status display (Active vs Deleted)
- ✅ Firestore rules updated (admins can delete/update posts)
- ✅ Linked to admin dashboard via "Moderation" button

### Firestore Rules Updates ✅
- ✅ Allow admins to read their own admin doc (for button visibility)
- ✅ Allow admins to delete/update posts
- ✅ Firestore rules deployment configured in firebase.json

### A. Instructor Dashboard ⏳
Possible features:
- View all student portfolios in grid
- Click student to preview their full portfolio
- Search/filter by name, activity date, post count
- Monitor engagement (frequency, last update)
- Bulk operations (message students, export data)

### B. Student Analytics ⏳
Possible features:
- Activity timeline (when was last log added)
- Post frequency chart
- Engagement metrics
- Time spent in editor
- Image upload stats

### C. Advanced Features ⏳
Possible features:
- Comment system (feedback on posts)
- Post scheduling (queue content to publish later)
- PDF export of entire portfolio
- Duplicate portfolio (share as template)
- Dark mode toggle
- Mobile app (PWA)

---

## PHASE 7B: Firebase Hosting Deployment ✅ COMPLETE

### Live Deployment ✅
**Status:** Complete and tested

- ✅ firebase-tools CLI installed globally
- ✅ firebase.json created with hosting config and rewrites
- ✅ .firebaserc configured with project ID (portfolio-web-app-26)
- ✅ Firebase CLI authenticated
- ✅ Initial deployment to portfolio-web-app-26.web.app successful
- ✅ test.aaand.space DNS configured and custom domain added
- ✅ app.aaand.space ready for production (switch DNS when ready)
- ✅ Firebase Auth authorized domains configured:
  - test.aaand.space ✅
  - app.aaand.space ✅
  - portfolio-web-app-26.web.app ✅

### UI/UX Polish ✅
**Status:** Complete - Commit a48cc9f

- ✅ Auth nav link updates dynamically (Sign In ↔ Editor when logged in)
- ✅ Email field added to profile editor
- ✅ Email displays in portfolio footer with mailto link
- ✅ Separate filter dropdown (decoupled from navigation)
- ✅ Unified card structure for logs and projects (consistent images, hierarchy)
- ✅ Fixed date formatting (handles both strings and Firestore timestamps)
- ✅ Markdown parsing working
- ✅ Card sorting by date (newest first)
- ✅ Simplified navigation (removed redundant Projects section)
- ✅ Projects accessible via filter, not separate nav

### Live URLs
- **Testing:** https://test.aaand.space ✅ (working)
- **Production:** https://app.aaand.space (ready - flip DNS at Squarespace to activate)
- **Fallback:** https://portfolio-web-app-26.web.app (always available)

### To Activate Production Domain
1. Go to Squarespace DNS settings
2. Find test.aaand.space CNAME record
3. Change to point to app.aaand.space
4. Wait 5-10 minutes for propagation
5. Update STUDENT_GUIDE.md with new URL
6. Update README.md with new URL

---

## 🆘 TROUBLESHOOTING

**Student can't log in:**
- Check Firebase Authentication console for user
- Verify email/password correct
- Try password reset flow via login.html
- Check browser console for errors

**Images won't upload:**
- Check Storage rules allow user's UID
- Verify file size under 5MB
- Check browser console for CORS errors
- Verify Storage enabled in Firebase Console

**Public portfolio not loading:**
- Check Firestore rules allow public reads
- Verify userId in URL is correct
- Check browser console for errors
- Test Firestore query in Firebase Console

**"Requires an index" error:**
- Click the link in the error message
- Firebase Console will create the index
- Wait 1-2 minutes for index to build

**Dashboard shows no students:**
- Verify instructor account in /admins collection
- Check Firestore security rules
- Verify query in dashboard.html
- Check browser console for errors

**Design inconsistency:**
- All pages should use CSS variables from styles.css
- Check that login.html and editor.html match index.html
- Verify no inline styles overriding variables

---

## 📝 NOTES FROM DEVELOPMENT

**Architecture Decisions:**
- Using Firebase v12.8.0 CDN modules (not npm) per PROJECT_CHARTER constraint (no bundlers)
- Multi-tenant single app with URL routing via ?user=userId query parameter
- Brutalist editorial design system with CSS variables (--spacing-*, --border-*, --color-*)
- Public read access for portfolios, owner-write for posts, admin override for instructors

**Known Issues:**
- Edit Profile button in editor.html shows alert - UI not implemented yet
- URLs use userId instead of username - need username field in profiles
- Sample markdown content not yet migrated to Firestore
- No instructor dashboard yet - can't view all students from single interface

**Recent Changes (Feb 3, 2026):**
- Redesigned login.html and editor.html to match index.html brutalist design
- Applied CSS variables for consistency (--spacing-lg, --border-medium, --shadow-md)
- Updated button classes from generic .btn to .editor-btn / .modal__btn
- Changed form labels to uppercase, removed rounded corners, added sharp borders

---

**Next Priority:** Deploy to live hosting OR build profile editor for cleaner URLs.
