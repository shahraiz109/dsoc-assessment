# Assessment Answers

## 1. How to run

Requirements:

- Node.js 20 or newer
- npm

Commands:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

The app works without an API key. GitHub limits unauthenticated requests to 60 per hour, so an optional token can be used:

```bash
cp .env.example .env.local
```

Add this to `.env.local`:

```bash
GITHUB_TOKEN=your_token_here
```

Then restart the dev server.

Useful checks:

```bash
npm run lint
npm run build
```

## 2. Stack choice

I used Next.js, React, TypeScript, and CSS Modules because this task needs a small UI plus a server-side place to call the GitHub API. Next.js lets the UI and API route live in one project, TypeScript makes the API response shapes safer, and CSS Modules keep the styling simple without adding a large styling framework.

A worse choice would have been a static-only React app that calls GitHub directly from the browser. It would work for basic public requests, but it would be harder to keep an optional GitHub token private, harder to centralize timeout/error handling, and less realistic for a tool that may grow.

## 3. One real edge case

The app handles duplicate repository input, including duplicates with different casing. For example, `vercel/next.js` and `Vercel/Next.js` are treated as the same repo.

This is handled in `src/lib/repoInput.ts` lines 45-51. The normalized repo label is lowercased before checking the `seen` set. Without this, the same repository could be fetched twice, shown twice in the comparison, and make the summary misleading.

## 4. AI usage

I used Claude.ai mainly for guidance and to unblock myself when I was unsure of an approach.

- I asked it to give me a high-level overview of how I could build something useful on top of the GitHub API. It suggested comparing multiple repositories side by side and gave me a rough plan: take repo input, fetch each one, show side-by-side stats, and add a simple score. I followed that plan and built each step myself.
- I asked it how to handle a slow API in a Next.js API route. It explained `AbortController` with `setTimeout`, which I used in the `fetchWithTimeout` helper.
- I asked it for a sensible way to build a basic health score for a repo without needing many API calls. It suggested looking at recent push date, open issue ratio, and community signals (stars and forks). I picked the weights and thresholds myself based on what looked reasonable.
- I asked it to help me word a couple of UI error messages so they sound clear instead of technical.

One AI suggestion I changed: it initially proposed pre-filling the textarea with example repo names so users could submit immediately. I did not like that because it makes the page feel like it has fake data when you first open it. I replaced it with an empty textarea and used a placeholder for the examples instead, which feels more natural.

## 5. Honest gap

The health score is useful but still too simple. It uses recent push activity, open issue pressure, and stars/forks, but it does not inspect pull request activity, issue close rate, release history, commit frequency, or contributor diversity.

With another day, I would call more GitHub endpoints and make the score more evidence-based. I would also add automated tests for the validation helper, timeout handling, and health-score calculation.
