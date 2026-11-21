"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = { id: string; title: string; icon: ReactNode; level: 3 | 4; defaultOpen?: boolean; children: ReactNode };

/**
 * On a phone a feature tile folds into one row, its icon and title, that opens to show the recording and
 * the words; the first one starts open. On a wider screen the row is hidden and the tile always shows in full.
 */
export function PhoneFold({ id, title, icon, level, defaultOpen, children }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const Heading = level === 3 ? "h3" : "h4";
  return (
    <div className="fold" data-open={open ? "" : undefined}>
      <Heading className="fold-title">
        <button type="button" className="fold-head" aria-expanded={open} aria-controls={`${id}-fold`} onClick={() => setOpen((o) => !o)}>
          <span className="tile-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="fold-name">{title}</span>
          <ChevronDown className="fold-chev" size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </Heading>
      <div className="fold-body" id={`${id}-fold`}>
        {children}
      </div>
    </div>
  );
}
