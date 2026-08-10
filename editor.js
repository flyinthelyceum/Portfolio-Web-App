// Editor JavaScript - Portfolio Web-App
import { auth, db, storage } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js';
import { initErrorReporting, reportError } from './error-reporting.js';

// Global state
let currentUser = null;
let userProfile = null;
let currentFilter = 'all';
let posts = [];
let selectedLogImages = [];
let selectedProjectImage = null;
let isAdmin = false;

initErrorReporting('editor');

// Initialize
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  await loadUserProfile();
  await checkAdmin();
  await loadPosts();
  setupEventListeners();
});

async function checkAdmin() {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
    isAdmin = adminDoc.exists();
  } catch (error) {
    console.warn('Admin role check failed, defaulting to non-admin:', error?.code || error);
    reportError(error, { action: 'check_admin', page: 'editor' });
    isAdmin = false;
  }

  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  }
}

// Load user profile
async function loadUserProfile() {
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  
  if (userDoc.exists()) {
    userProfile = userDoc.data();
    document.getElementById('user-display').textContent = userProfile.displayName || currentUser.email;
    const sidebarUser = document.getElementById('user-display-sidebar');
    if (sidebarUser) sidebarUser.textContent = userProfile.displayName || currentUser.email;
  } else {
    userProfile = { displayName: currentUser.email };
    document.getElementById('user-display').textContent = currentUser.email;
    const sidebarUser = document.getElementById('user-display-sidebar');
    if (sidebarUser) sidebarUser.textContent = currentUser.email;
  }
}

// Load posts
async function loadPosts() {
  const postsRef = collection(db, 'posts');
  const postsSnap = await getDocs(postsRef);
  posts = [];
  postsSnap.forEach(d => {
    const data = d.data();
    if (data.userId === currentUser.uid) {
      posts.push({ id: d.id, ...data });
    }
  });

  // Sort by createdAt descending (client-side)
  posts.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  renderPosts();
}

// Render posts
function renderPosts() {
  const grid = document.getElementById('posts-grid');
  
  const filteredPosts = currentFilter === 'all' 
    ? posts 
    : posts.filter(p => p.type === currentFilter);

  if (filteredPosts.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <div style="font-size:32px;margin-bottom:8px;">📝</div>
        <div style="font-weight:500;margin-bottom:4px;">No ${currentFilter === 'all' ? 'posts' : currentFilter + 's'} yet</div>
        <div>Click "+ ${currentFilter === 'all' ? 'Log" or "+ Project' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}" to get started</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredPosts.map(post => `
    <div class="post-card">
      ${post.images && post.images.length > 0 ? `
        <img src="${post.images[0]}" alt="${post.title}" class="post-card__image">
      ` : ''}
      <div class="post-card__content">
        <div class="post-card__meta">
          <span class="post-card__type post-card__type--${post.type}">${post.type}</span>
          <span class="post-card__date">${formatDate(post.date || post.createdAt)}</span>
        </div>
        <h3 class="post-card__title">${escapeHtml(post.title)}</h3>
        <p class="post-card__excerpt">${escapeHtml(truncate(post.body || post.summary || '', 120))}</p>
        <div class="post-card__actions">
          <button class="post-card__btn" onclick="editPost('${post.id}')">Edit</button>
          <button class="post-card__btn post-card__btn--delete" onclick="deletePost('${post.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Logout
  document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = 'index.html';
  });

  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }

  // View portfolio
  document.getElementById('view-portfolio-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const urlParam = userProfile?.username || currentUser.uid;
    window.open('index.html?user=' + urlParam, '_blank');
  });

  // Add log button
  document.getElementById('add-log-btn').addEventListener('click', () => {
    openModal('log-modal');
    // Set today's date
    document.getElementById('log-date').valueAsDate = new Date();
  });

  // Add project button
  document.getElementById('add-project-btn').addEventListener('click', () => {
    openModal('project-modal');
  });

  // Filter buttons
  document.querySelectorAll('.filter').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.filter').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderPosts();
    });
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.close);
    });
  });

  // Close modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Log image upload
  const logImageUpload = document.getElementById('log-image-upload');
  const logImageInput = document.getElementById('log-images');
  
  logImageUpload.addEventListener('click', () => logImageInput.click());
  logImageInput.addEventListener('change', handleLogImages);

  // Project image upload
  const projectImageUpload = document.getElementById('project-image-upload');
  const projectImageInput = document.getElementById('project-image');
  
  projectImageUpload.addEventListener('click', () => projectImageInput.click());
  projectImageInput.addEventListener('change', handleProjectImage);

  // Form submissions
  document.getElementById('log-form').addEventListener('submit', handleLogSubmit);
  document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
}

// Handle log images
function handleLogImages(e) {
  const files = Array.from(e.target.files);
  
  if (files.length > 3) {
    alert('Maximum 3 images allowed');
    return;
  }

  selectedLogImages = files;
  renderLogImagePreviews();
}

// Render log image previews
function renderLogImagePreviews() {
  const preview = document.getElementById('log-image-preview');
  
  if (selectedLogImages.length === 0) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = selectedLogImages.map((file, index) => `
    <div class="upload-preview__item">
      <img src="${URL.createObjectURL(file)}" class="upload-preview__img" alt="Preview ${index + 1}">
      <button type="button" class="upload-preview__remove" onclick="removeLogImage(${index})">×</button>
    </div>
  `).join('');
}

// Remove log image
window.removeLogImage = function(index) {
  selectedLogImages.splice(index, 1);
  renderLogImagePreviews();
};

// Handle project image
function handleProjectImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  selectedProjectImage = file;
  renderProjectImagePreview();
}

// Render project image preview
function renderProjectImagePreview() {
  const preview = document.getElementById('project-image-preview');
  
  if (!selectedProjectImage) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = `
    <div class="upload-preview__item">
      <img src="${URL.createObjectURL(selectedProjectImage)}" class="upload-preview__img" alt="Preview">
      <button type="button" class="upload-preview__remove" onclick="removeProjectImage()">×</button>
    </div>
  `;
}

// Remove project image
window.removeProjectImage = function() {
  selectedProjectImage = null;
  document.getElementById('project-image').value = '';
  renderProjectImagePreview();
};

// Handle log form submit
async function handleLogSubmit(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const formData = new FormData(e.target);
    
    // Upload images
    const imageUrls = await uploadImages(selectedLogImages, 'logs');

    // Create post
    // authorEmail is denormalised so the Canvas write-back can resolve the
    // student against the roster without a second read. createdAt must stay a
    // server timestamp: it decides which grading window the entry falls in.
    await addDoc(collection(db, 'posts'), {
      userId: currentUser.uid,
      authorEmail: (currentUser.email || '').toLowerCase(),
      type: 'log',
      title: formData.get('title'),
      date: formData.get('date'),
      body: formData.get('body'),
      images: imageUrls,
      createdAt: serverTimestamp()
    });

    // Reset and close
    e.target.reset();
    selectedLogImages = [];
    renderLogImagePreviews();
    closeModal('log-modal');
    
    // Reload posts
    await loadPosts();
    
  } catch (error) {
    console.error('Error saving log:', error);
    reportError(error, { action: 'save_log', page: 'editor' });
    alert('Failed to save log. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Log';
  }
}

// Handle project form submit
async function handleProjectSubmit(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const formData = new FormData(e.target);
    
    // Upload image
    const imageUrls = selectedProjectImage 
      ? await uploadImages([selectedProjectImage], 'projects')
      : [];

    // Create post
    await addDoc(collection(db, 'posts'), {
      userId: currentUser.uid,
      authorEmail: (currentUser.email || '').toLowerCase(),
      type: 'project',
      title: formData.get('title'),
      summary: formData.get('summary'),
      body: formData.get('body'),
      images: imageUrls,
      createdAt: serverTimestamp()
    });

    // Reset and close
    e.target.reset();
    selectedProjectImage = null;
    renderProjectImagePreview();
    closeModal('project-modal');
    
    // Reload posts
    await loadPosts();
    
  } catch (error) {
    console.error('Error saving project:', error);
    reportError(error, { action: 'save_project', page: 'editor' });
    alert('Failed to save project. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Project';
  }
}

// Upload images to Firebase Storage
async function uploadImages(files, folder) {
  const urls = [];
  
  for (const file of files) {
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `users/${currentUser.uid}/${folder}/${filename}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  
  return urls;
}

// Delete post
window.deletePost = async function(postId) {
  if (!confirm('Are you sure you want to delete this post?')) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'posts', postId));
    await loadPosts();
  } catch (error) {
    console.error('Error deleting post:', error);
    reportError(error, { action: 'delete_post', page: 'editor', context: { postId } });
    alert('Failed to delete post. Please try again.');
  }
};

// Edit post (TODO)
window.editPost = function(postId) {
  alert('Edit functionality coming soon!');
};

// Modal helpers
function openModal(modalId) {
  document.getElementById(modalId).classList.add('visible');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('visible');
}

// Utility functions
function formatDate(timestamp) {
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleDateString();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return 'Unknown date';
}

function truncate(str, length) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
