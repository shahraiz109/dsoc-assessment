"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { RepoReference } from "../lib/repoInput";
import { validateRepoInput } from "../lib/repoInput";
import styles from "./page.module.css";

export default function Home() {
  const [input, setInput] = useState(
    "vercel/next.js\nfacebook/react\nhttps://github.com/nodejs/node",
  );
  const [error, setError] = useState("");
  const [repos, setRepos] = useState<RepoReference[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateRepoInput(input);

    if (!result.ok) {
      setRepos([]);
      setError(result.message);
      return;
    }

    setError("");
    setRepos(result.repos);
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
          <span className={styles.badge}>Bad input handled</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="repos">Repositories</label>
          <textarea
            id="repos"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={6}
            spellCheck={false}
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

          <button type="submit">Validate repositories</button>
        </form>

        {repos.length > 0 ? (
          <div className={styles.preview}>
            <h3>Ready to compare</h3>
            <ul>
              {repos.map((repo) => (
                <li key={repo.label}>
                  <span>{repo.label}</span>
                  <small>
                    owner: {repo.owner}, repo: {repo.repo}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
