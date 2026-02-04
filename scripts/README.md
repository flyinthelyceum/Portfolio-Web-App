# Student Management Scripts

Scripts for managing student accounts in the Portfolio Web App.

## Setup

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **portfolio-web-app-26** project
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save as `serviceAccountKey.json` in this folder (scripts/)

⚠️ **IMPORTANT**: Never commit `serviceAccountKey.json` to GitHub!

### 3. Prepare CSV File

Create a CSV file with student data:

```csv
firstName,lastName,email
Alex,Rivera,alex.rivera@school.edu
Sam,Johnson,sam.johnson@school.edu
Jordan,Smith,jordan.smith@school.edu
```

See `students-sample.csv` for an example.

---

## Usage

### Bulk Import Students

```bash
node import-students.js <csv-file> <app-url>
```

**Example:**
```bash
node import-students.js students.csv https://yourapp.com
```

**Output:**
- ✅ Creates Firebase Auth account for each student
- ✅ Creates Firestore profile (`/users/{uid}`)
- ✅ Generates temporary passwords
- ✅ Creates `credentials-email.html` file with all credentials

### Send Credentials to Students

1. Run the import script (above)
2. Open the generated `credentials-email.html` file in your browser
3. Copy the table and paste into an email to students, OR
4. Screenshot and share individual credentials

**Email Template** (customize as needed):

```
Subject: Portfolio Login Credentials

Hi [Student Name],

Your portfolio account is ready! 

📌 Login Page: https://yourapp.com/login.html
📧 Email: [email]
🔑 Temporary Password: [password]

Next steps:
1. Visit the login page above
2. Log in with your email and password
3. Click "Edit Profile" to set your username and bio
4. Start adding logs and projects!

Your portfolio URL: https://yourapp.com/?user=[userId]

Questions? Ask in class or see the student guide.

Thanks!
```

---

## Files

- **import-students.js** - Main bulk import script
- **students-sample.csv** - Example CSV format
- **serviceAccountKey.json** - Firebase Admin credentials (⚠️ not in git)
- **package.json** - Node dependencies

---

## Troubleshooting

### "Service account key not found"
- Create one at Firebase Console (see Setup section)
- Make sure it's named `serviceAccountKey.json`
- Make sure it's in the `scripts/` folder

### "CSV file not found"
- Check the filename and path
- Make sure CSV is in the same folder or provide full path

### "Email already exists"
- Student account was already created
- To reset: delete from Firebase Console manually, then re-import

### "Permission denied" errors
- Check that your service account has Admin SDK permissions
- Check Firebase security rules allow writes to `/users/{uid}`

---

## Security Notes

✅ **DO:**
- Keep `serviceAccountKey.json` secure (never commit to git)
- Send credentials individually to students (not in group chats)
- Remind students to change passwords after first login

❌ **DON'T:**
- Share `serviceAccountKey.json` 
- Post credentials in Slack or Teams
- Commit credentials to version control
