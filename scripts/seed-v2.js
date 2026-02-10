/**
 * Seed Script for Portfolio Web App v2
 *
 * This script creates the initial task categories and sample tasks
 * Run with: node scripts/seed-v2.js
 *
 * Prerequisites:
 * 1. Set GOOGLE_APPLICATION_CREDENTIALS to your service account key file
 * 2. npm install in the scripts folder
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or uncomment and modify the following:
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

admin.initializeApp();
const db = admin.firestore();

// Category definitions (from POINTS_MODEL.md)
const categories = [
  {
    id: 'office-hours',
    name: 'Office Hours',
    pointsPerLog: 253,
    enabled: true,
    sortOrder: 1,
    description: 'Skill training, tool certification, technique demonstrations'
  },
  {
    id: 'news',
    name: 'News',
    pointsPerLog: 126,
    enabled: true,
    sortOrder: 2,
    description: 'Announcements, schedules, reminders'
  },
  {
    id: 'project',
    name: 'Project',
    pointsPerLog: 371,
    enabled: true,
    sortOrder: 3,
    description: 'Long arc prompts, unit briefs, milestone check-ins'
  },
  {
    id: 'chore',
    name: 'Chore',
    pointsPerLog: 184,
    enabled: true,
    sortOrder: 4,
    description: 'Studio operations, maintenance rituals, cleanup'
  },
  {
    id: 'ritual',
    name: 'Ritual',
    pointsPerLog: 213,
    enabled: true,
    sortOrder: 5,
    description: 'Recurring practice, habit loops, daily documentation'
  }
];

// Sample tasks
const sampleTasks = [
  {
    categoryId: 'ritual',
    title: 'Daily Documentation',
    subtitle: 'Capture your work every day',
    body: `<p>Document what you made today. Every day.</p>
<p><strong>What to log:</strong></p>
<ul>
<li>Photo(s) of your work in progress</li>
<li>What phase you're in (Sketch, Build, Test, Iteration, Reflection)</li>
<li>A short note about what changed</li>
</ul>`,
    status: 'published',
    isPinned: true
  },
  {
    categoryId: 'office-hours',
    title: 'Tool Cert: Basic Shop Safety',
    subtitle: 'Complete the safety walkthrough',
    body: `<p>Before using any power tools, complete the basic shop safety certification.</p>
<p><strong>To earn this certification:</strong></p>
<ol>
<li>Watch the safety video</li>
<li>Complete the hands-on walkthrough with instructor</li>
<li>Log your completion with a photo of your signed safety card</li>
</ol>`,
    status: 'published',
    certificationBadgeId: 'cert_shop_safety'
  },
  {
    categoryId: 'project',
    title: 'Build v1: Your First Prototype',
    subtitle: 'From sketch to working model',
    body: `<p>Build the first working version of your project.</p>
<p><strong>Requirements:</strong></p>
<ul>
<li>A physical or digital prototype that demonstrates your concept</li>
<li>Document each phase of the build process</li>
<li>Be prepared to test it and iterate</li>
</ul>
<p><strong>Log Work for this task should show:</strong></p>
<ul>
<li>Progress photos</li>
<li>What phase you're in</li>
<li>What's working and what needs iteration</li>
</ul>`,
    status: 'published'
  },
  {
    categoryId: 'chore',
    title: 'Studio Reset',
    subtitle: 'Clean up your workspace',
    body: `<p>Return tools, clean surfaces, organize materials.</p>
<p>A clean studio is a thinking studio.</p>`,
    status: 'published'
  },
  {
    categoryId: 'news',
    title: 'Welcome to Portfolio v2',
    subtitle: 'How to use the new system',
    body: `<p>Welcome! This is your Working Portfolio.</p>
<p><strong>How it works:</strong></p>
<ol>
<li>Browse Tasks to see what you can work on</li>
<li>Select a Task and tap "Log Work" to document your progress</li>
<li>Add photos, select your phase, and write a short note</li>
<li>Earn points for every published log</li>
<li>Check the Leaderboard to see where you stand</li>
</ol>
<p>Remember: process is visible, failure is documented, iteration is expected.</p>`,
    status: 'published',
    isPinned: true
  }
];

// Badge definitions
const badges = [
  {
    id: 'cert_shop_safety',
    family: 'certification',
    name: 'Shop Safety',
    icon: '🛡️',
    description: 'Completed basic shop safety training',
    sortOrder: 1
  },
  {
    id: 'log_streak_L1',
    family: 'streak',
    name: 'Streak L1',
    icon: '🔥',
    description: '5 published logs',
    sortOrder: 1
  },
  {
    id: 'log_streak_L2',
    family: 'streak',
    name: 'Streak L2',
    icon: '🔥🔥',
    description: '10 published logs',
    sortOrder: 2
  },
  {
    id: 'log_streak_L3',
    family: 'streak',
    name: 'Streak L3',
    icon: '🔥🔥🔥',
    description: '20 published logs',
    sortOrder: 3
  },
  {
    id: 'iter_streak_L1',
    family: 'streak',
    name: 'Iteration L1',
    icon: '🔄',
    description: '5 iteration logs',
    sortOrder: 4
  }
];

async function seed() {
  console.log('Seeding Portfolio v2 data...\n');

  // Create categories
  console.log('Creating task categories...');
  for (const category of categories) {
    const { id, ...data } = category;
    await db.collection('taskCategories').doc(id).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✓ ${category.name} (+${category.pointsPerLog} pts)`);
  }

  // Create sample tasks
  console.log('\nCreating sample tasks...');
  for (const task of sampleTasks) {
    const docRef = await db.collection('tasks').add({
      ...task,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✓ ${task.title}`);
  }

  // Create badge definitions
  console.log('\nCreating badge definitions...');
  for (const badge of badges) {
    const { id, ...data } = badge;
    await db.collection('badgeDefs').doc(id).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✓ ${badge.name} (${badge.family})`);
  }

  // Create initial scoreboards (empty)
  console.log('\nCreating scoreboards...');
  const scoreboards = [
    'total_alltime',
    'social_alltime',
    'feature_alltime',
    'category_office-hours_alltime',
    'category_news_alltime',
    'category_project_alltime',
    'category_chore_alltime',
    'category_ritual_alltime',
    'phase_Sketch_alltime',
    'phase_Build_alltime',
    'phase_Test_alltime',
    'phase_Iteration_alltime',
    'phase_Reflection_alltime'
  ];

  for (const boardId of scoreboards) {
    await db.collection('scoreboards').doc(boardId).set({
      boardId,
      title: boardId.replace(/_/g, ' '),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✓ ${boardId}`);
  }

  console.log('\n✅ Seed complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy Cloud Functions: firebase deploy --only functions');
  console.log('2. Deploy Firestore rules: firebase deploy --only firestore:rules');
  console.log('3. Deploy hosting: firebase deploy --only hosting');
  console.log('4. Open the app and create an admin user');

  process.exit(0);
}

seed().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
