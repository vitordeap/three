import Image from "next/image";
import styles from "./page.module.css";
import { Shiba } from "./components/shiba";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Shiba/>
      </main>
    </div>
  );
}
