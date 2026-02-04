// Firebase Configuration
// Portfolio Web-App - Multi-tenant Architecture

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js';

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

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
