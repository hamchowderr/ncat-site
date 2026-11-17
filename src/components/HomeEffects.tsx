"use client";

import { useEffect } from "react";

/**
 * Motion and small behaviours for the home page: rotating headline word, typed
 * ask-bar placeholder, example chips, floating ask bar, automation canvas edges,
 * the hero media demo and the use-case tabs. Ported from the design prototype;
 * everything respects prefers-reduced-motion.
 */
export function HomeEffects() {
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const intervals: number[] = [];
    let timers: number[] = [];
    let raf = 0;
    let typeTimer = 0;
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof WindowEventMap>(t: EventTarget, ev: K | string, fn: EventListener, opts?: AddEventListenerOptions) => {
      t.addEventListener(ev, fn, opts);
      cleanups.push(() => t.removeEventListener(ev, fn, opts));
    };
    const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel as string) as T | null;
    const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel as string));

    /* Rotating headline phrase */
    const rot = $("#rot");
    const phrases = ["clipped", "captioned", "transcribed", "resized", "ready to edit"];
    let pi = 0;
    if (rot && !reduce)
      intervals.push(
        window.setInterval(() => {
          rot.classList.add("out");
          timers.push(window.setTimeout(() => { pi = (pi + 1) % phrases.length; rot.textContent = phrases[pi]; rot.classList.remove("out"); }, 350));
        }, 2600),
      );

    /* Ask bar: typed placeholder, chips fill it, submit goes to early access */
    const input = $<HTMLInputElement>("#askInput");
    const prompts = ["Caption every video I drop in /Raw", "Cut the silences out of every lecture", "Every upload → 9:16, 1:1 and 16:9 versions", "New episode → transcript, MP3 and clips for my editor"];
    let pIdx = 0, cIdx = 0, typing = true;
    const type = () => {
      if (!input) return;
      if (document.activeElement === input || input.value) { typeTimer = window.setTimeout(type, 800); return; }
      const p = prompts[pIdx];
      if (typing) { cIdx++; if (cIdx > p.length) { typing = false; typeTimer = window.setTimeout(type, 1600); return; } }
      else { cIdx -= 2; if (cIdx <= 0) { cIdx = 0; typing = true; pIdx = (pIdx + 1) % prompts.length; } }
      input.setAttribute("placeholder", p.slice(0, cIdx) || " ");
      typeTimer = window.setTimeout(type, typing ? 45 : 18);
    };
    if (!reduce) type();
    $$<HTMLButtonElement>(".chips button").forEach((b) => on(b, "click", () => { if (input) { input.value = b.textContent ?? ""; input.focus(); } }));
    const early = $("#early");
    const toEarly: EventListener = (e) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const text = form.querySelector("input")?.value ?? "";
      const job = $<HTMLTextAreaElement>("#ea-job");
      if (job && text && !job.value) job.value = text;
      early?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", "#early");
    };
    $$("#askForm, #floatForm").forEach((f) => on(f, "submit", toEarly));

    /* Floating bar after the hero, hidden near the final call to action */
    const float = $("#float"), hero = $(".hero");
    const onScroll = () => {
      if (!float || !hero || !early) return;
      const show = hero.getBoundingClientRect().bottom < 0 && early.getBoundingClientRect().top > window.innerHeight;
      float.classList.toggle("show", show);
      float.setAttribute("aria-hidden", show ? "false" : "true");
      float.querySelectorAll<HTMLElement>("input,button").forEach((el) => { el.tabIndex = show ? 0 : -1; });
    };
    on(window, "scroll", onScroll, { passive: true });

    /* Canvas edges */
    const drawCanvas = (canvas: HTMLElement) => {
      if (!canvas.offsetParent) return;
      const svg = canvas.querySelector("svg"); if (!svg) return;
      const cr = canvas.getBoundingClientRect();
      let out = "";
      svg.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
      (canvas.dataset.edges ?? "").split(",").filter(Boolean).forEach((pair, i) => {
        const [x, y] = pair.split("-");
        const na = canvas.querySelector(`[data-n="${x}"]`), nb = canvas.querySelector(`[data-n="${y}"]`);
        if (!na || !nb) return;
        const a = na.getBoundingClientRect(), b = nb.getBoundingClientRect();
        let d: string;
        if (Math.abs(a.top - b.top) < 10) {
          const ltr = b.left > a.left;
          const ax = (ltr ? a.right : a.left) - cr.left, ay = a.top + a.height / 2 - cr.top, bx = (ltr ? b.left : b.right) - cr.left, by = b.top + b.height / 2 - cr.top;
          const mx = (ax + bx) / 2; d = `M${ax},${ay} C${mx},${ay} ${mx},${by} ${bx},${by}`;
        } else {
          const ax = a.left + a.width / 2 - cr.left, ay = a.bottom - cr.top, bx = b.left + b.width / 2 - cr.left, by = b.top - cr.top;
          const my = (ay + by) / 2; d = `M${ax},${ay} C${ax},${my} ${bx},${my} ${bx},${by}`;
        }
        const id = "e" + Math.random().toString(36).slice(2, 8);
        out += `<path class="edge" id="${id}" d="${d}"/>`;
        if (!reduce) out += `<circle class="pulse" r="4"><animateMotion dur="2.4s" begin="${i * 0.4}s" repeatCount="indefinite"><mpath href="#${id}"/></animateMotion></circle>`;
      });
      svg.innerHTML = out;
    };
    const drawMini = () => {
      const m = $("#mini"); if (!m || !m.offsetParent) return;
      const svg = m.querySelector("svg"); if (!svg) return;
      const r = m.getBoundingClientRect(), ns = $$(".n", m);
      let out = "";
      svg.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
      for (let i = 0; i < ns.length - 1; i++) {
        const a = ns[i].getBoundingClientRect(), b = ns[i + 1].getBoundingClientRect();
        out += `<path d="M${a.left + a.width / 2 - r.left},${a.top + a.height / 2 - r.top} L${b.left + b.width / 2 - r.left},${b.top + b.height / 2 - r.top}" stroke="rgba(255,255,255,.22)" stroke-width="2" stroke-dasharray="4 5" fill="none"/>`;
      }
      svg.innerHTML = out;
    };
    const drawAll = () => { $$(".canvas[data-edges]").forEach(drawCanvas); drawMini(); };
    on(window, "resize", drawAll);
    document.fonts?.ready.then(drawAll);
    raf = requestAnimationFrame(drawAll);

    /* Crop animation */
    const c916 = $(".crop.c916");
    if (!reduce && c916) { let left = true; intervals.push(window.setInterval(() => { left = !left; c916.style.left = left ? "39%" : "30%"; }, 2200)); }

    /* Hero media demo */
    const wave = $("#wave");
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    if (wave && !wave.childElementCount)
      for (let i = 0; i < 110; i++) { const bar = document.createElement("i"); bar.style.height = Math.min(100, 18 + Math.abs(Math.sin(i * 0.35)) * 50 + rnd() * 30) + "%"; wave.appendChild(bar); }
    const caps = $$(".phone .cap");
    caps.forEach((c) => { c.innerHTML = (c.dataset.words ?? "").split(" ").map((w) => `<span class="w">${w}</span>`).join(" "); });
    const chips = $$(".steps-live .chip"), segs = $$(".seg"), phones = $$(".phone"), head = $("#playhead");
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
    const setPhase = (n: number) => chips.forEach((c, i) => c.classList.toggle("on", i <= n));
    const finalState = () => { setPhase(4); segs.forEach((s) => s.classList.add("on")); phones.forEach((p) => p.classList.add("live", "posted-on")); if (head) head.style.left = "100%"; };
    const captionLoop = () => {
      const idx = [0, 0, 0];
      const tick = () => {
        caps.forEach((c, k) => { const ws = $$(".w", c); ws.forEach((w) => w.classList.remove("now")); if (ws.length) ws[idx[k] % ws.length].classList.add("now"); idx[k]++; });
        timers.push(window.setTimeout(tick, 380));
      };
      tick();
    };
    const play = () => {
      clearAll();
      if (reduce) { finalState(); return; }
      segs.forEach((s) => s.classList.remove("on")); phones.forEach((p) => p.classList.remove("live", "posted-on"));
      setPhase(0);
      let t0: number | null = null;
      const step = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min(1, (ts - t0) / 2600);
        if (head) head.style.left = p * 100 + "%";
        if (p < 1) { raf = requestAnimationFrame(step); return; }
        setPhase(1); segs.forEach((s, i) => timers.push(window.setTimeout(() => s.classList.add("on"), 220 * i)));
        timers.push(window.setTimeout(() => { setPhase(2); phones.forEach((ph, i) => timers.push(window.setTimeout(() => ph.classList.add("live"), 240 * i))); }, 900));
        timers.push(window.setTimeout(() => { setPhase(3); captionLoop(); }, 1900));
        timers.push(window.setTimeout(() => { setPhase(4); phones.forEach((ph, i) => timers.push(window.setTimeout(() => ph.classList.add("posted-on"), 250 * i))); }, 3300));
      };
      raf = requestAnimationFrame(step);
    };
    if (head) { finalState(); timers.push(window.setTimeout(play, 1400)); }
    const replay = $("#replay");
    if (replay) on(replay, "click", play);

    /* Tabs */
    const tabs = $$('[role="tab"]');
    tabs.forEach((t) => on(t, "click", () => {
      tabs.forEach((x) => {
        const sel = x === t;
        x.setAttribute("aria-selected", sel ? "true" : "false");
        x.tabIndex = sel ? 0 : -1;
        const panel = document.getElementById(x.getAttribute("aria-controls") ?? "");
        if (panel) panel.hidden = !sel;
      });
    }));

    onScroll();
    return () => {
      clearAll(); clearTimeout(typeTimer); intervals.forEach(clearInterval); cleanups.forEach((c) => c());
    };
  }, []);
  return null;
}
