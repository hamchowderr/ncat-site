import type React from "react";

export function Faq() {
  return (
    <>
<section style={{"paddingTop": "0"} as React.CSSProperties}>
  <div className="in faq-wrap">
    <div className="head" style={{"marginBottom": "0"} as React.CSSProperties}><h2>Got questions?</h2><p className="lede">Anything else, message me directly.</p></div>
    <div className="faq">
      <details open><summary>Is it out yet?</summary><p>Not yet. It’s being built now. Get on the early access list and you’ll be first to try it.</p></details>
      <details><summary>How is this different from Opus Clip and other clipping apps?</summary><p>Those apps sell AI editing one video at a time and charge per minute or credit for it. Most of that work is plain editing that doesn’t need AI. Here you set the job up once on a map you can read, your content stays organized in one library, and every new upload is handled the same way with no fee per video. Anything left over goes to your editing app or your editor. And you own it.</p></details>
      <details><summary>What does “own it” mean?</summary><p>You pay once and get your own version. The code lives in a private repository, and you get access to it when you buy. If you need your own copy to change, you get that the same way. It follows the same licence as the NCA Toolkit. For now, updates are included. The price doesn’t change with the size of your team.</p></details>
      <details><summary>Where does the AI come in?</summary><p>In setting things up. You describe the job, and the assistant builds the automation from plain editing steps, tests it on a real recording and turns it on. It can change an automation later the same way. The automation itself runs without AI, so there is no AI fee on every video. A few optional steps, like picking the best moments, will use AI with settings you control.</p></details>
      <details><summary>Do I need my own NCA Toolkit?</summary><p>Not necessarily. If you self-host, you connect your toolkit with its address and key, and <a href="https://claude.ai/artifact/Y8og6PdvJ3D4y9VjdHRMX1">the setup guide</a> walks you through setting one up with Claude. If you’d rather not run a server, a hosted option is planned. For now, the plan is that it comes with starting credits.</p></details>
      <details><summary>Where does it run?</summary><p>Two ways. On a rented server, or on your own machine that stays on around the clock and meets the specs. A Mac Mini is a good example. A laptop that gets closed at night is not, because automations have to be able to run while you sleep.</p></details>
      <details><summary>Does it make AI avatars, dubbing or text-to-video?</summary><p>No, and it is not planned. It works on real footage and audio you recorded.</p></details>
      <details><summary>Can I finish a clip in my own editor?</summary><p>That is planned. You will be able to export to CapCut, Premiere Pro and other editors, open the clip there and keep working. It is not built yet.</p></details>
      <details><summary>Do I need n8n?</summary><p>No. Automations run inside the dashboard. If you already use n8n, it can still start an automation with a webhook.</p></details>
      <details><summary>Is this the official NCA Toolkit?</summary><p>No. The NCA Toolkit is a free, open-source project by Stephen G. Pope. The dashboard is a separate product by Otaku Solutions that works with it.</p></details>
    </div>
  </div>
</section>

    </>
  );
}
