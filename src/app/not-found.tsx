import Link from "next/link";

export default function NotFound() {
  return (
    <section className="p-hero">
      <div className="wrap">
        <h1>That page isn’t here.</h1>
        <p className="hero-sub">It may have moved while the site is being built.</p>
        <Link className="btn primary" href="/">
          Back to the home page
        </Link>
      </div>
    </section>
  );
}
