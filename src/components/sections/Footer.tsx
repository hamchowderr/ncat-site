import Link from "next/link";
import { siInstagram, siX } from "simple-icons";
import { BrandMark } from "@/components/brand/BrandMark";
import { BrandIcon, FileLogo } from "@/components/brand/Logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Questions", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Toolkit setup guide", href: "https://claude.ai/artifact/Y8og6PdvJ3D4y9VjdHRMX1" },
      { label: "NCA Toolkit", href: "https://github.com/stephengpope/no-code-architects-toolkit" },
      { label: "The KINN talk", href: "https://claude.ai/artifact/6Eub1y5ZXra6K9FbhypK2H" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Otaku Solutions", href: "https://otakusolutions.io" },
      { label: "chowderr.dev", href: "https://chowderr.dev" },
    ],
  },
];

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/hamchowderr", mark: <BrandIcon icon={siInstagram} /> },
  { label: "X", href: "https://x.com/hamchowderr", mark: <BrandIcon icon={siX} /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tylanmiller", mark: <FileLogo name="linkedin" size={18} /> },
];

/** A light footer in the manner of Linear's: the mark and a line on the left, short link columns on the right, nothing underneath. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-row">
        <div className="foot-about">
          <Link className="brand" href="/">
            <BrandMark /> NCA Dashboard
          </Link>
          <p>Your content organized and clipped automatically, by Otaku Solutions.</p>
          <ul className="foot-social" aria-label="Follow">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label}>
                  {s.mark}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2>{c.title}</h2>
            <ul>
              {c.links.map((l) => (
                <li key={l.label}>{l.href.startsWith("/") ? <Link href={l.href}>{l.label}</Link> : <a href={l.href}>{l.label}</a>}</li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
