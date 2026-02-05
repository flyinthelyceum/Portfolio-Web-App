import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const adminUser = document.getElementById('admin-user');
const studentsContainer = document.getElementById('students-container');
const activityContainer = document.getElementById('activity-container');
const statStudents = document.getElementById('stat-students');
const statPosts = document.getElementById('stat-posts');
const statLogs = document.getElementById('stat-logs');
const statProjects = document.getElementById('stat-projects');
const statLast7 = document.getElementById('stat-last7');

const exportJsonBtn = document.getElementById('export-json-btn');
const refreshBtn = document.getElementById('refresh-btn');
const logoutBtn = document.getElementById('logout-btn');
const viewSiteBtn = document.getElementById('view-site-btn');
const editorBtn = document.getElementById('editor-btn');

let currentUser = null;
let users = [];
let posts = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  const adminDoc = await getDoc(doc(db, 'admins', user.uid));
  if (!adminDoc.exists()) {
    window.location.href = 'index.html';
    return;
  }

  adminUser.textContent = user.displayName || user.email || 'Admin';
  await loadData();
  renderDashboard();
  setupEventListeners();
});

async function loadData() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  users = usersSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const postsSnapshot = await getDocs(postsQuery);
  posts = postsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

function renderDashboard() {
  const postsByUser = new Map();
  let logCount = 0;
  let projectCount = 0;
  let last7Count = 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  posts.forEach((post) => {
    const userId = post.userId;
    if (!postsByUser.has(userId)) {
      postsByUser.set(userId, []);
    }
    postsByUser.get(userId).push(post);

    if (post.type === 'log') {
      logCount += 1;
    } else if (post.type === 'project') {
      projectCount += 1;
    }

    const createdAt = parseDate(post.createdAt || post.date);
    if (createdAt && createdAt >= sevenDaysAgo) {
      last7Count += 1;
    }
  });

  statStudents.textContent = users.length.toString();
  statPosts.textContent = posts.length.toString();
  statLogs.textContent = logCount.toString();
  statProjects.textContent = projectCount.toString();
  statLast7.textContent = last7Count.toString();

  renderStudents(postsByUser);
  renderActivity();
}

function renderStudents(postsByUser) {
  if (users.length === 0) {
    studentsContainer.innerHTML = '<div class="admin-empty">No students found.</div>';
    return;
  }

  const rows = users
    .slice()
    .sort((a, b) => (a.displayName || a.email || '').localeCompare(b.displayName || b.email || ''))
    .map((user) => {
      const userPosts = postsByUser.get(user.id) || [];
      const lastPost = userPosts[0];
      const lastPostDate = lastPost ? formatDate(parseDate(lastPost.createdAt || lastPost.date)) : '—';
      const username = user.username || '—';
      const email = user.email || '—';
      const profileLink = `index.html?user=${user.username || user.id}`;

      return `
        <tr>
          <td>${escapeHtml(user.displayName || email)}</td>
          <td>${escapeHtml(username)}</td>
          <td>${escapeHtml(email)}</td>
          <td>${userPosts.length}</td>
          <td>${lastPostDate}</td>
          <td><a href="${profileLink}" target="_blank">View</a></td>
        </tr>
      `;
    })
    .join('');

  studentsContainer.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Email</th>
          <th>Posts</th>
          <th>Last Post</th>
          <th>Portfolio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function renderActivity() {
  if (posts.length === 0) {
    activityContainer.innerHTML = '<div class="admin-empty">No posts yet.</div>';
    return;
  }

  const rows = posts.slice(0, 40).map((post) => {
    const createdAt = formatDate(parseDate(post.createdAt || post.date));
    const typeLabel = post.type ? post.type.toUpperCase() : 'POST';
    const owner = findUserName(post.userId);
    const title = post.title || post.summary || 'Untitled';
    const portfolioLink = `index.html?user=${post.username || post.userId}`;

    return `
      <tr>
        <td><span class="admin-pill">${escapeHtml(typeLabel)}</span></td>
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(owner)}</td>
        <td>${createdAt}</td>
        <td><a href="${portfolioLink}" target="_blank">View</a></td>
      </tr>
    `;
  }).join('');

  activityContainer.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Student</th>
          <th>Date</th>
          <th>Portfolio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function setupEventListeners() {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });

  viewSiteBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  editorBtn.addEventListener('click', () => {
    window.location.href = 'editor.html';
  });

  refreshBtn.addEventListener('click', async () => {
    refreshBtn.textContent = 'Refreshing...';
    await loadData();
    renderDashboard();
    refreshBtn.textContent = 'Refresh Data';
  });

  exportJsonBtn.addEventListener('click', () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      users,
      posts
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

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
