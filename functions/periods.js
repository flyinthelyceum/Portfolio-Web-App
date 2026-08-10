// Window membership is decided by the entry's SERVER timestamp, never by when the
// sync runs. A student cannot backfill in December and retroactively earn September.
// That property is the accountability, so do not "helpfully" relax it.

import { getFirestore } from "firebase-admin/firestore";

/**
 * A period doc lives at periods/{periodId} and is written by the same generation
 * pass that creates the Canvas assignments, so window bounds and assignment ids
 * arrive together and cannot drift apart.
 *   { courseSlug, canvasCourseId, canvasAssignmentId, startsAt, endsAt, label }
 */
export async function periodContaining(courseSlug, when) {
  const snap = await getFirestore()
    .collection("periods")
    .where("courseSlug", "==", courseSlug)
    .where("startsAt", "<=", when)
    .orderBy("startsAt", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const p = { id: snap.docs[0].id, ...snap.docs[0].data() };
  return when.toMillis() <= p.endsAt.toMillis() ? p : null;
}

/**
 * Cadence scoring. Judgment-free by construction: it only counts.
 * Thresholds are Jared's call and live in config, not in code.
 */
export function scoreFor(count, pointsPossible, thresholds) {
  const t = thresholds ?? [[5, 1.0], [3, 0.85], [1, 0.6]];
  for (const [needed, share] of t) {
    if (count >= needed) return Math.round(pointsPossible * share * 100) / 100;
  }
  return 0;
}
