import { CONTACT_EMAIL, CONTACT_HREF, TALKS } from "@/lib/contact";
import { Reveal } from "@/components/Reveal";
export const FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "Is it out yet?", a: "Not yet. Takewon is working and in testing now. Get on the early access list and you’ll be first to try it." },
  {
    q: "If the NCA Toolkit is free, what am I paying for?",
    a: "The shell around it. The toolkit is a free, open-source engine: it cuts, captions, transcribes and reframes video through an API, but it has no screens and nothing that runs on its own. We built the fine-tuned shell that makes it run your content: ready-made automations, an agent that sets up new ones, recordings that come in from Zoom, Google Meet and Microsoft Teams, a library of everything you’ve recorded, approvals, your brand on every clip and hand-off to your editor. You never pay for the processing itself.",
  },
  {
    q: "Can’t I just edit with an AI agent and the toolkit?",
    a: "You can, and it works while you sit with it. Every session uses your plan’s limits or API credits, starts from scratch, and stops when you close the laptop. Here you describe the edit once, the agent sets it up and tests it, and plain editing runs it on every new recording with nobody there and no AI used per video. You can still drive it from your own agent through the MCP server, which works with many MCP clients.",
  },
  {
    q: "Doesn’t the toolkit come with n8n?",
    a: "It does, and many people never set it up. n8n can string toolkit jobs together, but you wire each request and type the expressions yourself, and there is no library, review step or brand settings. Automations here run inside the shell, so you don’t need n8n. If you already use it, it works alongside.",
  },
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
        <a href={`${TALKS.summit}#start`}>my Claude Code talk</a> walks you through setting one up with Claude. If you’d rather
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
  { q: "Do I need n8n?", a: "No. Automations run inside the shell itself. n8n comes with the toolkit, and if you already use it, it can still start an automation." },
  {
    q: "Is this the official NCA Toolkit?",
    a: "No. The NCA Toolkit is a free, open-source project by Stephen G. Pope. Takewon, the shell around it, is a separate product.",
  },
];

export function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-in">
        <Reveal className="sec-head">
          <h2 id="faq-title">Got questions?</h2>
          <p>
            Anything else, email <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>.
          </p>
        </Reveal>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>
                <span>{f.q}</span>
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
