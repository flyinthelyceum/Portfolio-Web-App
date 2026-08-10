import { auth, db } from './firebase-config.js';
import {
  addDoc,
  collection,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const MAX_MESSAGE_LENGTH = 1500;
const MAX_STACK_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 2000;

function truncate(value, maxLength) {
  const text = String(value || '');
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function normalizeError(error) {
  if (!error) {
    return { message: 'Unknown error', code: '', stack: '' };
  }

  if (typeof error === 'string') {
    return { message: error, code: '', stack: '' };
  }

  return {
    message: error.message || String(error),
    code: error.code || '',
    stack: error.stack || ''
  };
}

function serializeContext(meta) {
  try {
    return truncate(JSON.stringify(meta || {}), MAX_CONTEXT_LENGTH);
  } catch {
    return '{}';
  }
}

export async function reportError(error, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }

  const normalized = normalizeError(error);
  const payload = {
    uid: user.uid,
    page: truncate(options.page || window.location.pathname.split('/').pop() || 'unknown', 80),
    action: truncate(options.action || 'unhandled', 120),
    message: truncate(normalized.message, MAX_MESSAGE_LENGTH),
    code: truncate(normalized.code, 120),
    stack: truncate(normalized.stack, MAX_STACK_LENGTH),
    context: serializeContext(options.context),
    path: truncate(window.location.pathname, 300),
    href: truncate(window.location.href, 500),
    userAgent: truncate(navigator.userAgent, 500),
    clientTime: new Date().toISOString(),
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'client_errors'), payload);
    return true;
  } catch (reportingError) {
    console.warn('Error reporting failed:', reportingError?.code || reportingError);
    return false;
  }
}

export function initErrorReporting(page) {
  if (window.__portfolioErrorReportingInitialized) {
    return;
  }
  window.__portfolioErrorReportingInitialized = true;

  window.addEventListener('error', (event) => {
    reportError(event.error || event.message, {
      page,
      action: 'window.error',
      context: {
        filename: event.filename || '',
        lineno: event.lineno || 0,
        colno: event.colno || 0
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason || 'Unhandled promise rejection', {
      page,
      action: 'window.unhandledrejection'
    });
  });
}
