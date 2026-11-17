import Link from "next/link";

const USUAL = [
  ["Transcripts", "per minute"],
  ["AI clipping", "per upload minute"],
  ["Captions and renders", "per credit"],
  ["Scheduling tool", "per month"],
  ["Extra editors", "per seat"],
];

export function NoFees() {
  return (
    <section className="fees" aria-labelledby="fees-title">
      <div className="wrap fees-in">
        <div className="fees-text">
          <h2 id="fees-title">Stop paying fees to edit your own content</h2>
          <p>
            Clipping apps charge for upload minutes, render credits and seats, every month, just to cut and caption what you already made. The NCA
            Toolkit does that editing for free, and you buy the dashboard once.
          </p>
          <ul className="ticks">
            <li>Self-host it on your own toolkit for unlimited runs with no meter</li>
            <li>Your own version with access to the code, not another subscription</li>
            <li>One price whatever the size of your team</li>
          </ul>
          <Link className="btn ghost" href="/pricing">
            See pricing
          </Link>
        </div>
        <div className="compare" aria-label="How the usual stack is billed compared with the dashboard">
          <div className="compare-col">
            <p className="compare-h">The usual stack</p>
            <ul>
              {USUAL.map(([k, v]) => (
                <li key={k}>
                  <span>{k}</span>
                  <span className="per">{v}</span>
                </li>
              ))}
            </ul>
            <p className="compare-f">Billed every month</p>
          </div>
          <div className="compare-col ours">
            <p className="compare-h">NCA Dashboard</p>
            <p className="once">Paid once</p>
            <p className="compare-f">Runs on your toolkit, as often as you like</p>
          </div>
        </div>
      </div>
    </section>
  );
}
