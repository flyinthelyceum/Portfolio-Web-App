#!/usr/bin/env node

/**
 * Bulk Student Import Script
 * 
 * Creates Firebase Auth accounts and Firestore profiles for all students
 * from a CSV file.
 * 
 * CSV Format:
 *   firstName,lastName,email
 *   Alex,Rivera,alex@example.com
 *   Sam,Johnson,sam@example.com
 * 
 * Usage:
 *   node scripts/import-students.js <csv-file> <app-url>
 * 
 * Example:
 *   node scripts/import-students.js students.csv https://yourapp.com
 * 
 * Output:
 *   - Prints each created student with email and temporary password
 *   - Creates email.html file with all credentials for mass email
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================================================
// Configuration
// ============================================================================

const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(process.cwd(), 'serviceAccountKey.json');

const CSV_FILE = process.argv[2];
const APP_URL = process.argv[3] || 'https://yourapp.com';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a random 12-character password
 * Avoids ambiguous characters: 1/l, 0/O, etc.
 */
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Parse CSV file line by line
 */
async function readCSV(filePath) {
  const students = [];
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }
    
    const [firstName, lastName, email] = line.split(',').map(s => s.trim());
    if (firstName && lastName && email) {
      students.push({ firstName, lastName, email });
    }
  }

  return students;
}

/**
 * Create HTML email with all student credentials
 */
function createEmailHTML(students, appUrl) {
  const rows = students.map(s => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${s.firstName} ${s.lastName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;"><code>${s.email}</code></td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;"><code style="font-family: monospace; background: #f5f5f5; padding: 4px 8px;">${s.tempPassword}</code></td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .info {
      background: #f0f7ff;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .credentials-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }
    .credentials-table th {
      background: #f0f0f0;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }
    code {
      font-family: 'Courier New', monospace;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
    }
    .timestamp {
      color: #666;
      font-size: 13px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 Student Portfolio Accounts Created</h1>
    
    <div class="info">
      <strong>App URL:</strong> <code>${appUrl}</code><br>
      <strong>Total Students:</strong> ${students.length}<br>
      <strong>Created:</strong> ${new Date().toLocaleString()}
    </div>

    <h2>Student Credentials</h2>
    <p>Share these credentials with students. They should:</p>
    <ol>
      <li>Visit <code>${appUrl}/login.html</code></li>
      <li>Log in with their email and temporary password</li>
      <li>Update their profile (Edit Profile button)</li>
      <li>Start creating portfolio content</li>
    </ol>

    <table class="credentials-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Temporary Password</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <h2>Portfolio URLs</h2>
    <p>Each student's public portfolio:</p>
    <ul>
      ${students.map(s => `<li><code>${appUrl}/?user=${s.userId}</code> (for <strong>${s.firstName} ${s.lastName}</strong>)</li>`).join('')}
    </ul>

    <div class="timestamp">
      <strong>⚠️ Note:</strong> Keep these credentials secure. Share via email to individual students, not in group chats.
    </div>
  </div>
</body>
</html>
`;
}

// ============================================================================
// Main Import Function
// ============================================================================

async function importStudents() {
  try {
    // Validate inputs
    if (!CSV_FILE) {
      console.error('❌ Usage: node import-students.js <csv-file> [app-url]');
      console.error('Example: node import-students.js students.csv https://yourapp.com');
      process.exit(1);
    }

    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ CSV file not found: ${CSV_FILE}`);
      process.exit(1);
    }

    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error(`❌ Service account key not found: ${SERVICE_ACCOUNT_PATH}`);
      console.error('Create one at: https://console.firebase.google.com/project/portfolio-web-app-26/settings/serviceaccounts/adminsdk');
      process.exit(1);
    }

    // Initialize Firebase Admin SDK
    console.log('🔑 Initializing Firebase Admin SDK...');
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const auth = admin.auth();
    const db = admin.firestore();

    // Read CSV
    console.log(`📂 Reading CSV file: ${CSV_FILE}`);
    const students = await readCSV(CSV_FILE);
    console.log(`✅ Found ${students.length} students\n`);

    if (students.length === 0) {
      console.error('❌ No students found in CSV');
      process.exit(1);
    }

    // Create accounts
    console.log('👥 Creating student accounts...\n');
    const createdStudents = [];
    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        const tempPassword = generatePassword();
        const displayName = `${student.firstName} ${student.lastName}`;

        // Create Auth account
        const userRecord = await auth.createUser({
          email: student.email,
          password: tempPassword,
          displayName: displayName
        });

        // Create Firestore profile
        await db.collection('users').doc(userRecord.uid).set({
          displayName: displayName,
          email: student.email,
          username: '',
          bio: '',
          avatarUrl: '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        createdStudents.push({
          ...student,
          userId: userRecord.uid,
          tempPassword: tempPassword
        });

        console.log(`✅ ${displayName}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Password: ${tempPassword}`);
        console.log(`   Portfolio: ${APP_URL}/?user=${userRecord.uid}\n`);

        successCount++;
      } catch (error) {
        console.error(`❌ ${student.firstName} ${student.lastName}: ${error.message}\n`);
        errorCount++;
      }
    }

    // Summary
    console.log('═'.repeat(60));
    console.log(`\n📊 SUMMARY`);
    console.log(`   ✅ Created: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed: ${errorCount}`);
    }
    console.log('');

    // Generate email template
    if (createdStudents.length > 0) {
      const emailHTML = createEmailHTML(createdStudents, APP_URL);
      const emailPath = path.join(path.dirname(CSV_FILE), 'credentials-email.html');
      fs.writeFileSync(emailPath, emailHTML);
      console.log(`📧 Email template created: ${emailPath}`);
      console.log('   Open in browser to copy/send credentials to students\n');
    }

    console.log('✨ Import complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run import
importStudents();
