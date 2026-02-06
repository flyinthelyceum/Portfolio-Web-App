import { db } from './firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  getDocs
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';

// Get user from URL
const urlParams = new URLSearchParams(window.location.search);
const urlUser = urlParams.get('user');

let currentUser = null;
let userData = null;
let posts = [];
let currentLightboxIndex = 0;
let currentLightboxImages = [];

// DOM Elements
const indexNav = document.getElementById('index-nav');
const profileBio = document.getElementById('profile-bio');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileLink = document.getElementById('profile-link');
const postsContainer = document.getElementById('posts-container');
const footerTimestamp = document.getElementById('footer-timestamp');
const footerAuth = document.getElementById('footer-auth');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxThumbs = document.getElementById('lightbox-thumbs');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// Auth state
const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    footerAuth.href = 'editor.html';
    footerAuth.textContent = 'Editor';

    // Auto-redirect to user's portfolio if no ?user parameter
    if (!urlUser) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const username = userDoc.data().username || user.uid;
        window.location.href = `?user=${username}`;
      }
    }
  } else {
    footerAuth.href = 'login.html';
    footerAuth.textContent = 'Log In';
  }
});

// Load portfolio
async function loadPortfolio() {
  try {
    if (!urlUser) {
      postsContainer.innerHTML = '<p>No user specified</p>';
      return;
    }

    // Get user by username or uid
    let userId;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', urlUser));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      userId = querySnapshot.docs[0].id;
      userData = querySnapshot.docs[0].data();
    } else {
      // Try direct UID lookup
      const userDoc = await getDoc(doc(db, 'users', urlUser));
      if (userDoc.exists()) {
        userId = urlUser;
        userData = userDoc.data();
      } else {
        postsContainer.innerHTML = '<p>User not found</p>';
        return;
      }
    }

    // Update profile
    document.title = userData.displayName || 'Portfolio';
    profileBio.textContent = userData.bio || '';
    profileName.textContent = userData.displayName || 'Portfolio';
    if (userData.email) {
      profileEmail.href = `mailto:${userData.email}`;
      profileEmail.textContent = userData.email;
      profileEmail.style.display = 'block';
    } else {
      profileEmail.style.display = 'none';
    }

    // Get posts
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const postsSnapshot = await getDocs(postsQuery);

    posts = postsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(post => !post.deletedAt);

    // Render
    renderIndex();
    renderPosts();
    updateFooter();
  } catch (error) {
    console.error('Error loading portfolio:', error);
    postsContainer.innerHTML = '<p>Error loading portfolio</p>';
  }
}

// Render index navigation
function renderIndex() {
  indexNav.innerHTML = posts.map((post, i) => `
    <div class="index__item" data-post-id="${post.id}">
      <span class="index__number">${String(i).padStart(2, '0')}.</span>
      <span class="index__title-text">${escapeHtml(post.title)}</span>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.index__item').forEach(item => {
    item.addEventListener('click', () => {
      const postId = item.dataset.postId;
      const postEl = document.getElementById(`post-${postId}`);
      if (postEl) {
        postEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Render posts
function renderPosts() {
  postsContainer.innerHTML = posts.map((post, i) => {
    const date = formatDate(post.createdAt);
    const type = post.type === 'log' ? 'Log' : 'Project';
    const images = post.images || [];
    
    return `
      <article class="post" id="post-${post.id}">
        <header class="post__header">
          <div class="post__number">${String(i).padStart(2, '0')}.</div>
          <div class="post__title-section">
            <h2 class="post__title">${escapeHtml(post.title)}</h2>
            <div class="post__meta">
              ${type}<br>
              ${date}
            </div>
          </div>
          <div class="post__publication">
            ${post.type === 'project' ? 'Project' : 'Log Entry'}
          </div>
        </header>
        ${post.content ? `<div class="post__body">${escapeHtml(post.content)}</div>` : ''}
        ${images.length > 0 ? `
          <div class="post__images">
            ${images.map((img, idx) => `
              <img class="post__image" src="${img}" alt="${escapeHtml(post.title)}" 
                   data-post-id="${post.id}" data-index="${idx}">
            `).join('')}
          </div>
        ` : ''}
      </article>
    `;
  }).join('');

  // Add lightbox handlers
  document.querySelectorAll('.post__image').forEach(img => {
    img.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      const index = parseInt(e.target.dataset.index);
      const post = posts.find(p => p.id === postId);
      if (post) {
        openLightbox(post.images, index);
      }
    });
  });
}

// Lightbox
function openLightbox(images, startIndex = 0) {
  currentLightboxImages = images;
  currentLightboxIndex = startIndex;
  updateLightbox();
  lightbox.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  lightboxImage.src = currentLightboxImages[currentLightboxIndex];
  
  // Update thumbnails
  lightboxThumbs.innerHTML = currentLightboxImages.map((img, i) => `
    <img class="lightbox__thumb ${i === currentLightboxIndex ? 'is-active' : ''}" 
         src="${img}" alt="" data-index="${i}">
  `).join('');

  // Add thumb click handlers
  document.querySelectorAll('.lightbox__thumb').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      currentLightboxIndex = parseInt(e.target.dataset.index);
      updateLightbox();
    });
  });
}

function nextImage() {
  currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
  updateLightbox();
}

function prevImage() {
  currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
  updateLightbox();
}

// Event listeners
lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', nextImage);
lightboxPrev.addEventListener('click', prevImage);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-active')) return;
  
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

// Helpers
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function updateFooter() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  footerTimestamp.textContent = time;
}

// Initialize
loadPortfolio();
setInterval(updateFooter, 1000);
