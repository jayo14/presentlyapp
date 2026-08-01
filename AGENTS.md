# AGENTS.md

## Git Commit Rules

- **Never add yourself (Kilo) as an author or co-author of a commit.**
  Always use the global git `user.name` and `user.email` values configured
  on the machine.
- If a commit was created with a custom author, amend it with
  `git commit --amend --reset-author --no-edit` before finishing.

## Code Style

- Prefer editing existing files over creating new ones.
- Follow existing patterns, libraries, and conventions in each subfolder
  (`backend/`, `frontend/`, `mobile/`, etc.).
- Do not add comments unless explicitly asked.

## Mobile (Expo / EAS) Notes

- The mobile project lives in `mobile/`.
- `.env.local` is gitignored; EAS build env vars are defined in
  `mobile/eas.json` (committed) and mirrored as EAS server-side
  environment variables via `eas env:create`.
- When adding/changing public env vars, update **both**:
  1. `mobile/eas.json` — the `env` block for each build profile.
  2. EAS servers — run `eas env:create` for each environment
     (development, preview, production).
- Actual secrets should only be added via `eas env:create --visibility secret`.
