# Backend Setup

These steps are intended for a developer working on the backend branch.

## 1. Enter the backend directory

```bash
cd backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a local environment file based on:

```text
.env.example
```

Do not upload private credentials to GitHub.

## 4. Start the backend

Use the npm script already defined in `package.json`.

For development, use the development script if one is provided by the project.

## 5. Git workflow

This backend work should be committed to its own branch rather than directly to the main branch.

Example:

```bash
git switch -c backend
git add backend/
git commit -m "Add backend documentation"
git push -u origin backend
```

If the branch already exists, switch to it instead of creating a second branch.

> These instructions do not require changes to the existing application code.
