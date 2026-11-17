import Link from "next/link";
import type React from "react";

export function NoFees() {
  return (
    <>
<section style={{"paddingTop": "0"} as React.CSSProperties}>
  <div className="in bill">
    <div className="head" style={{"marginBottom": "0"} as React.CSSProperties}>
      <h2>Stop paying fees to edit your own content</h2>
      <p className="lede">Clipping apps charge for upload minutes, render credits and seats, every month, just to cut and caption what you already made. The NCA Toolkit does that editing for free, and you buy the dashboard once.</p>
      <ul className="checks">
        <li><span><b>Self-host it</b> on your own toolkit for unlimited runs with no meter</span></li>
        <li><span><b>Or let us host it</b> and work from credits (planned)</span></li>
        <li><span><b>Your own version</b>, with access to the code, not another subscription</span></li>
        <li><span><b>One price</b> whatever the size of your team</span></li>
      </ul>
      <div><Link className="btn o" href="/pricing">See pricing</Link></div>
    </div>
    <div className="receipt" aria-label="Receipt comparing metered clipping tools with owning the dashboard">
      <h4>THE USUAL STACK</h4><p className="c">billed every month, forever</p>
      <div className="ln"><span>Transcripts</span><b>per minute</b></div>
      <div className="ln"><span>AI clipping</span><b>per upload minute</b></div>
      <div className="ln"><span>Captions + renders</span><b>per credit</b></div>
      <div className="ln"><span>Scheduling tool</span><b>per month</b></div>
      <div className="ln"><span>Extra editors</span><b>per seat</b></div>
      <div className="tot"><span>NCA Dashboard</span><span>once</span></div>
      <span className="stamp">Paid once</span>
    </div>
  </div>
</section>

    </>
  );
}
