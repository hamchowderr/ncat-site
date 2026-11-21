import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoResults } from "@/components/DemoResults";
import { viewOf } from "@/lib/demo/run";
import { blobStore, demoSecret, keyMatches } from "@/lib/demo/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your clips", robots: { index: false, follow: false } };

/** The link in the "your clips are ready" email: one visitor's run, opened by its key. */
export default async function ClipsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }) {
  const { id } = await params;
  const { k } = await searchParams;
  const secret = demoSecret();
  if (!secret || !keyMatches(id, k, secret)) notFound();
  const found = await blobStore.load(id).catch(() => null);
  if (!found) notFound();
  return (
    <section className="try clips-page" aria-labelledby="clips-title">
      <div className="wrap">
        <div className="sec-head">
          <h1 id="clips-title">Your clips from {found.demo.fileName}</h1>
          <p>Made by the toolkit from your video. They stay here for 7 days.</p>
        </div>
        <DemoResults id={id} k={k!} fileName={found.demo.fileName} initial={viewOf(found.demo)} />
      </div>
    </section>
  );
}
