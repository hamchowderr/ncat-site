import { EarlyAccessDialog } from "@/components/EarlyAccessDialog";
import { Mail } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_HREF } from "@/lib/contact";

/** The close of the page: one clear ask, centred, with email as the quieter second route. */
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
            <p>Questions first? Send an email.</p>
            <a href={CONTACT_HREF}>
              <Mail size={18} aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <EarlyAccessDialog />
      </div>
    </section>
  );
}
