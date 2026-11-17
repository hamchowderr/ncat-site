import type React from "react";

export function Features() {
  return (
    <>
<section id="features" style={{"paddingTop": "48px"} as React.CSSProperties}>
  <div className="in">
    <div className="head c">
      <h2>AI sets it up. <span className="g">Plain editing runs it.</span></h2>
      <p className="lede">Clipping apps run AI on every video and bill you for it. Most of that work is plain editing: cut, resize, caption, join, level the audio, which FFmpeg has done for free for over 20 years. Here the AI does the setting up, once. The automation it builds does the editing, every time.</p>
    </div>
    <div className="setup">
      <div className="su-l">
        <h3>Describe it. The AI builds it.</h3>
        <p>Say what should happen to new content. The assistant picks the editing steps, pulls in your brand, runs a test on one of your recordings and shows you the files. You check it and turn it on.</p>
      </div>
      <div className="su-r" aria-hidden="true">
        <div className="su-say"><small>You</small>New episode in /Episodes: transcript, MP3, cut the silences, 9:16 clips at my markers with my captions, then send to my editor.</div>
        <div className="su-steps"><span>Watched folder</span><i>→</i><span>Transcribe</span><i>→</i><span>Remove silences</span><i>→</i><span>Cut + 9:16</span><i>→</i><span>Captions</span><i>→</i><span>Review</span></div>
        <div className="su-ok"><b>Test run passed</b> · 3 clips, 1 MP3, 1 transcript · ready to turn on</div>
      </div>
    </div>
    <div className="models">
      <div className="model">
        <div className="vis v1">
          <div className="lib" aria-hidden="true">
            <div className="lr h"><span>File</span><span>Length</span><span>Size</span><span>Status</span></div>
            <div className="lr"><span><b>Ep 44 · full episode</b><small>/Episodes · 4K · 30 fps · stereo</small></span><span>58:12</span><span>16:9</span><span className="tg ok">Transcribed</span></div>
            <div className="lr"><span><b>Ep 44 · clip 1</b><small>from 06:10 · captions on</small></span><span>0:41</span><span>9:16</span><span className="tg ok">Ready</span></div>
            <div className="lr"><span><b>Ep 44 · clip 2</b><small>from 21:38 · captions on</small></span><span>0:33</span><span>9:16</span><span className="tg rv">In review</span></div>
            <div className="lr"><span><b>B-cam · studio</b><small>/Raw · 1080p · 60 fps</small></span><span>57:50</span><span>16:9</span><span className="tg">Ready to clip</span></div>
          </div>
        </div>
        <h3>Organized and ready to clip</h3>
        <p>Every upload is filed, its details are read (length, size, frame rate, audio), and it gets a transcript. Recordings stop sitting in a downloads folder. They are searchable, sorted and ready for the next step.</p>
      </div>
      <div className="model">
        <div className="vis v2">
          <div className="hand" aria-hidden="true">
            <div className="hs"><span className="mono">AUTOMATED</span><b>Cut · 9:16 · captions · audio level</b><small>runs on every upload, no one touching it</small></div>
            <div className="ha">↓</div>
            <div className="ht"><span>CapCut</span><span>Premiere Pro</span><span>DaVinci Resolve</span><span>Final Cut</span><span>Your editor</span></div>
            <small className="hn">Export to editing apps is coming</small>
          </div>
        </div>
        <h3>Finish it anywhere</h3>
        <p>The automation does the repeatable part. Whatever still needs a human touch opens in your editing app, or goes to your editor with an approval step, already cut and labelled.</p>
      </div>
    </div>
  </div>
</section>

    </>
  );
}
