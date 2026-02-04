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
- ✅ Password reset link
- ✅ Error messaging
- ✅ Redirect to editor.html after successful login
- ✅ Styled with CSS variables from styles.css (sharp borders, box shadows, uppercase labels)

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

### 10. Remove Old Code ⚠️
**Priority:** MEDIUM  
**Status:** Partial - Old files still present but unused

**Can Delete:**
- `admin/` folder (Decap CMS - no longer used)
- `posts/` markdown folder (now in Firestore)
- `projects/` markdown folder (now in Firestore)
- `manifest.json` files (replaced by Firestore queries)

**Keep:**
- styles.css (actively used)
- index.html (converted to Firebase)
- app.js (converted to Firebase)
- Documentation files (PROJECT_CHARTER.md, STUDENT_GUIDE.md, etc.)

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

## PHASE 4: Student Management

### 12. Create Bulk Student Import Script ⚠️
**Priority:** MEDIUM  
**Status:** Not started

**Node.js script using Firebase Admin SDK:**

```javascript
const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');

admin.initializeApp(/* service account */);

fs.createReadStream('students.csv')
  .pipe(csv())
  .on('data', async (row) => {
    const { email, firstName, lastName } = row;
    const tempPassword = generatePassword();
    
    // Create auth account
    const user = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: `${firstName} ${lastName}`
    });
    
    // Create Firestore profile
    await admin.firestore().collection('users').doc(user.uid).set({
      displayName: `${firstName} ${lastName}`,
      email,
      bio: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Created: ${email} / ${tempPassword}`);
  });
```

---

### 13. Create Student Credential Email Template ⚠️
**Priority:** MEDIUM  
**Status:** Not started

**Email to students:**
```
Subject: Art & Technology Portfolio - Your Login Credentials

Hi [Student Name],

Your portfolio account is ready!

URL: https://yourapp.com/login.html
Email: [student.email]
Temporary Password: [password]

Next steps:
1. Visit the URL above
2. Log in with your email and temporary password
3. Click "Edit Profile" to update your information
4. Start adding logs and projects!

Your public portfolio URL:
https://yourapp.com/?user=[userId]

Questions? See the student guide or ask in class.

—Mr./Ms. [Instructor]
```

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

**Completed so far:** ~17 hours (Firebase setup, auth, editor, portfolio viewer, UI redesign)

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
