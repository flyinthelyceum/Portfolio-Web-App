import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js';
import { initErrorReporting, reportError } from './error-reporting.js';
import { buildPublicProfile, publicProfileRef } from './identity.js';
import { resizeImage } from './image-resize.js';

// DOM Elements
const profileForm = document.getElementById('profile-form');
const displayNameInput = document.getElementById('displayName');
const usernameInput = document.getElementById('username');
const bioInput = document.getElementById('bio');
const emailInput = document.getElementById('email');
const studentIdInput = document.getElementById('studentId');
const avatarInput = document.getElementById('avatar');
const avatarPreview = document.getElementById('avatar-preview');
const usernamePreview = document.getElementById('username-preview');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

let currentUser = null;
let currentAvatarUrl = null;
let originalUsername = null;

initErrorReporting('profile');

// Check authentication
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadProfile();
  } else {
    window.location.href = 'login.html';
  }
});

// Load existing profile data
async function loadProfile() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      displayNameInput.value = data.displayName || currentUser.displayName || '';
      usernameInput.value = data.username || '';
      bioInput.value = data.bio || '';
      emailInput.value = data.email || currentUser.email || '';
      studentIdInput.value = data.studentId || '';
      originalUsername = data.username || '';
      
      if (data.avatarUrl) {
        currentAvatarUrl = data.avatarUrl;
        showAvatarPreview(data.avatarUrl);
      }
      
      if (data.username) {
        usernamePreview.textContent = data.username;
      }
    } else {
      // No profile yet, pre-fill with auth data
      displayNameInput.value = currentUser.displayName || '';
      usernameInput.value = generateUsernameFromEmail(currentUser.email);
      usernamePreview.textContent = usernameInput.value;
      emailInput.value = currentUser.email || '';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    reportError(error, { action: 'profile_load', page: 'profile' });
    showError('Failed to load profile data');
  }
}

// Generate username suggestion from email
function generateUsernameFromEmail(email) {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Show avatar preview
function showAvatarPreview(url) {
  avatarPreview.innerHTML = `<img src="${url}" alt="Avatar">`;
}

// Avatar file selection
avatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    // No size limit here any more. The file is resized to 512px before upload,
    // so rejecting a large original just made students go and find a smaller
    // photo for no reason.
    const reader = new FileReader();
    reader.onload = (e) => {
      showAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// Username preview update
usernameInput.addEventListener('input', (e) => {
  usernamePreview.textContent = e.target.value || 'username';
});

// Check if username is available
async function isUsernameAvailable(username) {
  // If username hasn't changed, it's available
  if (username === originalUsername) {
    return true;
  }
  
  const q = query(collection(db, 'users'), where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

// Upload avatar to Storage
async function uploadAvatar(file) {
  const resized = await resizeImage(file, { maxEdge: 512 });
  const storageRef = ref(storage, `users/${currentUser.uid}/avatar.jpg`);
  await uploadBytes(storageRef, resized);
  return await getDownloadURL(storageRef);
}

// Form submission
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  hideMessages();
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    const displayName = displayNameInput.value.trim();
    const username = usernameInput.value.trim().toLowerCase();
    const bio = bioInput.value.trim();
    const studentId = studentIdInput.value.trim();
    
    // Validate username format
    if (!/^[a-z0-9]+$/.test(username)) {
      throw new Error('Username must contain only lowercase letters and numbers');
    }
    
    // Check username availability
    const available = await isUsernameAvailable(username);
    if (!available) {
      throw new Error('Username is already taken');
    }
    
    // Upload avatar if new file selected
    let avatarUrl = currentAvatarUrl;
    if (avatarInput.files[0]) {
      avatarUrl = await uploadAvatar(avatarInput.files[0]);
    }
    
    // Update Firebase Auth displayName
    await updateProfile(currentUser, {
      displayName: displayName,
      photoURL: avatarUrl
    });
    
    // The private record keeps studentId and is readable by signed-in users
    // only. `email` is deliberately not written here. It is the identity key
    // the Canvas write-back resolves against the roster, so it is set once from
    // the verified sign-in address and is rejected by rules on update.
    await setDoc(doc(db, 'users', currentUser.uid), {
      displayName,
      username,
      bio,
      studentId,
      avatarUrl,
      updatedAt: new Date()
    }, { merge: true });

    // The public projection is what an unauthenticated visitor reads when they
    // open a shared portfolio link. Email and studentId must never land here.
    await setDoc(publicProfileRef(db, currentUser.uid), buildPublicProfile({
      username,
      displayName,
      bio,
      avatarUrl
    }), { merge: true });
    
    showSuccess('Profile updated successfully!');
    
    // Redirect to editor after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'editor.html';
    }, 1500);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    reportError(error, { action: 'profile_save', page: 'profile' });
    showError(error.message);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Profile';
  }
});

// Cancel button
cancelBtn.addEventListener('click', () => {
  window.location.href = 'editor.html';
});

// Message helpers
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
  successMessage.classList.remove('visible');
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('visible');
  errorMessage.classList.remove('visible');
}

function hideMessages() {
  errorMessage.classList.remove('visible');
  successMessage.classList.remove('visible');
}
