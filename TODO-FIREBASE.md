# Portfolio Deployment TODO - Multi-Tenant Architecture

**Project Purpose:** Multi-tenant portfolio platform for Art & Technology course
**Canonical Reference:** See [PROJECT_CHARTER.md](PROJECT_CHARTER.md)
**Architecture:** Single Firebase app hosting all student portfolios
**Last Updated:** January 29, 2026

---

## PHASE 1: Firebase Backend Setup

### 1. Create Firebase Project ❌
**Priority:** CRITICAL  
**Status:** Not started

1. Go to https://console.firebase.google.com
2. Create new project: "Art Tech Portfolio"
3. Add web app, get config credentials
4. Enable **Authentication** → Email/Password
5. Enable **Firestore Database**
6. Enable **Firebase Storage**

---

### 2. Configure Firestore Security Rules ❌
**Priority:** CRITICAL

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

---

### 3. Configure Storage Rules ❌
**Priority:** CRITICAL

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true; // Public images
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## PHASE 2: Frontend Implementation

### 4. Create firebase-config.js ❌
**Priority:** CRITICAL

```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

### 5. Build login.html (Authentication UI) ❌
**Priority:** HIGH

**Features:**
- Email/password login form
- Password reset link
- Error messaging
- Redirect to editor.html after login
- Remember me checkbox

---

### 6. Build editor.html (Content Creation) ❌
**Priority:** CRITICAL

**Charter Alignment:** Section 10 - Never open VS Code; add content via + button

**Features:**
- Header: User name, logout button
- Main area: Grid of user's posts (cards)
- **+ Log** button: Opens modal for quick log entry
- **+ Project** button: Opens modal for project entry
- Each card: Edit/Delete buttons
- Filter: All / Logs / Projects

**Modal for Logs:**
- Title input
- Date picker (default: today)
- Image upload (drag-drop, max 3)
- Body textarea (markdown support)
- Save button → writes to Firestore

**Modal for Projects:**
- Title input
- Hero image upload
- Order number (1-4)
- Summary textarea
- Body textarea (markdown)
- Save button → writes to Firestore

---

### 7. Build index.html (Public Portfolio Viewer) ❌
**Priority:** CRITICAL

**Charter Alignment:** Section 10 - Shareable URL students are proud of

**URL Structure:** `/student/username` or `/?user=username`

**Features:**
- Fetch user by username from Firestore
- Display user profile (name, bio, links)
- Display all user's posts in card grid
- Filter: All / Logs / Projects
- Modal viewer for full post
- Reuse existing CSS card styles

**Data fetching:**
```javascript
// Get username from URL
const username = new URLSearchParams(window.location.search).get('user');

// Fetch user profile
const userDoc = await getDoc(doc(db, 'users', username));

// Fetch user's posts
const q = query(
  collection(db, 'posts'),
  where('userId', '==', username),
  orderBy('createdAt', 'desc')
);
const posts = await getDocs(q);
```

---

### 8. Build dashboard.html (Instructor View) ❌
**Priority:** MEDIUM

**Charter Alignment:** Section 9 - Browse all student work from single interface

**Features:**
- Grid of all students (name, photo, post count)
- Click student → view their portfolio in modal/iframe
- Filter: by date range, post count
- Export button: Download all data as JSON/CSV
- Add student button (if not using bulk import)

**Requires:**
- Instructor authentication check
- Query all users from Firestore
- Aggregate post counts per user

---

### 9. Convert app.js for Firebase ❌
**Priority:** HIGH

**Replace:**
- Markdown file fetching → Firestore queries
- Local file parsing → Firebase data rendering
- Manual manifest → Real-time database

**Keep:**
- Card rendering logic
- Modal viewer
- Filter functionality
- CSS variable theming

---

## PHASE 3: Data Migration & Cleanup

### 10. Remove Old Code ❌
**Priority:** MEDIUM

**Delete:**
- `admin/` folder (Decap CMS)
- `api/` folder (OAuth gateway)
- `vercel.json`
- `posts/` and `projects/` markdown folders
- `manifest.json` files
- GitHub API code in app.js
- settings.json (now in Firestore)

**Keep:**
- styles.css (reuse entirely)
- Current HTML structure (adapt for Firebase)
- Modal and card components

---

### 11. Migrate Sample Content to Firestore ❌
**Priority:** LOW

**Optional:** Import sample logs/projects into Firebase to demonstrate:
- Create sample user "Alex Rivera"
- Import 6 sample logs
- Import 4 sample projects
- Shows students what good documentation looks like

---

## PHASE 4: Student Management

### 12. Create Bulk Student Import Script ❌
**Priority:** MEDIUM

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
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      displayName: `${firstName} ${lastName}`,
      email,
      bio: '',
      links: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Created: ${email} / ${tempPassword}`);
  });
```

---

### 13. Create Student Credential Email Template ❌
**Priority:** MEDIUM

**Email to students:**
```
Subject: Art & Technology Portfolio - Your Login Credentials

Hi [Student Name],

Your portfolio account is ready!

URL: https://yourapp.com
Email: [student.email]
Temporary Password: [password]

Next steps:
1. Visit the URL above
2. Log in with your email and temporary password
3. Change your password
4. Complete your profile (name, bio, social links)
5. Start adding logs and projects!

Your public portfolio URL will be:
https://yourapp.com/student/[username]

Questions? See the student guide or ask in class.

—Mr./Ms. [Instructor]
```

---

## PHASE 5: Documentation

### 14. Update STUDENT_GUIDE.md ❌
**Priority:** HIGH

**New workflow:**
1. Receive login credentials from instructor
2. Visit app URL and log in
3. Change password on first login
4. Complete profile:
   - Display name
   - Bio/artist statement
   - Social links (Instagram, etc.)
   - Theme color (optional)
5. Add content:
   - Click **+ Log** for quick updates
   - Click **+ Project** for finished work
6. Share portfolio: `app.com/student/username`

---

### 15. Create INSTRUCTOR_GUIDE.md ❌
**Priority:** HIGH

**Contents:**
1. Firebase setup walkthrough
2. How to bulk import students
3. How to send credentials
4. How to use the dashboard
5. How to export data at semester end
6. How to assess portfolios
7. Integration with Canvas
8. Troubleshooting

---

### 16. Update README.md ❌
**Priority:** HIGH

**Sections:**
- Architecture overview (multi-tenant)
- Firebase setup instructions
- Deployment instructions
- Student workflow summary
- Instructor workflow summary
- Development/customization guide

---

## PHASE 6: Deployment & Testing

### 17. Deploy to Hosting ❌
**Priority:** CRITICAL

**Option A: GitHub Pages**
- Push code → Settings → Pages → main branch
- URL: `https://username.github.io/repo/`
- Free, simple, fast

**Option B: Netlify**
- Connect repo → Deploy
- URL: `https://sitename.netlify.app`
- Free, custom domains easy

**Option C: Firebase Hosting**
- `firebase deploy`
- URL: `https://project-id.web.app`
- Integrated with Firebase backend

---

### 18. Test Multi-Tenant Workflow ❌
**Priority:** CRITICAL

**As student:**
1. Create test account
2. Log in
3. Complete profile
4. Add 2 logs with images
5. Add 1 project
6. View public portfolio URL
7. Log out and verify portfolio is public

**As instructor:**
1. Log in to dashboard
2. View all test students
3. Click student → see their work
4. Export data
5. Verify instructor-only access

**As anonymous visitor:**
1. Visit student public URL
2. Verify portfolio loads
3. Verify can't edit
4. Verify images load

---

## ✅ FINAL CHECKLIST

**Backend:**
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore created with security rules
- [ ] Storage enabled with security rules
- [ ] firebase-config.js created with credentials

**Frontend:**
- [ ] login.html built and styled
- [ ] editor.html built with + buttons
- [ ] index.html (portfolio viewer) built
- [ ] dashboard.html (instructor) built
- [ ] app.js converted to Firebase
- [ ] Old CMS code removed

**Student Management:**
- [ ] Bulk import script created
- [ ] Test students imported
- [ ] Credential email template created

**Documentation:**
- [ ] PROJECT_CHARTER.md updated
- [ ] README.md updated
- [ ] STUDENT_GUIDE.md updated
- [ ] INSTRUCTOR_GUIDE.md created
- [ ] TODO.md updated (this file)

**Deployment:**
- [ ] App deployed to hosting
- [ ] Firebase connected
- [ ] Public URLs working
- [ ] Authentication working
- [ ] Content creation tested
- [ ] Instructor dashboard tested

---

## 🎯 TIME ESTIMATE

| Task | Time |
|------|------|
| Firebase setup | 30 min |
| Build authentication UI | 2 hours |
| Build editor interface | 4 hours |
| Build portfolio viewer | 2 hours |
| Build instructor dashboard | 3 hours |
| Remove old code | 1 hour |
| Student import script | 1 hour |
| Update documentation | 2 hours |
| Testing & debugging | 2 hours |
| **TOTAL** | **~17-18 hours** |

---

## 🆘 TROUBLESHOOTING

**Student can't log in:**
- Check Firebase Authentication console
- Verify email/password correct
- Try password reset flow
- Check for typos in email

**Images won't upload:**
- Check Storage rules allow user's UID
- Verify file size under 5MB (adjust if needed)
- Check browser console for CORS errors
- Verify Storage enabled in Firebase

**Public portfolio not loading:**
- Check Firestore rules allow reads
- Verify username in URL is correct
- Check browser console for errors
- Test Firestore query in console

**Dashboard shows no students:**
- Verify instructor account has admin role
- Check Firestore security rules
- Verify query in dashboard.html
- Check browser console for errors

---

**Next Step:** Create Firebase project and obtain credentials, then build firebase-config.js.
