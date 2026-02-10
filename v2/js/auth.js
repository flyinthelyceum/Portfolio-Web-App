/**
 * Auth Module for Portfolio Web App v2
 * Handles authentication state and user creation
 */

import {
  auth,
  db,
  googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from './firebase-config.js';

// Current user state
let currentUser = null;
let currentUserData = null;

/**
 * Initialize auth state listener
 * @param {Function} callback - Called with (user, userData) on auth change
 */
export function initAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      // Fetch or create user document
      currentUserData = await ensureUserDocument(user);
      callback(user, currentUserData);
    } else {
      currentUserData = null;
      callback(null, null);
    }
  });
}

/**
 * Ensure user document exists in Firestore
 * Creates one with defaults if not present
 */
async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    // Update last login
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    return userDoc.data();
  }

  // Create new user document with v2 schema
  const newUserData = {
    role: 'student', // Default role
    active: true,
    fullName: user.displayName || user.email?.split('@')[0] || 'Student',
    handle: null,
    photoUrl: user.photoURL || null,
    bio: null,
    links: [],
    publicEnabled: false,
    // Points (all start at 0)
    pointsTotal: 0,
    pointsLogsTotal: 0,
    pointsSocialTotal: 0,
    pointsFeatureTotal: 0,
    // Streaks
    streakLogCurrent: 0,
    streakIterationCurrent: 0,
    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(userRef, newUserData);
  return newUserData;
}

/**
 * Sign in with email/password
 */
export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign in with Google
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign out
 */
export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get current user data from Firestore
 */
export function getCurrentUserData() {
  return currentUserData;
}

/**
 * Check if current user is admin
 */
export function isAdmin() {
  return currentUserData?.role === 'admin';
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
