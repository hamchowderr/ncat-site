import { Bot } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ShapeShifter } from "@/components/ShapeShifter";

export function PlatformExpert() {
  return (
    <section className="platforms" aria-labelledby="platforms-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="agent-badge">
            <span className="agent-badge-icon" aria-hidden="true">
              <Bot size={16} strokeWidth={2.2} />
            </span>
            Kontifi’s agent
          </p>
          <h2 id="platforms-title">It knows every feed you post to</h2>
          <p>
            The agent knows each platform’s shapes, lengths and formats, and builds clips that fit them, starting with the main ones.
            Every clip comes out in your brand: your caption style, logo, colours and font.
          </p>
        </Reveal>
        <ShapeShifter />
      </div>
    </section>
  );
}
