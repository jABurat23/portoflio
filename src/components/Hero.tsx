"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "@/components/ThemeProvider";

// ── Shared terminal state ─────────────────────────────────────────────────────
interface Command {
  input: string;
  output: string[];
}

  const COMMANDS: Record<string, string[]> = {
  help: [
    "available commands:",
    "  help          — show this list",
    "  neofetch      — system info",
    "  contact       — send me a message",
    "  cv            — download resume",
    "  history       — show command history",
    "  clear         — clear terminal",
  ],
  contact: [],
  cv: [
    "fetching cv.pdf...",
    "████████████████████ 100%",
    "downloaded: agstn404_cv.pdf (142kb)",
    "→ opening file...",
  ],
  resume: [
    "fetching cv.pdf...",
    "████████████████████ 100%",
    "downloaded: agstn404_cv.pdf (142kb)",
    "→ opening file...",
  ],
  history: [],
  clear: [],
};

// ── Float card wrapper ────────────────────────────────────────────────────────
function FloatCard({
  children,
  initialX,
  initialY,
  rotate,
  delay = 0,
  onFocus,
  isTop,
}: {
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  rotate: number;
  delay?: number;
  onFocus?: () => void;
  isTop?: boolean;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={{
        top: -50,
        bottom: 200,
        left: -50,
        right: 300,
      }}
      initial={{ opacity: 0, scale: 0.88, x: initialX, y: initialY, rotate }}
      animate={{ opacity: 1, scale: 1, x: initialX, y: initialY, rotate }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      whileDrag={{ scale: 1.03, rotate: 0, cursor: "grabbing" }}
      onPointerDown={onFocus}
      style={{
        position: "absolute",
        cursor: "grab",
        userSelect: "none",
        zIndex: isTop ? 30 : 10,
        transition: "z-index 0s",
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Card shell ────────────────────────────────────────────────────────────────
function Card({ children, width = 220 }: { children: React.ReactNode; width?: number }) {
  return (
    <div style={{
      width,
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{
      padding: "0.5rem 0.75rem",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
          ))}
        </div>
        <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

function TerminalCard({ onExpand }: { onExpand: () => void }) {
  return (
    <Card width={240}>
      <CardHeader
        title="terminal"
        action={
          <button
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-3)",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0",
              fontFamily: "var(--mono)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >
            expand ↗
          </button>
        }
      />
      <div style={{ padding: "0.9rem 0.75rem", fontFamily: "var(--mono)", fontSize: "10px", lineHeight: 1.8 }}>
        <div style={{ color: "var(--text-3)" }}>
          <span style={{ color: "var(--accent)" }}>~/winrt</span> $ cargo build
        </div>
        <div style={{ color: "var(--text-3)" }}>   Compiling app_lib v0.1.0</div>
        <div style={{ color: "#4a9c6a" }}>    Finished in 2.34s</div>
        <div style={{ color: "var(--text-3)" }}>
          <span style={{ color: "var(--accent)" }}>~/winrt</span> ${"  "}
          <span style={{
            display: "inline-block", width: "6px", height: "11px",
            background: "var(--accent)", verticalAlign: "middle",
            animation: "blink 1s step-end infinite",
          }} />
        </div>
      </div>
    </Card>
  );
}

// ── Expanded terminal modal ───────────────────────────────────────────────────
function ExpandedTerminal({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<Command[]>([{
  input: "",
  output: ["personal.archive terminal v1", 'type "help" to see available commands.', ""],
}]);
const [input, setInput] = useState("");
const [inputHistory, setInputHistory] = useState<string[]>(() => {
  // load saved command history from localStorage on mount
  try {
    const saved = localStorage.getItem("terminal_history");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
});
const [historyIdx, setHistoryIdx] = useState(-1);
const [contactStep, setContactStep] = useState<null | "email" | "message">(null);
const [contactEmail, setContactEmail] = useState("");
const bottomRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  setTimeout(() => inputRef.current?.focus(), 100);
}, []);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [history]);

useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [onClose]);

// persist command history to localStorage whenever it changes
useEffect(() => {
  try {
    localStorage.setItem("terminal_history", JSON.stringify(inputHistory));
  } catch {}
}, [inputHistory]);

  const appendOutput = (lines: string[]) => {
    setHistory((prev) => [...prev, { input: "", output: lines }]);
  };

  const run = async (raw: string) => {
    const cmd = raw.trim();
    const cmdLower = cmd.toLowerCase();

    // ── contact flow ──────────────────────────────────────────
    if (contactStep === "email") {
      setContactEmail(cmd);
      setHistory((prev) => [...prev, { input: cmd, output: [] }]);
      setInput("");
      setContactStep("message");
      appendOutput(["enter your message:"]);
      return;
    }

    if (contactStep === "message") {
      setHistory((prev) => [...prev, { input: cmd, output: [] }]);
      setInput("");
      setContactStep(null);
      appendOutput(["transmitting..."]);

      try {
        await fetch("https://formspree.io/f/xbdblkrp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contactEmail, message: cmd }),
        });
      } catch {}

      setTimeout(() => {
        appendOutput([
          "[SUCCESS] message transmitted securely.",
          `from: ${contactEmail}`,
          "i'll get back to you soon.",
          "",
        ]);
      }, 800);
      return;
    }

    // ── normal commands ───────────────────────────────────────
    if (!cmdLower) return;
    setInputHistory((prev) => [cmdLower, ...prev]);
    setHistoryIdx(-1);

    if (cmdLower === "clear") { setHistory([]); setInput(""); return; }

    if (cmdLower === "history") {
      const lines = inputHistory.length
        ? inputHistory.map((cmd, i) => `  ${String(inputHistory.length - i).padStart(3, " ")}  ${cmd}`)
        : ["no command history yet."];
      setHistory((prev) => [...prev, { input: cmd, output: ["command history:", ...lines] }]);
      setInput("");
      return;
    }

    if (cmdLower === "contact") {
      setHistory((prev) => [...prev, { input: cmd, output: [] }]);
      setInput("");
      setContactStep("email");
      appendOutput([
        "// secure message relay",
        "──────────────────────",
        "enter your email:",
      ]);
      return;
    }

    if (cmdLower === "cv" || cmdLower === "resume") {
      setHistory((prev) => [...prev, { input: cmd, output: COMMANDS.cv }]);
      setInput("");
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = "/cv.pdf";
        a.download = "agstn404_cv.pdf";
        a.click();
      }, 1200);
      return;
    }

    const output = COMMANDS[cmdLower] ?? [
      `command not found: ${cmdLower}`,
      'type "help" for available commands.',
    ];
    setHistory((prev) => [...prev, { input: cmd, output }]);
    setInput("");

    if (cmdLower === "neofetch") {
  setHistory((prev) => [...prev, { input: cmd, output: ["fetching sys info..."] }]);
  setInput("");
  try {
    const res = await fetch("/api/neofetch");
    const data = await res.json();
    const lines = [
      `  ${data.user}`,
      "  ─────────────────────────",
      `  os       ${data.os}`,
      `  host     ${data.host}`,
      `  shell    ${data.shell}`,
      `  location ${data.location}`,
      `  stack    ${data.stack}`,
      `  focus    ${data.focus}`,
      `  github   ${data.github}`,
      `  repos    ${data.repos} public`,
      `  stars    ${data.stars} total`,
      `  status   ${data.status}`,
      `  site     ${data.site}`,
      `  uptime   ${data.uptime}`,
      "",
    ];
    setHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { input: "", output: lines };
      return updated;
    });
  } catch {
    setHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { input: "", output: ["failed to fetch sys info."] };
      return updated;
    });
  }
  return;
}

  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { run(input); }
    else if (e.key === "ArrowUp" && !contactStep) {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, inputHistory.length - 1);
      setHistoryIdx(next); setInput(inputHistory[next] ?? "");
    } else if (e.key === "ArrowDown" && !contactStep) {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next); setInput(next === -1 ? "" : inputHistory[next] ?? "");
    }
  };

  const prompt = contactStep ? ">" : "~/archive $";

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
        }}
      />
      <motion.div
        key="terminal"
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ top: -300, bottom: 300, left: -400, right: 400 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        marginTop: "-36vh",
        marginLeft: "min(-350px, -45vw)",
        zIndex: 201,
        width: "min(700px, 90vw)",
        maxHeight: "72vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        cursor: "default",
      }}
      >
        {/* titlebar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.6rem 1rem", borderBottom: "1px solid var(--border)", flexShrink: 0,
          cursor: "grab", userSelect: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
              ))}
            </div>
            <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>
              archive.terminal — drag to move
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none",
              color: "var(--text-3)", fontSize: "14px",
              cursor: "pointer", padding: "0 4px", lineHeight: 1,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >
            ✕
          </button>
        </div>

        {/* output */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            flex: 1, overflowY: "auto",
            padding: "1rem 1.25rem",
            fontFamily: "var(--mono)", fontSize: "12px", lineHeight: 1.9,
            cursor: "text",
          }}
        >
          {history.map((item, i) => (
            <div key={i}>
              {item.input && (
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <span style={{ color: "var(--accent)", userSelect: "none" }}>~/archive $</span>
                  <span style={{ color: "var(--text)" }}>{item.input}</span>
                </div>
              )}
              {item.output.map((line, j) => (
                <div key={j} style={{
                  color: line.startsWith("[SUCCESS]") ? "#4a9c6a"
                    : line.startsWith("//") ? "var(--accent)"
                    : line.startsWith("──") ? "var(--border)"
                    : line.includes("██") ? "var(--accent)"
                    : "var(--text-3)",
                  paddingLeft: item.input ? "6.5rem" : 0,
                  whiteSpace: "pre",
                }}>
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid var(--border)", flexShrink: 0,
        }}>
          <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: "12px", userSelect: "none", whiteSpace: "nowrap" }}>
            {prompt}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontFamily: "var(--mono)", fontSize: "12px",
              caretColor: "var(--accent)",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
// ── Status card ───────────────────────────────────────────────────────────────
function StatusCard() {
  return (
    <Card width={210}>
      <CardHeader title="sys.status" />
      <div style={{ padding: "0.9rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {[
          { label: "build", value: "passing", ok: true },
          { label: "runtime", value: "tauri 2.0", ok: true },
          { label: "backend", value: "rust", ok: true },
          { label: "memory", value: "~112mb", ok: true },
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase" }}>
              {row.label}
            </span>
            <span style={{ fontSize: "10px", color: row.ok ? "#4a9c6a" : "#c85a5a", fontFamily: "var(--mono)" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Stack card ────────────────────────────────────────────────────────────────
function StackCard() {
  const [stack, setStack] = useState<{ name: string; level: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchStack = async () => {
        try {
          const res = await fetch("/api/github-stats");
          const data = await res.json();
          setStack(data);
        } catch {
          setStack([
            { name: "Rust", level: 60 },
            { name: "JavaScript", level: 25 },
            { name: "TypeScript", level: 10 },
            { name: "HTML", level: 5 },
          ]);
        } finally {
          setLoading(false);
        }
      };
    fetchStack();
  }, []);

  return (
    <Card width={220}>
      <CardHeader title="stack.profile" />
      <div style={{ padding: "0.9rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {loading
          ? [1,2,3,4].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ height: "9px", width: `${40 + i * 10}%`, background: "var(--bg-3)", opacity: 0.4 }} />
                <div style={{ height: "2px", width: "100%", background: "var(--border)" }} />
              </div>
            ))
          : stack.map((s) => (
              <div key={s.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--text-3)" }}>{s.level}%</span>
                </div>
                <div style={{ height: "2px", background: "var(--border)", width: "100%" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.level}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    style={{ height: "100%", background: "var(--accent)" }}
                  />
                </div>
              </div>
            ))}
      </div>
    </Card>
  );
}

// ── Activity card ─────────────────────────────────────────────────────────────
function ActivityCard() {
  const [commits, setCommits] = useState<{ msg: string; time: string; repo: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        // fetch recent public events for the user
        const res = await fetch("/api/github-activity");
        const events = await res.json();

        // filter only push events and extract commits
        const pushEvents = events.filter(
          (e: { type: string }) => e.type === "PushEvent"
        );

        const recent: { msg: string; time: string; repo: string }[] = [];

        for (const event of pushEvents) {
          if (recent.length >= 4) break;
          const commits = event.payload?.commits ?? [];
          for (const commit of commits.reverse()) {
            if (recent.length >= 4) break;
            const msg = commit.message?.split("\n")[0] ?? "";
            const repo = event.repo?.name?.split("/")[1] ?? "";
            const time = timeAgo(new Date(event.created_at));
            recent.push({ msg, time, repo });
          }
        }

        setCommits(recent.length ? recent : fallback);
      } catch {
        setCommits(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  const fallback = [
    { msg: "feat: boot screen animation", time: "2h ago", repo: "winrt" },
    { msg: "fix: tauri command namespace", time: "1d ago", repo: "winrt" },
    { msg: "chore: phase 2 merged", time: "3d ago", repo: "winrt" },
  ];

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card width={260}>
      <CardHeader title="recent.activity" />
      <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column" }}>
        {loading
          ? [0, 1, 2].map((i) => (
              <div key={i} style={{
                padding: "0.5rem 0",
                borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                <div style={{ height: "10px", width: "85%", background: "var(--bg-3)", opacity: 0.4 }} />
                <div style={{ height: "8px", width: "40%", background: "var(--bg-3)", opacity: 0.3 }} />
              </div>
            ))
          : commits.map((c, i) => (
              <div key={i} style={{
                padding: "0.5rem 0",
                borderBottom: i < commits.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex", flexDirection: "column", gap: "2px",
              }}>
                <span style={{
                  fontSize: "10px", color: "var(--text-2)",
                  fontFamily: "var(--mono)",
                  whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis", maxWidth: "220px",
                }}>
                  {c.msg}
                </span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", color: "var(--accent)", opacity: 0.7 }}>
                    {c.repo}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--text-3)" }}>·</span>
                  <span style={{ fontSize: "9px", color: "var(--text-3)" }}>{c.time}</span>
                </div>
              </div>
            ))
        }
      </div>
    </Card>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const { theme, toggle } = useTheme();
  const [termOpen, setTermOpen] = useState(false);
  const [topCard, setTopCard] = useState<string | null>(null);

  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
    }
    if (dotRef.current) {
      gsap.to(dotRef.current, { opacity: 0.3, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ marginBottom: "7rem" }}
    >
      {/* topbar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "4rem",
      }}>
        <span style={{ color: "var(--text-3)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          sys / personal.archive v1
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span ref={dotRef} style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ color: "var(--text-3)", fontSize: "11px", letterSpacing: "0.1em" }}>online</span>
          </div>

          {/* tools button */}
          <button
            onClick={() => setTermOpen(true)}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "4px 10px", cursor: "pointer",
              transition: "all 0.2s", fontFamily: "var(--mono)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
          >
            tools
          </button>

          {/* theme toggle */}
          <button
            onClick={toggle}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "4px 10px", cursor: "pointer",
              transition: "all 0.2s", fontFamily: "var(--mono)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
          >
            {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </div>

      {/* hero body */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "4rem", position: "relative" }}>
        {/* left */}
        <div style={{ flex: "0 0 auto", maxWidth: "520px" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "clamp(3.5rem, 6vw, 6rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text)" }}>
              <span style={{ color: "var(--accent)" }}></span> agstn404
              <span style={{ color: "var(--accent)" }}>_</span>
              <span ref={cursorRef} style={{ display: "inline-block", width: "4px", height: "0.75em", marginLeft: "6px", verticalAlign: "middle", background: "var(--accent)" }} />
            </h1>
          </div>
          <p style={{ fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1.75rem" }}>
            systems builder &nbsp;·&nbsp; desktop tooling &nbsp;·&nbsp; cebu, ph
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.8, maxWidth: "420px", fontStyle: "italic", color: "var(--text-2)", fontFamily: "var(--sans)", fontWeight: 300, marginBottom: "2.5rem" }}>
            i build things that live close to the metal.
            <br />this is where i keep them.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href="https://github.com/jABurat23" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 20px", border: "1px solid var(--accent-dim)", color: "var(--accent)", textDecoration: "none", transition: "all 0.15s", fontFamily: "var(--mono)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,169,110,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >github ↗</a>
            <a href="#projects"
              style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 20px", border: "1px solid var(--border)", color: "var(--text-3)", textDecoration: "none", transition: "all 0.15s", fontFamily: "var(--mono)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
            >view work ↓</a>
          </div>
        </div>

          {/* right: floating cards */}
          <div style={{ flex: 1, position: "relative", height: "420px", minWidth: 0 }}>
            {[
              { id: "status", x: 20, y: 0, rotate: -3, delay: 0.2, el: <StatusCard /> },
              { id: "terminal", x: 200, y: 30, rotate: 2.5, delay: 0.35, el: <TerminalCard onExpand={() => setTermOpen(true)} /> },
              { id: "activity", x: 60, y: 210, rotate: -1.5, delay: 0.5, el: <ActivityCard /> },
              { id: "stack", x: 240, y: 220, rotate: 3, delay: 0.65, el: <StackCard /> },
            ].map((card) => (
              <FloatCard
                key={card.id}
                initialX={card.x}
                initialY={card.y}
                rotate={card.rotate}
                delay={card.delay}
                onFocus={() => setTopCard(card.id)}
                isTop={topCard === card.id}
              >
                {card.el}
              </FloatCard>
            ))}
          </div>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--border)", marginTop: "5rem" }}>
        {[
          { label: "focus", value: "Rust", sub: "+ js, ts" },
          { label: "current", value: "winrt", sub: "v3 in progress" },
          { label: "base", value: "Cebu", sub: "Philippines" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "2rem 0",
            paddingLeft: i > 0 ? "2.5rem" : 0,
            paddingRight: i < 2 ? "2.5rem" : 0,
            borderRight: i < 2 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.75rem" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", fontWeight: 300, color: "var(--text)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "0.5rem" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* expanded terminal */}
      {termOpen && <ExpandedTerminal onClose={() => setTermOpen(false)} />}
    </motion.section>
  );
}