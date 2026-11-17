import type React from "react";

export function SetupOnce() {
  return (
    <>
<section style={{"paddingTop": "0"} as React.CSSProperties}>
  <div className="in">
    <div className="head c">
      <h2>Set it up once. It runs from then on.</h2>
    </div>
    <div className="tl">
      <div><span className="dot">1</span><h3>Describe it</h3><p>Tell the assistant the job in plain words, or start from a template.</p></div>
      <div><span className="dot">2</span><h3>AI sets it up</h3><p>It lays out the editing steps, pulls in your brand and folders, and tests it on a real recording.</p></div>
      <div><span className="dot">3</span><h3>You check it</h3><p>Look at the files it made and the map of steps. Change anything you want.</p></div>
      <div><span className="dot">4</span><h3>Turn it on</h3><p>On every upload, every morning, or every Friday at 9. It runs without you, and without AI.</p></div>
      <div><span className="dot">5</span><h3>Finish anywhere</h3><p>Anything that needs a human goes to your editing app or your editor, ready to work on.</p></div>
    </div>
  </div>
</section>

    </>
  );
}
