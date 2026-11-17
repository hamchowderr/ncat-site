export const FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "Is it out yet?", a: "Not yet. The dashboard is working and in testing now. Get on the early access list and you’ll be first to try it." },
  {
    q: "How is this different from Opus Clip and other clipping apps?",
    a: "Those apps sell AI editing one video at a time and charge per minute or credit for it. Most of that work is plain editing that doesn’t need AI. Here you set the job up once on a canvas you can read, your content stays organized in your own storage, and every new upload is handled the same way with no fee per video. Anything left over goes to your editing app or your editor. And you own it.",
  },
  {
    q: "What does “own it” mean?",
    a: "You pay once and get your own version. The code lives in a private repository, and you get access to it when you buy. If you need your own copy to change, you get that the same way. It follows the same licence as the NCA Toolkit. For now, updates are included. The price doesn’t change with the size of your team.",
  },
  {
    q: "Where does the AI come in?",
    a: "In setting things up. You describe the job, and the agent builds the automation from plain editing steps, tests it on a real recording and turns it on when you say so. It can change an automation later the same way. The automation itself runs without AI, so there is no AI fee on every video.",
  },
  {
    q: "Do I need my own NCA Toolkit?",
    a: (
      <>
        If you self-host, yes: you connect your toolkit with its address and key, and{" "}
        <a href="https://claude.ai/artifact/Y8og6PdvJ3D4y9VjdHRMX1">the setup guide</a> walks you through setting one up with Claude. If you’d rather
        not run a server, a hosted option is planned. For now, the plan is that it comes with starting credits.
      </>
    ),
  },
  {
    q: "Where does it run?",
    a: "Two ways. On a rented server, or on your own machine that stays on around the clock and meets the specs. A Mac Mini is a good example. A laptop that gets closed at night is not, because automations have to be able to run while you sleep.",
  },
  {
    q: "Can I finish a clip in my own editor?",
    a: "Yes. An Export for editors step makes timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro with every cut adjustable, plus CapCut-ready clip packs, because CapCut can’t import a timeline. Caption files come with them.",
  },
  { q: "Does it make AI avatars, dubbing or text-to-video?", a: "No, and it is not planned. It works on real footage and audio you recorded." },
  { q: "Do I need n8n?", a: "No. Automations run inside the dashboard. If you already use n8n, it can still start an automation with a webhook." },
  {
    q: "Is this the official NCA Toolkit?",
    a: "No. The NCA Toolkit is a free, open-source project by Stephen G. Pope. The dashboard is a separate product by Otaku Solutions that works with it.",
  },
];

export function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-in">
        <header className="sec-head left">
          <h2 id="faq-title">Got questions?</h2>
          <p>Anything else, message me directly.</p>
        </header>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <div className="faq-a">{typeof f.a === "string" ? <p>{f.a}</p> : <p>{f.a}</p>}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
