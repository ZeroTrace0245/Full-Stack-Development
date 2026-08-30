# Backend Development Notes

## Branch Policy

Backend changes should be developed on a dedicated Git branch.

Recommended branch name:

```text
backend
```

The main branch should remain unchanged unless the group agrees to merge the backend work.

## Commit Guidelines

Use small, clear commits. Examples:

```text
Add backend documentation
Update authentication middleware
Add task API changes
Fix message route validation
```

## Before Pushing

Check:

```bash
git status
```

Then review:

```bash
git diff
```

Make sure only the intended backend files are included.

## Security

Never commit:

- Real `.env` files
- Database passwords
- API keys
- Access tokens
- Private credentials

The existing `.env.example` should be used as the reference for environment configuration.

## Group Project Workflow

1. Work on the backend branch.
2. Keep the main branch untouched.
3. Commit only your intended changes.
4. Push the backend branch.
5. Open a pull request when the group is ready to review/merge.
