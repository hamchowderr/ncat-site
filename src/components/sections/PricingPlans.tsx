import { TRIAL_LABEL, trialUrl } from "@/lib/trial";

const TRIAL = trialUrl();

const SELF = [
  "Your own version of the platform",
  "Runs on a rented server or your own always-on machine, such as a Mac Mini",
  "The agent that sets up your automations, plus templates, the canvas, files and outputs",
  "Unlimited runs on your toolkit, no meter",
  "Team workspace, brand set once, approvals and alerts",
  "Export to Premiere Pro, DaVinci Resolve, Final Cut Pro and CapCut",
  "One price for your whole team, whatever its size",
  "Access to the private code repository once you buy",
  "Updates included, for now",
  "A 4-week group cohort with Chowderr to build out your version",
];

const HOSTED = ["Everything in self-hosted", "No server to set up or maintain", "Starting credits included, for now", "Pay for what you process with credits"];

const COMPARE: [string, string, string][] = [
  ["How you pay", "Monthly, forever", "Once"],
  ["Per-minute or per-credit fees", "Yes", "None when self-hosted"],
  ["Runs on its own for every new upload", "Only through an API or another tool", "Yes, that’s the point"],
  ["AI sets up the automation for you", "No", "Yes"],
  ["AI runs on every video you edit", "Yes, and you pay for it", "No, plain editing steps"],
  ["A visual canvas of every automation", "No", "Yes"],
  ["Approval steps before anything goes out", "No", "Yes"],
  ["Price goes up with team size", "Yes, per seat", "No, one price"],
  ["Access to the code", "No", "Yes, once you buy"],
  ["Files in your own storage", "No", "Yes, when self-hosted"],
  ["Hands-on help building your version", "Support tickets", "4-week group cohort with Chowderr"],
];

export function PricingPlans() {
  return (
    <section className="plans-sec" aria-label="Plans">
      <div className="wrap">
        <div className="plans">
          <article className="plan main">
            <h2>
              Self-hosted <span className="plan-status">Early access</span>
            </h2>
            <p className="plan-price">One-time purchase</p>
            <p className="plan-tba">Price announced at launch</p>
            <p className="plan-desc">The dashboard and the cohort come together as one purchase. Runs on the NCA Toolkit you host.</p>
            <a className="btn primary" href="#early">
              Get early access
            </a>
            <ul className="ticks">
              {SELF.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </article>
          <article className="plan">
            <h2>
              Hosted <span className="plan-status">Planned</span>
            </h2>
            <p className="plan-price">Credits</p>
            <p className="plan-tba">Details coming</p>
            <p className="plan-desc">Don’t want to manage a server? We run the toolkit for you.</p>
            {TRIAL ? (
              <a className="btn ghost" href={TRIAL}>
                {TRIAL_LABEL}
              </a>
            ) : (
              <a className="btn ghost" href="#early">
                Tell me you’re interested
              </a>
            )}
            <ul className="ticks">
              {HOSTED.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="rungs">
          <article>
            <h3>
              social-clips <span className="plan-status">Free</span>
            </h3>
            <p>A smaller version of the idea that you clone and run yourself. A good first step if you are not ready for the dashboard.</p>
          </article>
          <article>
            <h3>
              Video editing skills <span className="plan-status">Price to be announced</span>
            </h3>
            <p>A plugin for Claude Code and other agents: cut silences, add captions, reframe to vertical and join clips with nothing but FFmpeg on your computer.</p>
          </article>
        </div>

        <h2 className="cmp-title">Compared with a typical clipping app</h2>
        <div className="cmp-wrap">
          <table className="cmp">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr">Feature</span>
                </th>
                <th scope="col">Typical clipping app</th>
                <th scope="col">Takewon</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, them, us]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{them}</td>
                  <td className="us">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
