"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";

// ── IP-based live location + clock ───────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [coords, setCoords] = useState({ lat: "...", lon: "...", city: "...", country: "..." });
  const tzRef = useRef("Asia/Manila");

  useEffect(() => {
    // fetch IP-based location silently — no permission needed
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const lat = parseFloat(data.latitude).toFixed(4);
        const lon = parseFloat(data.longitude).toFixed(4);
        const latDir = parseFloat(lat) >= 0 ? "N" : "S";
        const lonDir = parseFloat(lon) >= 0 ? "E" : "W";
        setCoords({
          lat: `${Math.abs(parseFloat(lat))}°${latDir}`,
          lon: `${Math.abs(parseFloat(lon))}°${lonDir}`,
          city: data.city || "unknown",
          country: data.country_name || "unknown",
        });
        if (data.timezone) tzRef.current = data.timezone;
      })
      .catch(() => {
        setCoords({ lat: "7.0707°N", lon: "125.6087°E", city: "Cebu City", country: "PH" });
      });
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: tzRef.current,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          timeZone: tzRef.current,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <span style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>
        coordinates
      </span>
      <span style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
        {coords.lat} {coords.lon}
      </span>
      <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
        {coords.city}, {coords.country}
      </span>
      <span style={{
        fontSize: "13px",
        color: "var(--accent)",
        fontFamily: "var(--mono)",
        letterSpacing: "0.08em",
        marginTop: "0.25rem",
      }}>
        {time}
      </span>
      <span style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
        {date}
      </span>
    </div>
  );
}

// ── Split-text hover link ─────────────────────────────────────────────────────
function SplitLink({ href, children }: { href: string; children: string }) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = children.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      return span;
    });
    charsRef.current = chars;
    containerRef.current.innerHTML = "";
    chars.forEach((s) => containerRef.current?.appendChild(s));
  }, [children]);

  const handleEnter = () => {
    if (!charsRef.current.length) return;
    animate(charsRef.current, {
      y: [0, -4, 0],
      color: ["var(--text-3)", "var(--accent)", "var(--text-3)"],
      duration: 400,
      delay: stagger(35),
      easing: "easeOutQuad",
    });
  };

  return (
    <a
      ref={containerRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleEnter}
      style={{
        fontSize: "12px",
        color: "var(--text-3)",
        textDecoration: "none",
        fontFamily: "var(--mono)",
        letterSpacing: "0.04em",
        display: "inline-block",
      }}
    >
      {children}
    </a>
  );
}

// ── Scramble label ────────────────────────────────────────────────────────────
function ScrambleLabel({ children, triggered, delay = 0 }: {
  children: string;
  triggered: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const didRun = useRef(false);

  useEffect(() => {
    if (!triggered || didRun.current || !ref.current) return;
    didRun.current = true;
    setTimeout(() => {
      if (!ref.current) return;
      animate(ref.current, {
        scrambleText: {
          chars: "a-zA-Z0-9!@#$%-_",
          speed: 0.6,
        },
        duration: 900,
        easing: "easeOutQuad",
      });
    }, delay);
  }, [triggered, delay]);

  return (
    <span
      ref={ref}
      style={{
        fontSize: "9px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--text-3)",
        fontFamily: "var(--mono)",
      }}
    >
      {children}
    </span>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !footerRef.current) return;
    animate(footerRef.current, {
      opacity: [0, 1],
      y: [20, 0],
      duration: 700,
      easing: "easeOutQuad",
    });
  }, [visible]);

  return (
    <footer
      ref={footerRef}
      style={{
        opacity: 0,
        borderTop: "1px solid var(--border)",
        paddingTop: "3rem",
        paddingBottom: "1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "2rem",
        alignItems: "start",
      }}
    >
      {/* left: live IP coordinates + clock */}
      <LiveClock />

      {/* center: links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <ScrambleLabel triggered={visible} delay={100}>contact</ScrambleLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
          <SplitLink href="https://github.com/jABurat23">github ↗</SplitLink>
          <SplitLink href="https://linkedin.com/in/jABurat23">linkedin ↗</SplitLink>
          <SplitLink href="mailto:john.doe@example.com">email ↗</SplitLink>
          <SplitLink href="/public/cv.pdf">résumé ↗</SplitLink>
        </div>
      </div>

      {/* right: system info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
        <ScrambleLabel triggered={visible} delay={200}>system</ScrambleLabel>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", marginTop: "0.25rem" }}>
          <span style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
            personal.archive v1
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
            next.js · typescript · gsap
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
            framer motion · anime.js
          </span>
        </div>
      </div>

      {/* bottom strip */}
      <div style={{
        gridColumn: "1 / -1",
        borderTop: "1px solid var(--border)",
        paddingTop: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <ScrambleLabel triggered={visible} delay={300}>
          est. 2024 · all builds personal
        </ScrambleLabel>
        <ScrambleLabel triggered={visible} delay={400}>
          sys / personal.archive v1
        </ScrambleLabel>
      </div>
    </footer>
  );
}