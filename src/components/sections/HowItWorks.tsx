const STEPS = [
  {
    title: "Connect your toolkit",
    body: "Sign up, then paste the address and key of your own NCA Toolkit and your storage. That is the only thing you plug in.",
  },
  {
    title: "Describe the job",
    body: "Tell the agent what should happen to new content, or pick a template. Check the test run and change anything you want.",
  },
  {
    title: "Turn it on",
    body: "From then on it runs on every upload, every morning or whenever another tool calls it, without you and without AI.",
  },
];

export function HowItWorks() {
  return (
    <section className="how" id="how-it-works" aria-labelledby="how-title">
      <div className="wrap">
        <header className="sec-head">
          <h2 id="how-title">
            <span className="keep">Set it up once.</span> <span className="keep">It runs from then on.</span>
          </h2>
        </header>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="step-n" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
