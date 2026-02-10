# Changelog

All notable changes to the Portfolio Web-App.

---

## [2026-02-10] — Cargo Design System + Editor Redesign

### Design
- **Unified cargo.site Template L384 aesthetic** across all pages
- Removed all colored pills, bordered cards, colored alerts — pure #000/#fff/#666
- System font stack (-apple-system) at 13px base, hierarchy via weight and spacing only
- Nav buttons converted to plain text links site-wide

### Portfolio Page (index.html + app.js)
- **Layout restructured**: narrow left index column (260px) → large central gutter → right content column (48%)
- Removed `border-right` vertical bar between columns
- Post numbers (`01.`, `02.`) float far left into gutter with absolute positioning (`left: -140px`)
- Images wrapped in **black container** (`background: #000`, `object-fit: contain`), horizontal scroll carousel
- Profile avatar + tagline moved to **upper-right content column** as header above post list
- Added placeholder description: "A daily practice of documenting work as storytelling…"
- Date format simplified to **mm/dd** across sidebar index and post metadata
- Sidebar simplified: name + index list + nav links + email footer (avatar removed from sidebar)
- **Portfolio navigation added**: Editor, Profile, My Portfolio links in sidebar for logged-in users

### Editor Page (editor.html + editor.js)
- **Redesigned to match portfolio layout**: fixed left sidebar (260px), center gutter, right content column
- Nav links (View Portfolio, Edit Profile, Attendance, Admin, Log Out) moved to sidebar
- Filter buttons (All / Logs / Projects) moved to sidebar
- `+ Log Entry` / `+ Project` buttons **sticky at top** of right content column
- **Share Portfolio button removed** from entire site

### Attendance Page
- Barcode enlarged **200%** (container min-height 300px, SVG scales to 100% width / max 600px)

### Bug Fixes
- **Fixed Firebase composite index error** in editor.js — `loadPosts()` now fetches all posts and filters/sorts client-side (same fix previously applied to app.js)
- Removed unused `query`, `where`, `orderBy` imports from editor.js
- Fixed portfolio navigation dead-end — logged-in users can now return to editor from portfolio page

### Code Cleanup
- Extracted login.js and signup.js from inline `<script>` blocks
- Deleted deprecated files: styles-old.css, index-old.html, app-old.js

---

## [2026-02-05] — Phase 8: Instructor Tools

### Added
- **Instructor Dashboard** (admin.html + admin.js): view all students, stats, activity
- **CSV/JSON Export**: students.csv, posts.csv download
- **Student Analytics**: engagement metrics, posts last 7 days, avg posts/week
- **Moderation Tools** (moderation.html + moderation.js): delete/restore posts, ban/unban students
- **Barcode Attendance** (attendance.html + attendance.js): student ID field, barcode generation, print-ready

---

## [2026-02-01] — Phases 1-7: Core Platform

### Added
- Firebase project (portfolio-web-app-26) with Auth, Firestore, Storage
- Multi-tenant architecture with security rules
- Authentication: email/password + Google SSO
- Content creation: logs + projects with image upload
- Profile editor with username support
- Public portfolio viewer with URL routing (?user=username)
- Bulk student import script (Node.js + Firebase Admin SDK)
- Documentation: README.md, STUDENT_GUIDE.md, INSTRUCTOR_GUIDE.md
- Deployed to Firebase Hosting
