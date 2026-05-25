export type RepoReference = {
  owner: string;
  repo: string;
  label: string;
};

export type RepoValidationResult =
  | {
      ok: true;
      repos: RepoReference[];
    }
  | {
      ok: false;
      message: string;
    };

const repoPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function validateRepoInput(value: string): RepoValidationResult {
  const rawEntries = value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (rawEntries.length === 0) {
    return {
      ok: false,
      message: "Enter at least two public GitHub repositories.",
    };
  }

  const repos: RepoReference[] = [];
  const seen = new Set<string>();

  for (const entry of rawEntries) {
    const normalized = normalizeRepoEntry(entry);

    if (!normalized) {
      return {
        ok: false,
        message: `"${entry}" is not valid. Use owner/repo or a GitHub repo URL.`,
      };
    }

    const key = normalized.label.toLowerCase();

    if (seen.has(key)) {
      return {
        ok: false,
        message: `"${normalized.label}" is repeated. Each repo should only appear once.`,
      };
    }

    seen.add(key);
    repos.push(normalized);
  }

  if (repos.length < 2) {
    return {
      ok: false,
      message: "Add at least two repositories so there is something to compare.",
    };
  }

  if (repos.length > 5) {
    return {
      ok: false,
      message: "Compare up to five repositories at a time.",
    };
  }

  return {
    ok: true,
    repos,
  };
}

function normalizeRepoEntry(entry: string): RepoReference | null {
  const withoutGitSuffix = entry.replace(/\.git$/i, "");
  const fromUrl = parseGitHubUrl(withoutGitSuffix);
  const candidate = fromUrl ?? withoutGitSuffix;

  if (!repoPattern.test(candidate)) {
    return null;
  }

  const [owner, repo] = candidate.split("/");

  return {
    owner,
    repo,
    label: `${owner}/${repo}`,
  };
}

function parseGitHubUrl(entry: string): string | null {
  try {
    const url = new URL(entry);

    if (url.hostname.toLowerCase() !== "github.com") {
      return null;
    }

    const [owner, repo] = url.pathname.split("/").filter(Boolean);

    if (!owner || !repo) {
      return null;
    }

    return `${owner}/${repo}`;
  } catch {
    return null;
  }
}
