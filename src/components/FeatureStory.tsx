"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import ScrollStack, { ScrollStackItem } from "@/components/reactbits/ScrollStack/ScrollStack";
import { FeatureVideo } from "@/components/FeatureVideo";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type StoryRow = {
  id: string;
  step: string;
  icon: ReactNode;
  title: string;
  body: string;
  points: string[];
  video: string;
  alt: string;
  extra?: ReactNode;
};

const WIDE = "(min-width: 1000px) and (min-height: 700px)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia?.(WIDE);
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
}

function Row({ r }: { r: StoryRow }) {
  return (
    <article className="row story-row" id={r.id}>
      <div className="row-text">
        <h3>{r.title}</h3>
        <p>{r.body}</p>
        <ul className="ticks">
          {r.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        {r.extra}
      </div>
      <FeatureVideo name={r.video} label={r.alt} />
    </article>
  );
}

/**
 * The four main features as one story: on a wide screen each one is a card that pins and
 * stacks on the last as you scroll. On phones, and for visitors who turn motion off, they are
 * plain rows one after another.
 */
export function FeatureStory({ rows }: { rows: StoryRow[] }) {
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia?.(WIDE).matches ?? false, () => false);
  const reduce = useReducedMotion();

  if (!wide || reduce) {
    return (
      <div className="rows story-plain">
        {rows.map((r) => (
          <div className="story-card" key={r.id}>
            <Row r={r} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <ScrollStack
      className="story-stack"
      useWindowScroll
      smoothScroll={false}
      stackPosition="96px"
      itemDistance={64}
      itemStackDistance={22}
      baseScale={0.94}
      itemScale={0.02}
      dimAmount={0.05}
      holdDistance={160}
    >
      {rows.map((r) => (
        <ScrollStackItem key={r.id} itemClassName="story-card">
          <Row r={r} />
        </ScrollStackItem>
      ))}
    </ScrollStack>
  );
}
