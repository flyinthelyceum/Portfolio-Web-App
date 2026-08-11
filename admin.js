import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  orderBy,
  query
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';
import { initErrorReporting, reportError } from './error-reporting.js';

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

initErrorReporting('admin');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
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
  } catch (error) {
    console.error('Error initializing admin dashboard:', error);
    reportError(error, { action: 'admin_init', page: 'admin' });
    studentsContainer.innerHTML = '<div class="empty">Failed to load students.</div>';
    activityContainer.innerHTML = '<div class="empty">Failed to load activity.</div>';
  }
});

async function loadData() {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const postsSnapshot = await getDocs(postsQuery);
  posts = postsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

  const usersSnapshot = await getDocs(collection(db, 'users'));
  const rawUsers = usersSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

  const userIdsWithPosts = new Set(posts.map(post => post.userId).filter(Boolean));
  users = rawUsers.filter(user => hasUserIdentity(user) || userIdsWithPosts.has(user.id));
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

function calculateEngagementStatus(postsLast7Days, averagePerWeek) {
  if (postsLast7Days > 0) return 'Active';
  if (averagePerWeek >= 0.5) return 'Somewhat Active';
  return 'Inactive';
}

function renderStudents(postsByUser) {
  if (users.length === 0) {
    studentsContainer.innerHTML = '<div class="empty">No students found.</div>';
    return;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const rows = users
    .slice()
    .sort((a, b) => (a.displayName || a.email || '').localeCompare(b.displayName || b.email || ''))
    .map((user) => {
      const userPosts = postsByUser.get(user.id) || [];
      const lastPost = userPosts[0];
      const lastPostDate = lastPost ? formatDate(parseDate(lastPost.createdAt || lastPost.date)) : 'never';
      const username = user.username || 'not set';
      const email = user.email || 'not set';
      const profileLink = `index.html?user=${user.username || user.id}`;

      // Calculate engagement metrics
      const postsLast7Days = userPosts.filter(post => {
        const postDate = parseDate(post.createdAt || post.date);
        return postDate && postDate > sevenDaysAgo;
      }).length;

      // Calculate average posts per week (based on first post to now)
      const firstPostDate = userPosts.length > 0 ? parseDate(userPosts[userPosts.length - 1].createdAt || userPosts[userPosts.length - 1].date) : null;
      let averagePerWeek = 0;
      if (firstPostDate) {
        const daysSinceFirstPost = (now - firstPostDate) / (1000 * 60 * 60 * 24);
        const weeksSinceFirstPost = Math.max(1, daysSinceFirstPost / 7);
        averagePerWeek = userPosts.length / weeksSinceFirstPost;
      }

      const engagement = calculateEngagementStatus(postsLast7Days, averagePerWeek);
      const engagementClass = engagement === 'Active' ? 'pill--active' : engagement === 'Somewhat Active' ? 'pill--warning' : 'pill--danger';

      return `
        <tr>
          <td>${escapeHtml(user.displayName || email)}</td>
          <td>${escapeHtml(username)}</td>
          <td>${escapeHtml(email)}</td>
          <td>${userPosts.length}</td>
          <td>${postsLast7Days}</td>
          <td><span class="pill ${engagementClass}">${engagement}</span></td>
          <td>${averagePerWeek.toFixed(2)}</td>
          <td>${lastPostDate}</td>
          <td style="text-align:center"><a href="${profileLink}" target="_blank">View</a></td>
          <td><button class="delete-x" data-delete-type="student" data-delete-id="${user.id}" data-delete-name="${escapeHtml(user.displayName || email)}" title="Delete student">&times;</button></td>
        </tr>
      `;
    })
    .join('');

  studentsContainer.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Email</th>
          <th>Total Posts</th>
          <th>Last 7 Days</th>
          <th>Engagement</th>
          <th>Avg/Week</th>
          <th>Last Post</th>
          <th style="text-align:center">Portfolio</th>
          <th></th>
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
    activityContainer.innerHTML = '<div class="empty">No posts yet.</div>';
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
        <td><span class="pill">${escapeHtml(typeLabel)}</span></td>
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(owner)}</td>
        <td>${createdAt}</td>
        <td style="text-align:center"><a href="${portfolioLink}" target="_blank">View</a></td>
        <td><button class="delete-x" data-delete-type="post" data-delete-id="${post.id}" data-delete-name="${escapeHtml(title)}" title="Delete post">&times;</button></td>
      </tr>
    `;
  }).join('');

  activityContainer.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Student</th>
          <th>Date</th>
          <th style="text-align:center">Portfolio</th>
          <th></th>
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

  const moderationBtn = document.getElementById('moderation-btn');
  if (moderationBtn) {
    moderationBtn.addEventListener('click', () => {
      window.location.href = 'moderation.html';
    });
  }

  const exportCsvStudentsBtn = document.getElementById('export-csv-students-btn');
  if (exportCsvStudentsBtn) {
    exportCsvStudentsBtn.addEventListener('click', () => {
      const csvContent = generateStudentsCSV();
      downloadCSV(csvContent, `students-${new Date().toISOString().slice(0, 10)}.csv`);
    });
  }

  const exportCsvPostsBtn = document.getElementById('export-csv-posts-btn');
  if (exportCsvPostsBtn) {
    exportCsvPostsBtn.addEventListener('click', () => {
      const csvContent = generatePostsCSV();
      downloadCSV(csvContent, `posts-${new Date().toISOString().slice(0, 10)}.csv`);
    });
  }

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

  // Delete buttons (delegated)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-x');
    if (!btn) return;
    const type = btn.dataset.deleteType;
    const id = btn.dataset.deleteId;
    const name = btn.dataset.deleteName;
    showConfirmModal(type, id, name);
  });

  // Confirm modal buttons
  document.getElementById('confirm-cancel').addEventListener('click', hideConfirmModal);
  document.getElementById('confirm-delete').addEventListener('click', handleConfirmDelete);
  document.getElementById('confirm-modal').addEventListener('click', (e) => {
    if (e.target.id === 'confirm-modal') hideConfirmModal();
  });
}

let pendingDelete = null;

function showConfirmModal(type, id, name) {
  pendingDelete = { type, id };
  const label = type === 'student' ? 'student' : 'post';
  document.getElementById('confirm-message').textContent = `Delete ${label} "${name}"? This cannot be undone.`;
  document.getElementById('confirm-modal').classList.add('visible');
}

function hideConfirmModal() {
  pendingDelete = null;
  document.getElementById('confirm-modal').classList.remove('visible');
}

async function handleConfirmDelete() {
  if (!pendingDelete) return;
  const { type, id } = pendingDelete;
  const deleteBtn = document.getElementById('confirm-delete');
  deleteBtn.textContent = 'Deleting…';
  deleteBtn.disabled = true;

  try {
    if (type === 'student') {
      // Delete user doc
      await deleteDoc(doc(db, 'users', id));
      // Delete all their posts
      const userPosts = posts.filter(p => p.userId === id);
      for (const p of userPosts) {
        await deleteDoc(doc(db, 'posts', p.id));
      }
    } else if (type === 'post') {
      await deleteDoc(doc(db, 'posts', id));
    }
    hideConfirmModal();
    await loadData();
    renderDashboard();
  } catch (err) {
    console.error('Delete failed:', err);
    reportError(err, {
      action: 'admin_delete',
      page: 'admin',
      context: { type, id }
    });
    alert('Delete failed: ' + err.message);
  } finally {
    deleteBtn.textContent = 'Delete';
    deleteBtn.disabled = false;
  }
}

function findUserName(userId) {
  const user = users.find(u => u.id === userId);
  return user?.displayName || user?.email || 'Unknown';
}

function hasUserIdentity(user) {
  if (!user) return false;
  const displayName = String(user.displayName || '').trim();
  const email = String(user.email || '').trim();
  const username = String(user.username || '').trim();
  return Boolean(displayName || email || username);
}

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date) {
  if (!date) return 'never';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCSV(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateStudentsCSV() {
  let csv = 'Name,Email,Posts,Last Activity\n';
  
  const sortedUsers = [...users].sort((a, b) => {
    return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
  });

  sortedUsers.forEach(user => {
    const postCount = posts.filter(p => p.userId === user.id && !p.deletedAt).length;
    const userPosts = posts.filter(p => p.userId === user.id).sort((a, b) => {
      const dateA = parseDate(a.createdAt) || new Date(0);
      const dateB = parseDate(b.createdAt) || new Date(0);
      return dateB - dateA;
    });
    const lastActivity = userPosts[0] ? formatDate(parseDate(userPosts[0].createdAt)) : 'never';
    
    const row = [
      escapeCSV(user.displayName || user.email || ''),
      escapeCSV(user.email || ''),
      postCount,
      lastActivity
    ].join(',');
    csv += row + '\n';
  });

  return csv;
}

function generatePostsCSV() {
  let csv = 'Title,Student,Type,Date,Status\n';
  
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = parseDate(a.createdAt) || new Date(0);
    const dateB = parseDate(b.createdAt) || new Date(0);
    return dateB - dateA;
  });

  sortedPosts.forEach(post => {
    const student = findUserName(post.userId);
    const status = post.deletedAt ? 'Deleted' : 'Active';
    
    const row = [
      escapeCSV(post.title || ''),
      escapeCSV(student),
      escapeCSV(post.type || ''),
      formatDate(parseDate(post.createdAt)),
      status
    ].join(',');
    csv += row + '\n';
  });

  return csv;
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
