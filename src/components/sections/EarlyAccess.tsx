import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";
import { siInstagram } from "simple-icons";

export function EarlyAccess() {
  return (
    <section className="early" id="early" aria-labelledby="early-title">
      <div className="wrap early-in">
        <header className="early-head">
          <h2 id="early-title">Get early access</h2>
          <p>
            Four short steps: who you are, what you make, where it would run and what you want automated. It takes about two minutes, and I reply to
            everyone myself.
          </p>
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
        </header>
        <EarlyAccessForm />
      </div>
    </section>
  );
}
