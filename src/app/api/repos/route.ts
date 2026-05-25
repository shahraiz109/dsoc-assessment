import { NextRequest, NextResponse } from "next/server";
import { validateRepoInput } from "../../../lib/repoInput";

type GitHubRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string | null;
};

type RepoSuccess = {
  ok: true;
  label: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string | null;
  updatedAt: string;
  pushedAt: string | null;
};

type RepoFailure = {
  ok: false;
  label: string;
  message: string;
};

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "dsoc-repo-health-comparator",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const input = getInput(body);

  if (!input) {
    return NextResponse.json(
      { message: "Send repositories in an input string." },
      { status: 400 },
    );
  }

  const validation = validateRepoInput(input);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const results = await Promise.all(validation.repos.map(fetchRepo));

  return NextResponse.json({ results });
}

function getInput(body: unknown) {
  if (!body || typeof body !== "object" || !("input" in body)) {
    return null;
  }

  const input = body.input;

  return typeof input === "string" ? input : null;
}

async function fetchRepo({
  owner,
  repo,
  label,
}: {
  owner: string;
  repo: string;
  label: string;
}): Promise<RepoSuccess | RepoFailure> {
  try {
    const response = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${repo}`,
      7000,
    );

    if (!response.ok) {
      return {
        ok: false,
        label,
        message: getGitHubErrorMessage(response),
      };
    }

    const data = (await response.json()) as GitHubRepo;

    return {
      ok: true,
      label,
      url: data.html_url,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      watchers: data.watchers_count,
      language: data.language,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
    };
  } catch (error) {
    return {
      ok: false,
      label,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "GitHub took too long to respond. Try again in a moment."
          : "Could not reach GitHub. Check your connection and try again.",
    };
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: githubHeaders,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function getGitHubErrorMessage(response: Response) {
  if (response.status === 404) {
    return "Repository not found or not public.";
  }

  if (response.status === 403) {
    const remaining = response.headers.get("x-ratelimit-remaining");

    if (remaining === "0") {
      return "GitHub rate limit reached. Try again later or add a GitHub token.";
    }

    return "GitHub refused this request.";
  }

  if (response.status >= 500) {
    return "GitHub is having trouble right now. Try again shortly.";
  }

  return `GitHub returned HTTP ${response.status}.`;
}
