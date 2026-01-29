# Art & Technology Student Portfolio Template

A minimal, beautiful portfolio template for showcasing student work in art and technology. Designed with an editorial "art book" aesthetic, typography-driven layout, and a completely code-free content management system via Decap CMS.

## Features

- **Editorial Design**: Clean, confident aesthetic inspired by xx.co restraint
- **Typography-First**: Uses Fraunces (display) and Inter (body) from Google Fonts
- **CSS Variables**: Fully customizable theme tokens for colors, spacing, and typography
- **Decap CMS Integration**: Non-technical students can manage content at `/admin` without touching code
- **Local Markdown Parser**: No CDN dependencies—everything runs locally
- **Responsive Design**: Beautiful on mobile, tablet, and desktop
- **Two Content Types**: 
  - **Logs**: Quick updates with compact cards and image galleries (3-up)
  - **Projects**: Larger featured-image cards with deep dives and narratives
- **Filtering**: Students can filter portfolio by All, Logs, or Projects
- **Modal Views**: Click any post or project to read the full story
- **Dark/Light Modes Ready**: CSS variables make theme switching trivial

## Project Structure

```
├── index.html              # Main portfolio page
├── styles.css              # All styling with CSS variables
├── app.js                  # Markdown parser & app logic
├── settings.json           # Configuration (student name, colors, links)
├── admin/
│   ├── index.html          # Decap CMS entry point
│   └── config.yml          # CMS collection definitions
├── posts/                  # Markdown files for logs and project posts
│   ├── log-001.md
│   ├── log-002.md
│   └── ... (6 samples included)
├── projects/               # Markdown files for project overviews
│   ├── project-001.md
│   ├── project-002.md
│   └── ... (4 samples included)
└── assets/uploads/         # Media storage for Decap CMS
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

## Content Management with Decap CMS (GitHub Pages)

### Setup

1. **Deploy to GitHub Pages** (see below)
2. **Create a GitHub OAuth App** (required for Decap CMS on GitHub Pages):
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Click **New OAuth App**
   - **Homepage URL:** your GitHub Pages site
   - **Authorization callback URL:** `https://YOUR-USERNAME.github.io/YOUR-REPO/admin/`
   - Copy the **Client ID**
3. **Add the Client ID** to `admin/config.yml`:
   - Set `app_id: YOUR_GITHUB_OAUTH_APP_ID`
   - Set `repo: YOUR-USERNAME/YOUR-REPO`
4. **Access CMS**:
   - Visit `https://YOUR-USERNAME.github.io/YOUR-REPO/admin/`
   - Log in with GitHub

### Adding Content

#### Posts (Logs & Projects)

1. Go to `/admin` and click "Posts"
2. Click "New Post"
3. Fill in:
   - **Title**: Post headline
   - **Publish Date**: When it was created
   - **Type**: "log" (quick update) or "project" (deep dive)
   - **Tags**: Categories (comma-separated)
   - **Summary**: Short excerpt (auto-generated from body if blank)
   - **Featured Image**: Main hero image (optional)
   - **Gallery Images**: Up to 3 images for logs (optional)
   - **Project Number**: Links to project overviews (optional)
   - **Body**: Full markdown content

4. Click "Publish" when ready

#### Projects

1. Go to `/admin` and click "Projects"
2. Click "New Project"
3. Fill in:
   - **Title**: Project name
   - **Order**: 1-4 determines display order
   - **Summary**: One-line description
   - **Hero Image**: Project showcase image
   - **Body**: Full markdown description

4. Click "Publish" when ready

### Markdown Syntax

The portfolio supports standard markdown:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** or __bold__
*Italic text* or _italic_
`inline code`

[Link text](https://example.com)
![Alt text](image-url.jpg)

- Bullet list
- Item 2

1. Numbered list
2. Item 2

> Blockquote

```code block```
```

## Deployment on GitHub Pages

1. **Push to GitHub** (if you haven't already).
2. Go to your repository → **Settings** → **Pages**.
3. **Source:** Deploy from a branch.
4. **Branch:** `main` and **/ (root)**.
5. Click **Save**. GitHub will publish your site at:
   - `https://YOUR-USERNAME.github.io/YOUR-REPO/`

### Custom Domain (Optional)

1. In GitHub Pages settings, add your custom domain.
2. Create a `CNAME` file with your domain name.
3. Update DNS records at your registrar to point to GitHub Pages.
4. GitHub will provision HTTPS automatically.

## How to Edit Locally

If you want to preview changes before publishing:

1. **Edit Markdown Files**:
   - Edit `.md` files in `/posts` and `/projects` folders
   - Use any text editor

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
