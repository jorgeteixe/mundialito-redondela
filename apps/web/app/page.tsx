import { Welcome } from "@mr/ui";

import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Welcome />
    </main>
  );
}
