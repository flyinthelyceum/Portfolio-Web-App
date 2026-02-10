import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const btnText = document.getElementById('btn-text');
const errorMessage = document.getElementById('error-message');
const resetLink = document.getElementById('reset-link');
const googleBtn = document.getElementById('google-btn');

// Check if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'editor.html';
  }
});

// Handle login
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginBtn.disabled = true;
  btnText.innerHTML = '<span class="loading"></span>';
  errorMessage.classList.remove('visible');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect happens via onAuthStateChanged
  } catch (error) {
    console.error('Login error:', error);

    let message = 'Login failed. Please check your credentials.';

    if (error.code === 'auth/invalid-credential') {
      message = 'Invalid email or password.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Check your connection.';
    }

    errorMessage.textContent = message;
    errorMessage.classList.add('visible');

    loginBtn.disabled = false;
    btnText.textContent = 'Log In';
  }
});

// Handle Google Sign-In
googleBtn.addEventListener('click', async () => {
  googleBtn.disabled = true;
  const originalText = googleBtn.innerHTML;
  googleBtn.innerHTML = '<span class="loading"></span> Signing in...';
  errorMessage.classList.remove('visible');

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // First time Google login - create profile and redirect to profile editor
      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        username: '',
        bio: '',
        avatarUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      window.location.href = 'profile.html';
    } else {
      window.location.href = 'editor.html';
    }
  } catch (error) {
    console.error('Google sign-in error:', error);

    let message = 'Sign in with Google failed.';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-in popup was closed.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Check your connection.';
    }

    errorMessage.textContent = message;
    errorMessage.classList.add('visible');

    googleBtn.disabled = false;
    googleBtn.innerHTML = originalText;
  }
});

// Handle password reset
resetLink.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    errorMessage.textContent = 'Enter your email address first.';
    errorMessage.classList.add('visible');
    emailInput.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    errorMessage.textContent = 'Password reset email sent! Check your inbox.';
    errorMessage.classList.remove('alert--error');
    errorMessage.classList.add('alert--success', 'visible');
  } catch (error) {
    console.error('Reset error:', error);
    errorMessage.textContent = 'Could not send reset email. Check the email address.';
    errorMessage.classList.add('visible');
  }
});
