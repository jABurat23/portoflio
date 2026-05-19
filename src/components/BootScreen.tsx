"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "initializing personal.archive v1...",
  "loading kernel modules............ok",
  "mounting filesystem...............ok",
  "checking system integrity.........ok",
  "starting runtime environment......ok",
  "loading project index.............ok",
  "establishing secure context.......ok",
  "spawning ui thread................ok",
  "boot sequence complete............ok",
];

interface BootScreenProps {
  onComplete: () => void;
}

function CornerTick({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const size = 18;
  const color = "var(--accent)";
  const s: React.CSSProperties = { position: "absolute", width: size, height: size, opacity: 0.7 };
  if (pos === "tl") Object.assign(s, { top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` });
  if (pos === "tr") Object.assign(s, { top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` });
  if (pos === "bl") Object.assign(s, { bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` });
  if (pos === "br") Object.assign(s, { bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` });
  return <div style={s} />;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const sysLabelRef = useRef<HTMLDivElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<{ text: string; done: boolean }[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusOk, setStatusOk] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  // ── boot sequence ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // fade in
      if (containerRef.current) {
        containerRef.current.style.transition = "opacity 0.5s";
        containerRef.current.style.opacity = "1";
      }

      await new Promise((r) => setTimeout(r, 400));

      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, Math.random() * 160 + 80));
        if (cancelled) return;
        setLines((prev) => [...prev, { text: BOOT_LINES[i], done: false }]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        await new Promise((r) => setTimeout(r, 50));
        setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, done: true } : l));
      }

      if (cancelled) return;
      setStatusOk(true);
      setBootDone(true);
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;

      // transition to greeting
      if (containerRef.current) {
        containerRef.current.style.transition = "opacity 0.4s";
        containerRef.current.style.opacity = "0";
      }
      await new Promise((r) => setTimeout(r, 420));
      if (cancelled) return;
      setShowGreeting(true);
    };

    run();
    return () => { cancelled = true; };
  }, []);

  // ── greeting animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!showGreeting) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    const chars = "ABCDEFGHIJKLMNabcdefghijklmn0123456789!@#$%";
    const target = "Agstn404";

    // fade greeting container in
    if (greetingRef.current) {
      greetingRef.current.style.transition = "opacity 0.3s";
      greetingRef.current.style.opacity = "1";
    }

    let pos = -10;
    const totalH = 130;
    let glitchFrame = 0;
    const totalGlitchFrames = 34;
    let rafId: number;

    const step = () => {
      if (cancelled) return;
      pos += 2.6;
      if (scanRef.current) scanRef.current.style.top = pos + "px";
      if (pos > 15 && sysLabelRef.current) sysLabelRef.current.style.opacity = "1";

      if (pos > 50 && nameRef.current) {
        nameRef.current.style.opacity = String(Math.min((pos - 50) / 40, 1));
        const progress = glitchFrame / totalGlitchFrames;
        let result = "";
        for (let i = 0; i < target.length; i++) {
          if (i < Math.floor(progress * target.length)) {
            result += target[i];
          } else {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        nameRef.current.textContent = result;
        glitchFrame = Math.min(glitchFrame + 0.85, totalGlitchFrames);
      }

      if (pos < totalH) {
        rafId = requestAnimationFrame(step);
      } else {
        // snap name clean
        if (scanRef.current) { scanRef.current.style.transition = "opacity 0.3s"; scanRef.current.style.opacity = "0"; }
        if (nameRef.current) { nameRef.current.textContent = target; nameRef.current.style.color = "var(--text)"; nameRef.current.style.opacity = "1"; }

        // access granted
        t(() => { if (subRef.current) subRef.current.style.opacity = "1"; }, 80);
        t(() => {
          if (!accessRef.current) return;
          accessRef.current.style.opacity = "1";
          let f = 0;
          const flick = () => {
            if (cancelled || !accessRef.current) return;
            if (f++ > 5) { accessRef.current.style.opacity = "1"; return; }
            accessRef.current.style.opacity = f % 2 === 0 ? "1" : "0.1";
            timers.push(setTimeout(flick, 70));
          };
          t(flick, 180);
        }, 200);

        // fade out and complete
        t(() => {
          if (!greetingRef.current || cancelled) return;
          greetingRef.current.style.transition = "opacity 0.6s";
          greetingRef.current.style.opacity = "0";
        }, 2000);
        t(() => { if (!cancelled) onComplete(); }, 2650);
      }
    };

    t(() => { rafId = requestAnimationFrame(step); }, 200);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
    };
  }, [showGreeting, onComplete]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflow: "hidden" }}>

      {/* ── boot screen ── */}
      <div
        ref={containerRef}
        style={{
          position: "absolute", inset: 0,
          background: "var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0,
        }}
      >
        {/* scanlines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)" }} />
        {/* vignette */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.75) 100%)" }} />

        <div style={{ position: "relative", zIndex: 1, width: "min(660px, 88vw)", padding: "2.5rem" }}>
          <CornerTick pos="tl" /><CornerTick pos="tr" /><CornerTick pos="bl" /><CornerTick pos="br" />
          <div style={{ padding: "0.5rem 0.25rem" }}>

            {/* top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)" }}>
                sys / personal.archive
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: statusOk ? "var(--accent)" : "var(--text-3)", transition: "color 0.4s" }}>
              {statusOk ? "status_ok" : "booting..."}
              </span>
            </div>

            {/* title */}
            <div style={{ marginBottom: "2.5rem" }}>
              <h1 style={{ fontFamily: "var(--mono)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--text)", margin: 0 }}>
                <span style={{ color: "var(--accent)" }}>Agstn404</span>
                <span style={{ color: "var(--accent)" }}>_</span>
              </h1>
            </div>

            <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.5rem" }} />

            {/* boot log */}
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", lineHeight: 2, marginBottom: "2rem", minHeight: "200px" }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", color: bootDone && i === lines.length - 1 ? "var(--accent)" : "var(--text-3)", transition: "color 0.3s" }}>
                  <span style={{ color: "var(--text-3)", flexShrink: 0, opacity: 0.5 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1 }}>{line.text}</span>
                  {line.done && <span style={{ color: "#4a9c6a", flexShrink: 0 }}>✓</span>}
                </div>
              ))}
              {lines.length < BOOT_LINES.length && lines.length > 0 && (
                <div style={{ display: "flex", gap: "1rem", color: "var(--text-3)" }}>
                  <span style={{ opacity: 0.5 }}>{String(lines.length + 1).padStart(2, "0")}</span>
                  <span style={{ opacity: 0.3 }}>_</span>
                </div>
              )}
            </div>

            <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.25rem" }} />

            {/* progress */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>matrix load status</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--accent)" }}>[ {String(progress).padStart(3, " ")}% ]</span>
              </div>
              <div style={{ height: "3px", background: "var(--bg-3)", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.15s ease" }} />
                <div style={{ position: "absolute", top: "-3px", left: `${progress}%`, transform: "translateX(-50%)", width: "20px", height: "9px", background: "var(--accent)", filter: "blur(6px)", opacity: progress > 0 && progress < 100 ? 0.8 : 0, transition: "left 0.15s ease", pointerEvents: "none" }} />
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-3)", marginTop: "0.5rem", letterSpacing: 0 }}>
                {Array.from({ length: 48 }, (_, i) => {
                  const filled = i < Math.round(progress / 100 * 48);
                  return <span key={i} style={{ color: filled ? "var(--accent)" : "var(--bg-3)", opacity: filled ? 0.8 : 0.4 }}>{filled ? "█" : "░"}</span>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── greeting screen ── */}
      {showGreeting && (
        <div
          ref={greetingRef}
          style={{
            position: "absolute", inset: 0,
            background: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0,
          }}
        >
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", fontFamily: "var(--mono)", width: "min(420px, 88vw)" }}>

            {/* scan line */}
            <div ref={scanRef} style={{ position: "absolute", left: "-40px", right: "-40px", height: "1px", background: "rgba(200,169,110,0.4)", top: "-10px", boxShadow: "0 0 12px rgba(200,169,110,0.3)", pointerEvents: "none" }} />

            {/* sys label */}
            <div ref={sysLabelRef} style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "1.25rem", opacity: 0, transition: "opacity 0.25s" }}>
              sys / personal.archive
            </div>

            {/* name */}
            <div style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1 }}>
              <span style={{ color: "var(--accent)" }}></span>{" "}
              <span ref={nameRef} style={{ color: "var(--accent)", opacity: 0, display: "inline-block", minWidth: "200px" }}></span>
              <span style={{ color: "var(--accent)" }}>_</span>
            </div>

            {/* subtitle */}
            <div ref={subRef} style={{ fontSize: "10px", letterSpacing: "0.16em", color: "var(--text-3)", textTransform: "uppercase", marginTop: "0.75rem", opacity: 0, transition: "opacity 0.4s" }}>
              systems builder &nbsp;·&nbsp; cebu, ph
            </div>

            {/* access granted */}
            <div ref={accessRef} style={{ fontSize: "11px", letterSpacing: "0.22em", color: "#4a9c6a", textTransform: "uppercase", marginTop: "1.25rem", opacity: 0 }}>
              [ access granted ]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}