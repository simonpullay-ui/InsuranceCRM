# Contribution and Release Workflow

## Branch strategy

- `main` is the production branch.
- `dev` is the active branch for day-to-day feature development.
- Work on feature branches when needed, then merge into `dev`.
- Merge `dev` into `main` only when you want a release candidate.

## Daily development flow

1. Start from `dev`:
```bash
git -C '/Users/simon/Documents/New project' checkout dev
```

2. Pull latest updates from remote:
```bash
git -C '/Users/simon/Documents/New project' pull origin dev
```

3. Create a small feature branch:
```bash
git -C '/Users/simon/Documents/New project' checkout -b feature/your-feature-name
```

4. Push your feature branch and open a merge request into `dev`:
```bash
git -C '/Users/simon/Documents/New project' push -u origin feature/your-feature-name
```

5. After merging into `dev`, continue on it:
```bash
git -C '/Users/simon/Documents/New project' checkout dev
git -C '/Users/simon/Documents/New project' pull origin dev
```

## Release flow

1. Update `dev` with all final changes.
2. Merge `dev` into `main`.
3. Tag the release:
```bash
git -C '/Users/simon/Documents/New project' checkout main
git -C '/Users/simon/Documents/New project' pull origin main
git -C '/Users/simon/Documents/New project' merge dev
git -C '/Users/simon/Documents/New project' tag -a v0.1.0 -m "InsuranceCRM release"
git -C '/Users/simon/Documents/New project' push origin main --tags
```

## One-command check

- Current branch status:
```bash
git -C '/Users/simon/Documents/New project' status --short
```

