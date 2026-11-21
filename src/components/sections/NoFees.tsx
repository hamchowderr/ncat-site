import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const USUAL = [
  ["Transcripts", "per minute"],
  ["AI clipping", "per upload minute"],
  ["Captions and renders", "per credit"],
  ["Scheduling tool", "per month"],
  ["Extra editors", "per seat"],
];

const MONTHS = ["January", "February", "March", "April"];

const RUNS = ["Clips for social", "TikTok captioned clips", "Captioned video with your logo", "Coaching session pack", "Vertical that follows the speaker", "Clips for social"];

/** One month of the usual bill: the same five charges, again. */
function Month({ name }: { name: string }) {
  return (
    <li className="bill-month">
      <p className="bill-when">{name}</p>
      <ul>
        {USUAL.map(([k, v]) => (
          <li key={k}>
            <span>{k}</span>
            <span className="per">{v}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function NoFees() {
  return (
    <section className="fees" aria-labelledby="fees-title">
      <div className="wrap">
        <div className="fees-stage">
          <Reveal className="fees-text">
            <h2 id="fees-title">Stop paying fees to edit your own content</h2>
            <p>
              Clipping apps charge for upload minutes, render credits and seats, every month, just to cut and caption what you already made. The NCA
              Toolkit engine does that editing for free. You pay once for the shell around it, never for the processing.
            </p>
            <ul className="ticks">
              <li>Self-host it on your own toolkit for unlimited runs with no meter</li>
              <li>Your own version with access to the code, not another subscription</li>
              <li>One price whatever the size of your team</li>
            </ul>
            <Link className="btn ghost" href="/pricing">
              See pricing
            </Link>
          </Reveal>
          <div className="compare" aria-label="How the usual stack is billed compared with Kontifi">
            <div className="bill">
              <p className="bill-h">
                The usual stack <span>Billed every month</span>
              </p>
              <div className="bill-roll">
                <ul aria-label="The usual stack, billed every month" className="bill-list">
                  {MONTHS.map((m) => (
                    <Month key={m} name={m} />
                  ))}
                </ul>
                <ul className="bill-list" aria-hidden="true">
                  {MONTHS.map((m) => (
                    <Month key={m} name={m} />
                  ))}
                </ul>
              </div>
            </div>
            <div className="ours">
              <p className="ours-h">Kontifi</p>
              <p className="once">
                Paid
                <br />
                once
              </p>
              <div className="runs-roll" aria-hidden="true">
                <ul>
                  {[...RUNS, ...RUNS].map((r, i) => (
                    <li key={i}>
                      <Check size={13} strokeWidth={2.6} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="ours-f">Runs on your toolkit, as often as you like. No meter.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
