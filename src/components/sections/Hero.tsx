import type React from "react";

export function Hero() {
  return (
    <>
<section className="hero">
  <div className="in">
    <h1 className="rise d1">Your content, organized and <span className="pill"><span id="rot">clipped</span></span> automatically</h1>
    <p className="lede rise d2">Tell the AI the job in plain words. It sets up the automation, tests it on your real recordings and turns it on. From then on every new recording is filed, transcribed, cut and captioned with plain editing steps, no AI per video. Whatever is left goes to your editing app or your editor.</p>
    <div className="ask-row rise d3">
      <form className="ask" id="askForm" autoComplete="off">
        <svg className="ic ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M12.5 6.5L18 12l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
        <label htmlFor="askInput" className="sr" style={{"position": "absolute", "left": "-9999px"} as React.CSSProperties}>Describe an automation</label>
        <input id="askInput" type="text" placeholder="Every new episode → transcript, MP3 and captioned clips" />
        <button className="btn w" type="submit">Set it up</button>
      </form>
    </div>
    <div className="chips rise d4" aria-label="Example automations">
      <button type="button">Podcast → vertical clips</button>
      <button type="button">Caption every upload</button>
      <button type="button">Remove silences</button>
      <button type="button">Transcript + show notes</button>
      <button type="button">One upload, every shape</button>
      <button type="button">Weekly highlight reel</button>
    </div>
    <p className="note rise d4">Built on the free, open-source NCA Toolkit · AI sets it up · plain editing runs it · no per-video fees</p>
    <div className="showcase rise d4">
      <div className="reel">
        <div className="mcard" aria-label="Animated example: a 58 minute episode is filed, transcribed, cut into vertical clips and captioned automatically, ready to review">
          <div className="flow-demo">
            <div className="src">
              <span className="label"><b>Trigger</b> New file in /Episodes · 2:14 AM</span>
              <div className="wide"><div className="mics"><i style={{"left": "30.5%"} as React.CSSProperties} /><i style={{"left": "66.5%"} as React.CSSProperties} /></div><span className="dur">58:12</span></div>
              <div className="track"><div className="wave" id="wave" />
                <div className="seg" style={{"left": "10.6%", "width": "4%"} as React.CSSProperties} /><div className="seg" style={{"left": "37.2%", "width": "3.4%"} as React.CSSProperties} /><div className="seg" style={{"left": "75.7%", "width": "4.6%"} as React.CSSProperties} />
                <div className="playhead" id="playhead" /></div>
              <div className="steps-live" aria-live="polite"><span className="chip">File + details</span><span className="chip">Transcribe</span><span className="chip">Cut + 9:16</span><span className="chip">Captions</span><span className="chip">Ready</span></div>
            </div>
            <div className="arrow" aria-hidden="true"><svg viewBox="0 0 70 24"><defs><linearGradient id="ag" x1={0} x2={1}><stop offset={0} stopColor="#ff5b3a" /><stop offset={1} stopColor="#ffd23f" /></linearGradient></defs><path d="M2 12 H62 M54 4 L64 12 L54 20" fill="none" stroke="url(#ag)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className="outs">
              <div className="phone"><div className="scene" /><span className="plat"><svg className="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>TikTok</span><div className="cap" data-words="Nobody tells you this about growing a channel" /><span className="posted">ready 2:23 AM</span></div>
              <div className="phone"><div className="scene" /><span className="plat"><svg className="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>Shorts</span><div className="cap" data-words="We cut our editing bill to almost zero" /><span className="posted">ready 2:23 AM</span></div>
              <div className="phone"><div className="scene" /><span className="plat"><svg className="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" /></svg>Reels</span><div className="cap" data-words="Post every day without touching an editor" /><span className="posted">ready 2:24 AM</span></div>
            </div>
          </div>
          <div className="mcard-foot">
            <span className="who"><b>Weekly podcast clips</b> · ran on its own while the team slept, no AI used · 9m 12s</span>
            <button className="replay" id="replay" type="button"><svg className="ico" style={{"width": "14px", "height": "14px"} as React.CSSProperties} viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>Replay</button>
          </div>
        </div>
        <div className="peek" aria-hidden="true"><span>Remove silences</span></div>
      </div>
    </div>
  </div>
</section>

    </>
  );
}
