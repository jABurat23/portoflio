"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger } from "animejs";
import gsap from "gsap";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { projects } from "@/data/projects";
import About from "@/components/About";
const statusColor: Record<string, string> = {
  building: "#2a5c3f",
  complete: "#c8a96e",
  archived: "#2e2e40",
};

// ── Terminal Modal (mobile) ───────────────────────────────────────────────────
const COMMANDS: Record<string, string[]> = {
  help: [
    "available commands:",
    "  help          — show this list",
    "  neofetch      — system info",
    "  contact       — send me a message",
    "  cv            — download resume",
    "  about         — who is agstn404",
    "  stack         — tech stack",
    "  projects      — list projects",
    "  clear         — clear terminal",
  ],
  neofetch: [
    "  agstn404@personal.archive",
    "  ─────────────────────────",
    "  os       windows 11",
    "  host     personal.archive v1",
    "  shell    archive.terminal",
    "  location cebu city, ph",
    "  stack    rust · tauri · next.js",
    "  focus    systems builder",
    "  github   github.com/jABurat23",
    "  status   building winrt v3",
    "  uptime   est. 2024",
  ],
  about: [
    "agstn404 — systems builder",
    "cebu city, philippines",
    "",
    "i build things that live close to the metal.",
  ],
  stack: [
    "languages   → rust, typescript, javascript",
    "runtime     → tauri 2.0",
    "frontend    → next.js, react",
    "editor      → vs code",
  ],
  projects: [
    "01  windows-operation-runtime  [building]",
    "    → github.com/jABurat23",
    "",
    "02  project_02  [archived]",
    "03  project_03  [archived]",
  ],
  contact: [],
  cv: [
    "fetching cv.pdf...",
    "████████████████████ 100%",
    "downloaded: agstn404_cv.pdf",
    "→ opening file...",
  ],
  clear: [],
};

interface Command { input: string; output: string[]; }

function MobileTerminal({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<Command[]>([{
    input: "",
    output: ["personal.archive terminal v1", 'type "help" to see available commands.', ""],
  }]);
  const [input, setInput] = useState("");
  const [inputHistory, setInputHistory] = useState<string[]>(() => {
    try { const s = localStorage.getItem("terminal_history"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [contactStep, setContactStep] = useState<null | "email" | "message">(null);
  const [contactEmail, setContactEmail] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);
  useEffect(() => {
    try { localStorage.setItem("terminal_history", JSON.stringify(inputHistory)); } catch {}
  }, [inputHistory]);

  const appendOutput = (lines: string[]) => setHistory((prev) => [...prev, { input: "", output: lines }]);

  const run = async (raw: string) => {
    const cmd = raw.trim();
    const cmdLower = cmd.toLowerCase();
    if (contactStep === "email") {
      setContactEmail(cmd);
      setHistory((prev) => [...prev, { input: cmd, output: [] }]);
      setInput(""); setContactStep("message");
      appendOutput(["enter your message:"]);
      return;
    }
    if (contactStep === "message") {
      setHistory((prev) => [...prev, { input: cmd, output: [] }]);
      setInput(""); setContactStep(null);
      appendOutput(["transmitting..."]);
      try {
        await fetch("https://formspree.io/f/placeholder", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contactEmail, message: cmd }),
        });
      } catch {}
      setTimeout(() => appendOutput(["[SUCCESS] message transmitted.", `from: ${contactEmail}`, ""]), 800);
      return;
    }
    if (!cmdLower) return;
    setInputHistory((prev) => [cmdLower, ...prev]);
    setHistoryIdx(-1);
    if (cmdLower === "clear") { setHistory([]); setInput(""); return; }
    if (cmdLower === "contact") {
      setHistory((prev) => [...prev, { input: cmd, output: [] }]);
      setInput(""); setContactStep("email");
      appendOutput(["// secure message relay", "──────────────────────", "enter your email:"]);
      return;
    }
    if (cmdLower === "cv" || cmdLower === "resume") {
      setHistory((prev) => [...prev, { input: cmd, output: COMMANDS.cv }]);
      setInput("");
      setTimeout(() => { const a = document.createElement("a"); a.href = "/cv.pdf"; a.download = "agstn404_cv.pdf"; a.click(); }, 1200);
      return;
    }
    const output = COMMANDS[cmdLower] ?? [`command not found: ${cmdLower}`, 'type "help" for available commands.'];
    setHistory((prev) => [...prev, { input: cmd, output }]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") run(input);
  };

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      />
      <motion.div key="terminal"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
          height: "75vh", display: "flex", flexDirection: "column",
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: "12px 12px 0 0", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", fontFamily: "var(--mono)" }}>archive.terminal</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-3)", fontSize: "16px", cursor: "pointer", padding: "0 4px" }}>✕</button>
        </div>
        <div onClick={() => inputRef.current?.focus()} style={{ flex: 1, overflowY: "auto", padding: "1rem", fontFamily: "var(--mono)", fontSize: "11px", lineHeight: 1.9, cursor: "text" }}>
          {history.map((item, i) => (
            <div key={i}>
              {item.input && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "var(--accent)", userSelect: "none" }}>$</span>
                  <span style={{ color: "var(--text)" }}>{item.input}</span>
                </div>
              )}
              {item.output.map((line, j) => (
                <div key={j} style={{ color: line.startsWith("[SUCCESS]") ? "#4a9c6a" : line.startsWith("//") ? "var(--accent)" : "var(--text-3)", paddingLeft: item.input ? "1.2rem" : 0, whiteSpace: "pre" }}>
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: "11px", userSelect: "none" }}>
            {contactStep ? ">" : "$"}
          </span>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
            spellCheck={false} autoComplete="off"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "var(--mono)", fontSize: "11px", caretColor: "var(--accent)" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Mobile Hero ───────────────────────────────────────────────────────────────
function MobileHero() {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const { theme, toggle } = useTheme();
  const [termOpen, setTermOpen] = useState(false);
  const [stack, setStack] = useState<{ name: string; level: number }[]>([]);

  useEffect(() => {
    if (cursorRef.current) gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
    if (dotRef.current) gsap.to(dotRef.current, { opacity: 0.3, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, []);

  useEffect(() => {
    fetch("/api/github-stats").then(r => r.json()).then(setStack).catch(() => {
      setStack([{ name: "Rust", level: 60 }, { name: "JavaScript", level: 25 }, { name: "TypeScript", level: 10 }]);
    });
  }, []);

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ marginBottom: "4rem" }}>
      {/* topbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "2.5rem" }}>
        <span style={{ color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}>sys / archive v1</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span ref={dotRef} style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ color: "var(--text-3)", fontSize: "10px" }}>online</span>
          </div>
          <button onClick={() => setTermOpen(true)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", cursor: "pointer", fontFamily: "var(--mono)" }}>tools</button>
          <button onClick={toggle} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", cursor: "pointer", fontFamily: "var(--mono)" }}>{theme === "dark" ? "light" : "dark"}</button>
        </div>
      </div>

      {/* name */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "clamp(2.8rem, 12vw, 4.5rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text)" }}>
          <span style={{ color: "var(--accent)" }}>//</span> agstn404
          <span style={{ color: "var(--accent)" }}>_</span>
          <span ref={cursorRef} style={{ display: "inline-block", width: "3px", height: "0.7em", marginLeft: "4px", verticalAlign: "middle", background: "var(--accent)" }} />
        </h1>
      </div>

      <p style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1.25rem" }}>
        systems builder · desktop tooling · cebu, ph
      </p>

      <p style={{ fontSize: "14px", lineHeight: 1.8, fontStyle: "italic", color: "var(--text-2)", fontFamily: "var(--sans)", fontWeight: 300, marginBottom: "2rem" }}>
        i build things that live close to the metal.
        <br />this is where i keep them.
      </p>

      {/* cta */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "2.5rem" }}>
        <a href="https://github.com/jABurat23" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", border: "1px solid var(--accent-dim)", color: "var(--accent)", textDecoration: "none", fontFamily: "var(--mono)" }}>
          github ↗
        </a>
        <a href="#projects"
          style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", border: "1px solid var(--border)", color: "var(--text-3)", textDecoration: "none", fontFamily: "var(--mono)" }}>
          view work ↓
        </a>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--border)" }}>
        {[
          { label: "focus", value: "Rust", sub: "+ js, ts" },
          { label: "current", value: "winrt", sub: "v3" },
          { label: "base", value: "Cebu", sub: "PH" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "1.25rem 0", paddingLeft: i > 0 ? "1rem" : 0, paddingRight: i < 2 ? "1rem" : 0, borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem" }}>{s.label}</div>
            <div style={{ fontSize: "clamp(1rem, 4vw, 1.4rem)", fontWeight: 300, color: "var(--text)", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "var(--text-3)", marginTop: "0.35rem" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* stack card */}
      {stack.length > 0 && (
        <div style={{ marginTop: "2rem", border: "1px solid var(--border)", background: "var(--bg-2)", padding: "1rem" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>stack.profile</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {stack.map((s) => (
              <div key={s.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>{s.name}</span>
                  <span style={{ fontSize: "9px", color: "var(--text-3)" }}>{s.level}%</span>
                </div>
                <div style={{ height: "2px", background: "var(--border)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} style={{ height: "100%", background: "var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {termOpen && <MobileTerminal onClose={() => setTermOpen(false)} />}
    </motion.section>
  );
}

// ── Mobile Projects ───────────────────────────────────────────────────────────
function MobileProjects() {
  const [featuredId, setFeaturedId] = useState(projects[0]?.id ?? "");
  const featured = projects.find((p) => p.id === featuredId) ?? projects[0];
  const featuredIndex = projects.findIndex((p) => p.id === featuredId);
  const grid = projects.filter((p) => p.id !== featuredId);

  return (
    <motion.section id="projects" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ marginBottom: "4rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: 0 }}>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>projects</span>
          <span style={{ fontSize: "9px", color: "var(--text-3)" }}>/ {projects.length} total</span>
        </div>
        <span style={{ fontSize: "8px", letterSpacing: "0.1em", color: "var(--text-3)", textTransform: "uppercase" }}>tap to feature ↑</span>
      </div>

      {/* featured */}
      <AnimatePresence mode="wait">
        <motion.div key={featured.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          style={{ border: "1px solid var(--border)", background: "var(--bg-2)", padding: "1.5rem", marginBottom: "1px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>{String(featuredIndex + 1).padStart(2, "0")} · featured</span>
            <span style={{ fontSize: "8px", color: statusColor[featured.status], textTransform: "uppercase", letterSpacing: "0.1em" }}>{featured.status}</span>
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", marginBottom: "0.75rem", lineHeight: 1.3 }}>{featured.name}</h2>
          <p style={{ fontSize: "12px", lineHeight: 1.7, color: "var(--text-2)", fontFamily: "var(--sans)", fontStyle: "italic", fontWeight: 300, marginBottom: "1rem" }}>{featured.description}</p>
          {featured.tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {featured.tags.map((tag) => (
                <span key={tag} style={{ fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", border: "1px solid var(--border)", color: "var(--text-3)" }}>{tag}</span>
              ))}
            </div>
          )}
          {featured.repo && (
            <a href={featured.repo} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 14px", border: "1px solid var(--accent-dim)", color: "var(--accent)", textDecoration: "none", fontFamily: "var(--mono)", display: "inline-block" }}>
              repo ↗
            </a>
          )}
        </motion.div>
      </AnimatePresence>

      {/* grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)" }}>
        {grid.map((project, i) => (
          <div key={project.id} onClick={() => setFeaturedId(project.id)}
            style={{ background: "var(--bg)", padding: "1rem", cursor: "pointer", minHeight: "120px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "8px", color: "var(--text-3)", letterSpacing: "0.1em" }}>{String(projects.findIndex(p => p.id === project.id) + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: "8px", color: statusColor[project.status], textTransform: "uppercase", letterSpacing: "0.08em" }}>{project.status}</span>
              </div>
              <h3 style={{ fontSize: "11px", fontWeight: 300, color: "var(--text)", lineHeight: 1.3, marginBottom: "0.35rem" }}>{project.name}</h3>
              <p style={{ fontSize: "10px", color: "var(--text-2)", fontStyle: "italic", fontFamily: "var(--sans)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>
            </div>
            <span style={{ fontSize: "9px", color: "var(--text-3)", marginTop: "0.5rem" }}>↑ feature</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function MobileAbout() {
  const facts = [
    { key: "age",       value: "18" },
    { key: "location",  value: "cebu city, ph" },
    { key: "status",    value: "bsit freshman" },
    { key: "type",      value: "self-taught + formal" },
    { key: "exp",       value: "~2 years coding" },
    { key: "current",   value: "building winrt v3" },
    { key: "idle_mode", value: "sleep | play games" },
    { key: "uptime",    value: "est. 2024" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      style={{ marginBottom: "4rem" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: 0 }}>
        <span style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)" }}>about</span>
        <span style={{ fontSize: "9px", color: "var(--text-3)" }}>/ sys.info</span>
      </div>

      {/* statement — full width on mobile */}
      <div style={{ padding: "1.5rem 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1rem" }}>// README.md</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "var(--sans)", fontSize: "13px", lineHeight: 1.8, color: "var(--text-2)", fontWeight: 300 }}>
          <p>i'm agustin — 18, from cebu. i build software because i want to know how things actually work, not just that they do.</p>
          <p>started coding almost two years ago, self-taught, inconsistent. now i'm a <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: "11px" }}>bsit freshman</span> doing both at once.</p>
          <p>i don't build things to put on a resume. i build them because i need them, or because someone else might.</p>
          <p style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "12px" }}>when the quota runs out — i sleep, or i open a game. the code will still be there tomorrow.</p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
          {["Rust", "Tauri", "TypeScript", "Next.js", "GSAP"].map((tag) => (
            <span key={tag} style={{ fontFamily: "var(--mono)", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", border: "1px solid var(--border)", color: "var(--text-3)" }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* config — full width on mobile */}
      <div style={{ padding: "1.5rem 0" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1rem" }}>// config.toml</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent)", marginBottom: "0.5rem" }}>[user.agstn404]</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {facts.map((f, i) => (
            <div key={f.key} style={{ display: "flex", alignItems: "baseline", padding: "0.5rem 0", borderBottom: i < facts.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ color: "var(--text-3)", minWidth: "90px", fontSize: "10px", fontFamily: "var(--mono)" }}>{f.key}</span>
              <span style={{ color: "var(--text-3)", marginRight: "0.5rem", fontSize: "10px" }}>=</span>
              <span style={{ color: "var(--text)", fontSize: "10px", fontFamily: "var(--mono)" }}>"{f.value}"</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
} 

// ── Mobile Footer ─────────────────────────────────────────────────────────────
function MobileFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState("");
  const [coords, setCoords] = useState({ lat: "...", lon: "...", city: "..." });

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !footerRef.current) return;
    animate(footerRef.current, { opacity: [0, 1], y: [20, 0], duration: 600, easing: "easeOutQuad" });
  }, [visible]);

  useEffect(() => {
    fetch("https://ipapi.co/json/").then(r => r.json()).then(data => {
      const lat = parseFloat(data.latitude).toFixed(4);
      const lon = parseFloat(data.longitude).toFixed(4);
      setCoords({ lat: `${Math.abs(parseFloat(lat))}°${parseFloat(lat) >= 0 ? "N" : "S"}`, lon: `${Math.abs(parseFloat(lon))}°${parseFloat(lon) >= 0 ? "E" : "W"}`, city: data.city || "unknown" });
    }).catch(() => setCoords({ lat: "7.0707°N", lon: "125.6087°E", city: "Cebu City" }));
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Manila" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer ref={footerRef} style={{ opacity: 0, borderTop: "1px solid var(--border)", paddingTop: "2rem", paddingBottom: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <span style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>coordinates</span>
        <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>{coords.lat} {coords.lon}</span>
        <span style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>{coords.city}</span>
        <span style={{ fontSize: "13px", color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: "0.08em", marginTop: "0.2rem" }}>{time}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <span style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>contact</span>
          <a href="https://github.com/jABurat23" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-3)", textDecoration: "none", fontFamily: "var(--mono)" }}>github ↗</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
          <span style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>system</span>
          <span style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>personal.archive v1</span>
          <span style={{ fontSize: "9px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>next.js · typescript</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>est. 2024 · all builds personal</span>
        <span style={{ fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>agstn404</span>
      </div>
    </footer>
  );
}

// ── Main MobileLayout ─────────────────────────────────────────────────────────
export default function MobileLayout() {
  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: "2rem 1.5rem 0" }}>
      <MobileHero />
      <MobileAbout />
      <MobileProjects />
      <MobileFooter />
    </div>
  );
}