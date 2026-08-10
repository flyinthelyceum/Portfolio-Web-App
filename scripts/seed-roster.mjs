#!/usr/bin/env node
// Seed the Firestore roster from Canvas. Keyed by lowercase school email, which is
// the join between Firebase Auth and Canvas.
//
//   node scripts/seed-roster.mjs [--dry]
//
// Re-run at term boundaries. Canvas user ids are stable within a term; course and
// assignment ids are not.
//
// Env: CANVAS_API_TOKEN, GOOGLE_APPLICATION_CREDENTIALS (service account json)

// firebase-admin is imported lazily below so --dry needs no credentials and no deps.

const BASE = "https://brophyprep.instructure.com/api/v1";
const DRY = process.argv.includes("--dry");
const token = process.env.CANVAS_API_TOKEN;
if (!token) { console.error("set CANVAS_API_TOKEN"); process.exit(1); }

// Only courses whose students use the portfolio app. Add slugs here deliberately;
// seeding a course that does not use it creates rows that will silently grade.
const COURSES = [
  { id: 5067, slug: "art-and-technology", label: "Art and Technology" },
  // { id: 5074, slug: "3d2-advanced",      label: "3D Studio 2" },
];

const api = async (p) => {
  const out = [];
  let url = `${BASE}${p}`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    out.push(...(await res.json()));
    const next = (res.headers.get("link") || "").split(",").find((s) => s.includes('rel="next"'));
    url = next ? next.split(";")[0].trim().slice(1, -1) : null;
  }
  return out;
};

const rows = [];
for (const c of COURSES) {
  const sections = Object.fromEntries((await api(`/courses/${c.id}/sections?per_page=100`)).map((s) => [s.id, s.name]));
  for (const e of await api(`/courses/${c.id}/enrollments?type[]=StudentEnrollment&state[]=active&per_page=100`)) {
    const email = (e.user?.login_id || "").trim().toLowerCase();
    if (!email) { console.warn(`  no email for canvas user ${e.user?.id}, skipped`); continue; }
    const sec = sections[e.course_section_id] || "";
    rows.push({
      email,
      canvasUserId: e.user.id,
      canvasCourseId: c.id,
      courseSlug: c.slug,
      name: e.user.name,
      section: sec.split(" - ")[0]?.trim() || null,
      period: /^\d/.test(sec) ? `P${sec[0]}` : null,
    });
  }
  console.log(`${c.label}: ${rows.filter((r) => r.canvasCourseId === c.id).length} students`);
}

if (DRY) { console.log(JSON.stringify(rows.slice(0, 3), null, 2)); console.log(`dry run, ${rows.length} rows not written`); process.exit(0); }

const { initializeApp, applicationDefault } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");
initializeApp({ credential: process.env.GOOGLE_APPLICATION_CREDENTIALS ? applicationDefault() : undefined });
const db = getFirestore();
let batch = db.batch(), n = 0;
for (const r of rows) {
  batch.set(db.collection("roster").doc(r.email), r, { merge: true });
  if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
}
await batch.commit();
console.log(`wrote ${rows.length} roster docs`);
