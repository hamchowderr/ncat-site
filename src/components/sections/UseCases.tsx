import type React from "react";

export function UseCases() {
  return (
    <>
<section id="use-cases" style={{"paddingTop": "0"} as React.CSSProperties}>
  <div className="in">
    <div className="head c"><h2>Built for the people who were in the room</h2></div>
    <div style={{"textAlign": "center"} as React.CSSProperties}><div className="tabs" role="tablist" aria-label="Use cases">
        <button role="tab" id="t1" aria-controls="p1" aria-selected="true" type="button">Creators</button>
        <button role="tab" id="t2" aria-controls="p2" aria-selected="false" type="button">Editing agencies</button>
        <button role="tab" id="t3" aria-controls="p3" aria-selected="false" type="button">Podcast teams</button>
        <button role="tab" id="t4" aria-controls="p4" aria-selected="false" type="button">Music video teams</button>
      </div></div>
    <div className="panel" role="tabpanel" id="p1" aria-labelledby="t1">
      <div><h3>Record once. Clips all week.</h3><p>Upload your long video and it is filed, transcribed and cut into captioned clips for every platform on its own. Open the ones that need a touch in your editor. No per-minute fees.</p></div>
      <div className="week"><div><span>MON</span>Long video up, transcript done</div><div><span>TUE</span>Clip 1, vertical, captioned, ready</div><div><span>WED</span>Clip 2 plus a thumbnail</div><div><span>THU</span>Clip 3 and an audio version</div></div>
    </div>
    <div className="panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>
      <div><h3>One workflow per client. Running forever.</h3><p>Set up each client’s automation once, add an approval step, and let it run. Your editors spend their time on the creative work, and more clients doesn’t mean a bigger software bill.</p></div>
      <div className="week"><div><span>CLI A</span>12 shorts captioned, awaiting approval</div><div><span>CLI B</span>Podcast cut to clips, sent to the editor</div><div><span>CLI C</span>Thumbnails for 6 videos</div><div><span>YOU</span>Every run in one list</div></div>
    </div>
    <div className="panel" role="tabpanel" id="p3" aria-labelledby="t3" hidden>
      <div><h3>Every episode, handled the same way.</h3><p>Transcript, audio, clips and captions on every new episode, every time, filed where the team expects them.</p></div>
      <div className="week"><div><span>00:00</span>Episode lands in your folder</div><div><span>+04m</span>Transcript and MP3 ready</div><div><span>+09m</span>3 captioned vertical clips</div><div><span>+10m</span>In the review queue</div></div>
    </div>
    <div className="panel" role="tabpanel" id="p4" aria-labelledby="t4" hidden>
      <div><h3>One master and one cover. The whole release.</h3><p>Drop in the finished track and the artwork. Every version a release needs is made the same way each time, so the team stays on the shoot and the edit.</p></div>
      <div className="week"><div><span>16:9</span>Cover art video with a waveform</div><div><span>9:16</span>Vertical short for every feed</div><div><span>LYRIC</span>Lyric video from your own lyrics</div><div><span>LOOP</span>Spotify Canvas loop and a thumbnail</div></div>
    </div>
  </div>
</section>

    </>
  );
}
