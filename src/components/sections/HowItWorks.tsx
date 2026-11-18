import { MovingIcon } from "@/components/MovingIcon";
import MousePointer2Icon from "@/components/itshover/mouse-pointer-2-icon";
import PlugConnectedIcon from "@/components/itshover/plug-connected-icon";
import ToggleIcon from "@/components/itshover/toggle-icon";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  {
    title: "Connect your toolkit",
    icon: PlugConnectedIcon,
    body: "Sign up, then paste the address and key of your own NCA Toolkit and your storage. That is the only thing you plug in.",
  },
  {
    title: "Pick an automation",
    icon: MousePointer2Icon,
    body: "Choose a ready-made automation for clips, captions, transcripts or audio. Want something else? Describe it and the agent builds it once.",
  },
  {
    title: "Turn it on",
    icon: ToggleIcon,
    body: "From then on it runs on every upload, every morning or whenever another tool calls it, without you and without AI.",
  },
];

export function HowItWorks() {
  return (
    <section className="how" id="how-it-works" aria-labelledby="how-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="how-title">
            <span className="keep">Set it up once.</span> <span className="keep">It runs from then on.</span>
          </h2>
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
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
