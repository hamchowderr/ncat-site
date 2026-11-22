/**
 * The ask, straight after the scene that shows the whole idea, so nobody has to scroll to the end of the page to sign up.
 */
export function MidCta() {
  return (
    <section className="mid-cta" aria-labelledby="mid-cta-title">
      <div className="wrap">
        <div className="mid-cta-in">
          <h2 id="mid-cta-title">
            Use AI once. Every recording after that runs by itself.
          </h2>
          <p>
            Build your content factory once. From then on it runs on a server or
            an always-on machine you own, with no fee for each video.
          </p>
          <a className="btn primary" href="#early">
            Get early access
          </a>
        </div>
      </div>
    </section>
  );
}
