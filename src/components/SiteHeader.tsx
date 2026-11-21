"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { trialUrl } from "@/lib/trial";

const TRIAL = trialUrl();

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = links.map((l) => (
    <Link key={l.href} href={l.href} aria-current={l.href === pathname ? "page" : undefined} onClick={() => setOpen(false)}>
      {l.label}
    </Link>
  ));

  return (
    <header className={open ? "nav open" : "nav"}>
      <div className="wrap nav-in">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <BrandMark /> Kontentifi
        </Link>
        <nav className="nav-links" aria-label="Main">
          {items}
        </nav>
        <div className="nav-r">
          {TRIAL ? (
            <a className="btn dark sm" href={TRIAL}>
              Start free trial
            </a>
          ) : (
            <Link className="btn dark sm" href="#early" onClick={() => setOpen(false)}>
              Get early access
            </Link>
          )}
          <button className="menu-btn" type="button" aria-expanded={open} aria-controls="mnav" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
      <nav className="mnav" id="mnav" aria-label="Menu" hidden={!open}>
        {items}
      </nav>
    </header>
  );
}
