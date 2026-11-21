import Image from "next/image";
import tower from "@/assets/ffmpeg-tower.jpg";
import { BrandIcon, icons } from "@/components/brand/Logo";
import { Reveal } from "@/components/Reveal";

/** The ways people use the free engine today, from "you do every step" to "it runs by itself". */
export const WAYS: { name: string; how: string; leaves: string; ours?: boolean }[] = [
  {
    name: "The engine alone",
    how: "Send requests to the toolkit's API from your own scripts.",
    leaves: "Every new job is new code, and every failure is yours to catch.",
  },
  {
    name: "An AI agent on your computer",
    how: "Ask Claude Code or another agent to edit each video through the toolkit or FFmpeg.",
    leaves: "Sitting with it every time, using up your plan's limits or API credits, laptop open.",
  },
  {
    name: "n8n with the engine",
    how: "It comes with the toolkit, though many people never set it up.",
    leaves: "Wiring each request and typing expressions by hand, with no library, review or brand settings.",
  },
  {
    name: "social-clips, our free version",
    how: "Clone it and run it yourself for one job: turning videos into social clips.",
    leaves: "Just that one job, without the builder, imports, teams, approvals or the agent.",
  },
  {
    name: "Takewon, the fine-tuned shell",
    how: "Switch on ready-made automations, or describe a new one and the agent sets it up.",
    leaves: "Recordings come in, get processed, wait for your yes and land organized, on brand, with no AI used per video.",
    ours: true,
  },
];

export function Engine() {
  return (
    <section className="engine" id="engine" aria-labelledby="engine-title">
      <div className="wrap">
        <div className="engine-in">
          <figure className="engine-pic">
            <Image
              src={tower}
              alt="Cartoon tower of platform logos, YouTube, Netflix, X, Instagram, Facebook, Twitch, TikTok and Pornhub, all resting on one small block labelled FFmpeg"
              sizes="(max-width: 800px) 70vw, 340px"
            />
          </figure>
          <Reveal className="engine-text">
            <h2 id="engine-title">Free engine. Fine-tuned shell.</h2>
            <p>
              The biggest video platforms process their uploads with <BrandIcon icon={icons.ffmpeg} />
              FFmpeg underneath. It has cut, resized, captioned and converted video for over 20 years, and it costs nothing to run.
            </p>
            <p>
              The NCA Toolkit puts FFmpeg and transcription behind an API on your own server. It is free and open source, and it has no screens:
              no accounts, no schedule, nothing that runs on its own. Takewon is the fine-tuned shell we built around it, so the engine runs your
              content by itself. You pay for the shell, never for the processing.
            </p>
          </Reveal>
        </div>

        <div className="ways">
          <h3 className="ways-title">Five ways to use the free engine</h3>
          <div className="ways-scale" aria-hidden="true">
            <span>You do the work</span>
            <span>It runs by itself</span>
          </div>
          <ol className="ways-list">
            {WAYS.map((w) => (
              <li key={w.name} className={w.ours ? "ours" : undefined}>
                <span className="ways-dot" aria-hidden="true" />
                <h4>{w.name}</h4>
                <p className="ways-how">{w.how}</p>
                <p className="ways-leaves">
                  <span className="ways-k">{w.ours ? "What happens" : "Leaves you"}</span>
                  {w.leaves}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
