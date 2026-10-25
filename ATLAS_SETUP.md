# MongoDB Atlas setup

The backend uses Mongoose and the `MONGODB_URI` variable in `backend/.env`. The application database is `ism`. Uploaded images and resource files are stored in MongoDB GridFS; GridFS creates the `contentFiles.files` and `contentFiles.chunks` collections.

## Configure Atlas securely

1. In Atlas, open the project and ensure its cluster is running.
2. Open **Security → Network Access → IP Access List → Add IP Address**. Add the backend machine's current public IP, or the deployment host's fixed outbound IP. Do not use `0.0.0.0/0` as a permanent rule.
3. Open **Security → Database Access → Add New Database User**. Use password authentication and create a dedicated application user. Grant the built-in **readWrite** role on database **ism** only. Do not grant `atlasAdmin`, `readWriteAnyDatabase`, or project-owner permissions to the application user.
4. Open **Database → Connect → Drivers → Node.js** for the running cluster and copy its connection URI. Replace the username and password placeholders locally; percent-encode special characters in the password.
5. In `backend/.env`, set `MONGODB_URI` to that URI. Ensure its database path is `ism` (the backend uses `ism` if no database is included). Do not paste the URI into chat, commit it, or put it in `.env.example`.
6. From PowerShell, run the one-time collection/index setup:

   ```powershell
   cd C:\Users\hussein\Desktop\ISM\backend
   node scripts\setup-atlas.js
   ```

7. Start the backend with `npm run dev`, then check `http://localhost:5000/api/health`. It should report `"connected": true`.

## Database objects created

The setup script idempotently creates the collections used by the models and upload storage:

- `users` — unique index on `email`
- `contents` — indexes on `createdAt` descending and `{ category, createdAt }`
- `contactmessages` — the default `_id` index (the app only inserts contact messages)
- `contentFiles.files` and `contentFiles.chunks` — GridFS filename/upload-date and unique file/chunk indexes

The file collections are created on first upload as well; the setup script creates them in advance.

## Current connection account

The Atlas connection currently available to this workspace authenticates with the `atlasAdmin` role on the `admin` database. That is **not least privilege**. The project can use this connection to create its `ism` collections/indexes, but this workspace does not have Atlas project-management access to alter the IP Access List or create/restrict Atlas database users. Create the dedicated `readWrite@ism` user in Atlas yourself, update `backend/.env` locally with its URI, and rotate or remove the old over-privileged database user after confirming the application works with the new one.

`backend/.env` is ignored by Git. `backend/.env.example` intentionally contains no credentials.
