// Portfolio to Canvas write-back.
//
// Two channels, and they must never touch:
//   score       mechanical checks only. Does it exist, did it arrive in the
//               window, does it have the parts. No judgment, ever.
//   commentary  can carry real analysis, and should when a model has actually
//               read the entry. Never a number, rank, letter or verdict.
//
// Design record and the tested Canvas constraints: ../CANVAS_WRITEBACK.md

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { putSubmission } from "./canvas.js";
import { periodContaining, scoreFor } from "./periods.js";

initializeApp();

export const portfolioToCanvas = onDocumentCreated(
  { document: "posts/{postId}", secrets: ["CANVAS_API_TOKEN"], region: "us-central1" },
  async (event) => {
    const db = getFirestore();
    const post = event.data?.data();
    if (!post) return;
    const postRef = event.data.ref;

    const fail = (reason, detail) =>
      db.collection("canvas_sync_errors").add({
        postId: event.params.postId, reason, detail: detail ?? null,
        userId: post.userId ?? null, at: FieldValue.serverTimestamp(),
      });

    // 1. Identity. Refuse rather than guess: a wrong user id posts one student's
    //    work onto another student's grade.
    const userSnap = await db.collection("users").doc(post.userId ?? "").get();
    const email = (userSnap.exists ? userSnap.data().email : null)?.trim().toLowerCase();
    if (!email) return void (await fail("no-email-on-user"));

    const rosterSnap = await db.collection("roster").doc(email).get();
    if (!rosterSnap.exists) return void (await fail("email-not-in-roster", email));
    const roster = rosterSnap.data();

    // 2. Window, by SERVER timestamp on the entry.
    const createdAt = post.createdAt ?? event.data.createTime;
    const period = await periodContaining(roster.courseSlug, createdAt);
    if (!period) return void (await fail("no-period-for-date", String(createdAt?.toDate?.() ?? createdAt)));

    // 3. Completeness. Also mechanical: does it have the parts.
    const hasParts = Boolean(post.title?.trim()) && (post.images?.length > 0 || post.body?.trim());
    if (!hasParts) return void (await fail("entry-missing-required-parts"));

    // 4. Count this author's qualifying entries inside the window.
    const inWindow = await db.collection("posts")
      .where("userId", "==", post.userId)
      .where("createdAt", ">=", period.startsAt)
      .where("createdAt", "<=", period.endsAt)
      .get();
    const count = inWindow.docs.filter((d) => {
      const p = d.data();
      return Boolean(p.title?.trim()) && (p.images?.length > 0 || p.body?.trim());
    }).length;

    const score = scoreFor(count, period.pointsPossible ?? 5, period.thresholds);

    // 5. Write. The comment is a receipt here on purpose: this trigger has not
    //    looked at the work. Substantive commentary is a separate pass that
    //    actually reads the entry, and it posts through the same guarded path.
    try {
      await putSubmission({
        courseId: roster.canvasCourseId,
        assignmentId: period.canvasAssignmentId,
        userId: roster.canvasUserId,
        score,
        comment: `Entry ${count}, ${period.label}. ${post.title ?? ""}`.trim(),
      });
    } catch (err) {
      return void (await fail("canvas-put-failed", String(err).slice(0, 500)));
    }

    // 6. Close the loop where the student already is. Seeing the grade land in
    //    the app is most of why a tool gets used rather than recommended.
    await postRef.set(
      { canvasSyncedAt: FieldValue.serverTimestamp(), canvasScore: score,
        canvasPeriod: period.id, canvasEntryIndex: count },
      { merge: true }
    );
  }
);
