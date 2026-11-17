import Link from "next/link";

export default function NotFound() {
  return (
    <section className="final">
      <div className="in">
        <h2>That page isn’t here.</h2>
        <p className="lede" style={{ textAlign: "center" }}>It may have moved while the site is being built.</p>
        <Link className="btn w" href="/">Back to the home page</Link>
      </div>
    </section>
  );
}
