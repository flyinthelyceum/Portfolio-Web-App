import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const form = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const googleBtn = document.getElementById('google-btn');

function validatePassword(password) {
  const hasMinLength = password.length >= 8;
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasLetters = /[a-zA-Z]/.test(password);

  return {
    isValid: hasMinLength && hasNumbers && hasSymbols && hasLetters,
    hasMinLength,
    hasNumbers,
    hasSymbols,
    hasLetters
  };
}

function showError(message, isSuccess = false) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
  if (isSuccess) {
    errorMessage.classList.remove('alert--error');
    errorMessage.classList.add('alert--success');
  } else {
    errorMessage.classList.remove('alert--success');
    errorMessage.classList.add('alert--error');
  }
}

function hideError() {
  errorMessage.classList.remove('visible');
}

// Handle Google Sign-Up
googleBtn.addEventListener('click', async () => {
  googleBtn.disabled = true;
  const originalText = googleBtn.innerHTML;
  googleBtn.innerHTML = '<span class="loading"></span> Signing up...';
  hideError();

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, 'users', user.uid), {
      displayName: user.displayName || user.email.split('@')[0],
      email: user.email,
      username: '',
      bio: '',
      avatarUrl: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    showError('Account created! Redirecting to profile setup...', true);

    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1000);
  } catch (error) {
    console.error('Google sign-up error:', error);

    let message = 'Sign up with Google failed.';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-up popup was closed.';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      message = 'This Google account is already linked to another method.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Check your connection.';
    }

    showError(message);
    googleBtn.disabled = false;
    googleBtn.innerHTML = originalText;
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!email) { showError('Please enter an email address'); return; }
  if (!password) { showError('Please enter a password'); return; }
  if (password !== confirmPassword) { showError('Passwords do not match'); return; }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    showError('Password must be at least 8 characters with letters, numbers, and symbols');
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="loading"></span> Creating account...';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: email.split('@')[0]
    });

    await setDoc(doc(db, 'users', user.uid), {
      displayName: email.split('@')[0],
      email: email,
      username: '',
      bio: '',
      avatarUrl: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    showError('Account created! Redirecting to profile setup...', true);

    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1000);
  } catch (error) {
    console.error('Signup error:', error);

    if (error.code === 'auth/email-already-in-use') {
      showError('This email is already registered. Try logging in instead.');
    } else if (error.code === 'auth/invalid-email') {
      showError('Please enter a valid email address');
    } else if (error.code === 'auth/weak-password') {
      showError('Password is too weak. Use letters, numbers, and symbols.');
    } else {
      showError(`Error: ${error.message}`);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
