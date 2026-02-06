import { db } from './firebase-config.js';
import { collection, doc, getDoc, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';

const urlParams = new URLSearchParams(window.location.search);
const urlUser = urlParams.get('user');

let userData = null;
let posts = [];
let currentLightboxIndex = 0;
let currentLightboxImages = [];

const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById('footer-auth').href = 'editor.html';
    document.getElementById('footer-auth').textContent = 'Editor';

    if (!urlUser) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const username = userDoc.data().username || user.uid;
        window.location.href = `?user=${username}`;
      }
    }
  }
});

async function loadPortfolio() {
  try {
    if (!urlUser) {
      document.getElementById('posts-container').innerHTML = '<p>No user specified</p>';
      return;
    }

    // Get user
    let userId;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', urlUser));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      userId = querySnapshot.docs[0].id;
      userData = querySnapshot.docs[0].data();
    } else {
      const userDoc = await getDoc(doc(db, 'users', urlUser));
      if (userDoc.exists()) {
        userId = urlUser;
        userData = userDoc.data();
      } else {
        document.getElementById('posts-container').innerHTML = '<p>User not found</p>';
        return;
      }
    }

    // Update profile
    document.title = userData.displayName || 'Portfolio';
    document.getElementById('profile-bio').textContent = userData.bio || '';
    document.getElementById('profile-name').textContent = userData.displayName || 'Portfolio';
    
    const emailEl = document.getElementById('profile-email');
    if (userData.email) {
      emailEl.href = `mailto:${userData.email}`;
      emailEl.textContent = userData.email;
      emailEl.style.display = 'block';
    }

    // Get posts
    const postsRef = collection(db, 'posts');
    const postsQuery = query(postsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const postsSnapshot = await getDocs(postsQuery);

    posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(post => !post.deletedAt);

    renderIndex();
    renderPosts();
    updateFooter();
  } catch (error) {
    console.error('Error loading portfolio:', error);
    document.getElementById('posts-container').innerHTML = '<p>Error loading portfolio</p>';
  }
}

function renderIndex() {
  const indexNav = document.getElementById('index-nav');
  indexNav.innerHTML = posts.map((post, i) => `
    <div class="index__item" data-post-id="${post.id}">
      <span class="index__number">${String(i).padStart(2, '0')}.</span>
      <span>${escapeHtml(post.title)}</span>
    </div>
  `).join('');

  document.querySelectorAll('.index__item').forEach(item => {
    item.addEventListener('click', () => {
      const postEl = document.getElementById(`post-${item.dataset.postId}`);
      if (postEl) postEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderPosts() {
  const container = document.getElementById('posts-container');
  container.innerHTML = posts.map((post, i) => {
    const date = formatDate(post.createdAt);
    const images = post.images || [];
    
    return `
      <article class="post" id="post-${post.id}">
        <header class="post__header">
          <div class="post__number">${String(i).padStart(2, '0')}.</div>
          <div>
            <h2 class="post__title">${escapeHtml(post.title)}</h2>
            <div class="post__meta">${post.type === 'log' ? 'Log' : 'Project'}<br>${date}</div>
          </div>
          <div class="post__publication">${post.type === 'project' ? 'Project' : 'Log Entry'}</div>
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

  document.querySelectorAll('.post__image').forEach(img => {
    img.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      const index = parseInt(e.target.dataset.index);
      const post = posts.find(p => p.id === postId);
      if (post) openLightbox(post.images, index);
    });
  });
}

function openLightbox(images, startIndex = 0) {
  currentLightboxImages = images;
  currentLightboxIndex = startIndex;
  updateLightbox();
  document.getElementById('lightbox').classList.add('is-active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('is-active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  document.getElementById('lightbox-image').src = currentLightboxImages[currentLightboxIndex];
  
  const thumbs = document.getElementById('lightbox-thumbs');
  thumbs.innerHTML = currentLightboxImages.map((img, i) => `
    <img class="lightbox__thumb ${i === currentLightboxIndex ? 'is-active' : ''}" 
         src="${img}" data-index="${i}">
  `).join('');

  thumbs.querySelectorAll('.lightbox__thumb').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      currentLightboxIndex = parseInt(e.target.dataset.index);
      updateLightbox();
    });
  });
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-next').addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
  updateLightbox();
});
document.getElementById('lightbox-prev').addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
  updateLightbox();
});

document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox') closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lightbox').classList.contains('is-active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
});

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
  document.getElementById('footer-timestamp').textContent = time;
}

loadPortfolio();
setInterval(updateFooter, 1000);

