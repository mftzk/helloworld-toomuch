"use client";

// app/page.js
// The entire spectacle. Everything here is hand-rolled vanilla JS:
// canvas starfields, confetti physics, a Web Audio synth, a cursor trail and
// a pile of live API calls. No extra dependencies were harmed.

import { useCallback, useEffect, useRef, useState } from "react";
import { GREETINGS } from "../lib/greetings";

/* ------------------------------------------------------------------ */
/* Small pure helpers                                                  */
/* ------------------------------------------------------------------ */

// mm:ss.mmm — used by both the HUD and the API uptime tiles.
function formatUptime(ms) {
  const total = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}.${String(millis).padStart(3, "0")}`;
}

function formatInt(n) {
  return Math.round(n).toLocaleString("en-US");
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// Smoothly counts a number up to `target` whenever the target changes.
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number.isFinite(target) ? target : 0;
    const start = typeof performance !== "undefined" ? performance.now() : 0;
    let raf;

    function step(now) {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (to - from) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/* Static content                                                      */
/* ------------------------------------------------------------------ */

// Which features feed the TOO MUCH METER.
const FEATURE_INFO = {
  api: "Live API stats",
  audio: "Web Audio synth",
  confetti: "Confetti physics",
  fortune: "Fortune generator",
  trail: "Cursor trail",
  party: "Konami party mode",
};
const FEATURE_KEYS = Object.keys(FEATURE_INFO);

const FEATURE_CARDS = [
  {
    ico: "🌌",
    title: "Canvas Starfield",
    body: "Drifting, twinkling stars with slow parallax and pulsing nebulae, painted by hand on a full-screen canvas.",
  },
  {
    ico: "🗣️",
    title: "63 Languages",
    body: "A typewriter subtitle and a quad-lingual rotator greet you in every language this API knows.",
  },
  {
    ico: "🎉",
    title: "Confetti Physics",
    body: "Velocity, gravity, rotation and fade — 100% hand-rolled particles with zero libraries attached.",
  },
  {
    ico: "🎹",
    title: "Web Audio Synth",
    body: "An arpeggio, HUD blips and a party fanfare, synthesized live and fully guarded against missing AudioContext.",
  },
  {
    ico: "📡",
    title: "Real API Routes",
    body: "Health, hello, languages and counter endpoints, all CORS-enabled and dependency free.",
  },
  {
    ico: "🕹️",
    title: "Konami Party Mode",
    body: "↑↑↓↓←→←→BA flips the whole page into a hue-rotating rainbow with a giant marquee.",
  },
  {
    ico: "✨",
    title: "Cursor Trail",
    body: "Glowing particles bloom under your pointer and fade quietly back into the void.",
  },
  {
    ico: "📈",
    title: "TOO MUCH METER",
    body: "The more you play, the further this bar fills. There is no prize — only TOOMUCH.",
  },
];

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function meterLabel(pct) {
  if (pct <= 0) return "normal";
  if (pct < 30) return "warming up";
  if (pct < 50) return "getting spicy";
  if (pct < 70) return "extra";
  if (pct < 90) return "overkill";
  if (pct < 100) return "absolutely too much";
  return "MAXIMUM TOOMUCH";
}

// A reusable readout tile for the HUD and stats strip.
function Tile({ label, value, sub, tone }) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className={tone ? `value ${tone}` : "value"}>{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function Page() {
  // ----- visible state ------------------------------------------------
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [caretOn, setCaretOn] = useState(true);
  const [clock, setClock] = useState({
    local: "--:--:--",
    utc: "--:--:--",
  });
  const [uptime, setUptime] = useState("00:00.000");
  const [fps, setFps] = useState(0);
  const [blinks, setBlinks] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [party, setParty] = useState(false);
  const [toast, setToast] = useState("");
  const [features, setFeatures] = useState([]);
  const [stats, setStats] = useState({
    visits: 0,
    luckyNumber: 0,
    loaded: false,
  });
  const [health, setHealth] = useState({
    status: "checking",
    version: "…",
    uptimeSeconds: 0,
  });
  const [fortune, setFortune] = useState(
    "Press GENERATE FORTUNE and the cosmos will improvise."
  );

  // ----- refs ---------------------------------------------------------
  const starCanvasRef = useRef(null);
  const fxCanvasRef = useRef(null);
  const audioRef = useRef(null);
  const soundOnRef = useRef(false);
  const partyRef = useRef(false);
  const unlockedRef = useRef(false);
  const confettiRef = useRef([]);
  const trailRef = useRef([]);
  const trailSeenRef = useRef(false);
  const toastTimerRef = useRef(null);

  const active = GREETINGS[greetingIndex % GREETINGS.length];

  // ----- tiny UI helpers ---------------------------------------------
  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2200);
  }, []);

  // ----- Web Audio synth ---------------------------------------------
  // Everything below is defensive: browsers without AudioContext (or with
  // autoplay restrictions) should never see an exception.

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioRef.current) {
      try {
        audioRef.current = new AC();
      } catch {
        return null;
      }
    }
    const ctx = audioRef.current;
    if (ctx && ctx.state === "suspended") {
      // Resume is async; ignore rejections from autoplay policies.
      Promise.resolve(ctx.resume()).catch(() => {});
    }
    return ctx;
  }, []);

  // Emit a sequence of notes. Always attempts to play (callers gate on sound).
  const emitNotes = useCallback(
    (notes, opts = {}) => {
      const ctx = ensureAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const step = opts.step ?? 0.12;
      const dur = opts.dur ?? 0.22;
      const volume = opts.volume ?? 0.16;
      const type = opts.type ?? "triangle";

      notes.forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.value = freq;
          const t = now + i * step;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.05);
        } catch {
          /* audio is best-effort only */
        }
      });
    },
    [ensureAudio]
  );

  const playHello = useCallback(() => {
    emitNotes([523.25, 659.25, 783.99, 1046.5], {
      step: 0.11,
      dur: 0.3,
      type: "triangle",
      volume: 0.16,
    });
  }, [emitNotes]);

  const playBlip = useCallback(
    (freq = 660) => {
      if (!soundOnRef.current) return;
      emitNotes([freq], { step: 0, dur: 0.08, type: "square", volume: 0.05 });
    },
    [emitNotes]
  );

  const playFanfare = useCallback(() => {
    if (!soundOnRef.current) return;
    emitNotes([392, 523.25, 659.25, 783.99, 1046.5, 1318.5], {
      step: 0.13,
      dur: 0.35,
      type: "sawtooth",
      volume: 0.13,
    });
  }, [emitNotes]);

  // ----- feature tracking / TOO MUCH METER ---------------------------
  const triggerFeature = useCallback(
    (key) => {
      if (!FEATURE_KEYS.includes(key)) return;
      setFeatures((prev) => (prev.includes(key) ? prev : [...prev, key]));
      playBlip(480 + Math.random() * 520);
    },
    [playBlip]
  );

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (next) {
      ensureAudio();
      playHello();
      triggerFeature("audio");
      showToast("🔊 Sound on");
    } else {
      showToast("🔇 Sound off");
    }
  }, [ensureAudio, playHello, triggerFeature, showToast]);

  const toggleParty = useCallback(() => {
    const next = !partyRef.current;
    partyRef.current = next;
    setParty(next);
    if (next) {
      triggerFeature("party");
      playFanfare();
      showToast("🎊 PARTY MODE ACTIVATED — there is no way back");
    } else {
      showToast("🕺 Party mode off");
    }
  }, [playFanfare, showToast, triggerFeature]);

  // ----- confetti -----------------------------------------------------
  const fireConfetti = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 800;
    const h = typeof window !== "undefined" ? window.innerHeight : 600;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colors = [
      "#4ff0e0",
      "#ff4fd8",
      "#ffd166",
      "#59f7a0",
      "#8b5cff",
      "#ff8a5c",
    ];
    const count = reduce ? 40 : 170;

    for (let i = 0; i < count; i++) {
      confettiRef.current.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.35,
        y: h * 0.36,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 13 - 4,
        w: 6 + Math.random() * 9,
        h: 8 + Math.random() * 11,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.45,
        life: 1,
        decay: 0.004 + Math.random() * 0.006,
      });
    }

    triggerFeature("confetti");
    showToast("🎉 Confetti deployed");
  }, [showToast, triggerFeature]);

  // ----- fortune ------------------------------------------------------
  const handleFortune = useCallback(async () => {
    try {
      const res = await fetch("/api/hello?name=World");
      const data = await res.json();
      setFortune(`${data.fortune}  ·  Did you know? ${data.fact}`);
      triggerFeature("fortune");
      showToast("🔮 Fortune generated");
    } catch {
      setFortune("The cosmos is silent. Check the network and try again.");
    }
  }, [triggerFeature, showToast]);

  /* ---------------------------------------------------------------- */
  /* Effects                                                           */
  /* ---------------------------------------------------------------- */

  // First user gesture unlocks the AudioContext and plays the hello arpeggio.
  useEffect(() => {
    function unlock() {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      soundOnRef.current = true;
      setSoundOn(true);
      ensureAudio();
      playHello();
      triggerFeature("audio");
      showToast("👋 Hello! Audio unlocked");
    }
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureAudio, playHello, triggerFeature, showToast]);

  // Restore + persist TOO MUCH METER progress.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hwtm:features");
      const saved = raw ? JSON.parse(raw) : [];
      if (Array.isArray(saved) && saved.length) setFeatures(saved);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("hwtm:features", JSON.stringify(features));
    } catch {
      /* storage may be unavailable */
    }
  }, [features]);

  // Background starfield: stars + nebula pulses with optional parallax.
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf;
    let w = 0;
    let h = 0;
    let stars = [];
    let nebulae = [];
    let t = 0;

    function build() {
      const count = reduce
        ? 90
        : Math.min(340, Math.round((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        r: Math.random() * 1.6 + 0.3,
        tw: Math.random() * Math.PI * 2,
      }));
      nebulae = [280, 190, 320, 215].map((hue, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 150 + Math.random() * 230,
        hue,
        phase: i * 1.7 + Math.random(),
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Pulsing nebulae.
      for (const n of nebulae) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + n.phase);
        const radius = n.r * (1 + 0.15 * pulse);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius);
        grad.addColorStop(0, `hsla(${n.hue}, 90%, 60%, ${0.1 + 0.08 * pulse})`);
        grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Twinkling, slowly drifting stars.
      for (const s of stars) {
        s.tw += 0.03 + s.z * 0.05;
        const alpha = 0.32 + 0.5 * (0.5 + 0.5 * Math.sin(s.tw));
        if (!reduce) {
          s.x -= 0.05 + s.z * 0.28;
          if (s.x < -2) s.x = w + 2;
        }
        const r = s.r * (0.5 + s.z);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.arc(s.x, s.y + Math.sin(s.tw * 0.5) * s.z * 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame() {
      t += 0.006;
      draw();
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Foreground effects canvas: confetti + cursor trail.
  useEffect(() => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Confetti: velocity + gravity + rotation + fade.
      const confetti = confettiRef.current;
      for (let i = confetti.length - 1; i >= 0; i--) {
        const p = confetti[i];
        p.vy += 0.18;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.rot += p.vr;
        p.life -= p.decay;
        if (p.y > h + 40 || p.life <= 0) {
          confetti.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = clamp(p.life, 0, 1);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      // Cursor trail: soft glowing dots that rise and fade.
      const trail = trailRef.current;
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02;
        p.life -= 0.02;
        if (p.life <= 0) {
          trail.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.life * 0.6})`;
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Pointer trail spawner.
  useEffect(() => {
    function onMove(e) {
      const trail = trailRef.current;
      for (let i = 0; i < 2; i++) {
        trail.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6 - 0.35,
          r: 2 + Math.random() * 4,
          hue: 160 + Math.random() * 140,
          life: 1,
        });
      }
      if (trail.length > 320) trail.splice(0, trail.length - 320);
      if (!trailSeenRef.current) {
        trailSeenRef.current = true;
        triggerFeature("trail");
      }
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [triggerFeature]);

  // Clock, session uptime and cursor-blink counter (250ms / 530ms).
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const now = new Date();
      setClock({
        local: now.toLocaleTimeString(),
        utc: now.toISOString().slice(11, 19),
      });
      setUptime(formatUptime(Date.now() - start));
    }, 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCaretOn((prev) => !prev);
      setBlinks((b) => b + 1);
    }, 530);
    return () => clearInterval(id);
  }, []);

  // FPS meter driven by requestAnimationFrame.
  useEffect(() => {
    let raf;
    let frames = 0;
    let last = performance.now();
    function loop(now) {
      frames++;
      const span = now - last;
      if (span >= 1000) {
        setFps(Math.round((frames * 1000) / span));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Big greeting rotator: a new language every 1.5s.
  useEffect(() => {
    const id = setInterval(() => {
      setGreetingIndex((i) => (i + 1) % GREETINGS.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Typewriter subtitle that cycles greetings.
  useEffect(() => {
    let cancelled = false;
    let idx = 0;
    let chars = 0;
    let deleting = false;
    let timer;

    function tick() {
      if (cancelled) return;
      const text = GREETINGS[idx].text;
      if (!deleting) {
        chars++;
        setTyped(text.slice(0, chars));
        if (chars >= text.length) {
          deleting = true;
          timer = setTimeout(tick, 1100);
        } else {
          timer = setTimeout(tick, 90);
        }
      } else {
        chars--;
        setTyped(text.slice(0, chars));
        if (chars <= 0) {
          deleting = false;
          idx = (idx + 1) % GREETINGS.length;
          timer = setTimeout(tick, 400);
        } else {
          timer = setTimeout(tick, 40);
        }
      }
    }

    timer = setTimeout(tick, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Live stats: hit all three public endpoints on mount.
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const counterRes = await fetch("/api/counter", { method: "POST" });
        const counter = await counterRes.json();
        const healthRes = await fetch("/api/health");
        const healthData = await healthRes.json();
        const helloRes = await fetch("/api/hello?all=0");
        const helloData = await helloRes.json();
        if (!alive) return;

        setStats({
          visits: counter.visits,
          luckyNumber: helloData.luckyNumber,
          loaded: true,
        });
        setHealth({
          status: healthData.status,
          version: healthData.version,
          uptimeSeconds: healthData.uptimeSeconds,
        });
        setFortune(helloData.fortune);
        triggerFeature("api");
      } catch {
        if (alive) showToast("⚠️ API unavailable — running the pretty parts only");
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [showToast, triggerFeature]);

  // Konami code listener.
  useEffect(() => {
    let pos = 0;
    function onKey(e) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[pos]) {
        pos++;
        if (pos === KONAMI.length) {
          pos = 0;
          toggleParty();
        }
      } else {
        pos = key === KONAMI[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleParty]);

  /* ---------------------------------------------------------------- */
  /* Derived values                                                    */
  /* ---------------------------------------------------------------- */

  const meterPct = Math.round((features.length / FEATURE_KEYS.length) * 100);
  const visitsAnim = useCountUp(stats.visits);
  const luckyAnim = useCountUp(stats.luckyNumber);
  const procAnim = useCountUp(health.uptimeSeconds * 1000);

  // Tilt a card toward the pointer.
  function tilt(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${px * 14}deg) rotateX(${
      -py * 14
    }deg) translateZ(6px)`;
  }

  function untilt(e) {
    e.currentTarget.style.transform = "";
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="app" data-party={party ? "true" : "false"}>
      {/* 1. Aurora + starfield background */}
      <div className="aurora" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="blob b4" />
      </div>
      <canvas ref={starCanvasRef} className="starfield" aria-hidden="true" />
      <canvas ref={fxCanvasRef} className="fx-layer" aria-hidden="true" />
      <div className="rainbow-flash" aria-hidden="true" />

      {/* 9. Party-mode marquee */}
      {party ? (
        <div className="marquee-wrap" aria-hidden="true">
          <div className="marquee">{"HELLO WORLD · ".repeat(14)}</div>
        </div>
      ) : null}

      <header className="topbar">
        <div className="brand">
          HELLO WORLD <span>TOOMUCH</span>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="chip"
            data-on={soundOn ? "true" : "false"}
            onClick={toggleSound}
          >
            {soundOn ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
          </button>
          <button
            type="button"
            className="chip"
            data-on={party ? "true" : "false"}
            onClick={toggleParty}
          >
            {party ? "🌈 PARTY ON" : "🕹️ KONAMI?"}
          </button>
        </div>
      </header>

      <main className="content">
        {/* 2 + 3. Hero title, typewriter + rotator */}
        <section className="hero">
          <h1 className="glitch" data-text="HELLO WORLD">
            HELLO WORLD
          </h1>
          <p className="typewriter" aria-live="polite">
            <span>{typed}</span>
            <span className="caret" data-on={caretOn ? "true" : "false"}>
              ▊
            </span>
          </p>

          <div className="rotator" key={active.code}>
            <div className="rotator-flag">{active.flag}</div>
            <div className="rotator-text">{active.text}</div>
            <div className="rotator-meta">
              {active.language} · {active.code}
            </div>
          </div>

          <div className="hero-buttons">
            <button type="button" className="btn primary" onClick={fireConfetti}>
              PRESS FOR CONFETTI
            </button>
            <button type="button" className="btn" onClick={handleFortune}>
              GENERATE FORTUNE
            </button>
          </div>

          <p className="fortune">{fortune}</p>
        </section>

        {/* 4. Real-time HUD */}
        <h2 className="section-title">Real-time HUD</h2>
        <section className="hud">
          <Tile label="Local time" value={clock.local} />
          <Tile label="UTC" value={clock.utc} />
          <Tile label="Session uptime" value={uptime} />
          <Tile label="FPS" value={String(fps)} sub="requestAnimationFrame" />
          <Tile label="Cursor blinks" value={formatInt(blinks)} />
        </section>

        {/* 9. Live API stats */}
        <h2 className="section-title">Live API stats</h2>
        <section className="stats-strip">
          <Tile
            label="Visits (counter)"
            value={stats.loaded ? formatInt(visitsAnim) : "…"}
            sub="/api/counter"
          />
          <Tile
            label="Lucky number"
            value={stats.loaded ? formatInt(luckyAnim) : "…"}
            sub="1 – 999"
          />
          <Tile
            label="Process uptime"
            value={formatUptime(procAnim)}
            sub={`api v${health.version}`}
          />
          <Tile
            label="Health"
            value={health.status}
            sub={health.status === "ok" ? "all systems go" : "checking…"}
            tone={health.status === "ok" ? "ok" : "warn"}
          />
        </section>

        {/* 11. TOO MUCH METER */}
        <section className="meter">
          <div className="meter-head">
            <span className="label">Too much meter</span>
            <span className="status">
              {meterLabel(meterPct)} — {features.length}/{FEATURE_KEYS.length}
            </span>
          </div>
          <div
            className="meter-track"
            role="progressbar"
            aria-valuenow={meterPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="meter-fill" style={{ width: `${meterPct}%` }} />
          </div>
          <p className="meter-note">
            Trigger features to fill the bar. Progress is saved in localStorage,
            so it follows you around like a mild curse.
          </p>
        </section>

        {/* 8. Feature cards */}
        <h2 className="section-title">Inside the spectacle</h2>
        <section className="cards">
          {FEATURE_CARDS.map((card) => (
            <article
              key={card.title}
              className="card"
              onMouseMove={tilt}
              onMouseLeave={untilt}
            >
              <div className="ico" aria-hidden="true">
                {card.ico}
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </section>
      </main>

      {/* 12. Footer */}
      <footer className="footer">
        Built with opencode · Deployed on{" "}
        <a href="https://nrapken.dev" target="_blank" rel="noreferrer">
          nrapken.dev
        </a>{" "}
        Quick Apps
        <div style={{ marginTop: 6 }}>
          Tip: press ↑ ↑ ↓ ↓ ← → ← → B A
        </div>
      </footer>

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
