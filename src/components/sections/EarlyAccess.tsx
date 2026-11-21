import { EarlyAccessDialog } from "@/components/EarlyAccessDialog";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";
import { siInstagram } from "simple-icons";

/** The close of the page: one clear ask, centred, with messaging Chowderr as the quieter second route. */
export function EarlyAccess() {
  return (
    <section className="early" id="early" aria-labelledby="early-title">
      <div className="wrap">
        <div className="early-in">
          <h2 id="early-title">Get early access</h2>
          <p className="early-lede">
            Four short steps: who you are, what you make, where it would run and what you want automated. It takes about two minutes, and I reply to everyone
            myself.
          </p>
          <div className="early-cta">
            <a className="btn primary lg" href="#early">
              Get early access
            </a>
          </div>
          <div className="socials">
            <p>Or message Chowderr and say “dashboard”.</p>
            <a href="https://www.instagram.com/hamchowderr">
              <BrandIcon icon={siInstagram} /> Instagram
            </a>
            <a href="https://www.linkedin.com/in/tylanmiller">
              <FileLogo name="linkedin" size={20} /> LinkedIn
            </a>
            <a href="https://x.com/hamchowderr">
              <BrandIcon icon={icons.x} /> X
            </a>
          </div>
        </div>
        <EarlyAccessDialog />
      </div>
    </section>
  );
}
