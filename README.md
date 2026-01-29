# Art & Technology Student Portfolio System

A multi-tenant portfolio platform for art and technology students. Designed with an editorial "art book" aesthetic, this system hosts all student portfolios in a single application with individual authentication and public URLs.

## Architecture

**Multi-Tenant Design:**
- Single web application hosts all student portfolios
- Firebase backend for authentication, data storage, and image hosting
- Students log in with email and see only their content
- Public URLs: `yourapp.com/student/username`
- Instructor dashboard: view all students at once

**Why This Approach:**
- Students never touch code, Git, or deployment infrastructure
- Instructor sets up once, not 30 times
- Interface feels like Padlet—just log in and post
- Aligns with Charter Section 6.2 (no code editing) and Section 10 (never open VS Code)

## Features

- **Editorial Design**: Clean, confident aesthetic inspired by art publications
- **Typography-First**: Uses Fraunces (display) and Inter (body) from Google Fonts
- **CSS Variables**: Fully customizable theme tokens for colors, spacing, and typography
- **Firebase Integration**: Real-time database, authentication, and file storage
- **Web Interface**: Add content via + button (no CMS complexity)
- **Responsive Design**: Beautiful on mobile, tablet, and desktop
- **Two Content Types**: 
  - **Logs**: Quick updates with compact cards and image galleries
  - **Projects**: Featured-image cards with deep dives and artist statements
- **Filtering**: Students can filter portfolio by All, Logs, or Projects
- **Modal Views**: Click any post or project to read the full story
- **Instructor Dashboard**: Browse all student work, monitor frequency, export data

## Project Structure

```
├── index.html              # Main portfolio viewer (public)
├── dashboard.html          # Instructor dashboard
├── editor.html             # Student content editor
├── styles.css              # All styling with CSS variables
├── app.js                  # Portfolio display logic
├── editor.js               # Content creation/editing interface
├── firebase-config.js      # Firebase initialization
└── assets/                 # Static assets
```

## Customization

### Quick Personalization (via CMS)

Students should edit settings in `/admin` → **Settings** → **Site Settings**.

Advanced users can still edit `settings.json` directly if needed:

```json
{
  "studentName": "Your Name",
  "siteTitle": "Your Site Title",
  "bio": "Your studio statement",
  "accentColor": "#d4461f",
  "fontPairing": "fraunces-inter",
  "cardRadius": "8px",
  "spacing": "comfortable",
  "links": {
    "Instagram": "https://instagram.com/yourhandle",
    "GitHub": "https://github.com/yourhandle",
    "Email": "mailto:your@email.com"
  }
}
```

**Available options:**
- `studentName`: Displayed in hero and footer
- `siteTitle`: Browser tab title and page heading
- `bio`: Studio stance line under name
- `accentColor`: Primary color (hex, rgb, or named color)
- `fontPairing`: Currently supports "fraunces-inter" (expandable in styles.css)
- `cardRadius`: Border radius for cards (e.g., "8px", "12px", "0px" for sharp)
- `spacing`: "comfortable", "tight", or "generous" (modifies CSS variables)
- `links`: Social/external links displayed in About section

### Theme via CSS Variables

In `styles.css`, modify `:root` variables:

```css
:root {
  --color-bg: #fafaf8;
  --color-text: #1a1a18;
  --color-accent: #d4461f;
  --text-4xl: 3.5rem;
  --spacing-xl: 3rem;
  /* ... more variables */
}
```

All typography, spacing, and color scales are controlled here. No need to touch component styles.

## Getting Started (Instructor)

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project: **"Art Tech Portfolio"**
3. Add a web app, copy the config object
4. Enable **Authentication** → Email/Password provider
5. Enable **Firestore Database** (start in test mode, we'll secure it)
6. Enable **Storage** for image uploads
7. Create `firebase-config.js` with your credentials

### 2. Deploy Application

**Option A: GitHub Pages**
1. Push code to GitHub
2. Settings → Pages → Deploy from main branch
3. Site live at: `https://USERNAME.github.io/REPO/`

**Option B: Netlify**
1. Connect GitHub repo to Netlify
2. Deploy (no build command needed)
3. Site live at: `https://SITENAME.netlify.app`

### 3. Add Students

Two approaches:

**A. Bulk Import (Recommended)**
- Create CSV of student emails
- Use Firebase Admin SDK to create accounts
- Send students their login credentials

**B. Self-Registration**
- Enable email/password signup
- Students create accounts with school email
- Instructor approves via dashboard

### 4. Student Access

Students visit the deployed URL:
1. Log in with school email
2. Complete profile (name, bio, links)
3. Click + button to add logs/projects
4. View public portfolio at: `yourapp.com/student/username`

## For Students

### First-Time Setup

1. Visit the portfolio site URL (provided by instructor)
2. Log in with your school email and password
3. Complete your profile:
   - Display name
   - Bio/artist statement
   - Social links (optional)
4. Customize theme colors (optional)

### Adding Content

**Working Portfolio Logs** (frequent, process-focused):
1. Click the **+ Log** button
2. Add 1-3 images
3. Write 2-3 sentences about what you're working on
4. Add a "next step" note
5. Click **Save**

**Projects** (finished work with statements):
1. Click the **+ Project** button
2. Add a hero image
3. Write project title
4. Add artist statement (what, why, how)
5. Add process images (optional)
6. Click **Save**

### Viewing Your Portfolio

Your public portfolio URL: `app-url.com/student/YOUR-USERNAME`

Share this link with anyone—no login required to view.

## For Instructors

### Dashboard Access

Visit `app-url.com/dashboard` and log in with instructor credentials.

**Features:**
- View all student portfolios in grid
- Click any student to see their full work
- Monitor posting frequency
- Filter by date range, content type
- Export student data at semester end

### Managing Students

- Add students individually or bulk import
- Reset passwords if needed
- Archive students after semester ends
- View analytics (posts per student, engagement)

2. **Edit Settings**:
   - Modify `settings.json` with your info and theme preferences

3. **View Locally**:
   - Open `index.html` in a browser
   - Or use a local server: `python -m http.server 8000`
   - Visit `localhost:8000`

4. **Push to Git** when happy:
   ```bash
   git add .
   git commit -m "Update portfolio"
   git push origin main
   ```

   GitHub Pages will auto-publish your changes after you push.

## Markdown File Format

Posts and projects use YAML front matter for metadata:

```markdown
---
title: "Post Title"
date: 2026-01-13
type: log
tags: [tag1, tag2, tag3]
featured_image: /assets/uploads/image.jpg
gallery_images:
  - /assets/uploads/img1.jpg
  - /assets/uploads/img2.jpg
  - /assets/uploads/img3.jpg
summary: "Short excerpt"
---

# Post Title

Body content in markdown...
```

**For Projects:**

```markdown
---
title: "Project Title"
order: 1
hero_image: /assets/uploads/image.jpg
summary: "One-line description"
---

# Project Title

Body content in markdown...
```

## Technical Details

### Markdown Parser

The app includes a lightweight markdown parser that supports:
- Headers (h1-h3)
- Bold, italic, inline code
- Links and images
- Lists (ordered and unordered)
- Blockquotes
- Code blocks

No external dependencies—everything runs in the browser.

### CSS Architecture

- **CSS Variables**: All theming via `:root` variables
- **Utility-First Approach**: Minimal class names, semantic HTML
- **Mobile-First Responsive**: Breakpoints at 640px and 480px
- **Dot Grid Background**: Subtle, never competes with content

### JavaScript

- **App Initialization**: Loads settings, content, and sets up event listeners
- **Section Navigation**: Smooth switching between Portfolio, Projects, About
- **Filtering**: Real-time filter of posts by type
- **Modal System**: Click-to-read experience for posts and projects
- **Markdown Rendering**: Client-side parsing and HTML generation

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Fully responsive

## Performance

- No build step required
- No dependencies to install
- ~25KB total (HTML + CSS + JS)
- Loads instantly even on slow connections
- Markdown parsing happens client-side (< 50ms for typical posts)

## Troubleshooting

### CMS Not Loading

- Check that your GitHub OAuth App is configured correctly
- Verify `app_id` and `repo` in `admin/config.yml`
- Confirm your Pages URL matches the OAuth callback URL
- Check browser console for errors

### Images Not Showing

- Ensure image paths start with `/assets/uploads/`
- In Decap CMS, use the image widget to upload (handles paths automatically)
- Check file extensions (.jpg, .png, .webp, etc.)

### Post Not Appearing

- Check that the publish date is not in the future
- Check that the markdown file is in the correct folder (`/posts` or `/projects`)
- Ensure front matter is valid YAML (colons, dashes properly formatted)
- Try a hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Styling Issues

- Clear browser cache
- Check that `styles.css` is being loaded (inspect Network tab)
- Verify CSS variable values in `:root` section

## Expansion Ideas

- Add dark mode toggle (CSS variable swap)
- Add filter by tags
- Add search functionality
- Add comments system
- Add RSS feed
- Add read-time estimates
- Add "related posts" recommendations
- Add analytics integration
- Add newsletter signup

## Credits

- Typography: [Google Fonts](https://fonts.google.com)
- CMS: [Decap CMS](https://decapcms.org)
- Hosting: [GitHub Pages](https://pages.github.com)
- Design philosophy: Inspired by [xxix.co](https://xxix.co)

## License

This template is provided as-is for educational use. Customize and deploy freely.

## Questions?

Refer to the official documentation:
- [Decap CMS Docs](https://decapcms.org/docs/intro/)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Created for Art & Technology students.** May your portfolio be as thoughtful as your work.
