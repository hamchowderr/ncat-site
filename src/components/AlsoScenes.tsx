import { ArrowRight, Check, FileVideo, MessageSquareText, Mic, Sparkles, Upload } from "lucide-react";
import { SlackMark } from "@/components/brand/AppLogos";

export type AlsoSceneName = "chat" | "clients" | "steps" | "files" | "tours";

/**
 * Small drawn scenes of each feature, built from the same pieces the dashboard uses
 * (rows, pills, a progress bar, a tour bubble). Decorative: the card's words say it all.
 */
export function AlsoScene({ name }: { name: AlsoSceneName }) {
  return (
    <div className={`scene scene-${name}`} aria-hidden="true">
      {name === "chat" && <ChatScene />}
      {name === "clients" && <ClientsScene />}
      {name === "steps" && <StepsScene />}
      {name === "files" && <FilesScene />}
      {name === "tours" && <ToursScene />}
    </div>
  );
}

function ChatScene() {
  return (
    <div className="chat">
      <p className="chat-chan">
        <SlackMark /> # content-team
      </p>
      <div className="msg">
        <span className="ava ava-you">MO</span>
        <div>
          <p className="msg-who">Maya</p>
          <p className="msg-bubble">
            <b>@Kontifi</b> cut Monday’s stream into three TikTok clips
          </p>
        </div>
      </div>
      <div className="msg msg-bot">
        <span className="ava ava-bot">
          <Sparkles size={14} strokeWidth={2.2} />
        </span>
        <div>
          <p className="msg-who">Kontifi</p>
          <p className="msg-bubble">
            Done. Three captioned clips are waiting in Review <ArrowRight size={13} strokeWidth={2.4} />
          </p>
        </div>
      </div>
      <div className="msg msg-voice">
        <span className="ava ava-you">JR</span>
        <p className="voice">
          <Mic size={14} strokeWidth={2.2} />
          <span className="voice-wave">
            {Array.from({ length: 18 }, (_, i) => (
              <i key={i} style={{ height: `${28 + 72 * Math.abs(Math.sin(i * 1.7))}%` }} />
            ))}
          </span>
          <span className="voice-len">0:08</span>
        </p>
      </div>
    </div>
  );
}

function ClientsScene() {
  return (
    <div className="portal">
      <p className="portal-top">
        <span className="portal-ava">NS</span>
        <span>
          <b>Northside Studio</b>
          <small>3 clips to review</small>
        </span>
      </p>
      <div className="portal-thumbs">
        <span />
        <span />
        <span />
      </div>
      <p className="portal-acts">
        <span className="pa-yes">
          <Check size={13} strokeWidth={2.6} /> Approve
        </span>
        <span className="pa-ask">Ask for changes</span>
      </p>
    </div>
  );
}

function StepsScene() {
  return (
    <div className="steps-s">
      <p className="ask">
        <MessageSquareText size={14} strokeWidth={2.2} />
        <span className="ask-type">Fade in from black for two seconds</span>
      </p>
      <div className="made">
        <span className="made-icon">
          <Sparkles size={15} strokeWidth={2.2} />
        </span>
        <span>
          <b>Fade in</b>
          <small>
            <Check size={12} strokeWidth={2.6} /> Tried on a file
          </small>
        </span>
        <span className="made-save">Saved</span>
      </div>
    </div>
  );
}

function FilesScene() {
  return (
    <div className="files-s">
      <p className="file-row">
        <FileVideo size={16} strokeWidth={2} />
        <span className="file-name">full-day-shoot.mov</span>
        <Upload size={14} strokeWidth={2.2} className="file-up" />
      </p>
      <div className="parts">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} style={{ "--p": i } as React.CSSProperties} />
        ))}
      </div>
      <p className="vs">
        <span className="vs-on">Version 1</span>
        <span>Version 2</span>
      </p>
    </div>
  );
}

function ToursScene() {
  return (
    <div className="tour">
      <div className="tour-bar">
        <span className="tour-dot" />
        <span className="tour-line" />
        <span className="tour-line short" />
      </div>
      <div className="tour-tip">
        <p>Runs land here. Open one to see each step.</p>
        <p className="tour-foot">
          <span>2 of 5</span>
          <span className="tour-next">Next</span>
        </p>
      </div>
    </div>
  );
}
