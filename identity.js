// Identity helpers shared by signup, login and profile.
//
// Two properties downstream depend on this file.
//
// 1. The Canvas write-back resolves a student to a Canvas user id by school
//    email, so a profile has to carry an email from the moment it exists.
//    Posts carry it too, so the bridge does not need a second read to grade.
//
// 2. A portfolio link only works if the profile has a username. Signup used to
//    write an empty one and rely on the student visiting a separate setup page,
//    which most of them never did, so their share link resolved to nothing.
//    The username is derived at first sign-in instead.
//
// Public-safe fields live in publicProfiles, which is world readable. Email,
// studentId and fullName must never be written there.

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const USERNAME_MAX_LENGTH = 30;
const USERNAME_FALLBACK = 'student';
const SUFFIX_LENGTH = 4;

// jdoe27@brophybroncos.org -> jdoe27
export function usernameFromEmail(email) {
  const localPart = String(email || '').split('@')[0].toLowerCase();
  const cleaned = localPart.replace(/[^a-z0-9]/g, '');
  return cleaned.slice(0, USERNAME_MAX_LENGTH) || USERNAME_FALLBACK;
}

export function displayNameFromEmail(email) {
  const localPart = String(email || '').split('@')[0];
  return localPart || 'Student';
}

async function isUsernameTaken(db, username, ownUserId) {
  const matches = await getDocs(
    query(collection(db, 'publicProfiles'), where('username', '==', username))
  );
  return matches.docs.some((match) => match.id !== ownUserId);
}

// Two students can share an initial, surname and graduation year, and a silent
// collision would point one student's portfolio link at the other's work. Fall
// back to a uid suffix rather than letting that happen.
export async function uniqueUsername(db, base, userId) {
  try {
    if (!(await isUsernameTaken(db, base, userId))) {
      return base;
    }
    const suffix = String(userId || '').slice(0, SUFFIX_LENGTH).toLowerCase();
    return `${base}${suffix}`.slice(0, USERNAME_MAX_LENGTH);
  } catch (error) {
    console.warn('Username uniqueness check failed, using base:', error?.code || error);
    return base;
  }
}

// Private member record. Readable by signed-in users only.
export function buildUserRecord({ email, displayName, username, avatarUrl }) {
  return {
    displayName,
    email,
    username,
    bio: '',
    avatarUrl: avatarUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

// Public projection. Anything added here is world readable.
export function buildPublicProfile({ username, displayName, bio, avatarUrl }) {
  return {
    username,
    displayName,
    bio: bio || '',
    avatarUrl: avatarUrl || '',
    publicEnabled: true,
    updatedAt: serverTimestamp()
  };
}

export function userRef(db, userId) {
  return doc(db, 'users', userId);
}

export function publicProfileRef(db, userId) {
  return doc(db, 'publicProfiles', userId);
}
