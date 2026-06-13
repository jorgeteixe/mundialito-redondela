import { Logo } from "@mr/ui";

import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>
        Mundialito da Xunqueira - Redondela 2026
      </h1>
      <div className={styles.content}>
        <Logo style={{ width: "100%", maxWidth: "340px" }} />
      </div>
    </main>
  );
}
