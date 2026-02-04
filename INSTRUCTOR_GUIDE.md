# Instructor Guide — Art & Technology Portfolio

This guide covers setup, student management, and troubleshooting for instructors deploying the portfolio app.

---

## Overview

**What You're Deploying:**
- Single multi-tenant portfolio app (all students in one app)
- Firebase backend (auth, database, storage)
- Deployed on GitHub Pages (static hosting, free)
- Three authentication methods: Google SSO, email/password, bulk import

**Time to Deploy:**
- Initial setup: ~15 minutes
- Add students: ~5 minutes (if using bulk import)
- Student support: ~2-3 hours over semester

---

## Initial Setup (One Time)

### 1. Verify Firebase Project

The Firebase project is already configured:
- **Project ID**: `portfolio-web-app-26`
- **Location**: US Central
- **Authentication**: Enabled (Google OAuth, Email/Password)
- **Firestore**: Database created with indexes
- **Storage**: Image hosting enabled
- **Security Rules**: Deployed (public read, owner write, admin access)

**You only need to:**
1. Verify you have access to Firebase Console
2. Check that auth methods are enabled (they are)
3. Done!

### 2. Share the App URL with Students

App URL: **https://flyinthelyceum.github.io/Portfolio-Web-App/**

Share via:
- Email to class
- Learning management system (Canvas, Classroom, etc.)
- Printed handout
- Classroom poster

### 3. Share Student Guide

Send students the [STUDENT_GUIDE.md](STUDENT_GUIDE.md) file or direct them to it in the repo.

---

## Adding Students

### Option A: Self-Registration (Recommended for Flexibility)

Students create their own accounts:

1. **Share signup link** with students: `https://flyinthelyceum.github.io/Portfolio-Web-App/signup.html`
2. Students can:
   - Use Google SSO (one-click for @school.edu accounts)
   - Use email/password (self-serve registration)
3. No instructor action needed
4. Works great if students stagger signups over first few days

**Pros:** 
- Simple, low instructor effort
- Students own their credentials
- Asynchronous (students can signup anytime)

**Cons:**
- May need to remind students
- Some students might forget password

### Option B: Bulk Import (Recommended for Initial Onboarding)

Pre-create all student accounts from a CSV file:

1. **Prepare CSV file** with columns:
   ```
   firstName,lastName,email
   Alex,Rivera,alex.rivera@school.edu
   Sam,Johnson,sam.johnson@school.edu
   Jordan,Smith,jordan.smith@school.edu
   ```

2. **Run import script**:
   ```bash
   cd scripts
   npm install
   node import-students.js students.csv https://flyinthelyceum.github.io/Portfolio-Web-App/
   ```
   (Requires Firebase Admin credentials—one-time setup)

3. **Share credentials** with students:
   - Script generates `credentials-email.html`
   - Open in browser
   - Copy table and email to students, OR
   - Screenshot individual credentials and email separately

4. **Students log in** with provided email + temporary password
5. **Students reset password** on first login (optional but recommended)

**Pros:**
- All students onboarded at once
- You control initial credentials
- Faster than waiting for students to self-register

**Cons:**
- Requires setup (Firebase Admin credentials)
- Need to deliver credentials securely
- Students might lose password

**When to Use:**
- Start of semester with full roster
- Want synchronized onboarding
- Prefer instructor-controlled credentials

---

## Manage Students

### Monitor Activity

**From Firebase Console:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select `portfolio-web-app-26` project
3. Navigate to **Firestore Database**
4. Browse `/users` collection to see all student profiles
5. Browse `/posts` collection to see all content

**Metrics:**
- Check `createdAt` field to see when students joined
- Check post count per student (count documents with matching `userId`)
- Check `updatedAt` on users to see last activity

### Reset a Student's Password

If a student forgets their password:

1. Student goes to login page
2. Clicks **"Forgot password?"**
3. Enters email
4. Clicks reset link in email
5. Creates new password

**You can't manually reset.** Students must use the "forgot password" flow (it's automated).

### Remove/Archive a Student

To remove a student (end of semester):

1. **Option A: Delete via Firebase**
   - Go to **Authentication** in Firebase Console
   - Find student email
   - Click three dots → Delete
   - (This deletes their auth account but not their Firestore profile)

2. **Option B: Keep for archive**
   - Leave account active
   - Their portfolio remains viewable
   - They can't modify it (only logged-in users can edit)

3. **Recommended:** Keep accounts active as portfolio archive (students can show past work)

### Export Student Data

To export all portfolios/posts:

1. Go to Firestore Database
2. Select `/posts` collection
3. Click three dots → **Export collection**
4. Choose JSON or CSV
5. Download file

---

## Support & Troubleshooting

### Common Student Issues

**"I can't log in"**
- Check email is correct
- Try "Forgot password" flow
- Check that student used correct auth method (Google vs Email)
- Try incognito window (clears cached cookies)

**"Google sign-in doesn't work"**
- Browser must allow popups
- Clear browser cookies
- Try different browser
- Fallback to email/password method

**"Image won't upload"**
- Check file size (< 5MB)
- Check format (JPEG or PNG only)
- Check internet connection
- Try different image file

**"Portfolio URL doesn't work"**
- Click "Share Portfolio" button to get correct URL
- Check that username doesn't have spaces
- URL format: `https://.../?user=yourusername`

**"I forgot my username"**
- Check their profile editor page
- Username shown in "Edit Profile" button
- Or use their userId from Firebase Console

### Common Instructor Issues

**"Firebase Console not loading"**
- Check internet connection
- Check Google account permissions
- Try incognito window
- Try different browser

**"Bulk import script failing"**
- Check Firebase Admin credentials (serviceAccountKey.json)
- Check CSV format (must be exact: firstName, lastName, email)
- Check email validity
- See [scripts/README.md](scripts/README.md) for detailed help

**"Can't see student posts"**
- Check Firestore Database → `/posts` collection
- Filter by studentId/userId to find their posts
- Check that posts have images (image uploads sometimes fail silently)

**"Images not displaying in portfolios"**
- Check Firebase Storage `/users/{userId}/` folder
- Check that images are actually uploaded
- Check image file permissions (should be public)
- Try uploading again

---

## Semester Workflow

### Week 1: Setup & Onboarding
- [ ] Test app yourself (create account, post content, share URL)
- [ ] Prepare CSV if using bulk import
- [ ] Run bulk import OR send signup link to students
- [ ] Share STUDENT_GUIDE.md with class
- [ ] Demonstrate in class (create log, share portfolio)

### Weeks 2-14: Ongoing Teaching
- [ ] Remind students to update portfolios weekly
- [ ] Spot-check that students are using it
- [ ] Answer student questions (see troubleshooting above)
- [ ] Optional: Review portfolios mid-semester, provide feedback

### Week 15: Final Review & Archive
- [ ] Have students review their portfolios
- [ ] Optional: Export all portfolios (see "Export Student Data" above)
- [ ] Archive student accounts (optional—keep them active for portfolio records)
- [ ] Debrief with class about what they learned

---

## Customization (Advanced)

### Change Theme Colors

Edit `styles.css`:

```css
:root {
  --color-bg: #fafaf8;           /* Change background */
  --color-text: #1a1a18;         /* Change text color */
  --color-accent: #007bff;       /* Change link/button color */
  --color-border: #d0d0c8;       /* Change border color */
}
```

All changes apply instantly site-wide.

### Change Fonts

Edit `styles.css`:

```css
:root {
  --font-display: 'Fraunces', serif;  /* Heading font */
  --font-body: 'Inter', sans-serif;   /* Body text */
  --font-mono: 'IBM Plex Mono', monospace; /* Code */
}
```

### Add Custom Domain

1. Own a domain (e.g., portfolio.yourdomain.com)
2. Deploy to Firebase Hosting (instead of GitHub Pages)
3. Point domain DNS to Firebase Hosting
4. Update app URL in your documentation

See [README.md](README.md) for Firebase Hosting deployment.

---

## Security & Privacy

### Data Ownership

- **Students own their portfolios** (they create account, they own the data)
- **No instructor credentials required** to view student work (portfolios are public)
- **Instructor cannot edit student work** (security rules prevent this)

### FERPA Compliance

⚠️ **Important:** This system stores student names, emails, and photos in Firebase.

- **FERPA-Compliant Setup:**
  - Use school Google accounts (@school.edu)
  - Sign school data processing agreement with Google/Firebase
  - Treat portfolio URLs as student education records
  - Don't share URLs with external parties without permission

- **Getting a DPA (Data Processing Agreement):**
  - Google has standard DPAs: https://policies.google.com/terms/universal-terms-of-service
  - Firebase inherits Google's DPA
  - Check with your school's legal/privacy office

- **Recommended:** Review with your school administrator before deployment

### Backup & Data Loss

- **Firestore Database:** Google handles daily backups
- **Your responsibility:** Document important student work
- **Optional:** Export portfolios at semester end (see above)

---

## Scaling to Multiple Classes

If you have multiple classes using this app:

### Option A: Single Shared App (Recommended)
- All students (all classes) in same app
- Students only see their own work
- Instructor can see all students
- **Pro:** Simple, one deployment
- **Con:** Can't easily isolate by class

### Option B: Separate Apps per Class
- Create separate Firebase project for each class
- Deploy separate instances
- Clean separation by class
- **Pro:** Clear class isolation
- **Con:** More complex setup, more maintenance

**Recommendation:** Use Option A (single shared app) unless you need strict class separation.

---

## Extending the App (Optional)

Possible future enhancements:

- Instructor dashboard (view all students at once)
- Comments/feedback system
- Post scheduling
- Analytics (activity tracking, engagement metrics)
- Student comparison tool (see similar interests)
- Export to PDF
- Embed portfolios on other sites

See [TODO-FIREBASE.md](TODO-FIREBASE.md) for planned phases.

---

## Getting Help

**Questions about this guide:**
- See [README.md](README.md) for technical overview
- See [STUDENT_GUIDE.md](STUDENT_GUIDE.md) for student-facing help
- See [PROJECT_CHARTER.md](PROJECT_CHARTER.md) for project vision

**Firebase documentation:**
- [Firebase Console Docs](https://firebase.google.com/docs/console)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)

**Bugs or feature requests:**
- See [GitHub Issues](https://github.com/flyinthelyceum/Portfolio-Web-App/issues)
- Submit bug report with:
  - What you tried
  - What happened
  - What you expected
  - Browser/device

---

## Good luck! 🚀

Your students are about to document their creative process in a way they'll be proud of. You've got this.

**Next step:** Deploy the app and have students create their first logs this week!
