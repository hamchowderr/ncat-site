import type { Metadata } from "next";
import type { ReactNode } from "react";

/** The small print and help pages: one column of reading, a title, and the date it last changed. */
export function DocPage({ title, updated, lead, children }: { title: string; updated: string; lead: ReactNode; children: ReactNode }) {
  return (
    <article className="doc">
      <div className="wrap doc-wrap">
        <header className="doc-head">
          <h1>{title}</h1>
          <p className="doc-updated">
            Last updated <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
          <p className="doc-lead">{lead}</p>
        </header>
        <div className="doc-body">{children}</div>
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** Page metadata for a doc page, in the same shape as the other pages'. */
export function docMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Takewon", title: `${title} · Takewon`, description, url: path },
    twitter: { card: "summary", title: `${title} · Takewon`, description, creator: "@hamchowderr" },
  };
}
