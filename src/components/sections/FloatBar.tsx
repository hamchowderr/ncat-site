import type React from "react";

export function FloatBar() {
  return (
    <>
<div className="float" id="float" aria-hidden="true">
  <form className="ask" id="floatForm" autoComplete="off">
    <svg className="ic ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M12.5 6.5L18 12l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
    <label htmlFor="floatInput" style={{"position": "absolute", "left": "-9999px"} as React.CSSProperties}>Describe an automation</label>
    <input id="floatInput" type="text" placeholder="Describe an automation…" tabIndex={-1} />
    <button className="btn w sm" type="submit" tabIndex={-1}>Set it up</button>
  </form>
</div>

    </>
  );
}
