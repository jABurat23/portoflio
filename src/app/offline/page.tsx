"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Link from "next/link";
import CRT from "@/components/CRT";

const LOG_LINES = [
  "attempting connection..................fail",
  "checking network interfaces...........fail",
  "scanning alternate routes.............fail",
  "pinging gateway.......................fail",
  "connection lost.......................—",
];

export default function OfflinePage() {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
    }
    if (dotRef.current) {
      gsap.to(dotRef.current, { opacity: 0.3, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < LOG_LINES.length) {
        setLines((prev) => [...prev, LOG_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setReady(true), 300);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => window.location.reload();

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
            <span style={{ color: "var(--text-3)", fontSize: "11px", letterSpacing: "0.1em" }}>offline</span>
          </div>
        </div>

        {/* main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "700px" }}>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ marginBottom: "3rem" }}
          >
            <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1rem" }}>
              error / no_network_connection
            </div>
            <h1 style={{
              fontFamily: "var(--mono)",
              fontSize: "clamp(3rem, 10vw, 7rem)",
              fontWeight: 300,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--text)",
              marginBottom: "0.5rem",
            }}>
              <span style={{ color: "var(--accent)" }}>//</span> offline
              <span ref={cursorRef} style={{ display: "inline-block", width: "4px", height: "0.75em", marginLeft: "6px", verticalAlign: "middle", background: "var(--accent)" }} />
            </h1>
            <p style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-3)", letterSpacing: "0.06em" }}>
              no network connection detected
            </p>
          </motion.div>

          {/* log */}
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

          {/* actions */}
          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <button
                onClick={handleRetry}
                style={{
                  fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "8px 20px",
                  border: "1px solid var(--accent-dim)", color: "var(--accent)",
                  background: "transparent", cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,169,110,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                ↺ retry connection
              </button>
              <Link href="/"
                style={{
                fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "8px 20px",
                border: "1px solid var(--border)", color: "var(--text-3)",
                textDecoration: "none", transition: "all 0.15s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--text-3)")}
            >
                ← return home
            </Link>
            </motion.div>
        )}
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
            connection_lost · offline
        </span>
        </div>
    </div>
    </main>
);
}