# Art & Technology Student Portfolio System

A multi-tenant portfolio platform for art and technology students. Built with Firebase, featuring an editorial "art book" aesthetic. Students create accounts, build portfolios, and share shareable URLs with zero code knowledge required.

## Quick Links

- **Live App**: https://flyinthelyceum.github.io/Portfolio-Web-App/
- **Student Guide**: See [STUDENT_GUIDE.md](STUDENT_GUIDE.md)
- **Instructor Guide**: See [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)
- **Project Charter**: See [PROJECT_CHARTER.md](PROJECT_CHARTER.md)

---

## Architecture Overview

### Multi-Tenant Design

- **Single web application** hosts all student portfolios
- **Firebase backend** for authentication, data storage, and image hosting
- **Students log in** with Google account or email/password
- **Public URLs**: `yourapp.com/?user=username` or `yourapp.com/?user=userId`
- **Instructor tools**: CSV bulk import, credential email generation (optional)

### Authentication Methods

Students can sign up/log in using any of three methods:

1. **Google SSO** (recommended for school Google accounts)
   - One-click sign-in
   - Profile picture auto-imported
   - Perfect for @school.edu accounts

2. **Email/Password**
   - Self-service registration
   - Email-based password reset
   - Secure password validation

3. **Bulk Import** (instructor)
   - Import CSV of students
   - Auto-generate credentials
   - Send credentials via email template

---

## Features

### For Students

✅ **One-Click Sign-In/Sign-Up**
- Google account (for school users)
- Email/password (optional)
- No installation, no configuration

✅ **Content Creation**
- **+ Log button**: Quick updates with images (3 images · 2 sentences · 1 next step)
- **+ Project button**: Deeper work with hero images and artist statements
- **Image uploads**: Up to 5 images per post, up to 5MB each
- **Drag-and-drop**: Reorder images in preview grid

✅ **Profile Management**
- Edit displayName, username, bio
- Upload avatar image
- Username used in portfolio URLs (e.g., `?user=alexrivera`)

✅ **Portfolio Display**
- Clean card grid with responsive layout
- Filter by All / Logs / Projects
- Full-post modal viewer
- Share button (copies URL to clipboard)

✅ **Public Portfolio**
- Shareable link with clean URL (`?user=username`)
- Displays all posts in reverse chronological order
- Mobile-friendly design
- No login required to view

### For Instructors (Optional)

⚡ **Bulk Student Import**
- Upload CSV file with student names and emails
- Auto-generate temporary passwords
- Creates Firebase Auth accounts
- Email credentials to students in one command

⚡ **Bulk Credential Email**
- Generates HTML email with all credentials
- Copy/paste to Gmail or paste into email blast
- Secure delivery template

---

## Tech Stack

### Frontend
- **HTML/CSS/JavaScript** (no frameworks, no build step)
- **Firebase SDK v12.8.0** (via CDN)
- **marked.js** for Markdown parsing
- **Google Fonts** (Fraunces, Inter, IBM Plex Mono)

### Backend
- **Firebase Authentication** (Google OAuth, Email/Password)
- **Firestore Database** (NoSQL, real-time queries)
- **Firebase Storage** (image hosting with security rules)

### Hosting
- **GitHub Pages** (static site hosting)
- Can be deployed to Firebase Hosting or custom domain

### Optional: Student Management
- **Node.js** script for bulk CSV import
- **Firebase Admin SDK** for server-side operations

---

## Project Structure

```
portfolio-web-app/
├── index.html              # Public portfolio viewer (landing page)
├── login.html              # Email/password + Google Sign-In
├── signup.html             # Email/password + Google Sign-Up registration
├── editor.html             # Student dashboard (content creation)
├── editor.js               # Dashboard logic (+ Log, + Project buttons)
├── profile.html            # Profile editor (username, bio, avatar)
├── profile.js              # Profile save/upload logic
├── app.js                  # Portfolio viewer logic (Firestore queries)
├── styles.css              # Brutalist design system (CSS variables)
├── firebase-config.js      # Firebase SDK initialization
│
├── scripts/                # Optional instructor tools
│   ├── import-students.js  # Bulk import from CSV
│   ├── package.json        # Node.js dependencies
│   ├── .gitignore         # Protects serviceAccountKey.json
│   └── README.md          # Setup instructions
│
├── firestore.rules         # Firestore security rules (deployed)
├── storage.rules           # Storage security rules (deployed)
│
├── PROJECT_CHARTER.md      # Project vision & constraints
├── STUDENT_GUIDE.md        # Student onboarding guide
├── INSTRUCTOR_GUIDE.md     # Instructor setup & management
├── README.md               # This file
└── TODO-FIREBASE.md        # Development roadmap
```

---

## Getting Started

### For Instructors: Initial Setup

1. **Access the Firebase Console**
   - Project: `portfolio-web-app-26`
   - Already configured with Auth, Firestore, Storage
   - Security rules already deployed

2. **Share the App URL with Students**
   - Live: https://flyinthelyceum.github.io/Portfolio-Web-App/
   - Students visit signup.html to create accounts
   - OR use bulk import script to pre-create accounts (see below)

3. **(Optional) Bulk Import Students**
   - See [scripts/README.md](scripts/README.md)
   - Requires Firebase Admin credentials (one-time setup)
   - Creates 20+ accounts from CSV in seconds

4. **Support Students**
   - See [STUDENT_GUIDE.md](STUDENT_GUIDE.md) for common questions
   - See [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md) for troubleshooting

### For Students: Getting Started

1. **Visit the App**
   - Go to: https://flyinthelyceum.github.io/Portfolio-Web-App/
   - Click "Create Account"

2. **Sign Up** (Choose One)
   - **Google**: Click "Sign up with Google" (fastest for @school.edu)
   - **Email**: Enter email and password, follow validation requirements

3. **Complete Your Profile**
   - Set your displayName (real name)
   - Choose a username (used in your portfolio URL)
   - Write a short bio (optional)
   - Upload an avatar image (optional)

4. **Start Creating**
   - Click **+ Log** for quick updates (images + 2 sentences)
   - Click **+ Project** for deeper work (hero image + description)
   - Upload images (up to 5MB, JPEG/PNG)

5. **Share Your Portfolio**
   - Click **Share Portfolio** button (copies URL)
   - Send link to friends, teachers, colleges
   - Portfolio URL: `https://.../?user=yourusername`

---

## Design System (Customization)

All styling uses CSS variables in `styles.css`:

```css
:root {
  /* Colors */
  --color-bg: #fafaf8;              /* Background */
  --color-text: #1a1a18;            /* Text */
  --color-border: #d0d0c8;          /* Borders */
  --color-accent: #007bff;          /* Links, accents */
  
  /* Typography */
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  
  /* Spacing Scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  /* ... more spacing */
  
  /* Borders */
  --border-thin: 1px;
  --border-medium: 2px;
  --border-thick: 3px;
}
```

**To customize:**
1. Open `styles.css`
2. Modify `:root` CSS variables
3. Changes apply site-wide instantly

No need to edit component styles — everything is variable-driven.

---

## Security

### Firestore Rules

Deployed rules ensure:
- ✅ Public read access (everyone can view portfolios)
- ✅ Owner-only write access (students can only edit their own posts)
- ✅ Admin access for instructors (via `/admins/{uid}`)

### Storage Rules

Deployed rules ensure:
- ✅ Public read access (images are visible to all)
- ✅ Owner-only upload (each student uploads to their folder)
- ✅ File size limit: 5MB per image
- ✅ File type limit: JPEG, PNG only

### API Security

Google Cloud Console:
- ✅ API key restricted to HTTP referrers
- ✅ API key restricted to Firebase APIs only
- ⚠️ API keys in frontend are expected and safe (public, Google-managed)

---

## Troubleshooting

### Google Sign-In Not Working
- Check browser allows popups from this domain
- Try clearing browser cookies
- Fallback: Use email/password method

### Images Not Uploading
- Check image size (must be < 5MB)
- Check image format (JPEG or PNG only)
- Check Firebase Storage quota

### Forgot Password
- Click "Forgot password?" on login page
- Enter email
- Check inbox (may be in spam)
- Follow reset link

### Can't Find Your Portfolio URL
- Click "Share Portfolio" button in editor
- URL will be copied to clipboard
- Format: `https://yourapp.com/?user=yourusername`

---

## Development

### Local Testing

This is a static site, so you can open `index.html` directly in a browser. For full functionality:

```bash
# Serve locally (requires Python)
python3 -m http.server 8000

# Then visit: http://localhost:8000/
```

### Deploying

Currently deployed to GitHub Pages. To deploy to a custom domain:

1. **Firebase Hosting** (recommended)
   - Deploy with: `firebase deploy --only hosting`
   - Get custom domain via Firebase Console

2. **Custom Domain**
   - Point DNS to your host
   - Update URLs in firebase-config.js if needed

---

## Roadmap

- ✅ Phase 1-5: Core platform (auth, editor, portfolio, profiles)
- ✅ Phase 6: Bulk student import
- ✅ Phase 7: Documentation (README, Student Guide, Instructor Guide)
- 🚀 Phase 8 (Optional): Instructor dashboard, analytics, exports

---

## Support

**For Students:**
- See [STUDENT_GUIDE.md](STUDENT_GUIDE.md)
- Ask your instructor

**For Instructors:**
- See [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)
- Check [scripts/README.md](scripts/README.md) for bulk import
- See [PROJECT_CHARTER.md](PROJECT_CHARTER.md) for design philosophy

---

## License

MIT License — feel free to fork, modify, and deploy.

---

**Last Updated:** February 4, 2026  
**Tech Stack:** Firebase + Static HTML/CSS/JS  
**Hosting:** GitHub Pages (deployable to Firebase Hosting)
