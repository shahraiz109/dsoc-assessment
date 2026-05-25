"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { validateRepoInput } from "../lib/repoInput";
import styles from "./page.module.css";

type RepoResult =
  | {
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
      healthScore: number;
      healthLabel: string;
      healthNotes: string[];
    }
  | {
      ok: false;
      label: string;
      message: string;
    };

export default function Home() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<RepoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const summary = getSummary(results);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateRepoInput(input);

    if (!result.ok) {
      setResults([]);
      setError(result.message);
      return;
    }

    setIsLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("/api/repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });
      const data = (await response.json()) as {
        message?: string;
        results?: RepoResult[];
      };

      if (!response.ok) {
        setError(data.message ?? "Could not compare those repositories.");
        return;
      }

      setResults(data.results ?? []);
    } catch {
      setError("The app could not reach its API. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Public API Consumer</p>
        <h1>GitHub Repo Health Comparator</h1>
        <p>
          Compare public repositories side by side using signals such as activity,
          issues, stars, forks, and language mix.
        </p>
      </section>

      <section className={styles.card} aria-labelledby="repo-form-title">
        <div className={styles.cardHeader}>
          <div>
            <h2 id="repo-form-title">Choose repositories</h2>
            <p>
              Enter 2 to 5 public GitHub repositories. Use one per line or
              separate them with commas.
            </p>
          </div>
          <span className={styles.badge}>GitHub API connected</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="repos">Repositories</label>
          <textarea
            id="repos"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={6}
            spellCheck={false}
            placeholder={"Paste 2 to 5 GitHub repos to compare, one per line.\n\nvercel/next.js\nfacebook/react\nhttps://github.com/nodejs/node"}
          />
          <p className={styles.helpText}>
            Examples: <code>vercel/next.js</code>, <code>facebook/react</code>,
            or <code>https://github.com/nodejs/node</code>
          </p>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Comparing..." : "Compare repositories"}
          </button>
        </form>

        {results.length > 0 ? (
          <div className={styles.preview}>
            <h3>Repository results</h3>
            <p className={styles.resultHint}>
              Sorted by health score so the strongest repo appears first.
            </p>

            {summary ? (
              <section className={styles.summary} aria-label="Comparison summary">
                <div>
                  <span>Best overall</span>
                  <strong>{summary.bestOverall.label}</strong>
                  <small>
                    {summary.bestOverall.healthScore}/100 health score
                  </small>
                </div>
                <div>
                  <span>Most stars</span>
                  <strong>{summary.mostStars.label}</strong>
                  <small>{formatNumber(summary.mostStars.stars)} stars</small>
                </div>
                <div>
                  <span>Fewest open issues</span>
                  <strong>{summary.fewestIssues.label}</strong>
                  <small>
                    {formatNumber(summary.fewestIssues.openIssues)} open issues
                  </small>
                </div>
                <div>
                  <span>Loaded</span>
                  <strong>
                    {summary.successCount}/{summary.totalCount}
                  </strong>
                  <small>
                    {summary.failedCount === 0
                      ? "All repositories loaded."
                      : `${summary.failedCount} failed to load.`}
                  </small>
                </div>
              </section>
            ) : null}

            <div className={styles.resultsGrid}>
              {results.map((repo) =>
                repo.ok ? (
                  <article className={styles.repoCard} key={repo.label}>
                    <div className={styles.repoTopLine}>
                      <div>
                        <a href={repo.url} rel="noreferrer" target="_blank">
                          {repo.label}
                        </a>
                        <p>{repo.description ?? "No description provided."}</p>
                      </div>
                      <div className={styles.scoreBadge}>
                        <strong>{repo.healthScore}</strong>
                        <span>{repo.healthLabel}</span>
                      </div>
                    </div>

                    <dl>
                      <div>
                        <dt>Stars</dt>
                        <dd>{formatNumber(repo.stars)}</dd>
                      </div>
                      <div>
                        <dt>Forks</dt>
                        <dd>{formatNumber(repo.forks)}</dd>
                      </div>
                      <div>
                        <dt>Open issues</dt>
                        <dd>{formatNumber(repo.openIssues)}</dd>
                      </div>
                      <div>
                        <dt>Language</dt>
                        <dd>{repo.language ?? "Unknown"}</dd>
                      </div>
                    </dl>

                    <ul className={styles.healthNotes}>
                      {repo.healthNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>

                    <small>Last updated {formatDate(repo.updatedAt)}</small>
                  </article>
                ) : (
                  <article
                    className={`${styles.repoCard} ${styles.repoError}`}
                    key={repo.label}
                  >
                    <strong>{repo.label}</strong>
                    <p>{repo.message}</p>
                  </article>
                ),
              )}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getSummary(results: RepoResult[]) {
  const successful = results.filter((repo) => repo.ok);

  if (successful.length === 0) {
    return null;
  }

  const byStars = [...successful].sort((a, b) => b.stars - a.stars);
  const byIssues = [...successful].sort((a, b) => a.openIssues - b.openIssues);

  return {
    bestOverall: successful[0],
    mostStars: byStars[0],
    fewestIssues: byIssues[0],
    successCount: successful.length,
    failedCount: results.length - successful.length,
    totalCount: results.length,
  };
}
