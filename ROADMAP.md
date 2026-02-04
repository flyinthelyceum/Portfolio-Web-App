# ROADMAP.md — Path to Ship
**Portfolio Web App — Firebase Multi-Tenant Architecture**

**Last Updated:** February 2, 2026  
**Canonical Reference:** [PROJECT_CHARTER.md](PROJECT_CHARTER.md)  
**Architectural Context:** [INITIAL_ROADMAP.md](INITIAL_ROADMAP.md)

---

## Overview

This roadmap consolidates [TODO.md](TODO.md) and [TODO-FIREBASE.md](TODO-FIREBASE.md) into a **shipping plan** organized by dependencies, not effort.

The goal is a **Padlet-like multi-tenant portfolio system** where:
- Students log in with email/password (no OAuth complexity)
- Students add logs and projects via + buttons (no code editing)
- Each student gets a shareable public URL
- Instructor views all portfolios from a single dashboard
- Zero deployment friction or build steps

---

## Architecture Shift

### From (Old)
- Static markdown files in GitHub
- Decap CMS with GitHub OAuth
- GitHub Pages hosting
- Students fork repos and manage deployments
- Netlify API gateway for OAuth

### To (New)
- Firebase backend (Firestore + Storage + Auth)
- Single shared web app (all students use same URL)
- Login with email/password
- Students create content via web forms
- Public portfolio URLs: `app.com/student/username`
- Instructor dashboard: `app.com/dashboard`

---

## Phases

### Phase 1: Infrastructure
**Goal:** Firebase project configured and connected

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 1.1 Create Firebase project | CRITICAL | ❌ | None |
| 1.2 Enable Authentication (Email/Password) | CRITICAL | ❌ | 1.1 |
| 1.3 Enable Firestore Database | CRITICAL | ❌ | 1.1 |
| 1.4 Enable Firebase Storage | CRITICAL | ❌ | 1.1 |
| 1.5 Configure Firestore security rules | CRITICAL | ❌ | 1.3 |
| 1.6 Configure Storage security rules | CRITICAL | ❌ | 1.4 |
| 1.7 Create `firebase-config.js` with credentials | CRITICAL | ❌ | 1.1 |

**Time Estimate:** 30-45 minutes  
**Definition of Done:** Firebase console shows all services enabled; config file ready

---

### Phase 2: Core Frontend
**Goal:** Students can log in, create content, and view public portfolios

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 2.1 Build `login.html` (auth UI) | HIGH | ❌ | 1.2, 1.7 |
| 2.2 Build `editor.html` (content creation) | CRITICAL | ❌ | 2.1 |
| 2.3 Implement + Log button (modal + Firestore save) | CRITICAL | ❌ | 2.2 |
| 2.4 Implement + Project button | CRITICAL | ❌ | 2.2 |
| 2.5 Implement image upload to Storage | CRITICAL | ❌ | 2.2, 1.6 |
| 2.6 Build profile editor (name, bio, links) | HIGH | ❌ | 2.2 |
| 2.7 Rebuild `index.html` as portfolio viewer | CRITICAL | ❌ | 1.5 |
| 2.8 Implement URL routing: `?user=username` | CRITICAL | ❌ | 2.7 |
| 2.9 Convert `app.js` to fetch from Firestore | CRITICAL | ❌ | 2.7 |

**Time Estimate:** 8-10 hours  
**Definition of Done:** Student can log in, add log with images, save to Firebase, view public URL

---

### Phase 3: Instructor Tools
**Goal:** Instructor can view all student work and export data

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 3.1 Build `dashboard.html` (instructor view) | MEDIUM | ❌ | 2.7 |
| 3.2 Add grid of all students | MEDIUM | ❌ | 3.1 |
| 3.3 Add "view portfolio" modal/iframe | MEDIUM | ❌ | 3.1 |
| 3.4 Add export to JSON/CSV | MEDIUM | ❌ | 3.1 |
| 3.5 Create admin role in Firestore | MEDIUM | ❌ | 1.5 |
| 3.6 Protect dashboard with auth check | MEDIUM | ❌ | 3.5 |

**Time Estimate:** 3-4 hours  
**Definition of Done:** Instructor can log in, see all students, click to view portfolios, export data

---

### Phase 4: Student Management
**Goal:** Efficiently onboard 20+ students at semester start

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 4.1 Create bulk import script (Node.js + Admin SDK) | MEDIUM | ❌ | 1.2 |
| 4.2 Create CSV template for student roster | MEDIUM | ❌ | 4.1 |
| 4.3 Test bulk import with 3 sample students | MEDIUM | ❌ | 4.1 |
| 4.4 Create credential email template | MEDIUM | ❌ | 4.1 |
| 4.5 Document manual student creation workflow | LOW | ❌ | 1.2 |

**Time Estimate:** 2-3 hours  
**Definition of Done:** Script creates 20 accounts in under 5 minutes; credentials emailed

---

### Phase 5: Migration & Cleanup
**Goal:** Remove old architecture; preserve design system

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 5.1 Delete `admin/` folder (Decap CMS) | MEDIUM | ❌ | 2.9 |
| 5.2 Delete `api/` folder (Netlify OAuth gateway) | MEDIUM | ❌ | 2.9 |
| 5.3 Delete `posts/` and `projects/` markdown | MEDIUM | ❌ | 2.9 |
| 5.4 Delete `vercel.json` | MEDIUM | ❌ | 2.9 |
| 5.5 Delete GitHub API code from `app.js` | MEDIUM | ❌ | 2.9 |
| 5.6 Delete `settings.json` (now in Firestore) | MEDIUM | ❌ | 2.6 |
| 5.7 Keep `styles.css` (reuse entirely) | N/A | ✅ | None |
| 5.8 Keep card/modal HTML structure | N/A | ✅ | None |

**Time Estimate:** 30-60 minutes  
**Definition of Done:** Repository contains only Firebase-based code; no build warnings

---

### Phase 6: Documentation
**Goal:** Students and instructor can use system without your help

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 6.1 Update `STUDENT_GUIDE.md` for Firebase workflow | HIGH | ❌ | 2.8 |
| 6.2 Create `INSTRUCTOR_GUIDE.md` | HIGH | ❌ | 3.6, 4.4 |
| 6.3 Update `README.md` with architecture overview | HIGH | ❌ | 2.9 |
| 6.4 Document Firebase setup steps | HIGH | ❌ | 1.7 |
| 6.5 Create troubleshooting FAQ | MEDIUM | ❌ | 7.3 |

**Time Estimate:** 2-3 hours  
**Definition of Done:** Non-technical instructor can follow setup guide; students can self-onboard

---

### Phase 7: Deployment & Testing
**Goal:** Live app tested by real users

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 7.1 Choose hosting (Firebase, Netlify, or GitHub Pages) | CRITICAL | ❌ | None |
| 7.2 Deploy app to hosting | CRITICAL | ❌ | 7.1, 2.9 |
| 7.3 Test full student workflow | CRITICAL | ❌ | 7.2 |
| 7.4 Test instructor dashboard | CRITICAL | ❌ | 7.2 |
| 7.5 Test on mobile devices (iOS, Android) | HIGH | ❌ | 7.2 |
| 7.6 Test image upload/display across browsers | HIGH | ❌ | 7.2 |
| 7.7 Load test with 20+ concurrent users | MEDIUM | ❌ | 7.2 |
| 7.8 Verify public portfolios are truly public | CRITICAL | ❌ | 7.3 |

**Time Estimate:** 2-3 hours  
**Definition of Done:** Live URL shared; 3 test students successfully create portfolios

---

### Phase 8: Optional Enhancements
**Goal:** Polish for long-term sustainability

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| 8.1 Migrate sample content to Firestore (demo user) | LOW | ❌ | 2.9 |
| 8.2 Add password reset flow | MEDIUM | ❌ | 2.1 |
| 8.3 Add "change password" in profile editor | MEDIUM | ❌ | 2.6 |
| 8.4 Add markdown preview in editor | LOW | ❌ | 2.2 |
| 8.5 Add revision history (version tracking) | LOW | ❌ | 2.9 |
| 8.6 Add theme color picker in profile | LOW | ❌ | 2.6 |
| 8.7 Add Canvas LMS integration | LOW | ❌ | 3.6 |
| 8.8 Custom domain configuration | LOW | ❌ | 7.2 |

**Time Estimate:** 3-5 hours  
**Definition of Done:** System feels complete, not MVP

---

## Critical Path to MVP

To ship a **working product for semester start**, focus on:

1. **Phase 1** (Infrastructure) — 45 min
2. **Phase 2** (Core Frontend) — 10 hours
3. **Phase 4.1-4.4** (Student Import) — 2 hours
4. **Phase 6.1-6.2** (Student + Instructor Guides) — 2 hours
5. **Phase 7.1-7.4** (Deploy + Test) — 2 hours

**Total Critical Path:** ~17 hours

Everything else can ship incrementally after students start using the system.

---

## Key Decisions

### Hosting Choice
**Recommendation:** Firebase Hosting  
**Why:**
- Integrated with backend (no CORS issues)
- Free tier sufficient for class size
- Single deployment command (`firebase deploy`)
- HTTPS automatic
- Custom domains easy

**Alternative:** GitHub Pages (if you prefer static hosting and don't mind CORS config)

---

### URL Structure
**Recommendation:** `app.com/?user=username`  
**Why:**
- Simple query param routing (no server-side logic needed)
- Works on static hosting
- Easy for students to share

**Alternative:** `app.com/student/username` (requires Firebase Hosting rewrite rules or SPA router)

---

### Authentication
**Decision:** Email/Password only (no GitHub OAuth)  
**Why:**
- Students don't need GitHub accounts
- No OAuth complexity
- Instructor controls account creation
- Simpler for high school context

**Trade-off:** Instructor must manually create accounts (solved by bulk import script)

---

## Alignment Check

This roadmap preserves these core principles from [INITIAL_ROADMAP.md](INITIAL_ROADMAP.md):

✅ **Process over polish** — Logs remain lightweight and frequent  
✅ **Documentation as practice** — Low friction capture via + buttons  
✅ **Revision visibility** — Can add version history later (Phase 8.5)  
✅ **Authorship, not performance** — No social feed; individual portfolios only  
✅ **Quiet, serious, humane** — No gamification or performative metrics  

This roadmap satisfies these constraints from [PROJECT_CHARTER.md](PROJECT_CHARTER.md):

✅ **Students never edit code** — All content via web forms  
✅ **No bundlers/frameworks** — Static HTML/CSS/JS + Firebase CDN  
✅ **Padlet-like simplicity** — + button → add content → save  
✅ **Instructor dashboard** — Browse all student work from one place  
✅ **Shareable URLs** — Each student gets clean public link  

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Firebase free tier limits exceeded | MEDIUM | Monitor usage; class size ~20 students well under limits |
| Students forget passwords | LOW | Password reset flow (Phase 8.2); instructor can reset via console |
| Image uploads fail (large files) | MEDIUM | Client-side validation (max 5MB); compress before upload |
| Firestore security misconfigured | HIGH | Test with multiple accounts; review rules carefully |
| Mobile experience poor | MEDIUM | Existing CSS is responsive; test early (Phase 7.5) |
| Slow first-time load | LOW | Firebase CDN is fast; use image optimization |

---

## Success Metrics

**MVP Launch:**
- [ ] 20 students have accounts
- [ ] All students log in successfully
- [ ] All students add at least 1 log
- [ ] All students can share their public URL
- [ ] Instructor can view all portfolios from dashboard

**End of Semester:**
- [ ] Each student has 10+ logs
- [ ] Each student has 2+ projects
- [ ] Students use portfolio in final critique
- [ ] No students needed VS Code
- [ ] System required < 2 hours of instructor troubleshooting

---

## Next Actions

**Immediate (This Week):**
1. Create Firebase project
2. Configure authentication and database
3. Build login + editor UI
4. Test student workflow end-to-end

**Before Semester Starts:**
1. Deploy to hosting
2. Import student roster
3. Email credentials
4. Share student guide

**First Week of Class:**
1. Demo system in class
2. Students complete profiles
3. Students add first log
4. Collect feedback

---

## Notes

- Current `TODO.md` is mostly deprecated; it references old GitHub-based architecture
- `TODO-FIREBASE.md` is comprehensive but lacks sequencing and decision rationale
- This roadmap consolidates both into a shipping plan
- Phases can be worked in parallel where dependencies allow
- Optional enhancements (Phase 8) can ship after semester starts

---

**Remember:** Ship fast, iterate with student feedback. The goal is a **working system students actually use**, not a perfect system that ships too late.
