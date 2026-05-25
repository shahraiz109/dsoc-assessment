# GitHub Repo Health Comparator

A small public API consumer that compares public GitHub repositories side by side, scores their health, and summarizes which repo looks strongest.

## What It Does

- Accepts 2 to 5 GitHub repositories as `owner/repo` or full GitHub URLs.
- Fetches live public repository data from the GitHub API.
- Handles bad input, missing repositories, GitHub errors, rate limits, and slow responses.
- Calculates a simple health score from recent activity, issue pressure, and community signal.
- Sorts the results and shows a quick comparison summary.

## Run Locally

Requirements:

- Node.js 20 or newer
- npm

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Optional GitHub Token

The app works without an API key, but unauthenticated GitHub API calls are limited to 60 requests per hour.

To use a higher limit:

1. Create a fine-grained GitHub token with public repository read access.
2. Copy `.env.example` to `.env.local`.
3. Add your token:

```bash
GITHUB_TOKEN=your_token_here
```

Restart the dev server after changing environment variables.

Do not commit `.env.local`.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
```
