import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const backBtn = document.getElementById('back-btn');
const postsContainer = document.getElementById('posts-container');
const bannedContainer = document.getElementById('banned-container');
const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmText = document.getElementById('confirm-text');
const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');

let currentUser = null;
let users = [];
let posts = [];
let pendingAction = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  const adminDoc = await getDoc(doc(db, 'admins', user.uid));
  if (!adminDoc.exists()) {
    window.location.href = 'admin.html';
    return;
  }

  await loadData();
  renderPosts();
  renderBanned();
  setupEventListeners();
});

async function loadData() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  users = usersSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const postsSnapshot = await getDocs(postsQuery);
  posts = postsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

function renderPosts() {
  if (posts.length === 0) {
    postsContainer.innerHTML = '<div class="mod-empty">No posts found.</div>';
    return;
  }

  const rows = posts.map((post) => {
    const owner = findUserName(post.userId);
    const ownerId = post.userId;
    const isHidden = post.hidden === true;
    const isDeleted = post.deletedAt !== undefined;
    const title = post.title || post.summary || 'Untitled';
    const createdAt = formatDate(parseDate(post.createdAt || post.date));
    const statusClass = isDeleted ? 'mod-status--hidden' : 'mod-status--active';
    const statusText = isDeleted ? 'Deleted' : 'Active';

    return `
      <tr>
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(owner)}</td>
        <td>${escapeHtml(post.type || 'post')}</td>
        <td>${createdAt}</td>
        <td><span class="mod-status ${statusClass}">${statusText}</span></td>
        <td>
          <div class="mod-actions">
            ${!isDeleted ? `
              <button class="mod-btn mod-btn--danger" onclick="confirmDeletePost('${post.id}')">Delete</button>
            ` : `
              <button class="mod-btn" onclick="confirmRestorePost('${post.id}')">Restore</button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  postsContainer.innerHTML = `
    <table class="mod-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Student</th>
          <th>Type</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function renderBanned() {
  const bannedUsers = users.filter(u => u.banned === true);

  if (bannedUsers.length === 0) {
    bannedContainer.innerHTML = '<div class="mod-empty">No banned students.</div>';
    return;
  }

  const rows = bannedUsers.map((user) => {
    const email = user.email || '—';
    const bannedAt = user.bannedAt ? formatDate(parseDate(user.bannedAt)) : '—';

    return `
      <tr>
        <td>${escapeHtml(user.displayName || email)}</td>
        <td>${escapeHtml(email)}</td>
        <td>${bannedAt}</td>
        <td>
          <div class="mod-actions">
            <button class="mod-btn" onclick="confirmUnbanStudent('${user.id}')">Unban</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  bannedContainer.innerHTML = `
    <table class="mod-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Banned Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function setupEventListeners() {
  backBtn.addEventListener('click', () => {
    window.location.href = 'admin.html';
  });

  confirmCancel.addEventListener('click', closeConfirmModal);
  confirmOk.addEventListener('click', async () => {
    if (pendingAction) {
      await pendingAction();
      pendingAction = null;
      closeConfirmModal();
      await loadData();
      renderPosts();
      renderBanned();
    }
  });
}

function openConfirmModal(title, text, action) {
  confirmTitle.textContent = title;
  confirmText.textContent = text;
  pendingAction = action;
  confirmModal.classList.add('active');
}

function closeConfirmModal() {
  confirmModal.classList.remove('active');
  pendingAction = null;
}

window.confirmDeletePost = function(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  openConfirmModal(
    'Delete Post?',
    `Are you sure you want to delete "${post.title || 'Untitled'}" by ${findUserName(post.userId)}? This action cannot be undone.`,
    async () => {
      await deleteDoc(doc(db, 'posts', postId));
    }
  );
};

window.confirmRestorePost = function(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  openConfirmModal(
    'Restore Post?',
    `Restore "${post.title || 'Untitled'}"?`,
    async () => {
      await updateDoc(doc(db, 'posts', postId), { deletedAt: null });
    }
  );
};

window.confirmUnbanStudent = function(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  openConfirmModal(
    'Unban Student?',
    `Remove ban for ${user.displayName || user.email}?`,
    async () => {
      await updateDoc(doc(db, 'users', userId), { banned: false, bannedAt: null });
    }
  );
};

function findUserName(userId) {
  const user = users.find(u => u.id === userId);
  return user?.displayName || user?.email || 'Unknown';
}

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date) {
  if (!date) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
