"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const facts = [
    { key: "age",        value: "18" },
    { key: "location",   value: "cebu city, ph" },
    { key: "status",     value: "bsit freshman" },
    { key: "type",       value: "self-taught + formal" },
    { key: "exp",        value: "~2 years coding" },
    { key: "current",    value: "building winrt v3" },
    { key: "idle_mode",  value: "sleep | play games" },
    { key: "uptime",     value: "est. 2024" },
  ];

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ marginBottom: "7rem" }}
    >
      {/* section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: 0,
      }}>
        <span style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)" }}>
          about
        </span>
        <span style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.1em" }}>
          / sys.info
        </span>
      </div>

      {/* two column layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0px",
      }}>

        {/* left — personal statement */}
        <div style={{
          padding: "2.5rem 3rem 2.5rem 0",
          borderRight: "1px solid var(--border)",
        }}>
          <div style={{
            fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--text-3)", marginBottom: "1.5rem",
          }}>
            // README.md
          </div>

          <div style={{
            display: "flex", flexDirection: "column", gap: "1.25rem",
            fontFamily: "var(--sans)", fontSize: "14px", lineHeight: 1.85,
            color: "var(--text-2)", fontWeight: 300,
          }}>
            <p>
              i'm agustin — 18, from cebu. i build software because i want to know 
              how things actually work, not just that they do. the gap between 
              "it works" and "i understand why it works" is where i live.
            </p>

            <p>
              started coding almost two years ago, self-taught, inconsistent — 
              some weeks i'm shipping every day, some weeks i don't touch a line. 
              now i'm a{" "}
              <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: "12px" }}>
                bsit freshman
              </span>{" "}
              which means i'm doing both at once.
            </p>

            <p>
              i don't build things to put on a resume. i build them because i need 
              them, or because i think someone else might. if it's useful, ship it. 
              if it's not, keep going until it is.
            </p>

            <p style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "13px" }}>
              when the quota runs out or the drive disappears — i sleep, or i open 
              a game. the code will still be there tomorrow.
            </p>
          </div>

          {/* skills tags */}
          <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["Rust", "Tauri", "TypeScript", "Next.js", "GSAP", "anime.js", "Windows"].map((tag) => (
              <span key={tag} style={{
                fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "3px 8px",
                border: "1px solid var(--border)", color: "var(--text-3)",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* right — config file style facts */}
        <div style={{ padding: "2.5rem 0 2.5rem 3rem" }}>
          <div style={{
            fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--text-3)", marginBottom: "1.5rem",
          }}>
            // config.toml
          </div>

          <div style={{
            fontFamily: "var(--mono)", fontSize: "12px", lineHeight: 1,
            display: "flex", flexDirection: "column", gap: 0,
          }}>
            {/* toml header */}
            <div style={{ color: "var(--accent)", marginBottom: "0.75rem", fontSize: "11px" }}>
              [user.agstn404]
            </div>

            {facts.map((f, i) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, x: -8 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * i + 0.3, ease: "easeOut" }}
                style={{
                  display: "flex", alignItems: "baseline", gap: "0",
                  padding: "0.6rem 0",
                  borderBottom: i < facts.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ color: "var(--text-3)", minWidth: "110px", fontSize: "11px" }}>
                  {f.key}
                </span>
                <span style={{ color: "var(--text-3)", marginRight: "0.75rem" }}>=</span>
                <span style={{ color: "var(--text)", fontSize: "11px" }}>
                  "{f.value}"
                </span>
              </motion.div>
            ))}

            {/* toml section 2 */}
            <div style={{ color: "var(--accent)", marginTop: "1.5rem", marginBottom: "0.75rem", fontSize: "11px" }}>
              [user.drives]
            </div>

            {[
              { key: "why_i_build", value: "understand how things work" },
              { key: "for_who",     value: "myself + anyone who needs it" },
              { key: "approach",    value: "ship it or keep going" },
            ].map((f, i) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, x: -8 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * i + 0.9, ease: "easeOut" }}
                style={{
                  display: "flex", alignItems: "baseline",
                  padding: "0.6rem 0",
                  borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ color: "var(--text-3)", minWidth: "110px", fontSize: "11px" }}>
                  {f.key}
                </span>
                <span style={{ color: "var(--text-3)", marginRight: "0.75rem" }}>=</span>
                <span style={{ color: "var(--text)", fontSize: "11px" }}>
                  "{f.value}"
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}