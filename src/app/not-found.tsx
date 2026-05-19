"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Link from "next/link";
import CRT from "@/components/CRT";

const GLITCH_CHARS = "ABCDEFGHIJKLMNabcdefghijklmn0123456789!@#$%";

function useScramble(target: string, trigger: boolean) {
  const [text, setText] = useState(target);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!trigger) return;
    frame.current = 0;
    const total = 30;
    const step = () => {
      const progress = frame.current / total;
      let result = "";
      for (let i = 0; i < target.length; i++) {
        if (i < Math.floor(progress * target.length)) {
          result += target[i];
        } else {
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      setText(result);
      frame.current++;
      if (frame.current <= total) {
        timer.current = setTimeout(step, 40);
      } else {
        setText(target);
      }
    };
    step();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [trigger, target]);

  return text;
}

const LOG_LINES = [
  "attempting route resolution........fail",
  "checking fallback index.............fail",
  "scanning alternate paths............fail",
  "querying archive......................404",
];

export default function NotFound() {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [scramble, setScramble] = useState(false);
  const errorText = useScramble("404", scramble);
  const subText = useScramble("page not found", scramble);

  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
    }
    if (dotRef.current) {
      gsap.to(dotRef.current, { opacity: 0.3, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }

    // stream log lines
    let i = 0;
    const interval = setInterval(() => {
      if (i < LOG_LINES.length) {
        setLines((prev) => [...prev, LOG_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setScramble(true), 300);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden" }}>
      <CRT />

      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", boxSizing: "border-box",
        padding: "4rem clamp(1.5rem, 6vw, 8rem)",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}>

        {/* topbar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "5rem",
        }}>
          <span style={{ color: "var(--text-3)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            sys / personal.archive v1
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span ref={dotRef} style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#c85a5a" }} />
            <span style={{ color: "var(--text-3)", fontSize: "11px", letterSpacing: "0.1em" }}>error</span>
          </div>
        </div>

        {/* main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "700px" }}>

          {/* error code */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ marginBottom: "3rem" }}
          >
            <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1rem" }}>
              error / route_not_found
            </div>
            <h1 style={{
              fontFamily: "var(--mono)",
              fontSize: "clamp(5rem, 15vw, 10rem)",
              fontWeight: 300,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--text)",
              marginBottom: "0.5rem",
            }}>
              <span style={{ color: "var(--accent)" }}>//</span> {errorText}
              <span ref={cursorRef} style={{ display: "inline-block", width: "4px", height: "0.8em", marginLeft: "6px", verticalAlign: "middle", background: "var(--accent)" }} />
            </h1>
            <p style={{ fontFamily: "var(--mono)", fontSize: "14px", color: "var(--text-3)", letterSpacing: "0.08em" }}>
              {subText}
            </p>
          </motion.div>

          {/* log lines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              fontFamily: "var(--mono)", fontSize: "11px", lineHeight: 2,
              marginBottom: "3rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem",
            }}
          >
            {lines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", color: "var(--text-3)" }}>
                <span style={{ opacity: 0.4, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ flex: 1 }}>{line}</span>
                <span style={{ color: "#c85a5a", flexShrink: 0 }}>✗</span>
              </div>
            ))}
            {lines.length < LOG_LINES.length && lines.length > 0 && (
              <div style={{ display: "flex", gap: "1rem", color: "var(--text-3)" }}>
                <span style={{ opacity: 0.4 }}>{String(lines.length + 1).padStart(2, "0")}</span>
                <span style={{ opacity: 0.3 }}>_</span>
              </div>
            )}
          </motion.div>

          {/* nav options */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            <Link href="/"
              style={{
                fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "8px 20px",
                border: "1px solid var(--accent-dim)", color: "var(--accent)",
                textDecoration: "none", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,169,110,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ← return home
            </Link>
            <Link href="/#projects"
              style={{
                fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "8px 20px",
                border: "1px solid var(--border)", color: "var(--text-3)",
                textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
            >
              view projects ↓
            </Link>
          </motion.div>
        </div>

        {/* bottom */}
        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "3rem",
          display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)" }}>
            personal.archive v1
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#c85a5a" }}>
            route_not_found · 404
          </span>
        </div>
      </div>
    </main>
  );
}