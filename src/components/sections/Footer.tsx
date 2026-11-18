import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-about">
            <Link className="brand" href="/">
              <BrandMark /> NCA Dashboard
            </Link>
            <p>Your content organized and clipped automatically, built on the free NCA Toolkit. By Tylan “Chowderr” Miller and Otaku Solutions.</p>
          </div>
          <nav aria-label="Product">
            <h2>Product</h2>
            <ul>
              <li><Link href="/#features">Features</Link></li>
              <li><Link href="/#how-it-works">How it works</Link></li>
              <li><Link href="/#faq">Questions</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </nav>
          <nav aria-label="Use cases">
            <h2>Use cases</h2>
            <ul>
              <li><Link href="/#use-cases">Creators</Link></li>
              <li><Link href="/#use-cases">Editing agencies</Link></li>
              <li><Link href="/#use-cases">Podcast teams</Link></li>
              <li><Link href="/#use-cases">Music video teams</Link></li>
            </ul>
          </nav>
          <nav aria-label="Resources">
            <h2>Resources</h2>
            <ul>
              <li><a href="https://claude.ai/artifact/Y8og6PdvJ3D4y9VjdHRMX1">Toolkit setup guide</a></li>
              <li><a href="https://github.com/stephengpope/no-code-architects-toolkit">NCA Toolkit on GitHub</a></li>
              <li><a href="https://claude.ai/artifact/6Eub1y5ZXra6K9FbhypK2H">The KINN talk</a></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h2>Company</h2>
            <ul>
              <li><a href="https://otakusolutions.io">Otaku Solutions</a></li>
              <li><a href="https://chowderr.dev">chowderr.dev</a></li>
              <li><a href="https://www.instagram.com/hamchowderr">Instagram</a></li>
              <li><a href="https://x.com/hamchowderr">X</a></li>
              <li><a href="https://www.linkedin.com/in/tylanmiller">LinkedIn</a></li>
            </ul>
          </nav>
        </div>
        <div className="legal">
          <span>© 2026 Otaku Solutions. Early access. Screens are the working dashboard with demo data.</span>
          <span>
            Works with the open-source <a href="https://github.com/stephengpope/no-code-architects-toolkit">NCA Toolkit</a> by Stephen G. Pope.
          </span>
        </div>
      </div>
    </footer>
  );
}
