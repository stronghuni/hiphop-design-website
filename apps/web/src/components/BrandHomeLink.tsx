import Image from "next/image";
import Link from "next/link";
import styles from "./BrandHomeLink.module.css";

/** Shared brand/home destination on legal and support pages. */
export function BrandHomeLink() {
  return (
    <Link href="/" className={styles.link} aria-label="MINGLES 홈으로">
      <Image src="/mingle-mark.png" alt="MINGLES" width={64} height={64} unoptimized />
    </Link>
  );
}
