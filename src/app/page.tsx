import styles from "./page.module.css";

export default function Home() {
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

      <section className={styles.card}>
        <h2>First milestone complete</h2>
        <p>
          The project shell is ready. Next we will add repo input, GitHub API
          fetching, comparison scoring, and careful handling for bad input,
          API errors, and slow responses.
        </p>
      </section>
    </main>
  );
}
