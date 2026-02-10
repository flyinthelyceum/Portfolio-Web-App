/**
 * Portfolio Web App v2 - Cloud Functions
 *
 * These functions enforce scoring integrity:
 * - Students cannot write points directly
 * - One log per task per day is enforced server-side
 * - Points are awarded only through these functions
 *
 * Authority: CANON.md, SECURITY_RULES_PLAN.md, POINTS_MODEL.md
 */

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentDeleted } = require("firebase-functions/v2/firestore");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get Phoenix timezone dayKey (YYYY-MM-DD)
 * Used to enforce one log per task per day
 */
function getDayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
}

/**
 * Get ISO week key (YYYY-Www)
 * Used for weekly leaderboards
 */
function getWeekKey(date = new Date()) {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Validate user is authenticated and get their role
 */
async function validateUser(auth) {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const userDoc = await db.collection('users').doc(auth.uid).get();
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found');
  }

  const userData = userDoc.data();
  if (!userData.active) {
    throw new HttpsError('permission-denied', 'Account is not active');
  }

  return { uid: auth.uid, role: userData.role, ...userData };
}

// ============================================================================
// PUBLISH LOG - The Scoring Boundary
// ============================================================================

/**
 * publishLog - Called when student submits Log Work
 *
 * This is the critical scoring boundary:
 * - Validates one log per task per day
 * - Captures basePoints from category
 * - Awards points only for non-draft visibility
 * - Awards certification badges if applicable
 */
exports.publishLog = onCall({ cors: true }, async (request) => {
  const { taskId, media, phase, note, visibility, projectId } = request.data;
  const user = await validateUser(request.auth);

  // Validate required fields
  if (!taskId) throw new HttpsError('invalid-argument', 'taskId required');
  if (!media || !Array.isArray(media) || media.length === 0) {
    throw new HttpsError('invalid-argument', 'At least one media item required');
  }
  if (!phase) throw new HttpsError('invalid-argument', 'phase required');
  if (!note) throw new HttpsError('invalid-argument', 'note required');

  const validPhases = ['Sketch', 'Build', 'Test', 'Iteration', 'Reflection'];
  if (!validPhases.includes(phase)) {
    throw new HttpsError('invalid-argument', 'Invalid phase');
  }

  const validVisibility = ['draft', 'class', 'public'];
  const logVisibility = validVisibility.includes(visibility) ? visibility : 'class';

  // Get task and category for points
  const taskDoc = await db.collection('tasks').doc(taskId).get();
  if (!taskDoc.exists) {
    throw new HttpsError('not-found', 'Task not found');
  }
  const task = taskDoc.data();

  if (task.status !== 'published') {
    throw new HttpsError('failed-precondition', 'Task is not available');
  }

  const categoryDoc = await db.collection('taskCategories').doc(task.categoryId).get();
  if (!categoryDoc.exists) {
    throw new HttpsError('not-found', 'Category not found');
  }
  const category = categoryDoc.data();
  const basePoints = category.pointsPerLog || 0;

  // Compute dayKey and weekKey
  const now = new Date();
  const dayKey = getDayKey(now);
  const weekKey = getWeekKey(now);

  // Deterministic logId: one log per task per day
  const logId = `${user.uid}_${taskId}_${dayKey}`;

  // Check if log already exists
  const existingLog = await db.collection('logs').doc(logId).get();
  const isUpdate = existingLog.exists;
  const existingData = isUpdate ? existingLog.data() : null;

  // Determine if points should be awarded
  const eligibleForPoints = logVisibility !== 'draft';
  const wasEligible = existingData?.eligibleForPoints || false;
  const shouldAwardPoints = eligibleForPoints && !wasEligible;

  // Build log document
  const logData = {
    ownerUserId: user.uid,
    taskId,
    categoryId: task.categoryId,
    dayKey,
    weekKey,
    phase,
    note,
    media,
    projectId: projectId || null,
    visibility: logVisibility,
    basePoints,
    eligibleForPoints,
    featureBonusAwarded: existingData?.featureBonusAwarded || false,
    featureBonusValue: existingData?.featureBonusValue || 0,
    likeCount: existingData?.likeCount || 0,
    commentCount: existingData?.commentCount || 0,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!isUpdate) {
    logData.createdAt = FieldValue.serverTimestamp();
  }

  // Start batch write
  const batch = db.batch();

  // Write log
  batch.set(db.collection('logs').doc(logId), logData, { merge: true });

  // Award points if transitioning to eligible
  if (shouldAwardPoints && basePoints > 0) {
    const pointsEventId = `log_${logId}`;
    batch.set(db.collection('pointsEvents').doc(pointsEventId), {
      userId: user.uid,
      type: 'log_award',
      delta: basePoints,
      dayKey,
      weekKey,
      source: {
        sourceType: 'log',
        sourceId: logId,
        actorUserId: user.uid,
      },
      meta: { basePoints, taskId, categoryId: task.categoryId },
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update user points
    batch.update(db.collection('users').doc(user.uid), {
      pointsTotal: FieldValue.increment(basePoints),
      pointsLogsTotal: FieldValue.increment(basePoints),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update scoreboards
    batch.set(db.collection('scoreboards').doc('total_alltime').collection('entries').doc(user.uid), {
      userId: user.uid,
      score: FieldValue.increment(basePoints),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(db.collection('scoreboards').doc(`total_week_${weekKey}`).collection('entries').doc(user.uid), {
      userId: user.uid,
      score: FieldValue.increment(basePoints),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(db.collection('scoreboards').doc(`category_${task.categoryId}_alltime`).collection('entries').doc(user.uid), {
      userId: user.uid,
      score: FieldValue.increment(basePoints),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(db.collection('scoreboards').doc(`phase_${phase}_alltime`).collection('entries').doc(user.uid), {
      userId: user.uid,
      score: FieldValue.increment(basePoints),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  // Award certification badge if applicable
  if (shouldAwardPoints && task.certificationBadgeId) {
    const badgeRef = db.collection('users').doc(user.uid).collection('badges').doc(task.certificationBadgeId);
    const existingBadge = await badgeRef.get();

    if (!existingBadge.exists) {
      batch.set(badgeRef, {
        badgeId: task.certificationBadgeId,
        earnedAt: FieldValue.serverTimestamp(),
        earnedBy: 'system',
        sourceTaskId: taskId,
        sourceLogId: logId,
      });
    }
  }

  await batch.commit();

  return {
    success: true,
    logId,
    isUpdate,
    pointsAwarded: shouldAwardPoints ? basePoints : 0,
    message: isUpdate ? 'Log updated' : 'Log created',
  };
});

// ============================================================================
// SOCIAL: LIKES
// ============================================================================

/**
 * onCreateLike - Triggered when a like document is created
 * Awards points to the target owner (capped)
 */
exports.onCreateLike = onDocumentCreated("likes/{likeId}", async (event) => {
  const like = event.data.data();
  const likeId = event.params.likeId;

  if (!like.targetId || !like.targetType || !like.targetOwnerUserId) {
    console.error('Invalid like document:', likeId);
    return;
  }

  // Get the target log/project to determine points
  const targetCollection = like.targetType === 'log' ? 'logs' : 'projects';
  const targetDoc = await db.collection(targetCollection).doc(like.targetId).get();

  if (!targetDoc.exists) {
    console.error('Target not found for like:', likeId);
    return;
  }

  const target = targetDoc.data();
  const basePoints = target.basePoints || 0;
  const socialUnit = Math.round(basePoints / 10);

  if (socialUnit <= 0) return;

  // Check like cap for this target
  const existingLikeEvents = await db.collection('pointsEvents')
    .where('source.sourceType', '==', 'like')
    .where('source.sourceId', '==', like.targetId)
    .get();

  const currentLikePoints = existingLikeEvents.docs.reduce((sum, doc) => sum + (doc.data().delta || 0), 0);

  // Cap: total like points cannot exceed basePoints
  if (currentLikePoints >= basePoints) {
    console.log('Like cap reached for target:', like.targetId);
    return;
  }

  const pointsToAward = Math.min(socialUnit, basePoints - currentLikePoints);

  const dayKey = getDayKey();
  const weekKey = getWeekKey();

  const batch = db.batch();

  // Create points event
  batch.set(db.collection('pointsEvents').doc(`like_${likeId}`), {
    userId: like.targetOwnerUserId,
    type: 'like_award',
    delta: pointsToAward,
    dayKey,
    weekKey,
    source: {
      sourceType: 'like',
      sourceId: likeId,
      actorUserId: like.likerUserId,
    },
    meta: { targetId: like.targetId, targetType: like.targetType },
    createdAt: FieldValue.serverTimestamp(),
  });

  // Update user points
  batch.update(db.collection('users').doc(like.targetOwnerUserId), {
    pointsTotal: FieldValue.increment(pointsToAward),
    pointsSocialTotal: FieldValue.increment(pointsToAward),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update social scoreboard
  batch.set(db.collection('scoreboards').doc('social_alltime').collection('entries').doc(like.targetOwnerUserId), {
    userId: like.targetOwnerUserId,
    score: FieldValue.increment(pointsToAward),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  // Increment like count on target
  batch.update(db.collection(targetCollection).doc(like.targetId), {
    likeCount: FieldValue.increment(1),
  });

  await batch.commit();
});

// ============================================================================
// SOCIAL: COMMENTS
// ============================================================================

/**
 * onCreateComment - Triggered when a comment is created
 * Awards points to the commenter (first per target per day)
 */
exports.onCreateComment = onDocumentCreated("comments/{commentId}", async (event) => {
  const comment = event.data.data();
  const commentId = event.params.commentId;

  if (!comment.targetId || !comment.targetType || !comment.authorUserId) {
    console.error('Invalid comment document:', commentId);
    return;
  }

  // Get the target log/project to determine points
  const targetCollection = comment.targetType === 'log' ? 'logs' : 'projects';
  const targetDoc = await db.collection(targetCollection).doc(comment.targetId).get();

  if (!targetDoc.exists) {
    console.error('Target not found for comment:', commentId);
    return;
  }

  const target = targetDoc.data();
  const basePoints = target.basePoints || 0;
  const socialUnit = Math.round(basePoints / 10);

  // Increment comment count on target
  await db.collection(targetCollection).doc(comment.targetId).update({
    commentCount: FieldValue.increment(1),
  });

  if (socialUnit <= 0) return;

  const dayKey = getDayKey();
  const weekKey = getWeekKey();

  // Check if commenter already earned points for this target today
  const pointsEventId = `comment_${comment.authorUserId}_${comment.targetType}_${comment.targetId}_${dayKey}`;
  const existingEvent = await db.collection('pointsEvents').doc(pointsEventId).get();

  if (existingEvent.exists) {
    console.log('Comment points already awarded for this target today');
    return;
  }

  const batch = db.batch();

  // Create points event (deterministic ID ensures first-per-day)
  batch.set(db.collection('pointsEvents').doc(pointsEventId), {
    userId: comment.authorUserId,
    type: 'comment_award',
    delta: socialUnit,
    dayKey,
    weekKey,
    source: {
      sourceType: 'comment',
      sourceId: commentId,
      actorUserId: comment.authorUserId,
    },
    meta: { targetId: comment.targetId, targetType: comment.targetType },
    createdAt: FieldValue.serverTimestamp(),
  });

  // Update user points
  batch.update(db.collection('users').doc(comment.authorUserId), {
    pointsTotal: FieldValue.increment(socialUnit),
    pointsSocialTotal: FieldValue.increment(socialUnit),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update social scoreboard
  batch.set(db.collection('scoreboards').doc('social_alltime').collection('entries').doc(comment.authorUserId), {
    userId: comment.authorUserId,
    score: FieldValue.increment(socialUnit),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await batch.commit();
});

// ============================================================================
// FEATURES (Teacher-awarded bonus)
// ============================================================================

/**
 * onCreateHighlight - Triggered when a highlight (pin/feature) is created
 * Awards bonus points for features
 */
exports.onCreateHighlight = onDocumentCreated("highlights/{highlightId}", async (event) => {
  const highlight = event.data.data();
  const highlightId = event.params.highlightId;

  // Only features award points
  if (highlight.type !== 'feature') return;

  if (!highlight.targetId || !highlight.targetType || !highlight.targetOwnerUserId) {
    console.error('Invalid highlight document:', highlightId);
    return;
  }

  // Get the target to determine points
  const targetCollection = highlight.targetType === 'log' ? 'logs' : 'projects';
  const targetDoc = await db.collection(targetCollection).doc(highlight.targetId).get();

  if (!targetDoc.exists) {
    console.error('Target not found for feature:', highlightId);
    return;
  }

  const target = targetDoc.data();

  // Check if feature bonus already awarded
  if (target.featureBonusAwarded) {
    console.log('Feature bonus already awarded for target:', highlight.targetId);
    return;
  }

  const basePoints = target.basePoints || 0;
  const featureBonus = Math.round(basePoints / 2);

  if (featureBonus <= 0) return;

  const dayKey = getDayKey();
  const weekKey = getWeekKey();

  const batch = db.batch();

  // Mark target as featured
  batch.update(db.collection(targetCollection).doc(highlight.targetId), {
    featureBonusAwarded: true,
    featureBonusValue: featureBonus,
  });

  // Create points event
  batch.set(db.collection('pointsEvents').doc(`feature_${highlightId}`), {
    userId: highlight.targetOwnerUserId,
    type: 'feature_award',
    delta: featureBonus,
    dayKey,
    weekKey,
    source: {
      sourceType: 'highlight',
      sourceId: highlightId,
      actorUserId: highlight.createdByUserId,
    },
    meta: { targetId: highlight.targetId, targetType: highlight.targetType },
    createdAt: FieldValue.serverTimestamp(),
  });

  // Update user points
  batch.update(db.collection('users').doc(highlight.targetOwnerUserId), {
    pointsTotal: FieldValue.increment(featureBonus),
    pointsFeatureTotal: FieldValue.increment(featureBonus),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update feature scoreboard
  batch.set(db.collection('scoreboards').doc('feature_alltime').collection('entries').doc(highlight.targetOwnerUserId), {
    userId: highlight.targetOwnerUserId,
    score: FieldValue.increment(featureBonus),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await batch.commit();
});

// ============================================================================
// ADMIN: Create Task (callable)
// ============================================================================

exports.createTask = onCall({ cors: true }, async (request) => {
  const user = await validateUser(request.auth);

  if (user.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin only');
  }

  const { categoryId, title, subtitle, body, content, status, isPinned, openAt, closeAt, certificationBadgeId } = request.data;

  if (!categoryId) throw new HttpsError('invalid-argument', 'categoryId required');
  if (!title) throw new HttpsError('invalid-argument', 'title required');

  // Verify category exists
  const categoryDoc = await db.collection('taskCategories').doc(categoryId).get();
  if (!categoryDoc.exists) {
    throw new HttpsError('not-found', 'Category not found');
  }

  const taskRef = db.collection('tasks').doc();

  await taskRef.set({
    categoryId,
    title,
    subtitle: subtitle || null,
    body: body || null,
    content: content || {},
    status: status || 'draft',
    isPinned: isPinned || false,
    openAt: openAt || null,
    closeAt: closeAt || null,
    certificationBadgeId: certificationBadgeId || null,
    createdByUserId: user.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, taskId: taskRef.id };
});
