import type React from "react";

export function PricingPlans() {
  return (
    <>
  <section style={{"paddingTop": "16px"} as React.CSSProperties}>
    <div className="in">
      <div className="plans">
        <div className="plan feat">
          <span className="tag">Early access</span>
          <span className="nm">Self-hosted</span>
          <span className="big">One-time</span>
          <span className="tba">Price announced at launch</span>
          <p className="desc">The dashboard and the cohort come together as one purchase. Runs on the NCA Toolkit you host.</p>
          <ul>
            <li>Your own version of the platform</li>
            <li>Runs on a rented server or your own always-on machine, such as a Mac Mini</li>
            <li>The assistant that sets up your automations, plus the content library, templates and automation map</li>
            <li>Unlimited runs on your toolkit, no meter</li>
            <li>Team workspace, brand kit and approvals</li>
            <li>One price for your whole team, whatever its size</li>
            <li>Access to the private code repository once you buy</li>
            <li className="tbd">Export to CapCut, Premiere Pro and other editors, coming</li>
            <li className="tbd">Updates included, for now</li>
            <li>A 4-week group cohort with Chowderr to build out your version</li>
          </ul>
          <a className="btn g" href="#early">Get early access</a>
        </div>
        <div className="plan">
          <span className="tag">Planned</span>
          <span className="nm">Hosted</span>
          <span className="big">Credits</span>
          <span className="tba">Details coming</span>
          <p className="desc">Don’t want to manage a server? We run the toolkit for you.</p>
          <ul>
            <li>Everything in self-hosted</li>
            <li>No server to set up or maintain</li>
            <li className="tbd">Starting credits included, for now</li>
            <li>Pay for what you process with credits</li>
          </ul>
          <a className="btn o" href="#early">Tell me you’re interested</a>
        </div>
      </div>
      <div className="rungs">
        <div className="rung"><span className="mono">FREE</span><b>social-clips</b><p>A smaller version of the idea that you clone and run yourself. A good first step if you are not ready for the dashboard.</p></div>
        <div className="rung"><span className="mono">PRICE TO BE ANNOUNCED</span><b>Video editing skills</b><p>A plugin for Claude Code and other agents: cut silences, add captions, reframe to vertical and join clips with nothing but FFmpeg on your computer.</p></div>
      </div>
      <div className="cmp-wrap">
        <table className="cmp">
          <tbody><tr><th /><th>Typical clipping app</th><th>NCA Dashboard</th></tr>
            <tr><td>How you pay</td><td className="n">Monthly, forever</td><td className="y">Once</td></tr>
            <tr><td>Per-minute or per-credit fees</td><td className="n">Yes</td><td className="y">None when self-hosted</td></tr>
            <tr><td>Runs on its own for every new upload</td><td className="n">Only through an API or another tool</td><td className="y">Yes, that’s the point</td></tr>
            <tr><td>Every toolkit feature, not just clips</td><td className="n">No</td><td className="y">Yes</td></tr>
            <tr><td>AI sets up the automation for you</td><td className="n">No</td><td className="y">Yes</td></tr>
            <tr><td>AI runs on every video you edit</td><td className="n">Yes, and you pay for it</td><td className="y">No, plain editing steps</td></tr>
            <tr><td>A visual map of every automation</td><td className="n">No</td><td className="y">Yes</td></tr>
            <tr><td>Approval steps before anything goes out</td><td className="n">No</td><td className="y">Yes</td></tr>
            <tr><td>Price goes up with team size</td><td className="n">Yes, per seat</td><td className="y">No, one price</td></tr>
            <tr><td>Access to the code</td><td className="n">No</td><td className="y">Yes, once you buy</td></tr>
            <tr><td>Files in your own storage</td><td className="n">No</td><td className="y">Yes, when self-hosted</td></tr>
            <tr><td>Hands-on help building your version</td><td className="n">Support tickets</td><td className="y">4-week group cohort with Chowderr</td></tr>
          </tbody></table>
      </div>
    </div>
  </section>
  {/* ================= SHARED CTA ================= */}


    </>
  );
}
