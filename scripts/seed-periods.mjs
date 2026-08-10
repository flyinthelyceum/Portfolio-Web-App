#!/usr/bin/env node
// Push the output of canvas-generate-periods.mjs into Firestore.
//   node scripts/seed-periods.mjs <courseSlug>
// Env: GOOGLE_APPLICATION_CREDENTIALS

import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug) { console.error("usage: seed-periods.mjs <courseSlug>"); process.exit(1); }
const file = path.join(path.dirname(new URL(import.meta.url).pathname), `periods-${slug}.json`);
if (!fs.existsSync(file)) { console.error(`no ${file}. run canvas-generate-periods.mjs first.`); process.exit(1); }

const periods = JSON.parse(fs.readFileSync(file, "utf8"));
if (periods.some((p) => !p.canvasAssignmentId)) {
  console.error("that file came from a --dry run and has no Canvas assignment ids. Re-run without --dry.");
  process.exit(1);
}

const { initializeApp, applicationDefault } = await import("firebase-admin/app");
const { getFirestore, Timestamp } = await import("firebase-admin/firestore");
initializeApp({ credential: process.env.GOOGLE_APPLICATION_CREDENTIALS ? applicationDefault() : undefined });
const db = getFirestore();

const batch = db.batch();
for (const p of periods) {
  batch.set(db.collection("periods").doc(p.id), {
    ...p,
    startsAt: Timestamp.fromDate(new Date(p.startsAt)),
    endsAt: Timestamp.fromDate(new Date(p.endsAt)),
  }, { merge: true });
}
await batch.commit();
console.log(`wrote ${periods.length} periods for ${slug}`);
