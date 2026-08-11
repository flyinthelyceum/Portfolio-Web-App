#!/usr/bin/env node
/**
 * Archive a semester of student work before clearing the project.
 *
 * Exports every Firestore collection, the auth roster, and the whole Storage
 * bucket, then writes a readable per-student index so the archive can actually
 * be used. A JSON dump nobody can open is not an archive: the point is that
 * when a student asks for their work in March, someone can find it.
 *
 * Read-only against Firebase. It deletes nothing.
 *
 *   node scripts/archive-semester.mjs
 *   node scripts/archive-semester.mjs --out /Volumes/T7/portfolio-archive
 *   node scripts/archive-semester.mjs --skip-storage      (metadata only, fast)
 *
 * Auth comes from the gcloud CLI, so no service account key is needed:
 *   gcloud auth login
 */

import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const PROJECT_ID = 'portfolio-web-app-26';
const BUCKET = 'portfolio-web-app-26.firebasestorage.app';
const FIRESTORE_ROOT =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 300;
const BIG_BUFFER = 64 * 1024 * 1024;

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const stamp = new Date().toISOString().slice(0, 10);
  const outFlag = argv.indexOf('--out');
  return Object.freeze({
    outDir: outFlag !== -1 && argv[outFlag + 1]
      ? argv[outFlag + 1]
      : join(process.env.HOME, `Portfolio-Archive-${stamp}`),
    skipStorage: argv.includes('--skip-storage')
  });
}

// ------------------------------------------------------------------- firebase

async function accessToken() {
  try {
    const { stdout } = await run('gcloud', ['auth', 'print-access-token']);
    return stdout.trim();
  } catch (error) {
    throw new Error(
      'Could not get a gcloud access token. Run "gcloud auth login" first.\n' +
      `Underlying error: ${error.message}`
    );
  }
}

async function apiGet(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

/** Firestore typed value into plain JSON. Timestamps stay ISO strings. */
function unwrap(value) {
  if (value === null || typeof value !== 'object') return value;
  const [type, inner] = Object.entries(value)[0] ?? [];
  switch (type) {
    case 'nullValue': return null;
    case 'booleanValue': return inner;
    case 'stringValue': return inner;
    case 'timestampValue': return inner;
    case 'integerValue': return Number(inner);
    case 'doubleValue': return Number(inner);
    case 'mapValue':
      return Object.fromEntries(
        Object.entries(inner.fields ?? {}).map(([key, val]) => [key, unwrap(val)])
      );
    case 'arrayValue':
      return (inner.values ?? []).map(unwrap);
    default: return inner;
  }
}

function toPlainDoc(doc) {
  return {
    id: doc.name.split('/').pop(),
    ...Object.fromEntries(
      Object.entries(doc.fields ?? {}).map(([key, value]) => [key, unwrap(value)])
    )
  };
}

async function listCollections(token) {
  const response = await fetch(`${FIRESTORE_ROOT}:listCollectionIds`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageSize: 100 })
  });
  if (!response.ok) {
    throw new Error(`Could not list collections: ${response.status} ${response.statusText}`);
  }
  const { collectionIds = [] } = await response.json();
  return collectionIds;
}

async function fetchCollection(name, token) {
  const docs = [];
  let pageToken;
  do {
    const url = new URL(`${FIRESTORE_ROOT}/${encodeURIComponent(name)}`);
    url.searchParams.set('pageSize', String(PAGE_SIZE));
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const page = await apiGet(url.toString(), token);
    docs.push(...(page.documents ?? []).map(toPlainDoc));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return docs;
}

// ------------------------------------------------------------------ per student

function displayNameOf(user) {
  return user.displayName || user.fullName || user.handle || user.username || '(no name)';
}

function countBy(rows, key, value) {
  return rows.filter((row) => row[key] === value).length;
}

/**
 * One row per student, joining the two schemas that coexist in `users`:
 * v1 records key on username/displayName, v2 records on handle/fullName.
 */
function buildStudentIndex(data) {
  const users = data.users ?? [];
  const posts = data.posts ?? [];
  const logs = data.logs ?? [];
  const shopResets = data.shopResets ?? [];

  const students = users.map((user) => Object.freeze({
    id: user.id,
    name: displayNameOf(user),
    handle: user.username || user.handle || '',
    email: user.email || '',
    posts: countBy(posts, 'userId', user.id),
    logs: countBy(logs, 'ownerUserId', user.id),
    shopResets: countBy(shopResets, 'userId', user.id),
    storagePaths: [
      `storage/users/${user.id}/`,
      `storage/avatars/${user.id}/`,
      `storage/logs/${user.id}/`,
      `storage/shop-resets/${user.id}/`
    ]
  }));

  const knownIds = new Set(users.map((user) => user.id));
  const orphanPosts = posts.filter((post) => !knownIds.has(post.userId));

  return Object.freeze({ students, orphanPosts });
}

function renderIndexMarkdown({ students, orphanPosts }, meta) {
  const active = students
    .filter((s) => s.posts + s.logs + s.shopResets > 0)
    .sort((a, b) => b.posts - a.posts || a.name.localeCompare(b.name));
  const inactive = students.filter((s) => s.posts + s.logs + s.shopResets === 0);

  const rows = active.map((s) =>
    `| ${s.name} | ${s.handle || '.'} | ${s.posts} | ${s.logs} | ${s.shopResets} | \`${s.id}\` |`
  );

  return [
    `# Semester archive, ${meta.date}`,
    '',
    `Project \`${PROJECT_ID}\`. Everything a student made, and where to find it.`,
    '',
    `Students with work: **${active.length}**. Signed up but never posted: **${inactive.length}**.`,
    `Total documents: **${meta.totalDocs}**. Auth accounts: **${meta.authAccounts}**.`,
    '',
    '## Finding one student\'s work',
    '',
    'Take the id from the table, then look in `storage/` under that id. Post text',
    'lives in `firestore/posts.json`, matched on `userId`. Log media is under',
    '`storage/logs/<id>/`, portfolio images under `storage/users/<id>/`.',
    '',
    '## Students with work',
    '',
    '| Name | Handle | Posts | Logs | Shop resets | User id |',
    '|---|---|---:|---:|---:|---|',
    ...rows,
    '',
    '## Signed up, never posted',
    '',
    inactive.length
      ? inactive.map((s) => `- ${s.name}${s.handle ? ` (${s.handle})` : ''}`).join('\n')
      : '_none_',
    '',
    ...(orphanPosts.length
      ? [
        '## Posts with no matching profile',
        '',
        'These reference a user record that no longer exists. The work is still in',
        'Storage but cannot be attributed from the data alone.',
        '',
        ...orphanPosts.map((p) => `- \`${p.id}\` by missing user \`${p.userId}\``),
        ''
      ]
      : []),
    '## Sensitive contents',
    '',
    'auth/accounts.json holds email addresses and password hashes for minors.',
    'Keep this archive off shared drives and out of version control.',
    ''
  ].join('\n');
}

// ------------------------------------------------------------------- exports

async function exportFirestore(outDir, token) {
  const dir = join(outDir, 'firestore');
  await mkdir(dir, { recursive: true });

  const names = await listCollections(token);
  const data = {};
  const counts = {};

  for (const name of names) {
    const docs = await fetchCollection(name, token);
    data[name] = docs;
    counts[name] = docs.length;
    await writeFile(join(dir, `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`  ${name.padEnd(18)} ${String(docs.length).padStart(5)} docs`);
  }
  return { data, counts };
}

async function exportAuth(outDir) {
  const dir = join(outDir, 'auth');
  await mkdir(dir, { recursive: true });
  const target = join(dir, 'accounts.json');
  try {
    await run('firebase', [
      'auth:export', target, '--format=json', '--project', PROJECT_ID
    ], { maxBuffer: BIG_BUFFER });
    const parsed = JSON.parse(
      await (await import('node:fs/promises')).readFile(target, 'utf8')
    );
    const total = parsed.users?.length ?? 0;
    console.log(`  auth accounts      ${String(total).padStart(5)}`);
    return total;
  } catch (error) {
    console.error(`  auth export FAILED: ${error.message}`);
    return 0;
  }
}

async function mirrorStorage(outDir) {
  const dir = join(outDir, 'storage');
  await mkdir(dir, { recursive: true });
  console.log(`  mirroring gs://${BUCKET} (this is the slow part)`);
  try {
    await run('gcloud', [
      'storage', 'rsync', '-r', `gs://${BUCKET}`, dir
    ], { maxBuffer: BIG_BUFFER });
    const { stdout } = await run('du', ['-sh', dir]);
    console.log(`  storage mirrored   ${stdout.trim().split('\t')[0]}`);
    return true;
  } catch (error) {
    console.error(`  storage mirror FAILED: ${error.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------- main

async function main() {
  const { outDir, skipStorage } = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();

  console.log(`Archiving ${PROJECT_ID}`);
  console.log(`Destination: ${outDir}\n`);

  await mkdir(outDir, { recursive: true });
  const token = await accessToken();

  console.log('Firestore');
  const { data, counts } = await exportFirestore(outDir, token);

  console.log('\nAuth');
  const authAccounts = await exportAuth(outDir);

  let storageMirrored = false;
  if (skipStorage) {
    console.log('\nStorage skipped (--skip-storage)');
  } else {
    console.log('\nStorage');
    storageMirrored = await mirrorStorage(outDir);
  }

  const totalDocs = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const index = buildStudentIndex(data);

  await writeFile(
    join(outDir, 'INDEX.md'),
    renderIndexMarkdown(index, {
      date: startedAt.slice(0, 10),
      totalDocs,
      authAccounts
    })
  );

  await writeFile(join(outDir, 'manifest.json'), JSON.stringify({
    project: PROJECT_ID,
    bucket: BUCKET,
    startedAt,
    finishedAt: new Date().toISOString(),
    collections: counts,
    totalDocs,
    authAccounts,
    storageMirrored,
    studentsWithWork: index.students.filter(
      (s) => s.posts + s.logs + s.shopResets > 0
    ).length,
    studentsTotal: index.students.length,
    orphanPosts: index.orphanPosts.length
  }, null, 2));

  console.log(`\nDone. ${totalDocs} documents, ${authAccounts} accounts.`);
  console.log(`Read ${join(outDir, 'INDEX.md')} first.`);
  if (!storageMirrored && !skipStorage) {
    console.log('\nStorage did NOT mirror. Do not run the wipe until it does.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\nArchive failed: ${error.message}`);
  process.exitCode = 1;
});
