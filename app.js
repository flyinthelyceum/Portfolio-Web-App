import { db } from './firebase-config.js';
import { collection, doc, getDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';

const urlParams = new URLSearchParams(window.location.search);
const urlUser = urlParams.get('user');

let userData = null;
let posts = [];
let currentLightboxIndex = 0;
let currentLightboxImages = [];

let currentUser = null;

const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('footer-auth').href = 'editor.html';
    document.getElementById('footer-auth').textContent = 'Editor';

    // Update sidebar nav if already rendered
    updateSidebarNav(user);

    if (!urlUser) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const username = userDoc.data().username || user.uid;
        window.location.href = `?user=${username}`;
      }
    }
  }
});

function updateSidebarNav(user) {
  const navEl = document.getElementById('index-nav');
  if (!navEl) return;
  let links = '';
  if (user) {
    links += '<a href="editor.html">Editor</a>';
    links += '<a href="profile.html">Profile</a>';
    // If viewing someone else's portfolio, link to own
    if (urlUser) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        const myUsername = snap.exists() ? (snap.data().username || user.uid) : user.uid;
        if (myUsername !== urlUser) {
          const ownLink = document.createElement('a');
          ownLink.href = `?user=${myUsername}`;
          ownLink.textContent = 'My Portfolio';
          navEl.prepend(ownLink);
        }
      });
    }
  } else {
    links += '<a href="login.html">Log In</a>';
  }
  navEl.innerHTML += links;
}

async function loadPortfolio() {
  try {
    // Ensure DOM is ready
    if (!document.querySelector('.profile') || !document.querySelector('.posts')) {
      console.error('DOM elements not ready');
      return;
    }

    if (!urlUser) {
      const postsEl = document.querySelector('.posts');
      if (postsEl) postsEl.innerHTML = '<p>No user specified</p>';
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
        const postsEl = document.querySelector('.posts');
        if (postsEl) postsEl.innerHTML = '<p>User not found</p>';
        return;
      }
    }

    // Get posts
    const postsRef = collection(db, 'posts');
    const postsSnap = await getDocs(postsRef);
    const allPosts = [];
    postsSnap.forEach(d => {
      const data = d.data();
      if (data.userId === userId) {
        allPosts.push({ id: d.id, ...data });
      }
    });

    // Sort by date, newest first
    allPosts.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : (a.date?.toDate?.() || new Date(a.date));
      const dateB = b.date instanceof Date ? b.date : (b.date?.toDate?.() || new Date(b.date));
      return dateB - dateA;
    });

    posts = allPosts;

    // Populate sidebar index (narrow left column — titles + dates only)
    const index = document.querySelector('.index');
    if (index) {
      let sb = '<div class="index__header">';
      sb += `<div class="index__name">${escapeHtml(userData.displayName || userData.username || 'Anonymous')}</div>`;
      sb += '</div>';

      if (posts.length > 0) {
        sb += '<div class="index__label">Index</div>';
        sb += '<ul class="index__list">';
        posts.forEach((post, i) => {
          const date = formatDateShort(post.date);
          sb += `<li class="index__item"><a href="#post-${post.id}"><span>${escapeHtml(post.title)}</span><span class="index__item-date">${date}</span></a></li>`;
        });
        sb += '</ul>';
      }

      sb += '<nav class="index__nav" id="index-nav"></nav>';

      sb += '<div class="index__footer">';
      if (userData.email) {
        sb += `<a href="mailto:${escapeHtml(userData.email)}">${escapeHtml(userData.email)}</a>`;
      }
      sb += '</div>';

      index.innerHTML = sb;

      // Populate nav links if auth state already resolved
      if (currentUser) updateSidebarNav(currentUser);
    }

    // Populate profile header (upper-right, above post list)
    const profile = document.querySelector('.profile');
    if (profile) {
      let ph = '';
      if (userData.avatarUrl) {
        ph += `<img class="profile__avatar" src="${escapeHtml(userData.avatarUrl)}" alt="">`;
      }
      ph += '<div class="profile__info">';
      ph += `<div class="profile__name">${escapeHtml(userData.displayName || userData.username || 'Anonymous')}</div>`;
      if (userData.bio) {
        ph += `<div class="profile__tagline">${escapeHtml(userData.bio)}</div>`;
      }
      ph += `<div class="profile__description">A daily practice of documenting work as storytelling — capturing process, reflection, and creative progress over time.</div>`;
      ph += '</div>';
      profile.innerHTML = ph;
    }

    renderPosts();

  } catch (error) {
    console.error('Error loading portfolio:', error);
    const postsEl = document.querySelector('.posts');
    if (postsEl) postsEl.innerHTML = '<p>Error loading portfolio</p>';
  }
}

function renderPosts() {
  const container = document.querySelector('.posts');
  if (!container) return;

  container.innerHTML = posts.map((post, i) => {
    const date = formatDate(post.date);
    const images = post.images || [];
    
    const imagesCarousel = images.length > 0 ? `
      <div class="post__images">
        ${images.map((img, idx) => `
          <img class="post__image" src="${img}" alt="${escapeHtml(post.title)}" 
               data-post-index="${i}" data-image-index="${idx}">
        `).join('')}
      </div>
    ` : '';

    return `
      <article class="post" id="post-${post.id}">
        <div class="post__header">
          <div class="post__number">${String(i + 1).padStart(2, '0')}.</div>
          <h2 class="post__title">${escapeHtml(post.title)}</h2>
          <div class="post__meta">${date}</div>
        </div>
        ${post.body ? `<div class="post__body">${escapeHtml(post.body)}</div>` : ''}
        ${imagesCarousel}
      </article>
    `;
  }).join('');

  document.querySelectorAll('.post__image').forEach(img => {
    img.addEventListener('click', () => {
      const postIdx = parseInt(img.dataset.postIndex);
      const imageIdx = parseInt(img.dataset.imageIndex);
      openLightbox(posts[postIdx].images, imageIdx);
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
  const date = timestamp instanceof Date ? timestamp : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}`;
}

function formatDateShort(timestamp) {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}`;
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

