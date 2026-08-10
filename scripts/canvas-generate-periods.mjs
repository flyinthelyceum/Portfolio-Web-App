#!/usr/bin/env node
// Generate the per-period Portfolio assignments in Canvas AND the matching
// Firestore periods docs, in one pass, so window bounds and assignment ids can
// never drift apart. That coupling is the whole point of doing it here.
//
//   node scripts/canvas-generate-periods.mjs <courseSlug> [--weeks 1] [--points 5] [--dry]
//
// Reads meeting dates from the canvas-integration repo's schedule.json, so the
// periods land on real class days rather than ISO weeks.
//
// Env: CANVAS_API_TOKEN, CANVAS_COURSE_ID

import fs from "node:fs";
import path from "node:path";

const BASE = "https://brophyprep.instructure.com/api/v1";
const [slug, ...rest] = process.argv.slice(2);
const arg = (n, d) => { const i = rest.indexOf(`--${n}`); return i === -1 ? d : rest[i + 1]; };
const DRY = rest.includes("--dry");
const EVERY = Number(arg("weeks", 1));
const POINTS = Number(arg("points", 5));

if (!slug) { console.error("usage: canvas-generate-periods.mjs <courseSlug> [--weeks N] [--points N] [--dry]"); process.exit(1); }

const token = process.env.CANVAS_API_TOKEN;
const courseId = process.env.CANVAS_COURSE_ID;
if (!token || !courseId) { console.error("set CANVAS_API_TOKEN and CANVAS_COURSE_ID"); process.exit(1); }

// schedule.json lives in the canvas-integration repo, which is the source of truth
// for what days this course actually meets.
const roots = [
  `${process.env.HOME}/projects/canvas-integration/courses/${slug}/fall-2026/schedule.json`,
  `${process.env.HOME}/projects/canvas-integration/courses/3d-studio/tracks/${slug}/fall-2026/schedule.json`,
];
const schedPath = roots.find((p) => fs.existsSync(p));
if (!schedPath) { console.error(`no schedule.json for ${slug}. looked in:\n  ${roots.join("\n  ")}`); process.exit(1); }
const meetings = [...new Set(JSON.parse(fs.readFileSync(schedPath, "utf8")).meetings.map((m) => m.date))].sort();

// Group meetings into periods of N weeks. The period CLOSES on its last meeting,
// due at 23:59 Phoenix, which is 06:59:59Z the next day. That is the convention
// every other assignment in these courses already uses.
const isoWeek = (d) => { const t = new Date(d + "T12:00:00Z"); const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day); return t.toISOString().slice(0, 10); };
const byWeek = new Map();
for (const d of meetings) { const w = isoWeek(d); if (!byWeek.has(w)) byWeek.set(w, []); byWeek.get(w).push(d); }
const weeks = [...byWeek.entries()].sort();

const periods = [];
for (let i = 0; i < weeks.length; i += EVERY) {
  const chunk = weeks.slice(i, i + EVERY);
  const days = chunk.flatMap(([, ds]) => ds);
  const first = days[0], last = days[days.length - 1];
  const dueUtc = new Date(`${last}T00:00:00Z`); dueUtc.setUTCDate(dueUtc.getUTCDate() + 1);
  periods.push({
    id: `${slug}-${first}`,
    label: `week of ${new Date(first + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`,
    startsAt: `${first}T00:00:00-07:00`,
    endsAt: `${last}T23:59:59-07:00`,
    dueAt: `${dueUtc.toISOString().slice(0, 10)}T06:59:59Z`,
  });
}

console.log(`${slug}: ${meetings.length} meetings, ${weeks.length} weeks -> ${periods.length} periods at ${POINTS} pts (${periods.length * POINTS} pts total)`);

const out = [];
for (const p of periods) {
  const name = `Portfolio: ${p.label}`;
  const body = new URLSearchParams({
    "assignment[name]": name,
    "assignment[points_possible]": String(POINTS),
    "assignment[grading_type]": "points",
    "assignment[due_at]": p.dueAt,
    "assignment[submission_types][]": "none",
    "assignment[published]": "false",
    "assignment[omit_from_final_grade]": "false",
    "assignment[description]":
      `<div style="max-width:900px"><p>Post to your portfolio at ` +
      `<a href="https://test.aaand.space">test.aaand.space</a> during this period. ` +
      `This score records whether an entry arrived and whether it has its parts: a title, and an image or a written note. ` +
      `It is not a judgement of the work. That conversation happens in crit.</p></div>`,
  });
  if (DRY) { out.push({ ...p, name, created: "(dry)" }); continue; }
  const res = await fetch(`${BASE}/courses/${courseId}/assignments`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body,
  });
  if (!res.ok) { console.error(`  FAILED ${name}: ${res.status} ${(await res.text()).slice(0, 200)}`); continue; }
  const a = await res.json();
  out.push({ ...p, name, canvasAssignmentId: a.id, canvasCourseId: Number(courseId), courseSlug: slug, pointsPossible: POINTS });
  console.log(`  ${a.id}  ${p.dueAt}  ${name}`);
}

const dest = path.join(path.dirname(new URL(import.meta.url).pathname), `periods-${slug}.json`);
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`\nwrote ${dest}`);
console.log(DRY ? "dry run, nothing created in Canvas" : "now seed Firestore: node scripts/seed-periods.mjs " + slug);
console.log("assignments are created UNPUBLISHED. Publishing is by hand, week of, deliberately.");
