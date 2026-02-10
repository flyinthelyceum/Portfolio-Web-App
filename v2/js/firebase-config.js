/**
 * Firebase Configuration for Portfolio Web App v2
 * Authority: PROJECT_CHARTER.md
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// Firebase configuration (same project as v1)
const firebaseConfig = {
  apiKey: "AIzaSyCMb1U6K7C-DaMT6Dojbcv7UhLZO4Yfdu0",
  authDomain: "portfolio-web-app-26.firebaseapp.com",
  projectId: "portfolio-web-app-26",
  storageBucket: "portfolio-web-app-26.firebasestorage.app",
  messagingSenderId: "573014467309",
  appId: "1:573014467309:web:b1e915e1b003077b95e2e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// Cloud Functions (v2 scoring boundary)
export const publishLog = httpsCallable(functions, 'publishLog');
export const createTask = httpsCallable(functions, 'createTask');

// Re-export commonly used Firestore functions
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  ref,
  uploadBytes,
  getDownloadURL
};
