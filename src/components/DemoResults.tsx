"use client";

import { DemoClips, DemoSteps, useDemoRun } from "@/components/DemoRun";
import type { DemoView } from "@/lib/demo/run";

/** A run on its own page: the steps while it works, then the clips. */
export function DemoResults({ id, k, fileName, initial }: { id: string; k: string; fileName: string; initial: DemoView }) {
  const { view } = useDemoRun(initial.stage === "running" || initial.stage === "upload" ? id : null, k, initial);
  const v = view ?? initial;
  if (v.stage === "done") {
    return (
      <>
        {v.partial && <p className="try-next-note">{v.partial}</p>}
        <DemoClips clips={v.clips} fileName={fileName} />
      </>
    );
  }
  return (
    <>
      <DemoSteps steps={v.steps} />
      {v.stage === "failed" && (
        <p className="try-error" role="alert">
          {v.error ?? "This one couldn’t be finished."}
        </p>
      )}
    </>
  );
}
