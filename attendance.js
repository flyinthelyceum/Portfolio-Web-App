import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const userName = document.getElementById('user-name');
const displayName = document.getElementById('display-name');
const studentId = document.getElementById('student-id');
const barcodeContainer = document.getElementById('barcode');
const barcodeEmpty = document.getElementById('barcode-empty');
const errorMessage = document.getElementById('error-message');
const backBtn = document.getElementById('back-btn');
const printBtn = document.getElementById('print-btn');

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  await loadUserData();
  setupEventListeners();
});

async function loadUserData() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

    if (!userDoc.exists()) {
      showError('User profile not found');
      return;
    }

    const data = userDoc.data();
    const name = data.displayName || currentUser.displayName || 'Student';
    const idNumber = data.studentId || '';

    userName.textContent = name;
    displayName.textContent = name;

    if (idNumber) {
      studentId.textContent = idNumber;
      barcodeEmpty.style.display = 'none';
      barcodeContainer.style.display = 'inline-block';
      generateBarcode(idNumber);
    } else {
      barcodeContainer.style.display = 'none';
      barcodeEmpty.style.display = 'block';
      studentId.textContent = '—';
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showError('Failed to load profile data');
  }
}

function generateBarcode(code) {
  try {
    JsBarcode('#barcode', code, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 14,
      margin: 10
    });
  } catch (error) {
    console.error('Error generating barcode:', error);
    showError('Failed to generate barcode');
  }
}

function setupEventListeners() {
  backBtn.addEventListener('click', () => {
    window.location.href = 'editor.html';
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}
