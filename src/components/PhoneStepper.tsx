"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * On a phone, a set of tabs becomes one row: back and next buttons either side of the one that is
 * showing, with a dot for each option under it. Nothing scrolls sideways and nothing opens over the page.
 * Desktop keeps its tab row; CSS shows one or the other.
 */
export function PhoneStepper({
  items,
  active,
  onChange,
  label,
  controls,
}: {
  items: { id: string; label: string; icon?: ReactNode }[];
  active: number;
  onChange: (i: number) => void;
  label: string;
  controls: string;
}) {
  const n = items.length;
  const go = (d: number) => onChange((active + d + n) % n);
  const item = items[active];
  return (
    <div className="stepper" role="group" aria-label={label}>
      <div className="stepper-row">
        <button type="button" className="stepper-btn" aria-label={`Previous: ${items[(active - 1 + n) % n].label}`} aria-controls={controls} onClick={() => go(-1)}>
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
        <div className="stepper-now" aria-live="polite">
          {item.icon && (
            <span className="stepper-icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span key={item.id} className="stepper-label">
            {item.label}
          </span>
        </div>
        <button type="button" className="stepper-btn" aria-label={`Next: ${items[(active + 1) % n].label}`} aria-controls={controls} onClick={() => go(1)}>
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
      </div>
      <div className="stepper-dots">
        {items.map((x, i) => (
          <button key={x.id} type="button" className="stepper-dot" aria-label={`${x.label} (${i + 1} of ${n})`} aria-current={i === active ? "true" : undefined} aria-controls={controls} onClick={() => onChange(i)}>
            <i />
          </button>
        ))}
      </div>
    </div>
  );
}
