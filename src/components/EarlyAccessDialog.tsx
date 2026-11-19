"use client";

import { useEffect, useRef, useState } from "react";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { OPEN_EVENT, type OpenDetail, isEarlyAccessLink } from "@/lib/prefill";

/**
 * The early-access form as a pop-up, so signing up never means scrolling to the bottom.
 * Every "Get early access" link (href "#early") opens it, and so does arriving on the page
 * with #early in the address. Escape, the close button or a click outside closes it.
 */
export function EarlyAccessDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const after = useRef<OpenDetail["onSent"]>(undefined);
  const [tried, setTried] = useState("");
  // A fresh form after a finished sign-up is closed; a half-filled one keeps its answers.
  const [round, setRound] = useState(0);
  const sent = useRef(false);

  useEffect(() => {
    const open = (detail?: OpenDetail) => {
      const d = dialog.current;
      if (!d) return;
      after.current = detail?.onSent;
      if (detail?.tried) setTried(detail.tried);
      if (!d.open) d.showModal();
    };
    const onOpen = (e: Event) => open((e as CustomEvent<OpenDetail>).detail);
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link || !isEarlyAccessLink(link.getAttribute("href"))) return;
      e.preventDefault();
      open();
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    // Capture, so it runs before a Next.js <Link> starts its own navigation.
    document.addEventListener("click", onClick, true);
    if (location.hash === "#early") open();
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      className="ea-dialog"
      aria-labelledby="ea-dialog-title"
      onClick={(e) => {
        // a click on the dimmed backdrop lands on the dialog itself
        if (e.target === e.currentTarget) close();
      }}
      onClose={() => {
        after.current = undefined;
        if (sent.current) {
          sent.current = false;
          setRound((r) => r + 1);
        }
      }}
    >
      <div className="ea-dialog-in">
        <header className="ea-dialog-head">
          <h2 id="ea-dialog-title">Get early access</h2>
          <button type="button" className="ea-dialog-x" aria-label="Close" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <EarlyAccessForm
          key={round}
          tried={tried}
          onSent={() => {
            sent.current = true;
            after.current?.();
            after.current = undefined;
          }}
        />
      </div>
    </dialog>
  );
}
