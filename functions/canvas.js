// The only place this codebase talks to Canvas. Server-side only: the token is a
// full-privilege teacher credential covering 125 students across five courses.

const BASE = "https://brophyprep.instructure.com/api/v1";

function token() {
  const t = process.env.CANVAS_API_TOKEN;
  if (!t) throw new Error("CANVAS_API_TOKEN is not set in functions config");
  return t;
}

/**
 * Post a cadence score and a comment to one student's submission.
 *
 * score      mechanical, from periods.scoreFor. POINTS, not percent: on a
 *            5-point assignment 85% is 4.25. Sending 85 posts 85 out of 5.
 * comment    may carry real analysis. It may NOT carry a number, a rank, a
 *            letter, or a score-shaped phrase. See assertNoVerdict.
 */
export async function putSubmission({ courseId, assignmentId, userId, score, comment }) {
  const body = new URLSearchParams();
  if (score !== null && score !== undefined) body.set("submission[posted_grade]", String(score));
  if (comment) {
    assertNoVerdict(comment);
    body.set("comment[text_comment]", comment);
  }

  const res = await fetch(
    `${BASE}/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token()}` }, body }
  );
  if (!res.ok) throw new Error(`Canvas ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

/**
 * Keeps the two channels from bleeding. The moment analysis wears a number, the
 * student reads it as the grade and the whole separation collapses on contact.
 */
const VERDICT = [
  /\b\d{1,3}\s*(\/|out of)\s*\d{1,3}\b/i,
  /\b\d{1,3}\s*%/,
  /\b[A-DF][+-]?\s+(work|effort|job|range)\b/,
  /\b(grade|graded|score|scored|points|marks?)\b/i,
  // Bare praise is the other half of the failure: a machine congratulating a
  // student on work it may not have understood. Blocked whether or not it
  // carries a number.
  /\b(great|nice|excellent|good|strong|solid|impressive|amazing|fantastic|beautiful|stunning|poor|weak|bad|sloppy)\s+(work|job|effort|piece|start)\b/i,
  /\b(well done|keep it up|way to go|awesome)\b/i,
];
export function assertNoVerdict(text) {
  for (const re of VERDICT) {
    if (re.test(text)) {
      throw new Error(
        `Refusing to post: commentary contains a verdict-shaped phrase (${re}). ` +
          `Quality never becomes a number here. Write a paragraph, not a verdict.`
      );
    }
  }
}
