# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Creators** who record long-form content (podcasts, streams, lectures, music, talks) and want it filed, transcribed, cut and captioned without sitting in an editor for every upload.
- **Editing agencies and media teams** who run the same edit jobs for many clients and want them to run unattended, with approvals before anything goes out.
- First audience: people Chowderr met at his talks (Claude Code Creators Summit, a16z Tech Week Los Angeles, The KINN). They are technical enough to run a server or an always-on machine.

## Product Purpose
A fine-tuned shell around the free, open-source NCA Toolkit (Stephen G. Pope's media-processing API), never "just a dashboard". The toolkit is a headless engine: an API with no screens, accounts or scheduling; it ships with n8n, which many buyers never set up. Buyers otherwise use it alone with scripts, with an AI agent on their own computer (burning plan limits or credits every session), with n8n, or via the free social-clips version. We sell the shell, never the processing. The buyer describes an editing job in plain words; an AI agent builds the automation on a visual canvas, tests it on real recordings and turns it on. From then on, plain editing steps (FFmpeg and Whisper through the toolkit) run on every new recording with no AI per video. Whatever still needs a human goes to the buyer's editing app or their editor, cut and labelled. Success: content is organized and ready to clip, and nobody pays per-minute fees to edit their own content.

## Positioning
- "AI sets it up. Plain editing runs it." Using AI to edit every video is not automation; most jobs need no AI at all once set up.
- Own your version, not a SaaS: one-time purchase, runs on a server or always-on machine the buyer controls, on their own storage.
- Built on the same engine the internet's video already runs on (FFmpeg), which competitors meter by the minute.
- Competitors (Opus Clip, Submagic, Vizard, Klap, Descript, Riverside, Captions) sell a person pressing a button per video and meter usage. Some can automate via APIs or third-party tools, so never claim nobody else automates.

## Operating Context
- Automations start from a new upload, a watched folder, a schedule, a webhook, or n8n. They run inside the dashboard; n8n is optional.
- Hosting: a rented server, or the buyer's own machine that stays on 24/7 and meets the specs (a Mac Mini is the example). Never say "no server required".
- Finish anywhere: export to CapCut, Premiere Pro, DaVinci Resolve, Final Cut (coming; CapCut gets clip packs, not timelines).
- Posting to platforms goes direct through each platform's own API, no aggregators, and is built last.

## Capabilities and Constraints
- Working name "NCA Dashboard"; no product name yet. Do not propose names.
- Offer: one price for the dashboard plus a 4-week group cohort with Chowderr, no seat cap. No dashboard-only option. No pricing by team size. Price not set: never invent one, or any credit amount.
- Hosted-by-Chowderr version with starting credits is planned ("for now"); updates included "for now".
- Free rung: social-clips (a smaller clone-it-yourself app). Video editing skills plugin exists; price not announced.
- Private repo access on purchase; follows the toolkit's GPL-2.0.
- Not built and never planned: text-to-video, AI dubbing, AI avatars.
- Never mention Make or Zapier (the toolkit cannot be used there). No paid posting aggregators (Ayrshare, Upload-Post).
- Status: in development; screens shown are early designs. Early access is via the form or Chowderr's socials.

## Brand Commitments
- By Tylan "Chowderr" Miller and Otaku Solutions. The toolkit is Stephen G. Pope's; the dashboard is a separate product that works with it.
- Real logos for every company or platform named, never stand-ins.
- Chowderr's taste (stated): no heavy box outlines or divider lines; nothing overlaying content; seamless transitions; no sparkle/star "AI" icons; it should look like a real website, as creative as Opus Clip, not a document.

## Evidence on Hand
- Talks given: Claude Code Creators Summit, a16z Tech Week LA, The KINN (logos in the current site).
- FFmpeg dependency drawing from the KINN talk (`src/assets/ffmpeg-tower.jpg`).
- Real dashboard screens exist in `ncat-dash` (automation canvas, files page, review room) and explainer videos made with HyperFrames.
- No customers, testimonials, user counts or benchmarks exist. Never fabricate them.

## Product Principles
1. Automation that runs by itself beats AI that edits per video.
2. Own it: no meters, no seats, your storage, your server.
3. Show the mechanism (the canvas, the files, the runs), don't claim it.
4. Hand off cleanly: the last mile belongs to an editor or an editing app.
5. Plain words over jargon, for people and for the AI agent alike.
