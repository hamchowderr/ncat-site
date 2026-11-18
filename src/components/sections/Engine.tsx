import Image from "next/image";
import tower from "@/assets/ffmpeg-tower.jpg";
import { BrandIcon, icons } from "@/components/brand/Logo";
import { Reveal } from "@/components/Reveal";

export function Engine() {
  return (
    <section className="engine" aria-labelledby="engine-title">
      <div className="wrap engine-in">
        <figure className="engine-pic">
          <Image
            src={tower}
            alt="Cartoon tower of platform logos, YouTube, Netflix, X, Instagram, Facebook, Twitch, TikTok and Pornhub, all resting on one small block labelled FFmpeg"
            sizes="(max-width: 800px) 70vw, 340px"
          />
        </figure>
        <Reveal className="engine-text">
          <h2 id="engine-title">The internet’s video rests on one free project</h2>
          <p>
            The biggest video platforms process their uploads with <BrandIcon icon={icons.ffmpeg} />
            FFmpeg underneath. It has cut, resized, captioned and converted video for over 20
            years, and it costs nothing to run.
          </p>
          <p>
            The NCA Toolkit puts FFmpeg behind a simple API on your own server. This dashboard turns that into automations anyone on your team can
            read, so the same engine does your editing without a meter on every minute.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
