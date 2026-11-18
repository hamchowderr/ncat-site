import { Reveal } from "@/components/Reveal";
import { ShapeShifter } from "@/components/ShapeShifter";

export function PlatformExpert() {
  return (
    <section className="platforms" aria-labelledby="platforms-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="platforms-title">It knows every feed you post to</h2>
          <p>The agent knows each platform’s shapes, lengths and formats, and builds clips that fit them, starting with the main ones.</p>
        </Reveal>
        <ShapeShifter />
      </div>
    </section>
  );
}
