import { MovingIcon } from "@/components/MovingIcon";
import MousePointer2Icon from "@/components/itshover/mouse-pointer-2-icon";
import RefreshIcon from "@/components/itshover/refresh-icon";
import SendIcon from "@/components/itshover/send-icon";
import { Reveal } from "@/components/Reveal";

/** AI goes into building the factory once; after that every video goes through it with no chat. */
export const STEPS: { title: string; icon: typeof MousePointer2Icon; body: string; ends?: string[] }[] = [
  {
    title: "Build it once",
    icon: MousePointer2Icon,
    body: "Pick a ready-made automation, or describe what you want and the agent builds it with you. That’s where the AI goes.",
  },
  {
    title: "It runs by itself",
    icon: RefreshIcon,
    body: "From then on every upload, yours or a client’s, is cut, captioned and sized on its own. No chat and no prompting for each video.",
  },
  {
    title: "Ready, or handed off",
    icon: SendIcon,
    body: "Simple posts come out ready to go. Bigger edits arrive as an organized pack your editor opens in Premiere Pro or CapCut.",
    ends: ["Ready to post", "Ready for your editor"],
  },
];

export function HowItWorks() {
  return (
    <section className="how" id="how-it-works" aria-labelledby="how-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="how-title">
            <span className="keep">Use AI once.</span> <span className="keep">Not on every video.</span>
          </h2>
          <p className="sec-lead">
            Social media ready shouldn’t mean a chat session for every edit. Build your content factory once, and every recording comes
            out ready.
          </p>
        </Reveal>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.12} className="step-in">
                <span className="step-top" aria-hidden="true">
                  <span className="step-icon">
                    <MovingIcon icon={s.icon} size={22} trigger=".steps li" />
                  </span>
                  <span className="step-n">{i + 1}</span>
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {s.ends && (
                  <p className="step-ends">
                    {s.ends.map((e) => (
                      <span key={e}>{e}</span>
                    ))}
                  </p>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
