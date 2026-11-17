import Link from "next/link";
import type React from "react";

export function Footer() {
  return (
    <>
<footer>
  <div className="in">
    <div className="foot">
      <div><Link className="logo" href="/"><i />NCA <span>Dashboard</span></Link><p>Your content organized and edited automatically, built on the free NCA Toolkit. By Tylan “Chowderr” Miller and Otaku Solutions.</p></div>
      <div><h4>Product</h4><ul><li><Link href="/#features">Content library</Link></li><li><Link href="/#automations">Automations</Link></li><li><Link href="/#templates">Templates</Link></li><li><Link href="/pricing">Pricing</Link></li></ul></div>
      <div><h4>Use cases</h4><ul><li><Link href="/#use-cases">Creators</Link></li><li><Link href="/#use-cases">Editing agencies</Link></li><li><Link href="/#use-cases">Podcast teams</Link></li><li><Link href="/#use-cases">Music video teams</Link></li></ul></div>
      <div><h4>Resources</h4><ul><li><a href="https://claude.ai/artifact/Y8og6PdvJ3D4y9VjdHRMX1">Toolkit setup guide</a></li><li><a href="https://github.com/stephengpope/no-code-architects-toolkit">NCA Toolkit on GitHub</a></li><li><a href="https://claude.ai/artifact/6Eub1y5ZXra6K9FbhypK2H">The KINN talk</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="https://otakusolutions.io">Otaku Solutions</a></li><li><a href="https://chowderr.dev">chowderr.dev</a></li><li><a href="https://www.instagram.com/hamchowderr">Instagram</a></li><li><a href="https://x.com/hamchowderr">X</a></li><li><a href="https://www.linkedin.com/in/tylanmiller">LinkedIn</a></li></ul></div>
    </div>
    <div className="legal"><span>© 2026 Otaku Solutions. In development; screens shown are early designs.</span><span>Works with the open-source <a href="https://github.com/stephengpope/no-code-architects-toolkit">NCA Toolkit</a> by Stephen G. Pope.</span></div>
  </div>
</footer>

    </>
  );
}
